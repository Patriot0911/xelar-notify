import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DiscordWebhookiService, DiscordAuthService, DiscordBaseService, DiscordGuildService } from './services';
import { DiscordAuthMapper, DiscordGuildMapper } from './mappers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@libs/database';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://discord.com/api',
      timeout: 5000,
    }),
    TypeOrmModule.forFeature([
      UserEntity,
    ]),
  ],
  providers: [
    DiscordBaseService,
    DiscordGuildService,
    DiscordAuthService,
    DiscordAuthMapper,
    DiscordGuildMapper,
    DiscordWebhookiService,
  ],
  exports: [
    DiscordAuthService,
    DiscordBaseService,
    DiscordGuildService,
    DiscordWebhookiService,
  ],
})
export class DiscordModule {}
