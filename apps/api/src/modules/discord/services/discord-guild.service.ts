import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscordGuildEntity } from '@libs/database';
import { In, Repository } from 'typeorm';
import { botGuildIds, RedisService } from '@libs/redis';
import { DiscordApiService } from './discord-api.service';
import { IDiscordUserGuildItemModel } from '../models';
import { DiscordPermissionFlag } from '../constants/manager-permission.constant';
import { hasDiscordPermission } from '../utils/discord-permission.util';

const BASE_GUILD_BALANCE = 0;

@Injectable()
export class DiscordGuildService {
  constructor(
    private readonly discordApiService: DiscordApiService,
    private readonly redis: RedisService,
    @InjectRepository(DiscordGuildEntity)
    private readonly discordGuildRepository: Repository<DiscordGuildEntity>,
  ) {}

  async getUserGuilds(userId: string): Promise<IDiscordUserGuildItemModel[]> {
    const [userGuilds, botGuildIdList] = await Promise.all([
      this.discordApiService.fetchUserGuilds(userId),
      this.getBotGuildIds(),
    ]);

    const botGuildSet = new Set(botGuildIdList);

    if (userGuilds.length === 0) {
      return [];
    }

    const guildIds = userGuilds.map((g) => g.id);

    const userGuildsManagerPermissions = await this.discordGuildRepository.find({
      where: { guildId: In(guildIds) },
      select: { managerPermission: true, guildId: true, },
    });

    const managerPermissionMap = new Map(
      userGuildsManagerPermissions.map((g) => [g.guildId, g.managerPermission]),
    );

    const filteredGuilds = userGuilds.filter((guild) => {
      if (guild.owner) return true;
      if (hasDiscordPermission(guild.permissions, DiscordPermissionFlag.ADMINISTRATOR)) return true;

      const managerPermission = managerPermissionMap.get(guild.id);
      return !!managerPermission && hasDiscordPermission(guild.permissions, managerPermission);
    });

    const filteredGuildIds = filteredGuilds.map((g) => g.id);

    const dbStats = await this.discordGuildRepository
      .createQueryBuilder('guild')
      .leftJoin('guild.notifications', 'botNotif')
      .leftJoin('guild.webhookNotifications', 'webhookNotif')
      .select('guild.guildId', 'guildId')
      .addSelect('guild.balance', 'balance')
      .addSelect(
        'COUNT(DISTINCT botNotif.id) + COUNT(DISTINCT webhookNotif.id)',
        'notificationCount',
      )
      .where('guild.guildId IN (:...guildIds)', { guildIds: filteredGuildIds })
      .groupBy('guild.id, guild.guildId, guild.balance')
      .getRawMany<{ guildId: string; balance: string; notificationCount: string }>();

    const statsMap = new Map(
      dbStats.map((row) => [
        row.guildId,
        {
          balance: parseFloat(row.balance),
          notificationCount: parseInt(row.notificationCount, 10),
        },
      ]),
    );

    return filteredGuilds.map((guild) => ({
      ...guild,
      hasBot: botGuildSet.has(guild.id),
      balance: statsMap.get(guild.id)?.balance ?? 0,
      notificationCount: statsMap.get(guild.id)?.notificationCount ?? 0,
    }));
  }

  private async getBotGuildIds(): Promise<string[]> {
    const cached = await this.redis.get<string[]>(botGuildIds());
    if (cached) return cached;

    return [];
  }

  async getGuildInfo(discordGuildId: string): Promise<{ managerPermission: string | null }> {
    const guild = await this.discordGuildRepository.findOne({
      where: { guildId: discordGuildId },
      select: { managerPermission: true },
    });
    return { managerPermission: guild?.managerPermission ?? null };
  }

  async setManagerPermission(discordGuildId: string, permission: string | null | undefined): Promise<void> {
    await this.discordGuildRepository.update(
      { guildId: discordGuildId },
      { managerPermission: permission ?? null },
    );
  }

  async assertGuildBalance(discordGuildId: string, amount: number): Promise<void> {
    const guild = await this.discordGuildRepository.findOne({
      where: { guildId: discordGuildId },
      select: { balance: true },
    });
    if (!guild || Number(guild.balance) < amount) {
      throw new BadRequestException('Insufficient guild balance');
    }
  }

  async deductGuildBalance(discordGuildId: string, amount: number): Promise<void> {
    if (amount <= 0) return;
    const result = await this.discordGuildRepository
      .createQueryBuilder()
      .update(DiscordGuildEntity)
      .set({ balance: () => 'balance - :amount' })
      .where('guild_id = :guildId AND balance >= :amount')
      .setParameters({ guildId: discordGuildId, amount })
      .execute();

    if (result.affected === 0) {
      throw new BadRequestException('Insufficient guild balance');
    }
  }

  async getOrCreateGuild(discordGuildId: string) {
    const guild = await this.discordGuildRepository.findOne({
      where: { guildId: discordGuildId, },
    });
    if (guild !== null) {
      return guild;
    }
    const createdGuild = this.discordGuildRepository.create({
      balance: BASE_GUILD_BALANCE,
      guildId: discordGuildId,
    });
    const savedGuild = await this.discordGuildRepository.save(createdGuild);
    return savedGuild;
  }
}
