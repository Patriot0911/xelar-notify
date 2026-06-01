import { discordGuildChannels, RedisService } from '@libs/redis';
import { Injectable } from '@nestjs/common';
import { IDiscordChannelModel } from '../models/discord-channel.model';

@Injectable()
export class DiscordChannelsService {
  constructor(private readonly redis: RedisService) {}

  async getGuildTextChannels(guildId: string): Promise<IDiscordChannelModel[]> {
    const cached = await this.redis.get<IDiscordChannelModel[]>(
      discordGuildChannels(guildId),
    );
    return cached ?? [];
  }
}
