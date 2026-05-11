import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { TwitchAppsRepository } from '../repositories';
import { ITwitchApiUserModel, ITwitchApiUserNormalizedModel, ITwitchChannelsApiResponseModel, ITwitchEventRegistrationResponseModel, ITwitchGetUsersApiResponseModel, ITwitchHttpConfigModel, TSearchTwitchChannelsResponseModel } from '../models';
import { TwitchApiMapper } from '../mappers';
import { TwitchStreamerEvents } from '@libs/database';
import { AxiosError } from 'axios';

@Injectable()
export class TwitchApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly twitchAppsRepository: TwitchAppsRepository,
    private readonly twitchApiMapper: TwitchApiMapper,
  ) {}

  async getChannels(searchStr?: string, cursor?: string, limit: number = 20): Promise<TSearchTwitchChannelsResponseModel> {
    const app = await this.getLeastLoadedApp();
    const query = searchStr ? encodeURIComponent(searchStr) : '';

    const { data: { data, pagination, } } = await firstValueFrom(
      this.httpService.get<ITwitchChannelsApiResponseModel>('/helix/search/channels', <ITwitchHttpConfigModel> {
        params: {
          query,
          first: limit,
          after: cursor,
        },
        twitchClientId: app.clientId,
      }),
    );

    return {
      items: data.map(
        (c) => this.twitchApiMapper.TwitchApiChannelToNormalized(c)
      ),
      meta: pagination,
    };
  }

  async getUserById(broadcasterId: string): Promise<ITwitchApiUserNormalizedModel | null> {
    const users = await this.getUsers([broadcasterId]);
    return users.length > 0 ? users[0] : null;
  }

  async getUsers(broadcasterIds: string[], logins: string[] = []): Promise<ITwitchApiUserNormalizedModel[]> {
    if (broadcasterIds.length + logins.length > 100) {
      throw new InternalServerErrorException('Reached limit for Twitch API search params');
    }
    const app = await this.getLeastLoadedApp();
    try {
      const { data: { data, }, } = await firstValueFrom(
        this.httpService.get<ITwitchGetUsersApiResponseModel>('/helix/users', <ITwitchHttpConfigModel> {
          params: {
            id: broadcasterIds,
            login: logins,
          },
          twitchClientId: app.clientId,
        }),
      );
      return data.map(
        (d) => this.twitchApiMapper.TwitchApiUserToNormalized(d)
      );
    } catch(e: unknown) {
      const { message, status } = <AxiosError> e;
      console.error(message);
      throw new InternalServerErrorException(
        `Something went wrong with Twitch API. Please contact administrator for more information [${status}]`
      );
    }
  }

  async registerStreamOnlineEvent(
    clientId: string,
    webhookUrl: string,
    webhookSecret: string,
    broadcasterId: string,
  ) {
    try {
      const { data, } = await firstValueFrom(
        this.httpService.post<ITwitchEventRegistrationResponseModel>(
          'helix/eventsub/subscriptions',
          {
            type: TwitchStreamerEvents.STREAM_ONLINE,
            version: '1',
            condition: { broadcaster_user_id: broadcasterId },
            transport: {
              method: 'webhook',
              callback: webhookUrl,
              secret: webhookSecret,
            },
          },
          <ITwitchHttpConfigModel> { twitchClientId: clientId, }
        ),
      );
      return data;
    } catch(e: unknown) {
      const { message, status } = <AxiosError> e;
      console.error(message);
      throw new InternalServerErrorException(
        `Twitch Event registration went wrong. Please contact administrator for more information [${status}]`
      );
    }
  }

  private async getLeastLoadedApp() {
    const app = await this.twitchAppsRepository.findLeastLoaded();
    if (!app) {
      throw new InternalServerErrorException('No Twitch app available');
    }
    return app;
  }
}
