import { Module, OnModuleInit } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchAppEntity, TwitchStreamerEventEntity } from '@libs/database';
import { TwitchAppAuthService, TwitchApiService, TwitchAppService } from './services';
import { TwitchAppTokenManager } from './twitch-token.manager';
import { TwitchAuthInterceptor } from './twitch-auth.interceptor';
import { TwitchController } from './controllers/twitch.controller';
import { TwitchApiMapper, TwitchAppMapper } from './mappers';
import { TwitchAppsRepository } from './repositories';
import { DataSource } from 'typeorm';
import { CryptoService } from '@libs/shared';
import { TwitchAppController } from './controllers';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://api.twitch.tv',
      timeout: 5000,
    }),
    TypeOrmModule.forFeature([
      TwitchAppEntity,
      TwitchStreamerEventEntity,
    ]),
  ],
  controllers: [
    TwitchController,
    TwitchAppController,
  ],
  providers: [
    TwitchAppAuthService,
    TwitchAppTokenManager,
    TwitchApiService,
    TwitchAuthInterceptor,
    TwitchAppMapper,
    TwitchApiMapper,
    TwitchAppsRepository,
    TwitchAppService,
    {
      provide: TwitchAppsRepository,
      useFactory: (dataSource: DataSource, crypto: CryptoService) =>
        new TwitchAppsRepository(dataSource, crypto),
      inject: [DataSource, CryptoService],
    }
  ],
  exports: [
    TwitchAppAuthService,
    TwitchAppsRepository,
    TwitchAppMapper,
    TwitchApiService,
    TwitchAppService,
  ],
})
export class TwitchModule implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,
    private readonly interceptor: TwitchAuthInterceptor,
  ) {}

  onModuleInit() {
    this.interceptor.createAxiosInterceptors(this.httpService);
  }
}
