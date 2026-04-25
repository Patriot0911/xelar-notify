import { Module } from '@nestjs/common';
import { discordProvider } from './discord.provider';
import { DiscordExplorer } from './discord.explorer';
import { DiscoveryModule } from '@nestjs/core';

@Module({
  imports: [DiscoveryModule],
  providers: [
    discordProvider,
    DiscordExplorer,
  ],
  exports: [
    discordProvider,
    DiscordExplorer,
  ],
})
export class DiscordModule {}
