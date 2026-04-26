import { Body, Controller, Get, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { JwtRefreshGuard, JwtAccessGuard } from '../guards';
import { AuthService } from '../services';
import { IRefreshTokenPayloadWithToken, IAccessTokenPayload, IAuthResponse, IUserPayload } from '../models';
import { ApiGenericResponses, Feature, FeatureGuard } from '../../shared';
import { AuthResponseDto, LoginByEmailDto, RegistrationByEmailDto, UserPayloadDto } from '../dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
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
  async register(@Body() data: RegistrationByEmailDto): Promise<IAuthResponse> {
    return await this.authService.registerByEmail(data);
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
    return await this.authService.getMe(sub);
  }
}
