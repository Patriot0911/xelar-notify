import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { TwitchEventStatuses, TwitchStreamerEventEntity } from '@libs/database';
import { LessThan, Repository } from 'typeorm';
import { TwitchApiService } from '../../twitch/services';
import { TwitchAppService } from '../../twitch/services';

const TWITCH_EVENT_SYNC_CRON = '0 * * * *'; // Every hour
const TWITCH_EVENT_STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class TwitchSubscriptionsCronService {
  constructor(
    @InjectRepository(TwitchStreamerEventEntity)
    private twitchStreamerEventsRepository: Repository<TwitchStreamerEventEntity>,
    private twitchApiService: TwitchApiService,
    private twitchAppService: TwitchAppService,
  ) {}

  @Cron(TWITCH_EVENT_SYNC_CRON)
  async syncStaleSubscriptions() {
    const gapTime = new Date(Date.now() - TWITCH_EVENT_STALE_THRESHOLD_MS);

    const stale = await this.twitchStreamerEventsRepository.find({
      where: {
        eventStatus: TwitchEventStatuses.PENDING,
        createdAt: LessThan(gapTime),
      },
      select: ['id', 'subscriptionId', 'eventStatus', 'twitchApp'],
      relations: ['twitchApp'],
    });

    const groupedByClientId = stale.reduce((acc, event) => {
      const clientId = event.twitchApp.clientId;
      if (!acc[clientId]) {
        acc[clientId] = [];
      }
      acc[clientId].push(event);
      return acc;
    }, {} as Record<string, TwitchStreamerEventEntity[]>);

    const toEnable: TwitchStreamerEventEntity[] = [];
    const toDelete: TwitchStreamerEventEntity[] = [];
    const appCostToRelease: Record<string, number> = {};

    for (const clientId in groupedByClientId) {
      const events = groupedByClientId[clientId];
      const subscriptionIds = events.map((e) => e.subscriptionId).filter((id): id is string => !!id);
      const apiSubscriptions = await this.twitchApiService.getSubscriptions(clientId, { subscriptionIds, });
      let releaseAppCost = 0;
      for (const event of events) {
        const apiSub = apiSubscriptions.data.find((s) => s.id === event.subscriptionId);
        const twitchStatus = apiSub?.status;
        const isFailed = !twitchStatus
          || twitchStatus === 'webhook_callback_verification_failed'
          || twitchStatus === 'authorization_revoked'
          || twitchStatus === 'user_removed';
        if (isFailed) {
          const ageMs = Date.now() - new Date(event.createdAt).getTime();
          const hourMs = 60 * 60 * 1000;
          if (ageMs > hourMs) {
            releaseAppCost += apiSub?.cost ?? 0;
            toDelete.push(event);
          }
          continue;
        }
        toEnable.push(event);
      }
      if (releaseAppCost > 0) {
        appCostToRelease[clientId] = releaseAppCost;
      }
    }

    await this.twitchStreamerEventsRepository.update(
      toEnable.map((e) => e.id),
      { eventStatus: TwitchEventStatuses.VERIFIED, },
    );
    await this.twitchStreamerEventsRepository.update(
      toDelete.map((e) => e.id),
      { eventStatus: TwitchEventStatuses.REVOKED, },
    );

    for (const clientId in appCostToRelease) {
      await this.twitchAppService.releaseAppCost(clientId, appCostToRelease[clientId]);
    }
  }
}
