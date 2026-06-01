import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtRefreshGuard, JwtAccessGuard } from '../guards';
import { DiscordGuard } from '../../discord/guards';
import { AuthService, MeService } from '../services';
import {
  IRefreshTokenPayloadWithToken,
  IAccessTokenPayload,
  IAuthResponse,
  IUserPayload,
  ISessionModel,
} from '../models';
import { ApiGenericResponses, Feature, FeatureGuard } from '../../../shared';
import {
  AuthResponseDto,
  LinkDiscordDto,
  LoginByEmailDto,
  RegistrationByEmailDto,
  SessionDto,
  UpdateProfileDto,
  UserPayloadDto,
} from '../dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DiscordAuthService } from '../../discord/services';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly discordAuthService: DiscordAuthService,
    private readonly meService: MeService,
  ) {}

  @Post('login/email')
  @ApiGenericResponses({ [HttpStatus.CREATED]: AuthResponseDto })
  async login(@Body() data: LoginByEmailDto): Promise<IAuthResponse> {
    return await this.authService.loginByEmail(data);
  }

  @Post('register/email')
  @Feature('register-email')
  @UseGuards(FeatureGuard)
  @ApiGenericResponses({ [HttpStatus.CREATED]: AuthResponseDto })
  async registerByEmail(@Body() data: RegistrationByEmailDto): Promise<IAuthResponse> {
    return await this.authService.registerByEmail(data);
  }

  @Post('discord')
  @Feature('register-discord')
  @UseGuards(FeatureGuard)
  @ApiGenericResponses({ [HttpStatus.MOVED_PERMANENTLY]: String })
  async redirectForDiscordAuth(@Res() res) {
    const redirectUri = this.discordAuthService.getDiscordAuthRedirectUri();
    return res.redirect(redirectUri);
  }

  @Get('discord/authorize')
  @Feature('register-discord')
  @UseGuards(FeatureGuard)
  @ApiGenericResponses({ [HttpStatus.CREATED]: AuthResponseDto })
  async authByDiscord(@Query('code') code: string): Promise<IAuthResponse> {
    return await this.authService.authByDiscordCode(code);
  }

  @Post('refresh')
  @ApiBearerAuth()
  @UseGuards(JwtRefreshGuard)
  @ApiGenericResponses({ [HttpStatus.CREATED]: AuthResponseDto })
  async refresh(@Req() request): Promise<IAuthResponse> {
    const { sub, sessionId, refreshToken } = <IRefreshTokenPayloadWithToken>request.user;
    return await this.authService.refreshToken(sub, sessionId, refreshToken);
  }

  @Post('refresh/discord')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  async refreshDiscord(@Req() request): Promise<boolean> {
    const { sub } = <IAccessTokenPayload>request.user;
    return await this.authService.refreshDiscordToken(sub);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request): Promise<boolean> {
    const { sub, jti, sessionId, exp } = <IAccessTokenPayload>request.user;
    return await this.authService.logout(sub, sessionId, jti, exp!);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @ApiGenericResponses({ [HttpStatus.OK]: UserPayloadDto })
  async me(@Req() request): Promise<IUserPayload> {
    const { sub } = <IAccessTokenPayload>request.user;
    return await this.meService.getMe(sub);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Req() request, @Body() data: UpdateProfileDto): Promise<void> {
    const { sub } = <IAccessTokenPayload>request.user;
    return await this.meService.updateProfile(sub, data);
  }

  @Get('sessions')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @ApiGenericResponses({ [HttpStatus.OK]: SessionDto })
  async getSessions(@Req() request): Promise<ISessionModel[]> {
    const { sub } = <IAccessTokenPayload>request.user;
    return await this.authService.getSessions(sub);
  }

  @Delete('sessions/:sessionId')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @Req() request,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ): Promise<boolean> {
    const { sub } = <IAccessTokenPayload>request.user;
    return await this.authService.revokeSession(sub, sessionId);
  }

  @Post('discord/link')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  async linkDiscord(@Req() request, @Body() data: LinkDiscordDto): Promise<void> {
    const { sub } = <IAccessTokenPayload>request.user;
    return await this.authService.linkDiscord(sub, data.code);
  }

  @Delete('discord/unlink')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.OK)
  async unlinkDiscord(@Req() request): Promise<void> {
    const { sub } = <IAccessTokenPayload>request.user;
    return await this.authService.unlinkDiscord(sub);
  }
}
