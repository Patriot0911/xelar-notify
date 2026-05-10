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

  async registerStreamOnlineSubscription(broadcasterId: string): Promise<TwitchStreamerEventEntity> {
    const existingSubscription = await this.twitchStreamerEventsRepository.findOne({
      where: {
        event: TwitchStreamerEvents.STREAM_ONLINE,
        streamer: { broadcasterId, },
      },
    });

    if (!!existingSubscription) {
      throw new InternalServerErrorException('Twitch subscription already exists');
    }

    const app = await this.getTwitchAppForBroadcaster(broadcasterId);

    if (!app) {
      throw new InternalServerErrorException('No Twitch app available');
    }

    const streamer = await this.getOrCreateStreamer(broadcasterId);

    const eventEntity = this.twitchStreamerEventsRepository.create({
      event: TwitchStreamerEvents.STREAM_ONLINE,
      twitchApp: app,
      streamer,
      eventStatus: TwitchEventStatuses.PENDING,
    });

    const createdEvent = await this.twitchStreamerEventsRepository.save(eventEntity);

    const webhookBaseUrl = this.configService.get<string>('TWITCH_WEBHOOK_URL');

    const twtichResData = await this.twitchApiService.registerStreamOnlineEvent(
      app.clientId,
      `${webhookBaseUrl}/${app.clientId}`,
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

  async acknowledgeEvent(subscriptionId: string): Promise<boolean> {
    const result = await this.twitchStreamerEventsRepository.update(
      { subscriptionId, },
      { eventStatus: TwitchEventStatuses.VERIFIED, }
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
