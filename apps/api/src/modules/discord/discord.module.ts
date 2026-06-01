import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DiscordWebhookiService, DiscordAuthService, DiscordBaseService, DiscordGuildService, DiscordApiService, DiscordTokenService } from './services';
import { DiscordGuard } from './guards';
import { DiscordAuthMapper, DiscordGuildMapper } from './mappers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordGuildEntity, UserEntity } from '@libs/database';
import { DiscordController } from './controllers';

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
    DiscordGuard,
  ],
  controllers: [DiscordController],
  exports: [
    DiscordAuthService,
    DiscordBaseService,
    DiscordGuildService,
    DiscordWebhookiService,
    DiscordApiService,
    DiscordTokenService,
    DiscordGuard,
  ],
})
export class DiscordModule {}
