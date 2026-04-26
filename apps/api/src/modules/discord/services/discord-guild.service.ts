import { Injectable } from '@nestjs/common';
import { IDiscordApiGuildMemberModel, IDiscordApiGuildModel, IDiscordGuildMemberModel, IDiscordGuildModel } from '../models';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { DiscordGuildMapper } from '../mappers';
import { DiscordBaseService } from './discord-base.service';

@Injectable()
export class DiscordGuildService {
  constructor(
    private readonly discordBaseService: DiscordBaseService,
    private readonly discordGuildMapper: DiscordGuildMapper,
    private readonly httpService: HttpService,
  ) {}

  async getDiscordUserGuilds(userId: string, limit: number = 20, withCounts: boolean = false, beginWithGuildId?: string): Promise<IDiscordGuildModel[]> {
    const discordAccessToken = await this.discordBaseService.getUserDiscordAccessToken(userId);
    const { data, } = await firstValueFrom(
      this.httpService.get<IDiscordApiGuildModel[]>(
        'users/@me/guilds',
        {
          ...this.discordBaseService.getRequestHeadersWithDiscordToken(discordAccessToken),
          params: {
            after: beginWithGuildId,
            limit,
            with_counts: withCounts,
          },
        },
      ),
    );
    return data.map(guild => this.discordGuildMapper.ApiToGuildModel(guild))
  }

  async getDiscordUserGuildMember(userId: string, guildId: string): Promise<IDiscordGuildMemberModel> {
    const discordAccessToken = await this.discordBaseService.getUserDiscordAccessToken(userId);
    const { data, } = await firstValueFrom(
      this.httpService.get<IDiscordApiGuildMemberModel>(
        `users/@me/guilds/${guildId}/member`,
        this.discordBaseService.getRequestHeadersWithDiscordToken(discordAccessToken),
      ),
    );
    return this.discordGuildMapper.ApiToMemberModel(data);
  }
}
