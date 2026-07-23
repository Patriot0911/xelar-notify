import { Injectable } from '@nestjs/common';
import { RedisService, twitchGameName } from '@libs/redis';
import { ITwitchApiCategoryNormalizedModel } from '../models';
import { TwitchApiService } from './twitch-api.service';

const GAME_NAME_CACHE_TTL_SECONDS = 60 * 60 * 24 * 7;

@Injectable()
export class TwitchGamesService {
  constructor(
    private readonly redisService: RedisService,
    private readonly twitchApiService: TwitchApiService,
  ) {}

  async resolveNames(gameIds: string[]): Promise<ITwitchApiCategoryNormalizedModel[]> {
    const uniqueIds = [...new Set(gameIds)];
    if (uniqueIds.length === 0) return [];

    const cached = await Promise.all(
      uniqueIds.map((id) => this.redisService.get<ITwitchApiCategoryNormalizedModel>(this.cacheKey(id))),
    );

    const missingIds = uniqueIds.filter((_, i) => !cached[i]);
    const resolved = missingIds.length > 0 ? await this.twitchApiService.getGamesByIds(missingIds) : [];

    await Promise.all(
      resolved.map((game) => this.redisService.set(this.cacheKey(game.id), game, GAME_NAME_CACHE_TTL_SECONDS)),
    );

    const byId = new Map<string, ITwitchApiCategoryNormalizedModel>();
    cached.forEach((game) => { if (game) byId.set(game.id, game); });
    resolved.forEach((game) => byId.set(game.id, game));

    return uniqueIds.map((id) => byId.get(id)).filter((g): g is ITwitchApiCategoryNormalizedModel => !!g);
  }

  private cacheKey(gameId: string): string {
    return twitchGameName(gameId);
  }
}
