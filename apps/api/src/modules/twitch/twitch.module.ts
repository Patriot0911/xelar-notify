import { Module, OnModuleInit } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchAppEntity } from '@libs/database';
import { TwitchAuthService, TwitchApiService, TwitchAdminService } from './services';
import { TwitchTokenManager } from './twitch-token.manager';
import { TwitchAuthInterceptor } from './twitch-auth.interceptor';
import { TwitchAdminController } from './controllers';
import { TwitchAppMapper } from './mappers';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://api.twitch.tv',
      timeout: 5000,
    }),
    TypeOrmModule.forFeature([
      TwitchAppEntity,
    ]),
  ],
  controllers: [TwitchAdminController],
  providers: [
    TwitchAuthService,
    TwitchTokenManager,
    TwitchApiService,
    TwitchAuthInterceptor,
    TwitchAppMapper,
    TwitchAdminService,
  ],
  exports: [],
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
