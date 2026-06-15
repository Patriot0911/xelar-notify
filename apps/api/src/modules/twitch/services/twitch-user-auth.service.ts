import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { twitchAuthConfig } from '@libs/config';
import { ITwitchUserTokensModel, ITwitchUserTokenResponseModel } from '../models';
import { TwitchAppsRepository } from '../repositories';
import { TwitchTokenRevokedException } from '../../auth/exceptions';

@Injectable()
export class TwitchUserAuthService {
  private readonly authBaseUrl = 'https://id.twitch.tv';

  constructor(
    private readonly httpService: HttpService,
    private readonly twitchAppsRepository: TwitchAppsRepository,
    @Inject(twitchAuthConfig.KEY)
    private readonly twitchAuthConfigService: ConfigType<typeof twitchAuthConfig>,
  ) {}

  async getAuthRedirectUri(): Promise<string> {
    const app = await this.getInternalApp();

    const params = new URLSearchParams({
      client_id: app.clientId,
      response_type: 'code',
      redirect_uri: this.twitchAuthConfigService.redirectUri,
      scope: this.twitchAuthConfigService.scopes,
    });
    return `${this.authBaseUrl}/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<ITwitchUserTokensModel> {
    const app = await this.getInternalApp(true);

    try {
      const { data, } = await firstValueFrom(
        this.httpService.post<ITwitchUserTokenResponseModel>(
          `${this.authBaseUrl}/oauth2/token`,
          new URLSearchParams({
            client_id: app.clientId,
            client_secret: app.clientSecret,
            grant_type: 'authorization_code',
            code,
            redirect_uri:  this.twitchAuthConfigService.redirectUri,
          }).toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        ),
      );
      return this.toTokensModel(data);
    } catch(e: unknown) {
      const { message, status } = <AxiosError> e;
      console.error(message);
      throw new InternalServerErrorException(
        `Twitch authorization went wrong. Please contact administrator for more information [${status}]`
      );
    }
  }

  async refreshUserToken(refreshToken: string): Promise<ITwitchUserTokensModel> {
    const app = await this.getInternalApp(true);

    try {
      const { data, } = await firstValueFrom(
        this.httpService.post<ITwitchUserTokenResponseModel>(
          `${this.authBaseUrl}/oauth2/token`,
          new URLSearchParams({
            client_id:     app.clientId,
            client_secret: app.clientSecret,
            grant_type:    'refresh_token',
            refresh_token: refreshToken,
          }).toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        ),
      );
      return this.toTokensModel(data);
    } catch(e: unknown) {
      const { message, status } = <AxiosError> e;
      console.error(message);
      if (status === 401) {
        throw new TwitchTokenRevokedException();
      }
      throw new InternalServerErrorException(
        `Twitch authorization went wrong. Please contact administrator for more information [${status}]`
      );
    }
  }

  async getInternalApp(shouldDecrypt = false) {
    const app = await this.twitchAppsRepository.findInternalApp(shouldDecrypt, { clientSecret: true });
    if (!app) {
      throw new NotFoundException('No internal Twitch app is configured for user authorization');
    }
    return app;
  }

  private toTokensModel(data: ITwitchUserTokenResponseModel): ITwitchUserTokensModel {
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }
}
