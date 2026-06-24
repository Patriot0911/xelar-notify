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

  async canAccessGuild(userId: string, guildId: string): Promise<boolean> {
    const cacheKey = guildUserAccess(guildId, userId);
    const cached = await this.redis.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.resolveAccess(userId, guildId);
    await this.redis.set(cacheKey, result, GUILD_ACCESS_TTL);
    return result;
  }

  // todo: add diff permissions
  async canManageGuild(userId: string, guildId: string): Promise<boolean> {
    const cacheKey = guildAdminAccess(guildId, userId);
    const cached = await this.redis.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.resolveAccess(userId, guildId);
    await this.redis.set(cacheKey, result, GUILD_ACCESS_TTL);
    return result;
  }

  async assertAccess(userId: string, guildId: string): Promise<void> {
    const hasAccess = await this.canAccessGuild(userId, guildId);
    if (!hasAccess) {
      throw new ForbiddenException('User has no access to this action');
    }
  }

  async assertAccessAdmin(userId: string, guildId: string) {
    const hasAccess = await this.canManageGuild(userId, guildId);
    if (!hasAccess) {
      throw new ForbiddenException('User has no access to this action');
    }
  }

  async invalidateGuildCache(guildId: string): Promise<void> {
    await this.redis.deleteByPattern(guildUserAccessPattern(guildId));
  }

  private async resolveAccess(userId: string, guildId: string, shouldBeAdmin: boolean = false): Promise<boolean> {
    const guild = await this.discordApiService.fetchUserGuildById(userId, guildId);
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
      where: { discordGuildId: guildId },
      select: { managerPermission: true },
    });

    return !!(
      guildSettings?.managerPermission &&
      hasDiscordPermission(guild.permissions, guildSettings.managerPermission)
    );
  }
}
