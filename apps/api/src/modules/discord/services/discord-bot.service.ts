import { botGuildIds, discordGuildChannels, discordGuildRoles, RedisService } from '@libs/redis';
import { Inject, Injectable } from '@nestjs/common';
import { IDiscordChannelModel } from '../models/discord-channel.model';
import { BOT_RPC_CLIENT } from '@libs/rpc';
import { ClientProxy } from '@nestjs/microservices';
import { IDiscordRoleModel } from '../models/discord-role.model';
import { firstValueFrom, timeout } from 'rxjs';
import { RpcPatterns } from '@libs/rpc/patterns';

const DISCORD_BOT_CACHE = 60 * 10; // 10 m

@Injectable()
export class DiscordBotService {
  constructor(
    private readonly redis: RedisService,
    @Inject(BOT_RPC_CLIENT)
    private readonly botClient: ClientProxy,
  ) {}

  async getGuildTextChannels(guildId: string): Promise<IDiscordChannelModel[]> {
    const cached = await this.redis.get<IDiscordChannelModel[]>(discordGuildChannels(guildId));
    if (cached) return cached;

    return firstValueFrom(
      this.botClient
        .send<IDiscordChannelModel[]>(RpcPatterns.bot.getGuildChannels, { guildId })
        .pipe(timeout(8000)),
    );
  }

  async getBotGuildIds(): Promise<string[]> {
    const cached = await this.redis.get<string[]>(botGuildIds());
    if (cached) return cached;

    return firstValueFrom(
      this.botClient
        .send<string[]>(RpcPatterns.bot.getGuildIds, {})
        .pipe(timeout(8000)),
    );
  }

  async getGuildRoles(guildId: string): Promise<IDiscordRoleModel[]> {
    const cached = await this.redis.get<IDiscordRoleModel[]>(discordGuildRoles(guildId));
    if (cached) return cached;

    const roles = await firstValueFrom(
      this.botClient
        .send<IDiscordRoleModel[]>(RpcPatterns.bot.getGuildRoles, { guildId })
        .pipe(timeout(8000)),
    );

    await this.redis.set(discordGuildRoles(guildId), roles, DISCORD_BOT_CACHE);
    return roles;
  }
}
