import { AppConfig, AppConfigModule } from '@libs/config';
import { AccountModule, DiscordModule, NotificationsModule } from './modules';
import { Module } from '@nestjs/common';
import { RpcModule } from '@libs/rpc';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    AppConfigModule,
    AccountModule,
    DiscordModule,
    NotificationsModule,
    RpcModule.forRootAsync({
      inject:     [ConfigService],
      useFactory: (config: ConfigService<AppConfig>) => ({
        host: config.get('API_HOST')!,
        port: config.get('API_TCP_PORT')!,
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class DiscordBotModule {}
