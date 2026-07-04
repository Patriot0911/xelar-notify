import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscordGuildEntity, DiscordPermissionFlag } from '@libs/database';
import { In, Repository } from 'typeorm';
import { DiscordApiService } from './discord-api.service';
import { IDiscordUserGuildItemModel } from '../models';
import { hasDiscordPermission } from '../utils/discord-permission.util';
import { DiscordBotService } from './discord-bot.service';
import { DiscordGuildAccessService } from './discord-guild-access.service';

const BASE_GUILD_BALANCE = 5;

@Injectable()
export class DiscordGuildService {
  constructor(
    private readonly discordApiService: DiscordApiService,
    private readonly discordBotService: DiscordBotService,
    private readonly discordGuildAccessService: DiscordGuildAccessService,
    @InjectRepository(DiscordGuildEntity)
    private readonly discordGuildRepository: Repository<DiscordGuildEntity>,
  ) {}

  async getUserGuilds(userId: string): Promise<IDiscordUserGuildItemModel[]> {
    const [userGuilds, botGuildIdList] = await Promise.all([
      this.discordApiService.fetchUserGuilds(userId),
      this.discordBotService.getBotGuildIds(),
    ]);

    const botGuildSet = new Set(botGuildIdList);

    if (userGuilds.length === 0) {
      return [];
    }

    const guildIds = userGuilds.map((g) => g.id);

    const userGuildsManagerPermissions = await this.discordGuildRepository.find({
      where: { discordGuildId: In(guildIds) },
      select: { managerPermission: true, discordGuildId: true, },
    });

    const managerPermissionMap = new Map(
      userGuildsManagerPermissions.map((g) => [g.discordGuildId, g.managerPermission]),
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
      .select('guild.discordGuildId', 'discordGuildId')
      .addSelect('guild.balance', 'balance')
      .addSelect(
        'COUNT(DISTINCT botNotif.id) + COUNT(DISTINCT webhookNotif.id)',
        'notificationCount',
      )
      .where('guild.discordGuildId IN (:...guildIds)', { guildIds: filteredGuildIds })
      .groupBy('guild.id, guild.discordGuildId, guild.balance')
      .getRawMany<{ discordGuildId: string; balance: string; notificationCount: string }>();

    const statsMap = new Map(
      dbStats.map((row) => [
        row.discordGuildId,
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
      managerPermission: managerPermissionMap.get(guild.id) ?? undefined,
    }));
  }

  async getUserGuildInfo(userId: string, guildId: string): Promise<IDiscordUserGuildItemModel> {
    const botGuildIds = await this.discordBotService.getBotGuildIds();
    if (!botGuildIds.includes(guildId)) {
      throw new BadRequestException('Discord guild does not have bot');
    }

    const apiUserGuild = await this.discordApiService.fetchUserGuildById(userId, guildId);
    const guildInfo = await this.getOrCreateGuild(guildId);

    const notifications = await this.discordGuildRepository
      .createQueryBuilder('guild')
      .leftJoin('guild.notifications', 'botNotif')
      .leftJoin('guild.webhookNotifications', 'webhookNotif')
      .select('guild.discordGuildId', 'discordGuildId')
      .addSelect(
        'COUNT(DISTINCT botNotif.id) + COUNT(DISTINCT webhookNotif.id)',
        'count',
      )
      .where('guild.discordGuildId = :guildId', { guildId, })
      .groupBy('guild.guild_id')
      .getRawOne<{ discordGuildId: string; count: string }>();

    return {
      ...apiUserGuild,
      balance: guildInfo.balance,
      hasBot: true,
      managerPermission: guildInfo.managerPermission ?? undefined,
      notificationCount: notifications
        ? Number(notifications.count)
        : 0,
    };
  }

  async setManagerPermission(guildId: string, permission: DiscordPermissionFlag | null | undefined): Promise<void> {
    await this.discordGuildRepository.update(
      { discordGuildId: guildId, },
      { managerPermission: permission ?? null },
    );
    await this.discordGuildAccessService.invalidateGuildCache(guildId);
  }

  async assertGuildBalance(discordGuildId: string, amount: number): Promise<void> {
    const guild = await this.discordGuildRepository.findOne({
      where: { discordGuildId, },
      select: { balance: true },
    });
    if (!guild || Number(guild.balance) < amount) {
      throw new BadRequestException('Insufficient guild balance');
    }
  }

  async deductGuildBalance(guildId: string, amount: number): Promise<void> {
    if (amount <= 0) {
      return;
    }
    const result = await this.discordGuildRepository
      .createQueryBuilder()
      .update(DiscordGuildEntity)
      .set({ balance: () => 'balance - :amount' })
      .where('guild_id = :guildId AND balance >= :amount')
      .setParameters({ guildId, amount })
      .execute();

    if (result.affected === 0) {
      throw new BadRequestException('Insufficient guild balance');
    }
  }

  async getOrCreateGuild(guildId: string): Promise<DiscordGuildEntity> {
    const guild = await this.discordGuildRepository.findOne({
      where: { discordGuildId: guildId },
    });
    if (guild !== null) {
      return guild;
    }
    const createdGuild = this.discordGuildRepository.create({
      balance: BASE_GUILD_BALANCE,
      discordGuildId: guildId,
    });
    const savedGuild = await this.discordGuildRepository.save(createdGuild);
    return savedGuild;
  }
}
