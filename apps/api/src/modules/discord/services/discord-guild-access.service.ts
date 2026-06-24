import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscordGuildEntity, DiscordPermissionFlag } from '@libs/database';
import { Repository } from 'typeorm';
import { guildAdminAccess, guildUserAccess, guildUserAccessPattern, RedisService } from '@libs/redis';
import { DiscordApiService } from './discord-api.service';
import { hasDiscordPermission } from '../utils/discord-permission.util';

const GUILD_ACCESS_TTL = 10 * 60; // 10 minutes

@Injectable()
export class DiscordGuildAccessService {
  constructor(
    @InjectRepository(DiscordGuildEntity)
    private readonly guildRepository: Repository<DiscordGuildEntity>,
    private readonly redis: RedisService,
    private readonly discordApiService: DiscordApiService,
  ) {}

  async canAccessGuild(userId: string, discordGuildId: string): Promise<boolean> {
    const cacheKey = guildUserAccess(discordGuildId, userId);
    const cached = await this.redis.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.resolveAccess(userId, discordGuildId);
    await this.redis.set(cacheKey, result, GUILD_ACCESS_TTL);
    return result;
  }

  // todo: add diff permissions
  async canManageGuild(userId: string, discordGuildId: string): Promise<boolean> {
    const cacheKey = guildAdminAccess(discordGuildId, userId);
    const cached = await this.redis.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.resolveAccess(userId, discordGuildId);
    await this.redis.set(cacheKey, result, GUILD_ACCESS_TTL);
    return result;
  }

  async assertAccess(userId: string, discordGuildId: string): Promise<void> {
    const hasAccess = await this.canAccessGuild(userId, discordGuildId);
    if (!hasAccess) {
      throw new ForbiddenException('User has no access to this action');
    }
  }

  async assertAccessAdmin(userId: string, discordGuildId: string) {
    const hasAccess = await this.canManageGuild(userId, discordGuildId);
    if (!hasAccess) {
      throw new ForbiddenException('User has no access to this action');
    }
  }

  async invalidateGuildCache(guildId: string): Promise<void> {
    await this.redis.deleteByPattern(guildUserAccessPattern(guildId));
  }

  private async resolveAccess(userId: string, discordGuildId: string, shouldBeAdmin: boolean = false): Promise<boolean> {
    const guild = await this.discordApiService.fetchUserGuildById(userId, discordGuildId);
    if (!guild) {
      return false;
    }

    if (guild.owner) {
      return true;
    }

    if (hasDiscordPermission(guild.permissions, DiscordPermissionFlag.ADMINISTRATOR)) {
      return true;
    } else if (shouldBeAdmin) {
      return false;
    }

    const guildSettings = await this.guildRepository.findOne({
      where: { discordGuildId: discordGuildId },
      select: { managerPermission: true },
    });

    return !!(
      guildSettings?.managerPermission &&
      hasDiscordPermission(guild.permissions, guildSettings.managerPermission)
    );
  }
}
