import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscordGuildEntity } from '@libs/database';
import { Repository } from 'typeorm';
import { botGuildIds, RedisService } from '@libs/redis';
import { DiscordApiService } from './discord-api.service';

const BASE_GUILD_BALANCE = 0;

@Injectable()
export class DiscordGuildService {
  constructor(
    private readonly discordApiService: DiscordApiService,
    private readonly redis: RedisService,
    @InjectRepository(DiscordGuildEntity)
    private readonly discordGuildRepository: Repository<DiscordGuildEntity>,
  ) {}

  async getUserGuilds(userId: string) {
    return this.discordApiService.fetchUserGuilds(userId);
  }

  async getUserGuildsWithBot(userId: string) {
    const [userGuilds, botGuildIds] = await Promise.all([
      this.discordApiService.fetchUserGuilds(userId),
      this.getBotGuildIds(),
    ]);

    const botGuildSet = new Set(botGuildIds);

    return userGuilds.filter((guild) => botGuildSet.has(guild.id));
  }

  private async getBotGuildIds(): Promise<string[]> {
    const cached = await this.redis.get<string[]>(botGuildIds());
    if (cached) return cached;

    return [];
  }

  // async getDiscordUserGuildMember(userId: string, discordGuildId: string): Promise<IDiscordGuildMemberModel> {
  //   const discordAccessToken = await this.discordBaseService.getUserDiscordAccessToken(userId);
  //   const { data, } = await firstValueFrom(
  //     this.httpService.get<IDiscordApiGuildMemberModel>(
  //       `users/@me/guilds/${discordGuildId}/member`,
  //       this.discordBaseService.getRequestHeadersWithDiscordToken(discordAccessToken),
  //     ),
  //   );
  //   return this.discordGuildMapper.ApiToMemberModel(data);
  // }

  async getOrCreateGuild(discordGuildId: string) {
    const guild = await this.discordGuildRepository.findOne({
      where: { guildId: discordGuildId, },
    });
    if (guild !== null) {
      return guild;
    }
    const createdGuild = this.discordGuildRepository.create({
      balance: BASE_GUILD_BALANCE,
      guildId: discordGuildId,
    });
    const savedGuild = await this.discordGuildRepository.save(createdGuild);
    return savedGuild;
  }
}
