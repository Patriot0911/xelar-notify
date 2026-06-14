import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, TcpClientOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordWebhookService, DiscordAuthService, DiscordApiBaseService, DiscordGuildService, DiscordApiService, DiscordTokenService, DiscordBotService } from './services';
import { DiscordGuildAccessService } from './services/discord-guild-access.service';
import { DiscordGuard } from './guards';
import { DiscordAuthMapper, DiscordGuildMapper } from './mappers';
import { DiscordGuildEntity, UserEntity } from '@libs/database';
import { DiscordController } from './controllers';
import { BOT_RPC_CLIENT } from '@libs/rpc';
import type { AppConfig } from '@libs/config';

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
    ClientsModule.registerAsync([
      {
        name: BOT_RPC_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService<AppConfig>): TcpClientOptions => ({
          transport: Transport.TCP,
          options: {
            host: config.get('BOT_HOST')!,
            port: config.get('BOT_TCP_PORT')!,
          },
        }),
      },
    ]),
  ],
  providers: [
    DiscordApiBaseService,
    DiscordGuildService,
    DiscordAuthService,
    DiscordAuthMapper,
    DiscordGuildMapper,
    DiscordWebhookService,
    DiscordApiService,
    DiscordTokenService,
    DiscordBotService,
    DiscordGuildAccessService,
    DiscordGuard,
  ],
  controllers: [DiscordController],
  exports: [
    DiscordAuthService,
    DiscordApiBaseService,
    DiscordGuildService,
    DiscordWebhookService,
    DiscordApiService,
    DiscordTokenService,
    DiscordBotService,
    DiscordGuildAccessService,
    DiscordGuard,
  ],
})
export class DiscordModule {}
