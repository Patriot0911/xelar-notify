import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscordGuildEntity } from '@libs/database';
import { Repository } from 'typeorm';
import { guildUserAccess, guildUserAccessPattern, RedisService } from '@libs/redis';
import { DiscordApiService } from './discord-api.service';
import { IDiscordGuildModel } from '../models';
import { DiscordPermissionFlag } from '../constants/manager-permission.constant';
import { hasDiscordPermission } from '../utils/discord-permission.util';

const GUILD_ACCESS_TTL = 5 * 60; // 5 minutes

@Injectable()
export class DiscordGuildAccessService {
  constructor(
    @InjectRepository(DiscordGuildEntity)
    private readonly guildRepo: Repository<DiscordGuildEntity>,
    private readonly redis: RedisService,
    private readonly discordApiService: DiscordApiService,
  ) {}

  async canAccessGuild(userId: string, guildId: string): Promise<boolean> {
    const cacheKey = guildUserAccess(guildId, userId);
    const cached = await this.redis.get<boolean>(cacheKey);
    if (cached !== null) return cached;

    const result = await this.resolveAccess(userId, guildId);
    await this.redis.set(cacheKey, result, GUILD_ACCESS_TTL);
    return result;
  }

  async assertAccess(userId: string, guildId: string): Promise<void> {
    const hasAccess = await this.canAccessGuild(userId, guildId);
    if (!hasAccess) throw new ForbiddenException('No access to this guild');
  }

  async isDiscordAdminInGuild(userId: string, guildId: string): Promise<boolean> {
    const guild = await this.findUserGuild(userId, guildId);
    if (!guild) return false;

    return guild.owner || hasDiscordPermission(guild.permissions, DiscordPermissionFlag.ADMINISTRATOR);
  }

  async invalidateGuildCache(guildId: string): Promise<void> {
    await this.redis.deleteByPattern(guildUserAccessPattern(guildId));
  }

  private async resolveAccess(userId: string, guildId: string): Promise<boolean> {
    const guild = await this.findUserGuild(userId, guildId);
    if (!guild) return false;
    if (guild.owner || hasDiscordPermission(guild.permissions, DiscordPermissionFlag.ADMINISTRATOR)) return true;

    const guildSettings = await this.guildRepo.findOne({
      where: { guildId },
      select: { managerPermission: true },
    });

    return !!(
      guildSettings?.managerPermission &&
      hasDiscordPermission(guild.permissions, guildSettings.managerPermission)
    );
  }

  private async findUserGuild(userId: string, guildId: string): Promise<IDiscordGuildModel | undefined> {
    const guilds = await this.discordApiService.fetchUserGuilds(userId);
    return guilds.find((guild) => guild.id === guildId);
  }
}
