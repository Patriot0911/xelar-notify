import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcPatterns } from '@libs/rpc/patterns';
import { ChannelSyncService } from './channel-sync.service';

interface IGetGuildChannelsPayload {
  guildId: string;
}

@Controller()
export class GetGuildChannelsHandler {
  constructor(private readonly channelSync: ChannelSyncService) {}

  @MessagePattern(RpcPatterns.bot.getGuildChannels)
  handle(@Payload() { guildId }: IGetGuildChannelsPayload) {
    return this.channelSync.syncGuild(guildId);
  }
}
