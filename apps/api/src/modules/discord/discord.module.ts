import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, TcpClientOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordWebhookiService, DiscordAuthService, DiscordBaseService, DiscordGuildService, DiscordApiService, DiscordTokenService, DiscordChannelsService } from './services';
import { DiscordRolesService } from './services/discord-roles.service';
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
    DiscordBaseService,
    DiscordGuildService,
    DiscordAuthService,
    DiscordAuthMapper,
    DiscordGuildMapper,
    DiscordWebhookiService,
    DiscordApiService,
    DiscordTokenService,
    DiscordChannelsService,
    DiscordRolesService,
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
    DiscordChannelsService,
    DiscordRolesService,
    DiscordGuard,
  ],
})
export class DiscordModule {}
