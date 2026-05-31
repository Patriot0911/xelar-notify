import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DiscordWebhookiService, DiscordAuthService, DiscordBaseService, DiscordGuildService, DiscordApiService, DiscordTokenService } from './services';
import { DiscordAuthMapper, DiscordGuildMapper } from './mappers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordGuildEntity, UserEntity } from '@libs/database';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://discord.com/api',
      timeout: 5000,
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      DiscordGuildEntity,
    ]),
  ],
  providers: [
    DiscordBaseService,
    DiscordGuildService,
    DiscordAuthService,
    DiscordAuthMapper,
    DiscordGuildMapper,
    DiscordWebhookiService,
    DiscordApiService,
    DiscordTokenService,
  ],
  exports: [
    DiscordAuthService,
    DiscordBaseService,
    DiscordGuildService,
    DiscordWebhookiService,
    DiscordApiService,
    DiscordTokenService,
  ],
})
export class DiscordModule {}
