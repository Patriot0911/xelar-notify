import { AppConfig } from '@libs/config';
import { Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from "passport-jwt";
import { TokenType } from '../models/token-type.enum';
import { Request } from 'express';
import { IRefreshTokenPayload, IRefreshTokenPayloadWithToken } from '../models';
import { AuthService } from '../services';

@Injectable({
  scope: Scope.DEFAULT,
})
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh',) {
  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_REFRESH'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: IRefreshTokenPayload): Promise<IRefreshTokenPayloadWithToken> {
    if (payload.use != TokenType.Refresh) {
      throw new UnauthorizedException('Refresh denied');
    }
    const token = req.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const isValidRefreshToken = await this.authService.verifyRefreshToken(payload.sub, token);
    if (!isValidRefreshToken) {
      throw new UnauthorizedException('Refresh denied');
    }
    return { ...payload, refreshToken: token };
  }
}