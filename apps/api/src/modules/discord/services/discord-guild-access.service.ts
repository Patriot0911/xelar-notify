import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscordGuildEntity, UserEntity } from '@libs/database';
import { Repository } from 'typeorm';
import { guildUserAccess, guildUserAccessPattern, RedisService } from '@libs/redis';
import { ClientProxy } from '@nestjs/microservices';
import { BOT_RPC_CLIENT } from '@libs/rpc';
import { RpcPatterns } from '@libs/rpc/patterns';
import { firstValueFrom, timeout } from 'rxjs';

const GUILD_ACCESS_TTL = 5 * 60; // 5 minutes

interface IGuildMemberRolesResult {
  roles: string[];
  isAdministrator: boolean;
}

@Injectable()
export class DiscordGuildAccessService {
  constructor(
    @InjectRepository(DiscordGuildEntity)
    private readonly guildRepo: Repository<DiscordGuildEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly redis: RedisService,
    @Inject(BOT_RPC_CLIENT)
    private readonly botClient: ClientProxy,
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
    const member = await this.fetchGuildMember(userId, guildId);
    return member.isAdministrator;
  }

  async invalidateGuildCache(guildId: string): Promise<void> {
    await this.redis.deleteByPattern(guildUserAccessPattern(guildId));
  }

  private async resolveAccess(userId: string, guildId: string): Promise<boolean> {
    const member = await this.fetchGuildMember(userId, guildId);
    if (!member) return false;
    if (member.isAdministrator) return true;

    const guild = await this.guildRepo.findOne({
      where: { guildId },
      select: { managerRoleId: true },
    });

    return !!(guild?.managerRoleId && member.roles.includes(guild.managerRoleId));
  }

  private async fetchGuildMember(userId: string, guildId: string): Promise<IGuildMemberRolesResult> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: { discordId: true },
    });

    if (!user?.discordId) return { roles: [], isAdministrator: false };

    return firstValueFrom(
      this.botClient
        .send<IGuildMemberRolesResult>(RpcPatterns.bot.getGuildMemberRoles, {
          guildId,
          discordUserId: user.discordId,
        })
        .pipe(timeout(5000)),
    ).catch(() => ({ roles: [], isAdministrator: false }));
  }
}
