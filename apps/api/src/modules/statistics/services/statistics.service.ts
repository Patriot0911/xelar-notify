import { DiscordGuildEntity, DiscordNotificationEntity, NotificationLogEntity, NotificationLogStatus, TwitchStreamerEntity, UserEntity } from '@libs/database';
import { dailyStatistics, platformStatistics, RedisService, userStatistics } from '@libs/redis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IDailyStatsModel, IPlatformStatsModel, IUserStatsModel } from '../models';

const STATISTICS_CACHE_TTL = 60 * 20; // 20 minutes
const DAILY_STATS_DAYS = 7;

@Injectable()
export class StatisticsService {
  constructor(
    private readonly redis: RedisService,
    @InjectRepository(DiscordNotificationEntity)
    private readonly discordNotificationRepository: Repository<DiscordNotificationEntity>,
    @InjectRepository(TwitchStreamerEntity)
    private readonly twitchStreamerRepository: Repository<TwitchStreamerEntity>,
    @InjectRepository(NotificationLogEntity)
    private readonly notificationLogRepository: Repository<NotificationLogEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DiscordGuildEntity)
    private readonly discordGuildRepository: Repository<DiscordGuildEntity>,
  ) {}

  async getPlatformStats(): Promise<IPlatformStatsModel> {
    const cacheKey = platformStatistics();
    const cached = await this.redis.get<IPlatformStatsModel>(cacheKey);
    if (cached) {
      return cached;
    }

    const [
      totalNotifications,
      totalStreamers,
      totalUsers,
      totalGuilds,
      successfulNotifications,
    ] = await Promise.all([
      this.discordNotificationRepository.count(),
      this.twitchStreamerRepository.count(),
      this.userRepository.count(),
      this.discordGuildRepository.count(),
      this.notificationLogRepository.count({
        where: { status: NotificationLogStatus.Sent },
      }),
    ]);

    const result: IPlatformStatsModel = {
      totalNotifications,
      totalStreamers,
      totalUsers,
      totalGuilds,
      successfulNotifications,
    };

    await this.redis.set(cacheKey, result, STATISTICS_CACHE_TTL);
    return result;
  }

  async getDailyStats(): Promise<IDailyStatsModel[]> {
    const cacheKey = dailyStatistics();
    const cached = await this.redis.get<IDailyStatsModel[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const since = new Date();
    since.setDate(since.getDate() - DAILY_STATS_DAYS);
    since.setHours(0, 0, 0, 0);

    const rows = await this.notificationLogRepository
      .createQueryBuilder('log')
      .select("DATE_TRUNC('day', log.createdAt)", 'day')
      .addSelect('COUNT(*)', 'total')
      .addSelect('COUNT(*) FILTER (WHERE log.status = :sentStatus)', 'successful')
      .where('log.createdAt >= :since', { since, sentStatus: NotificationLogStatus.Sent })
      .groupBy("DATE_TRUNC('day', log.createdAt)")
      .orderBy("DATE_TRUNC('day', log.createdAt)", 'ASC')
      .getRawMany<{ day: string; total: string; successful: string }>();

    const result = this.fillMissingDays(rows, DAILY_STATS_DAYS);

    await this.redis.set(cacheKey, result, STATISTICS_CACHE_TTL);
    return result;
  }

  async getUserStats(userId: string): Promise<IUserStatsModel> {
    const cacheKey = userStatistics(userId);
    const cached = await this.redis.get<IUserStatsModel>(cacheKey);
    if (cached) {
      return cached;
    }

    const [notificationsSent, usedCredits] = await Promise.all([
      this.notificationLogRepository.count({
        where: {
          ownerId: userId,
          status: NotificationLogStatus.Sent,
        },
      }),
      this.discordNotificationRepository.createQueryBuilder('notification')
        .select('SUM(notification.cost)', 'total')
        .where('notification.ownerId = :userId', { userId })
        .getRawOne<{ total: string | null }>(),
    ]);

    const result: IUserStatsModel = {
      notificationsSent,
      usedCredits: Number(usedCredits?.total ?? 0),
    };

    await this.redis.set(cacheKey, result, STATISTICS_CACHE_TTL);
    return result;
  }

  private fillMissingDays(rows: { day: string; total: string; successful: string }[], days: number): IDailyStatsModel[] {
    const map = new Map(
      rows.map((r) => [
        new Date(r.day).toISOString().split('T')[0],
        { total: Number(r.total), successful: Number(r.successful) },
      ]),
    );

    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const key = date.toISOString().split('T')[0];

      return {
        date,
        total:      map.get(key)?.total ?? 0,
        successful: map.get(key)?.successful ?? 0,
      };
    });
  }
}
