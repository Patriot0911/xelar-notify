import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DISCORD_CLIENT, OnDiscordEvent } from '../../shared';
import { Client, Guild } from 'discord.js';
import { botGuildIds, RedisService } from '@libs/redis';

@Injectable()
export class GuildSyncService implements OnModuleInit {
  constructor(
    @Inject(DISCORD_CLIENT)
    private readonly client: Client,
    private readonly redis: RedisService,
  ) {}

  onModuleInit() {
    if (!this.client.isReady()) {
      this.client.once('ready', () => this.syncGuilds());
    } else {
      this.syncGuilds();
    }
  }

  async syncGuilds(): Promise<string[]> {
    const guildIds = [...this.client.guilds.cache.keys()];
    await this.redis.set(botGuildIds(), guildIds);
    console.log(`Synced ${guildIds.length} guilds to Redis`);
    return guildIds;
  }

  @OnDiscordEvent('guildCreate')
  async onGuildJoin(guild: Guild): Promise<void> {
    const guildIds = await this.getBotGuildIds();
    await this.redis.set(botGuildIds(), [...guildIds, guild.id]);
  }

  @OnDiscordEvent('guildDelete')
  async onGuildLeave(guild: Guild): Promise<void> {
    const guildIds = await this.getBotGuildIds();
    await this.redis.set(
      botGuildIds(),
      guildIds.filter((id) => id !== guild.id),
    );
  }

  async getBotGuildIds(): Promise<string[]> {
    return (await this.redis.get<string[]>(botGuildIds())) ?? [];
  }
}