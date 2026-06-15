import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TwitchAppsRepository } from '../../twitch/repositories';
import { TwitchApiService, TwitchAppService, TwitchUserTokenService } from '../../twitch/services';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@libs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DiscordNotificationEntity,
  NotificationCostType,
  NotificationStatus,
  TwitchAppEntity,
  TwitchAppStatus,
  TwitchEventStatuses,
  TwitchStreamerEntity,
  TwitchStreamerEventEntity,
  TwitchStreamerEvents,
  WebhookNotificationEntity,
} from '@libs/database';
import { In, Not, Repository } from 'typeorm';
import { TwitchSubscriptionMapper } from '../mappers';
import { IGenericListPayloadResponse, IPaginationFilters } from 'apps/api/src/shared';

@Injectable()
export class TwitchSubscriptionService {
  constructor(
    private readonly twitchAppsRepository: TwitchAppsRepository,
    private readonly twitchApiService: TwitchApiService,
    private readonly twitchAppService: TwitchAppService,
    private readonly twitchUserTokenService: TwitchUserTokenService,
    private readonly configService: ConfigService<AppConfig>,
    private readonly twitchSubscriptionMapper: TwitchSubscriptionMapper,
    @InjectRepository(TwitchStreamerEventEntity)
    private twitchStreamerEventsRepository: Repository<TwitchStreamerEventEntity>,
    @InjectRepository(TwitchStreamerEntity)
    private twitchStreamerRepository: Repository<TwitchStreamerEntity>,
    @InjectRepository(DiscordNotificationEntity)
    private discordNotificationRepository: Repository<DiscordNotificationEntity>,
    @InjectRepository(WebhookNotificationEntity)
    private webhookNotificationRepository: Repository<WebhookNotificationEntity>,
  ) {}

  async registerSubscription(broadcasterId: string, event: TwitchStreamerEvents): Promise<TwitchStreamerEventEntity> {
    const streamer = await this.getOrCreateStreamer(broadcasterId);

    if (streamer.userId && streamer.allowPersonalSubscriptions) {
      const userAuthorizedEvent = await this.tryRegisterWithUserToken(streamer, event);
      if (userAuthorizedEvent) {
        return userAuthorizedEvent;
      }
    }

    const app = await this.getTwitchAppForBroadcaster(broadcasterId);

    if (!app) {
      throw new InternalServerErrorException('No Twitch app available');
    }

    const newEvent = this.twitchStreamerEventsRepository.create({
      event,
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
      broadcasterId,
      event,
    );

    const subscriptionId = twtichResData.data[0].id;
    const appCost = twtichResData.data[0].cost ?? 1;

    // Note: do not use "save" method in case we can overwrite status change etc
    await this.twitchStreamerEventsRepository.update(
      { id: createdEvent.id, },
      { subscriptionId, appCost, }
    );
    createdEvent.subscriptionId = subscriptionId;
    createdEvent.appCost = appCost;

    if (appCost > 0) {
      await this.twitchAppService.consumeAppCost(app.clientId, appCost);
    }

    return createdEvent;
  }

  async migrateToUserAuthorizedSubscriptions(streamerId: string, userId: string): Promise<void> {
    const streamer = await this.twitchStreamerRepository.findOne({ where: { id: streamerId } });
    if (!streamer || !streamer.allowPersonalSubscriptions) return;

    let userToken: string;
    try {
      userToken = await this.twitchUserTokenService.getValidToken(userId);
    } catch {
      return;
    }

    const internalApp = await this.twitchAppsRepository.findInternalApp(true, { webhookSecret: true });
    if (!internalApp) return;

    const events = await this.twitchStreamerEventsRepository.find({
      where: { streamerId, twitchAppId: Not(internalApp.id) },
      relations: { twitchApp: true, },
    });

    const webhookBaseUrl = this.configService.get<string>('TWITCH_WEBHOOK_URL');

    for (const event of events) {
      try {
        const twtichResData = await this.twitchApiService.registerEvent(
          internalApp.clientId,
          `${webhookBaseUrl}/${internalApp.clientId}/${event.id}`,
          internalApp.webhookSecret,
          streamer.broadcasterId,
          event.event,
          userToken,
          userId,
        );

        const newSubscriptionId = twtichResData.data[0].id;
        const oldSubscriptionId = event.subscriptionId;
        const oldClientId = event.twitchApp?.clientId;
        const oldAppCost = Number(event.appCost);

        await this.twitchStreamerEventsRepository.update(
          { id: event.id, },
          {
            subscriptionId: newSubscriptionId,
            twitchAppId: internalApp.id,
            appCost: 0,
            eventStatus: TwitchEventStatuses.PENDING,
          },
        );

        if (oldSubscriptionId && oldClientId) {
          try {
            await this.twitchApiService.deleteSubscription(oldSubscriptionId, oldClientId);
          } catch {
            // subscription may already be gone on Twitch side
          }
        }

        if (oldClientId && oldAppCost > 0) {
          await this.twitchAppService.releaseAppCost(oldClientId, oldAppCost);
        }
      } catch {
        // leave this subscription untouched; it stays on its current app
      }
    }
  }

  async downgradeUserAuthorizedSubscriptions(streamerId: string): Promise<void> {
    const internalApp = await this.twitchAppsRepository.findInternalApp();
    if (!internalApp) return;

    const events = await this.twitchStreamerEventsRepository.find({
      where: { streamerId, twitchAppId: internalApp.id },
      relations: { twitchApp: true, streamer: true, },
    });

    const webhookBaseUrl = this.configService.get<string>('TWITCH_WEBHOOK_URL');

    for (const event of events) {
      const hasPaidNotification = await this.hasNonCreditNotifications(event.id);

      if (hasPaidNotification) {
        const newApp = await this.twitchAppsRepository.findLeastLoaded(true, { webhookSecret: true });
        if (!newApp) continue;

        try {
          const twtichResData = await this.twitchApiService.registerEvent(
            newApp.clientId,
            `${webhookBaseUrl}/${newApp.clientId}/${event.id}`,
            newApp.webhookSecret,
            event.streamer.broadcasterId,
            event.event,
          );

          const newSubscriptionId = twtichResData.data[0].id;
          const newAppCost = twtichResData.data[0].cost ?? 1;

          await this.deleteRemoteSubscription(event);

          await this.twitchStreamerEventsRepository.update(
            { id: event.id, },
            {
              subscriptionId: newSubscriptionId,
              twitchAppId: newApp.id,
              appCost: newAppCost,
              eventStatus: TwitchEventStatuses.PENDING,
            },
          );

          if (newAppCost > 0) {
            await this.twitchAppService.consumeAppCost(newApp.clientId, newAppCost);
          }
        } catch {
          // leave as user-authorized; the cron will retry on the next run
        }
      } else {
        await this.deleteRemoteSubscription(event);

        await this.twitchStreamerEventsRepository.update(
          { id: event.id, },
          { eventStatus: TwitchEventStatuses.DEACTIVATED, },
        );

        await this.deactivateNotifications(event.id);
      }
    }
  }

  async allowsPersonalSubscriptions(broadcasterId: string): Promise<boolean> {
    const streamer = await this.twitchStreamerRepository.findOne({
      where: { broadcasterId },
      select: { allowPersonalSubscriptions: true },
    });
    return streamer?.allowPersonalSubscriptions ?? false;
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

  private async tryRegisterWithUserToken(
    streamer: TwitchStreamerEntity,
    event: TwitchStreamerEvents,
  ): Promise<TwitchStreamerEventEntity | null> {
    let userToken: string;
    try {
      userToken = await this.twitchUserTokenService.getValidToken(streamer.userId!);
    } catch {
      return null;
    }

    const internalApp = await this.twitchAppsRepository.findInternalApp(true, { webhookSecret: true });
    if (!internalApp) {
      return null;
    }

    const newEvent = this.twitchStreamerEventsRepository.create({
      event,
      twitchAppId: internalApp.id,
      streamerId: streamer.id,
      eventStatus: TwitchEventStatuses.PENDING,
      appCost: 0,
    });

    const createdEvent = await this.twitchStreamerEventsRepository.save(newEvent);

    const webhookBaseUrl = this.configService.get<string>('TWITCH_WEBHOOK_URL');

    try {
      const twtichResData = await this.twitchApiService.registerEvent(
        internalApp.clientId,
        `${webhookBaseUrl}/${internalApp.clientId}/${createdEvent.id}`,
        internalApp.webhookSecret,
        streamer.broadcasterId,
        event,
        userToken,
        streamer.userId!,
      );

      const subscriptionId = twtichResData.data[0].id;

      await this.twitchStreamerEventsRepository.update(
        { id: createdEvent.id, },
        { subscriptionId, }
      );
      createdEvent.subscriptionId = subscriptionId;

      return createdEvent;
    } catch {
      await this.twitchStreamerEventsRepository.remove(createdEvent);
      return null;
    }
  }

  private async deleteRemoteSubscription(event: TwitchStreamerEventEntity): Promise<void> {
    if (event.subscriptionId && event.twitchApp?.clientId) {
      try {
        await this.twitchApiService.deleteSubscription(event.subscriptionId, event.twitchApp.clientId);
      } catch {
        // subscription may already be gone on Twitch side
      }
    }
  }

  private async hasNonCreditNotifications(streamerEventId: string): Promise<boolean> {
    const [discordCount, webhookCount] = await Promise.all([
      this.discordNotificationRepository.count({
        where: { streamerEventId, costType: Not(NotificationCostType.Credit) },
      }),
      this.webhookNotificationRepository.count({
        where: { streamerEventId, costType: Not(NotificationCostType.Credit) },
      }),
    ]);
    return discordCount + webhookCount > 0;
  }

  private async deactivateNotifications(streamerEventId: string): Promise<void> {
    await Promise.all([
      this.discordNotificationRepository.update(
        { streamerEventId },
        { status: NotificationStatus.Suspended },
      ),
      this.webhookNotificationRepository.update(
        { streamerEventId },
        { status: NotificationStatus.Suspended },
      ),
    ]);
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
        twitchApp: { status: Not(TwitchAppStatus.Internal), },
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
