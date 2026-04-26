import { AppConfig } from '@libs/config';
import { Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from "passport-jwt";
import { IAccessTokenPayload, TokenType } from '../models';

@Injectable({
  scope: Scope.DEFAULT,
})
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access',) {
  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET_ACCESS'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: IAccessTokenPayload): Promise<IAccessTokenPayload> {
    if (payload.use != TokenType.Access) {
      throw new UnauthorizedException('Access denied');
    }
    return payload;
  }
}