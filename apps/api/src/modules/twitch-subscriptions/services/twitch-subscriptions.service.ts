import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { TwitchAppsRepository } from '../../twitch/repositories';
import { TwitchApiService } from '../../twitch/services';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@libs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { TwitchAppEntity, TwitchEventStatuses, TwitchStreamerEntity, TwitchStreamerEventEntity, TwitchStreamerEvents } from '@libs/database';
import { Repository } from 'typeorm';
import { TwitchSubscriptionMapper } from '../mappers';
import { IGenericListPayloadResponse, IPaginationFilters } from 'apps/api/src/shared';

@Injectable()
export class TwitchSubscriptionService {
  constructor(
    private readonly twitchAppsRepository: TwitchAppsRepository,
    private readonly twitchApiService: TwitchApiService,
    private readonly configService: ConfigService<AppConfig>,
    private readonly twitchSubscriptionMapper: TwitchSubscriptionMapper,
    @InjectRepository(TwitchStreamerEventEntity)
    private twitchStreamerEventsRepository: Repository<TwitchStreamerEventEntity>,
    @InjectRepository(TwitchStreamerEntity)
    private twitchStreamerRepository: Repository<TwitchStreamerEntity>,
  ) {}

  async registerSubscription(broadcasterId: string, event: TwitchStreamerEvents): Promise<TwitchStreamerEventEntity> {
    const existingSubscription = await this.twitchStreamerEventsRepository.findOne({
      where: {
        event,
        streamer: { broadcasterId, },
      },
    });

    if (!!existingSubscription) {
      throw new BadRequestException(
        `Twitch event "${event}" already exists`
      );
    }

    const app = await this.getTwitchAppForBroadcaster(broadcasterId);

    if (!app) {
      throw new InternalServerErrorException('No Twitch app available');
    }

    const streamer = await this.getOrCreateStreamer(broadcasterId);

    const newEvent = this.twitchStreamerEventsRepository.create({
      event: TwitchStreamerEvents.STREAM_ONLINE,
      twitchAppId: app.id,
      streamerId: streamer.id,
      eventStatus: TwitchEventStatuses.PENDING,
    });

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

    const localEventsQb = this.twitchStreamerEventsRepository
      .createQueryBuilder('twEvents')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [localSubscriptions, total] = await localEventsQb
      .distinct(true)
      .getManyAndCount();

    return {
      items: localSubscriptions.map(
        (ls) => this.twitchSubscriptionMapper.EntityToDto(ls)
      ),
      meta: { count: total, },
    }
  }

  async getOrCreateEvent(broadcasterId: string, event: TwitchStreamerEvents): Promise<TwitchStreamerEventEntity> {
    const eventRecord = await this.twitchStreamerEventsRepository.findOne({
      where: {
        streamer: { broadcasterId, },
        event,
      },
      relations: { streamer: true, },
    });

    if (!!eventRecord) {
      return eventRecord;
    }

    return this.registerSubscription(broadcasterId, event);
  }

  private async getOrCreateStreamer(broadcasterId: string) {
    const existingStreamer = await this.twitchStreamerRepository.findOne({
      where: { broadcasterId, }
    });

    if (!!existingStreamer) {
      return existingStreamer;
    }

    const streamerApiData = await this.twitchApiService.getUserById(broadcasterId);

    if (!streamerApiData) {
      throw new BadRequestException(`Cannot find streamer with Twitch Id "${broadcasterId}"`);
    }

    const streamer = this.twitchStreamerRepository.create({
      broadcasterId,
      twitchLogin: streamerApiData.login,
      displayName: streamerApiData.displayName,
    });
    const createdStreamer = await this.twitchStreamerRepository.save(streamer);
    return createdStreamer;
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
