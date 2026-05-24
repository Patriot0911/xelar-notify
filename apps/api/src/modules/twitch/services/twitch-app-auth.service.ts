import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ITwitchTokenResponseModel } from '../models';
import { TwitchAppTokenManager } from '../twitch-token.manager';
import { AxiosError } from 'axios';
import { TwitchAppsRepository } from '../repositories';

@Injectable()
export class TwitchAppAuthService {
  private authBaseUrl = 'https://id.twitch.tv';

  constructor(
    private readonly httpService: HttpService,
    private readonly appTokenManager: TwitchAppTokenManager,
    private readonly twitchAppsRepository: TwitchAppsRepository,
  ) {}

  async getTokenForApp(clientId: string, forceRefresh = false): Promise<string> {
    if (forceRefresh) {
      this.appTokenManager.invalidate(clientId);
    }

    return this.appTokenManager.getOrRefresh(clientId, async () => {
      const app = await this.twitchAppsRepository.findOne({
        where: { clientId },
      }, true, { clientSecret: true });

      if (!app) {
        throw new NotFoundException(`Twitch app ${clientId} not found`);
      }

      const tokenData = await this.fetchToken(app.clientId, app.clientSecret);
      this.appTokenManager.setToken(clientId, tokenData.access_token, tokenData.expires_in);
      return tokenData.access_token;
    });
  }

  async fetchToken(clientId: string, clientSecret: string) {
    const params = new URLSearchParams({
      client_id:     clientId,
      client_secret: clientSecret,
      grant_type:    'client_credentials',
    });
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<ITwitchTokenResponseModel>(
          `${this.authBaseUrl}/oauth2/token`,
          params.toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        ),
      );
      return data;
    } catch(e: unknown) {
      const { message, status } = <AxiosError> e;
      console.error(message);
      throw new InternalServerErrorException(
        `Twitch App authorization went wrong. Please contact administrator for more information [${status}]`
      );
    }
  }
}
