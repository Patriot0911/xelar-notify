import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { JwtRefreshGuard, JwtAccessGuard } from '../guards';
import { AuthService, MeService } from '../services';
import { IRefreshTokenPayloadWithToken, IAccessTokenPayload, IAuthResponse, IUserPayload } from '../models';
import { ApiGenericResponses, Feature, FeatureGuard } from '../../../shared';
import { AuthResponseDto, LoginByEmailDto, RegistrationByEmailDto, UserPayloadDto } from '../dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DiscordAuthService } from '../../discord';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly discordAuthService: DiscordAuthService,
    private readonly meService: MeService,
  ) {}

  @Post('login/email')
  @ApiGenericResponses({ [HttpStatus.CREATED]: AuthResponseDto, })
  async login(@Body() data: LoginByEmailDto): Promise<IAuthResponse> {
    return await this.authService.loginByEmail(data);
  }

  @Post('register/email')
  @Feature('register-email')
  @UseGuards(FeatureGuard)
  @ApiGenericResponses({ [HttpStatus.CREATED]: AuthResponseDto, })
  async registerByEmail(@Body() data: RegistrationByEmailDto): Promise<IAuthResponse> {
    return await this.authService.registerByEmail(data);
  }

  @Post('discord')
  @Feature('register-discord')
  @UseGuards(FeatureGuard)
  @ApiGenericResponses({ [HttpStatus.MOVED_PERMANENTLY]: String, })
  async redirectForDiscordAuth(@Res() res) {
    const redirectUri = this.discordAuthService.getDiscordAuthRedirectUri();
    return res.redirect(redirectUri);
  }

  @Get('discord/authorize')
  @Feature('register-discord')
  @UseGuards(FeatureGuard)
  @ApiGenericResponses({ [HttpStatus.CREATED]: AuthResponseDto, })
  async authByDiscord(@Query('code') code: string): Promise<IAuthResponse> {
    return await this.authService.authByDiscordCode(code);
  }

  @Post('refresh')
  @ApiBearerAuth()
  @UseGuards(JwtRefreshGuard)
  @ApiGenericResponses({ [HttpStatus.CREATED]: AuthResponseDto, })
  async refresh(@Req() request): Promise<IAuthResponse> {
    const { sub, refreshToken } = <IRefreshTokenPayloadWithToken> request.user;
    return await this.authService.refreshToken(sub, refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  async logout(@Req() request): Promise<boolean> {
    const { sub } = <IAccessTokenPayload> request.user;
    return await this.authService.logout(sub);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @ApiGenericResponses({ [HttpStatus.OK]: UserPayloadDto, })
  async me(@Req() request): Promise<IUserPayload> {
    const { sub, } = <IAccessTokenPayload> request.user;
    return await this.meService.getMe(sub);
  }

  @Get('me/guilds')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @ApiGenericResponses({ [HttpStatus.OK]: UserPayloadDto, })
  async getMeGuilds(@Req() request): Promise<IUserPayload> {
    const { sub, } = <IAccessTokenPayload> request.user;
    return await this.meService.getUserDiscordGuilds(sub);
  }
}
