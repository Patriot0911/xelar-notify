import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RpcPatterns } from '@libs/rpc/patterns';
import { RpcPayload } from '@libs/rpc';
import type { ITwitchChannelInfoResult, ITwitchGetChannelInfoPayload } from '@libs/shared';
import { TwitchApiService } from '../services';

@Controller()
export class TwitchRpcController {
  constructor(private readonly twitchApiService: TwitchApiService) {}

  @MessagePattern(RpcPatterns.twitch.getChannelInfo)
  async getChannelInfo(
    @RpcPayload() payload: ITwitchGetChannelInfoPayload,
  ): Promise<ITwitchChannelInfoResult> {
    // todo: add assert update channel info
    return await this.twitchApiService.getChannelById(payload.broadcasterId);
  }
}
