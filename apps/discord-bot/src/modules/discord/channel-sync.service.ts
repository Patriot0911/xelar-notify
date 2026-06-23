import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChannelType, Client, NewsChannel, TextChannel } from 'discord.js';
import type { Channel, GuildBasedChannel } from 'discord.js';
import { discordGuildChannels, RedisService } from '@libs/redis';
import { DISCORD_CLIENT } from '../../shared/constants';
import { OnDiscordEvent } from '../../shared/decorators';

type TextGuildChannel = TextChannel | NewsChannel;

const CHANNELS_TTL = 24 * 60 * 60; // 24 h safety-net; events keep it fresh

export interface ICachedChannel {
  id: string;
  name: string;
  position: number;
  parentId: string | null;
  topic: string | null;
}

function isTextGuildChannel(ch: GuildBasedChannel): ch is TextGuildChannel {
  return ch.type === ChannelType.GuildText || ch.type === ChannelType.GuildAnnouncement;
}

function toGuildId(channel: Channel): string | null {
  return 'guildId' in channel ? (channel as { guildId: string }).guildId : null;
}

@Injectable()
export class ChannelSyncService implements OnModuleInit {
  private readonly logger = new Logger(ChannelSyncService.name);

  constructor(
    @Inject(DISCORD_CLIENT)
    private readonly client: Client,
    private readonly redis: RedisService,
  ) {}

  onModuleInit() {
    if (!this.client.isReady()) {
      this.client.once('ready', () => this.syncAll());
    } else {
      this.syncAll();
    }
  }

  private async syncAll(): Promise<void> {
    const guilds = [...this.client.guilds.cache.values()];
    await Promise.all(guilds.map((g) => this.syncGuild(g.id)));
    this.logger.log(`Synced channels for ${guilds.length} guilds`);
  }

  async syncGuild(guildId: string): Promise<ICachedChannel[]> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) return [];

    const channels = [...guild.channels.cache.values()]
      .filter(isTextGuildChannel)
      .map<ICachedChannel>((ch) => ({
        id: ch.id,
        name: ch.name,
        position: ch.position,
        parentId: ch.parentId ?? null,
        topic: ch.topic ?? null,
      }))
      .sort((a, b) => a.position - b.position);

    await this.redis.set(discordGuildChannels(guildId), channels, CHANNELS_TTL);
    return channels;
  }

  @OnDiscordEvent('channelCreate')
  async onChannelCreate(channel: Channel): Promise<void> {
    const guildId = toGuildId(channel);
    if (guildId) await this.syncGuild(guildId);
  }

  @OnDiscordEvent('channelDelete')
  async onChannelDelete(channel: Channel): Promise<void> {
    const guildId = toGuildId(channel);
    if (guildId) await this.syncGuild(guildId);
  }

  @OnDiscordEvent('channelUpdate')
  async onChannelUpdate(_old: Channel, newChannel: Channel): Promise<void> {
    const guildId = toGuildId(newChannel);
    if (guildId) await this.syncGuild(guildId);
  }
}
