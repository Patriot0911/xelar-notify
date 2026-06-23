import { Module } from '@nestjs/common';
import { discordProvider } from './discord.provider';
import { DiscordExplorer } from './discord.explorer';
import { DiscoveryModule } from '@nestjs/core';
import { GuildSyncService } from './guild-sync.service';
import { ChannelSyncService } from './channel-sync.service';
import { GetGuildRolesHandler } from './get-guild-roles.handler';
import { GetGuildMemberHandler } from './get-guild-member.handler';
import { GetGuildChannelsHandler } from './get-guild-channels.handler';
import { GetGuildIdsHandler } from './get-guild-ids.handler';

@Module({
  imports: [DiscoveryModule],
  providers: [
    discordProvider,
    DiscordExplorer,
    GuildSyncService,
    ChannelSyncService,
  ],
  controllers: [GetGuildRolesHandler, GetGuildMemberHandler, GetGuildChannelsHandler, GetGuildIdsHandler],
  exports: [
    discordProvider,
    DiscordExplorer,
  ],
})
export class DiscordModule {}
