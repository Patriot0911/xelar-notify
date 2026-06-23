import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RpcPatterns } from '@libs/rpc/patterns';
import { GuildSyncService } from './guild-sync.service';

@Controller()
export class GetGuildIdsHandler {
  constructor(private readonly guildSync: GuildSyncService) {}

  @MessagePattern(RpcPatterns.bot.getGuildIds)
  handle() {
    return this.guildSync.syncGuilds();
  }
}
