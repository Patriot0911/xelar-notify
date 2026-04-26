import { discordConfig } from '@libs/config';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { IDiscordApiMeModel, IDiscordMeModel, IDiscordTokensModel } from '../models';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { DiscordAuthMapper } from '../mappers';

@Injectable()
export class DiscordAuthService {
  constructor(
    @Inject(discordConfig.KEY)
    private discordConfigService: ConfigType<typeof discordConfig>,
    private readonly discordAuthMapper: DiscordAuthMapper,
    private readonly httpService: HttpService,
  ) {}

  getDiscordAuthRedirectUri(): string {
    const { clientId, redirectUri, apiUrl } = this.discordConfigService;

    const params = new URLSearchParams({
      client_id:     clientId,
      response_type: 'code',
      redirect_uri:  redirectUri,
      scope:         'identify email guilds',
    });
    return `${apiUrl}/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<IDiscordTokensModel> {
    const { clientId, redirectUri, clientSecret } = this.discordConfigService;
    const { data, } = await firstValueFrom(
      this.httpService.post(
        'oauth2/token',
        new URLSearchParams({
          client_id:     clientId,
          client_secret: clientSecret,
          grant_type:    'authorization_code',
          code,
          redirect_uri:  redirectUri,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );
    return data;
  }

  async getDiscordMe(accessToken: string): Promise<IDiscordMeModel> {
    const { data, } = await firstValueFrom(
      this.httpService.get<IDiscordApiMeModel>(
        'users/@me',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${accessToken}`,
          },
        },
      ),
    );
    return this.discordAuthMapper.ApiToMeModel(data);
  }
}
