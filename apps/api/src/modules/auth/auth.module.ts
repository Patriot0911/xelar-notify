import { TwitchStreamerEntity, UserEntity, UserSessionEntity } from '@libs/database/entities';
import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService, MeService, PasswordService } from './services';
import { AuthMapper } from './mappers';
import { AuthController } from './controllers';
import { JwtAccessStrategy, JwtRefreshStrategy } from './strategies';
import { DiscordModule } from '../discord';
import { RolesModule } from '../roles';
import { TwitchModule } from '../twitch/twitch.module';
import { TwitchSubscriptionsModule } from '../twitch-subscriptions/twitch-subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserSessionEntity,
      TwitchStreamerEntity,
    ]),
    PassportModule,
    JwtModule,
    DiscordModule,
    RolesModule,
    TwitchModule,
    TwitchSubscriptionsModule,
  ],
  controllers: [
    AuthController,
  ],
  providers: [
    JwtService,
    PasswordService,
    AuthService,
    MeService,
    AuthMapper,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
  exports: [],
})
export class AuthModule {}
