import { Module } from '@nestjs/common';
import { discordProvider } from './discord.provider';
import { DiscordExplorer } from './discord.explorer';
import { DiscoveryModule } from '@nestjs/core';
import { GuildSyncService } from './guild-sync.service';
import { ChannelSyncService } from './channel-sync.service';

@Module({
  imports: [DiscoveryModule],
  providers: [
    discordProvider,
    DiscordExplorer,
    GuildSyncService,
    ChannelSyncService,
  ],
  exports: [
    discordProvider,
    DiscordExplorer,
  ],
})
export class DiscordModule {}
