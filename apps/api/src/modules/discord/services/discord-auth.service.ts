import { discordConfig } from '@libs/config';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { IDiscordApiTokensModel, IDiscordTokensModel } from '../models';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { DiscordAuthMapper } from '../mappers';
import { AxiosError } from 'axios';
import { DiscordTokenRevokedException } from '../../auth/exceptions';

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
      scope:         'identify email guilds guilds.members.read connections',
    });
    return `${apiUrl}/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<IDiscordTokensModel> {
    const { clientId, redirectUri, clientSecret } = this.discordConfigService;
    try {
      const { data, } = await firstValueFrom(
        this.httpService.post<IDiscordApiTokensModel>(
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
      return this.discordAuthMapper.apiToTokensModel(data);
    } catch(e) {
      const { message, status } = <AxiosError> e;
      console.error(message);
      throw new InternalServerErrorException(
        `Something went wrong with Discord API. Please contact administrator for more information [${status}]`
      );
    }
  }

  async refreshToken(refreshToken: string): Promise<IDiscordTokensModel> {
    const { clientId, redirectUri, clientSecret } = this.discordConfigService;
    try {
      const { data, } = await firstValueFrom(
        this.httpService.post<IDiscordApiTokensModel>(
          'oauth2/token',
          new URLSearchParams({
            client_id:     clientId,
            client_secret: clientSecret,
            grant_type:    'refresh_token',
            refresh_token: refreshToken,
            redirect_uri:  redirectUri,
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );
      return this.discordAuthMapper.apiToTokensModel(data);
    } catch(e) {
      const { message, status } = <AxiosError> e;
      console.error(message);
      if (status === 401) {
        throw new DiscordTokenRevokedException();
      }
      throw new InternalServerErrorException(
        `Something went wrong with Discord API. Please contact administrator for more information [${status}]`
      );
    }
  }
}
