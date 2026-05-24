import { discordConfig } from '@libs/config';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { IDiscordApiMeModel, IDiscordApiTokensModel, IDiscordMeModel, IDiscordTokensModel } from '../models';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { DiscordAuthMapper } from '../mappers';
import { DiscordBaseService } from './discord-base.service';
import { AxiosError } from 'axios';

@Injectable()
export class DiscordAuthService {
  constructor(
    @Inject(discordConfig.KEY)
    private discordConfigService: ConfigType<typeof discordConfig>,
    private readonly discordBaseService: DiscordBaseService,
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
        `Something went wrong with Twitch API. Please contact administrator for more information [${status}]`
      );
    }
  }

  async getDiscordMeByUserId(userId: string): Promise<IDiscordMeModel> {
    const discordAccessToken = await this.discordBaseService.getUserDiscordAccessToken(userId);
    return this.getDiscordMeByToken(discordAccessToken);
  }

  async getDiscordMeByToken(accessToken: string): Promise<IDiscordMeModel> {
    const { data, } = await firstValueFrom(
      this.httpService.get<IDiscordApiMeModel>(
        'users/@me',
        this.discordBaseService.getRequestHeadersWithDiscordToken(accessToken)
      ),
    );
    return this.discordAuthMapper.apiToMeModel(data);
  }
}
