import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TwitchAppsRepository } from '../../twitch/repositories';
import { TwitchApiService, TwitchAppService } from '../../twitch/services';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@libs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { TwitchAppEntity, TwitchEventStatuses, TwitchStreamerEntity, TwitchStreamerEventEntity, TwitchStreamerEvents } from '@libs/database';
import { In, Repository } from 'typeorm';
import { TwitchSubscriptionMapper } from '../mappers';
import { IGenericListPayloadResponse, IPaginationFilters } from 'apps/api/src/shared';

@Injectable()
export class TwitchSubscriptionService {
  constructor(
    private readonly twitchAppsRepository: TwitchAppsRepository,
    private readonly twitchApiService: TwitchApiService,
    private readonly twitchAppService: TwitchAppService,
    private readonly configService: ConfigService<AppConfig>,
    private readonly twitchSubscriptionMapper: TwitchSubscriptionMapper,
    @InjectRepository(TwitchStreamerEventEntity)
    private twitchStreamerEventsRepository: Repository<TwitchStreamerEventEntity>,
    @InjectRepository(TwitchStreamerEntity)
    private twitchStreamerRepository: Repository<TwitchStreamerEntity>,
  ) {}

  async registerSubscription(broadcasterId: string, event: TwitchStreamerEvents): Promise<TwitchStreamerEventEntity> {
    const app = await this.getTwitchAppForBroadcaster(broadcasterId);

    if (!app) {
      throw new InternalServerErrorException('No Twitch app available');
    }

    const streamer = await this.getOrCreateStreamer(broadcasterId);

    const newEvent = this.twitchStreamerEventsRepository.create({
      event,
      twitchAppId: app.id,
      streamerId: streamer.id,
      eventStatus: TwitchEventStatuses.PENDING,
    });

    console.log({ newEvent })

    const createdEvent = await this.twitchStreamerEventsRepository.save(newEvent);

    const webhookBaseUrl = this.configService.get<string>('TWITCH_WEBHOOK_URL');

    const twtichResData = await this.twitchApiService.registerEvent(
      app.clientId,
      `${webhookBaseUrl}/${app.clientId}/${createdEvent.id}`,
      app.webhookSecret,
      broadcasterId
    );

    const subscriptionId = twtichResData.data[0].id;

    // Note: do not use "save" method in case we can overwrite status change etc
    await this.twitchStreamerEventsRepository.update(
      { id: createdEvent.id, },
      { subscriptionId, }
    );
    createdEvent.subscriptionId = subscriptionId;

    return createdEvent;
  }

  async changeEventStatus(eventId: string, status: TwitchEventStatuses): Promise<boolean> {
    const result = await this.twitchStreamerEventsRepository.update(
      { id: eventId, },
      { eventStatus: status, }
    );
    return !!result.affected;
  }

  async getAllTwitchSubscriptions(params: IPaginationFilters): Promise<IGenericListPayloadResponse<any>> {
    const { page, pageSize, } = params;

    const [localSubscriptions, total] = await this.twitchStreamerEventsRepository
      .createQueryBuilder('twEvents')
      .leftJoinAndSelect('twEvents.twitchApp', 'twitchApp')
      .leftJoinAndSelect('twEvents.streamer', 'streamer')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .distinct(true)
      .getManyAndCount();

    return {
      items: localSubscriptions.map(
        (ls) => this.twitchSubscriptionMapper.entityToDto(ls)
      ),
      meta: { count: total, },
    }
  }

  async deleteLocalSubscription(eventId: string): Promise<void> {
    const event = await this.twitchStreamerEventsRepository.findOne({
      where: { id: eventId },
      relations: { twitchApp: true },
    });

    if (!event) {
      throw new NotFoundException(`Subscription with id "${eventId}" not found`);
    }

    const clientId = event.twitchApp.clientId;

    if (event.subscriptionId) {
      try {
        await this.twitchApiService.deleteSubscription(event.subscriptionId, clientId);
      } catch {
        // subscription may already be gone on Twitch side — proceed with local cleanup
      }
    }

    if (event.appCost > 0) {
      await this.twitchAppService.releaseAppCost(clientId, event.appCost);
    }

    await this.twitchStreamerEventsRepository.remove(event);
  }

  async deleteTwitchOnlySubscription(subscriptionId: string, clientId: string): Promise<void> {
    const existing = await this.twitchStreamerEventsRepository.findOne({
      where: { subscriptionId },
    });

    if (existing) {
      throw new BadRequestException(
        `This subscription has a local entity (id: ${existing.id}). Use the local delete endpoint instead.`
      );
    }

    await this.twitchApiService.deleteSubscription(subscriptionId, clientId);
  }

  async getRawTwitchSubscriptions(clientId: string, after?: string) {
    const twitchResponse = await this.twitchApiService.getSubscriptions(clientId, { after });

    const subscriptionIds = twitchResponse.data.map((s) => s.id);

    const localEntities = subscriptionIds.length > 0
      ? await this.twitchStreamerEventsRepository.find({
          where: { subscriptionId: In(subscriptionIds) },
          select: ['id', 'subscriptionId', 'eventStatus', 'streamerId'],
          relations: { streamer: true },
        })
      : [];

    const localBySubscriptionId = new Map(localEntities.map((e) => [e.subscriptionId, e]));

    const items = twitchResponse.data.map((sub) => {
      const localEntity = localBySubscriptionId.get(sub.id) ?? null;
      return {
        subscriptionId: sub.id,
        status: sub.status,
        event: sub.type,
        cost: sub.cost,
        createdAt: sub.created_at,
        condition: sub.condition,
        transport: sub.transport,
        twitchApp: { clientId },
        isOrphaned: !localEntity,
        localEntity: localEntity
          ? {
              id: localEntity.id,
              eventStatus: localEntity.eventStatus,
              streamerId: localEntity.streamerId,
              streamerLogin: localEntity.streamer?.twitchLogin ?? null,
            }
          : null,
      };
    });

    return {
      items,
      meta: {
        total: twitchResponse.total,
        totalCost: twitchResponse.total_cost,
        maxTotalCost: twitchResponse.max_total_cost,
        cursor: twitchResponse.pagination?.cursor ?? null,
      },
    };
  }

  async getOrCreateEvent(
    broadcasterId: string,
    event: TwitchStreamerEvents,
  ): Promise<TwitchStreamerEventEntity> {
    const streamer = await this.twitchStreamerRepository.findOne({
      where: { broadcasterId },
    });

    if (streamer) {
      const eventRecord = await this.twitchStreamerEventsRepository.findOne({
        where: {
          streamerId: streamer.id,
          event,
        },
      });

      if (eventRecord) {
        return eventRecord;
      }
    }

    return this.registerSubscription(broadcasterId, event);
  }

  private async getOrCreateStreamer(broadcasterId: string) {
    const existingStreamer = await this.twitchStreamerRepository.findOne({
      where: { broadcasterId, }
    });

    const streamerApiData = await this.twitchApiService.getUserById(broadcasterId);

    if (!streamerApiData) {
      throw new BadRequestException(`Cannot find streamer with Twitch Id "${broadcasterId}"`);
    }

    if (existingStreamer) {
      if (existingStreamer.profileImageUrl !== streamerApiData.profileImageUrl) {
        const now = new Date();
        await this.twitchStreamerRepository.update(
          { id: existingStreamer.id },
          { profileImageUrl: streamerApiData.profileImageUrl, profileImageUpdatedAt: now },
        );
        existingStreamer.profileImageUrl        = streamerApiData.profileImageUrl;
        existingStreamer.profileImageUpdatedAt  = now;
      }
      return existingStreamer;
    }

    const streamer = this.twitchStreamerRepository.create({
      broadcasterId,
      twitchLogin:            streamerApiData.login,
      displayName:            streamerApiData.displayName,
      profileImageUrl:        streamerApiData.profileImageUrl,
      profileImageUpdatedAt:  new Date(),
    });
    return this.twitchStreamerRepository.save(streamer);
  }

  private async getTwitchAppForBroadcaster(broadcasterId: string): Promise<TwitchAppEntity | null> {
    const subscription = await this.twitchStreamerEventsRepository.findOne({
      where: {
        streamer: { broadcasterId, },
      },
      select: { twitchApp: true, },
      relations: { twitchApp: true, },
    });

    if (
      subscription
      && subscription.twitchApp.currentCost < subscription.twitchApp.maxCost
    ) {
      return subscription.twitchApp;
    }

    return await this.findTwitchApp();
  }

  private async findTwitchApp(appId?: string) {
    if (appId) {
      const app = await this.twitchAppsRepository.findOne(
        { where: { id: appId, } }, true, { webhookSecret: true, }
      );
      return app;
    }
    return this.twitchAppsRepository.findLeastLoaded(true, { webhookSecret: true });
  }
}
