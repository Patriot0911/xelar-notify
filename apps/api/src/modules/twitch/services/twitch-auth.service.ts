import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ITwitchTokenResponseModel } from '../models';
import { InjectRepository } from '@nestjs/typeorm';
import { TwitchAppEntity } from '@libs/database';
import { Repository } from 'typeorm';
import { TwitchTokenManager } from '../twitch-token.manager';

@Injectable()
export class TwitchAuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly tokenManager: TwitchTokenManager,
    @InjectRepository(TwitchAppEntity)
    private readonly twitchAppsRepository: Repository<TwitchAppEntity>,
  ) {}

  async getTokenForApp(clientId: string, forceRefresh = false): Promise<string> {
    if (forceRefresh) {
      this.tokenManager.invalidate(clientId);
    }

    return this.tokenManager.getOrRefresh(clientId, async () => {
      const app = await this.twitchAppsRepository.findOne({
        where: { clientId },
      });

      if (!app) {
        throw new NotFoundException(`Twitch app ${clientId} not found`);
      }

      const tokenData = await this.fetchToken(app.clientId, app.clientSecret);
      this.tokenManager.setToken(clientId, tokenData.access_token, tokenData.expires_in);
      return tokenData.access_token;
    });
  }

  async fetchToken(clientId: string, clientSecret: string) {
    const params = new URLSearchParams({
      client_id:     clientId,
      client_secret: clientSecret,
      grant_type:    'client_credentials',
    });
    const { data } = await firstValueFrom(
      this.httpService.post<ITwitchTokenResponseModel>(
        '/oauth2/token',
        params.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      ),
    );
    return data;
  }
}
