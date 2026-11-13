import { NotificationLogEntity, NotificationLogStatus, TwitchEventStatuses, TwitchStreamerEntity, TwitchStreamerEventEntity } from '@libs/database';
import { publicStreamersShowcase, RedisService } from '@libs/redis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { IPublicStreamerModel, IPublicStreamersShowcaseModel, IPublicStreamersStatsModel } from '../models';
import { PUBLIC_SHOWCASE_ACTIVITY_DAYS, PUBLIC_SHOWCASE_CACHE_TTL, PUBLIC_SHOWCASE_STREAMERS_LIMIT } from '../public.constants';

interface IShowcaseRow {
  twitchLogin: string;
  displayName: string;
  profileImageUrl: string | null;
  isPartner: boolean;
  notificationsDelivered: string;
  communitiesReached: string;
  lastNotifiedAt: Date | null;
}

interface IStatsRow {
  notificationsDelivered: string;
  notificationsDeliveredRecent: string;
  communitiesReached: string;
}

@Injectable()
export class PublicStreamersService {
  constructor(
    private readonly redis: RedisService,
    @InjectRepository(TwitchStreamerEntity)
    private readonly streamerRepository: Repository<TwitchStreamerEntity>,
    @InjectRepository(NotificationLogEntity)
    private readonly notificationLogRepository: Repository<NotificationLogEntity>,
  ) {}

  /** Cached, stampede-safe: concurrent misses wait for the first resolver instead of all hitting Postgres. */
  getShowcase(): Promise<IPublicStreamersShowcaseModel> {
    return this.redis.getOrSet(
      publicStreamersShowcase(),
      () => this.buildShowcase(),
      PUBLIC_SHOWCASE_CACHE_TTL,
    );
  }

  /** Call when something that affects the public list changes (e.g. a streamer is marked internal). */
  invalidate(): Promise<void> {
    return this.redis.delete(publicStreamersShowcase());
  }

  private async buildShowcase(): Promise<IPublicStreamersShowcaseModel> {
    const since = new Date();
    since.setDate(since.getDate() - PUBLIC_SHOWCASE_ACTIVITY_DAYS);

    const [streamers, stats] = await Promise.all([
      this.getStreamers(since),
      this.getStats(since),
    ]);

    return {
      streamers,
      stats,
      activityWindowDays: PUBLIC_SHOWCASE_ACTIVITY_DAYS,
      generatedAt: new Date().toISOString(),
    };
  }

  private async getStreamers(since: Date): Promise<IPublicStreamerModel[]> {
    const qb = this.streamerRepository
      .createQueryBuilder('streamer')
      .select('streamer.twitchLogin', 'twitchLogin')
      .addSelect('streamer.displayName', 'displayName')
      .addSelect('streamer.profileImageUrl', 'profileImageUrl')
      .addSelect('streamer.isPartner', 'isPartner')
      .addSelect('COUNT(log.id)', 'notificationsDelivered')
      .addSelect('COUNT(DISTINCT log.discordGuildId)', 'communitiesReached')
      .addSelect('MAX(log.createdAt)', 'lastNotifiedAt')
      .leftJoin(
        NotificationLogEntity,
        'log',
        'log.streamerLogin = streamer.twitchLogin AND log.status = :sent AND log.createdAt >= :since',
        { sent: NotificationLogStatus.Sent, since },
      )
      .groupBy('streamer.id')
      .orderBy('"notificationsDelivered"', 'DESC')
      .addOrderBy('"lastNotifiedAt"', 'DESC', 'NULLS LAST')
      .addOrderBy('streamer.createdAt', 'DESC')
      .limit(PUBLIC_SHOWCASE_STREAMERS_LIMIT);

    const rows = await this.wherePublicStreamer(qb).getRawMany<IShowcaseRow>();

    return rows.map((row, index) => {
      const notificationsDelivered = Number(row.notificationsDelivered);

      return {
        twitchLogin: row.twitchLogin,
        displayName: row.displayName,
        profileImageUrl: row.profileImageUrl,
        isPartner: row.isPartner,
        rank: index + 1,
        isTopActive: index === 0 && notificationsDelivered > 0,
        notificationsDelivered,
        communitiesReached: Number(row.communitiesReached),
        lastNotifiedAt: row.lastNotifiedAt ? new Date(row.lastNotifiedAt).toISOString() : null,
      };
    });
  }

  private async getStats(since: Date): Promise<IPublicStreamersStatsModel> {
    const totalStreamersQb = this.streamerRepository.createQueryBuilder('streamer');

    const logsQb = this.notificationLogRepository
      .createQueryBuilder('log')
      .select('COUNT(*)', 'notificationsDelivered')
      .addSelect('COUNT(*) FILTER (WHERE log.createdAt >= :since)', 'notificationsDeliveredRecent')
      .addSelect('COUNT(DISTINCT log.discordGuildId)', 'communitiesReached')
      .innerJoin(TwitchStreamerEntity, 'streamer', 'streamer.twitchLogin = log.streamerLogin')
      .where('log.status = :sent', { sent: NotificationLogStatus.Sent, since })
      .andWhere('streamer.isInternal IS NOT TRUE');

    const [totalStreamers, logs] = await Promise.all([
      this.wherePublicStreamer(totalStreamersQb).getCount(),
      logsQb.getRawOne<IStatsRow>(),
    ]);

    return {
      totalStreamers,
      notificationsDelivered: Number(logs?.notificationsDelivered ?? 0),
      notificationsDeliveredRecent: Number(logs?.notificationsDeliveredRecent ?? 0),
      communitiesReached: Number(logs?.communitiesReached ?? 0),
    };
  }

  /**
   * Public = not internal (NULL counts as public — `!= true` would drop NULL rows)
   * and has at least one verified Twitch subscription, i.e. is actually served by the platform.
   */
  private wherePublicStreamer<T extends SelectQueryBuilder<TwitchStreamerEntity>>(qb: T): T {
    return qb
      .andWhere('streamer.isInternal IS NOT TRUE')
      .andWhere((sub) => {
        const exists = sub
          .subQuery()
          .select('1')
          .from(TwitchStreamerEventEntity, 'event')
          .where('event.streamerId = streamer.id')
          .andWhere('event.eventStatus = :verified', { verified: TwitchEventStatuses.VERIFIED })
          .getQuery();
        return `EXISTS ${exists}`;
      }) as T;
  }
}
