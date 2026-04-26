import { UserEntity } from '@libs/database/entities/user.entity';
import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService, PasswordService } from './services';
import { AuthMapper } from './mappers';
import { AuthController } from './controllers';
import { JwtAccessStrategy, JwtRefreshStrategy } from './strategies';
import { HttpModule } from '@nestjs/axios';
import { DiscordModule } from '../discord';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
    ]),
    HttpModule,
    PassportModule,
    JwtModule,
    DiscordModule,
  ],
  controllers: [
    AuthController,
  ],
  providers: [
    JwtService,
    PasswordService,
    AuthService,
    AuthMapper,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
  exports: [],
})
export class AuthModule {}
