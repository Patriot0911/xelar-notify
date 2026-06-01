import { Injectable } from '@nestjs/common';
import { DiscordTokenService } from './discord-token.service';
import { firstValueFrom } from 'rxjs';
import { IDiscordApiGuildModel, IDiscordApiMeModel, IDiscordGuildModel, IDiscordMeModel } from '../models';
import { HttpService } from '@nestjs/axios';
import { DiscordAuthMapper, DiscordGuildMapper } from '../mappers';
import { RedisService, userGuilds } from '@libs/redis';
import { DiscordBaseService } from './discord-base.service';

const DISCORD_API_CACHE = 10 * 60 * 1000;

@Injectable()
export class DiscordApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly discordTokenService: DiscordTokenService,
    private readonly discordGuildMapper: DiscordGuildMapper,
    private readonly discordAuthMapper: DiscordAuthMapper,
    private readonly discordBaseService: DiscordBaseService,
    private readonly redis: RedisService,
  ) {}

  async fetchUserGuilds(userId: string): Promise<IDiscordGuildModel[]> {
    const cachedGuilds = await this.redis.get<IDiscordGuildModel[]>(userGuilds(userId));
    if (cachedGuilds) {
      return cachedGuilds;
    }

    const token = await this.discordTokenService.getValidToken(userId);

    const { data } = await firstValueFrom(
      this.httpService.get<IDiscordApiGuildModel[]>(
        'https://discord.com/api/users/@me/guilds',
        {
          params: { with_counts: true, },
          headers: { Authorization: `Bearer ${token}` }
        },
      ),
    );

    const result = data.map(
      g => this.discordGuildMapper.ApiToGuildModel(g)
    );

    await this.redis.set(userGuilds(userId), result, DISCORD_API_CACHE);

    return result;
  }

  async fetchMeUser(userId: string): Promise<IDiscordMeModel> {
    const token = await this.discordTokenService.getValidToken(userId);
    return this.fetchMeUserByToken(token);
  }

  async fetchMeUserByToken(token: string): Promise<IDiscordMeModel> {
    const { data, } = await firstValueFrom(
      this.httpService.get<IDiscordApiMeModel>(
        'users/@me',
        this.discordBaseService.getRequestHeadersWithDiscordToken(token)
      ),
    );
    return this.discordAuthMapper.apiToMeModel(data);
  }
}
