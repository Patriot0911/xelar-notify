import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RpcPatterns } from '@libs/rpc/patterns';
import { RpcPayload } from '@libs/rpc';
import { ISearchStreamersResult } from '@libs/shared';
import { TwitchApiService } from '../../twitch/services';
import { SearchStreamersDto } from '../dto';

const MIN_SEARCH_LENGTH = 2;
const MAX_RESULTS = 25;

@Controller()
export class SearchStreamersHandler {
  constructor(
    private readonly twitchApiService: TwitchApiService,
  ) {}

  @MessagePattern(RpcPatterns.discord.searchStreamers)
  async handle(@RpcPayload() data: SearchStreamersDto): Promise<ISearchStreamersResult> {
    const search = data.search.trim();

    if (search.length < MIN_SEARCH_LENGTH) {
      return { items: [] };
    }

    const { items } = await this.twitchApiService.getChannels(search, undefined, MAX_RESULTS);

    return {
      items: items.map(c => ({
        broadcasterId: c.broadcasterId,
        broadcasterLogin: c.broadcasterLogin,
        displayName: c.displayName,
      })),
    };
  }
}
