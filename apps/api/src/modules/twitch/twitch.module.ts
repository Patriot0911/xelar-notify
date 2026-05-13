import { Module, OnModuleInit } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchAppEntity, TwitchStreamerEventEntity } from '@libs/database';
import { TwitchAuthService, TwitchApiService } from './services';
import { TwitchTokenManager } from './twitch-token.manager';
import { TwitchAuthInterceptor } from './twitch-auth.interceptor';
import { TwitchApiMapper, TwitchAppMapper } from './mappers';
import { TwitchAppsRepository } from './repositories';
import { DataSource } from 'typeorm';
import { TwitchController } from './controllers/twitch.controller';
import { CryptoService } from '@libs/shared';
import { TwitchAppService } from './services/twitch-app.service';

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
  ],
  providers: [
    TwitchAuthService,
    TwitchTokenManager,
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
    TwitchAuthService,
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
