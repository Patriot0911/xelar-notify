import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  ITwitchApiCategoryNormalizedModel,
  ITwitchApiUserNormalizedModel,
  ITwitchCategoriesApiResponseModel,
  ITwitchChannelsApiResponseModel,
  ITwitchEventRegistrationResponseModel,
  ITwitchGamesApiResponseModel,
  ITwitchGetUsersApiResponseModel,
  ITwitchHttpConfigModel,
  TSearchTwitchCategoriesResponseModel,
  TSearchTwitchChannelsResponseModel,
} from '../models';
import { TwitchApiMapper } from '../mappers';
import { TwitchStreamerEvents } from '@libs/database';
import { AxiosError } from 'axios';
import {
  ITwitchApiChannelNormalizedModel,
  ITwitchChannelApiResponseModel,
  ITwitchGetSubscriptionsApiResponseModel
} from '../models/twitch-api';
import { IGetTwitchSubscriptionParamsModel } from '../models/twitch-params.model';
import { TwitchAppsRepository } from '../repositories';

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
        (c) => this.twitchApiMapper.twitchApiChannelToNormalized(c)
      ),
      meta: pagination,
    };
  }

  async searchCategories(searchStr: string, cursor?: string, limit: number = 20): Promise<TSearchTwitchCategoriesResponseModel> {
    const app = await this.getLeastLoadedApp();
    const query = encodeURIComponent(searchStr);

    const { data: { data, pagination, } } = await firstValueFrom(
      this.httpService.get<ITwitchCategoriesApiResponseModel>('/helix/search/categories', <ITwitchHttpConfigModel> {
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
        (c) => this.twitchApiMapper.twitchApiCategoryToNormalized(c)
      ),
      meta: pagination,
    };
  }

  async getGamesByIds(gameIds: string[]): Promise<ITwitchApiCategoryNormalizedModel[]> {
    if (gameIds.length === 0) return [];
    if (gameIds.length > 100) {
      throw new InternalServerErrorException('Reached limit for Twitch API search params');
    }
    const app = await this.getLeastLoadedApp();

    const { data: { data, }, } = await firstValueFrom(
      this.httpService.get<ITwitchGamesApiResponseModel>('/helix/games', <ITwitchHttpConfigModel> {
        params: { id: gameIds },
        twitchClientId: app.clientId,
      }),
    );

    return data.map((g) => this.twitchApiMapper.twitchApiCategoryToNormalized(g));
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
        (d) => this.twitchApiMapper.twitchApiUserToNormalized(d)
      );
    } catch(e: unknown) {
      const { message, status } = <AxiosError> e;
      console.error(message);
      throw new InternalServerErrorException(
        `Something went wrong with Twitch API. Please contact administrator for more information [${status}]`
      );
    }
  }

  async registerEvent(
    clientId: string,
    webhookUrl: string,
    webhookSecret: string,
    broadcasterId: string,
    event: TwitchStreamerEvents = TwitchStreamerEvents.STREAM_ONLINE,
    userAccessToken?: string,
    twitchUserId?: string,
  ) {
    try {
      const { data, } = await firstValueFrom(
        this.httpService.post<ITwitchEventRegistrationResponseModel>(
          'helix/eventsub/subscriptions',
          {
            type: event,
            version: '1',
            condition: { broadcaster_user_id: broadcasterId },
            transport: {
              method: 'webhook',
              callback: webhookUrl,
              secret: webhookSecret,
            },
          },
          <ITwitchHttpConfigModel> {
            twitchClientId: clientId,
            accessToken: userAccessToken,
            twitchUserId,
          }
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

  async getUserByToken(accessToken: string, clientId: string): Promise<ITwitchApiUserNormalizedModel | null> {
    const { data: { data, }, } = await firstValueFrom(
      this.httpService.get<ITwitchGetUsersApiResponseModel>('/helix/users', <ITwitchHttpConfigModel> {
        twitchClientId: clientId,
        accessToken,
      }),
    );
    return data.length > 0
      ? this.twitchApiMapper.twitchApiUserToNormalized(data[0])
      : null;
  }

  async getSubscriptionById(subscriptionId: string, clientId: string) {
    const subscriptions = await this.getSubscriptions(clientId, { subscriptionIds: [subscriptionId] });
    return subscriptions.data.length > 0 ? subscriptions.data[0] : null;
  }

  async getSubscriptions(
    clientId: string,
    options: IGetTwitchSubscriptionParamsModel
  ) {
    const app = await this.twitchAppsRepository.findOne(
      { where: { clientId, }, }
    );

    if (!app) {
      throw new InternalServerErrorException('Cannot find Twitch app for provided clientId');
    }

    try {
      const { data, } = await firstValueFrom(
        this.httpService.get<ITwitchGetSubscriptionsApiResponseModel>(
          `helix/eventsub/subscriptions`,
          <ITwitchHttpConfigModel> {
            params: {
              subscription_id: options.subscriptionIds,
              status: options.statuses,
              after: options.after,
              user_id: options.userIds,
            },
            twitchClientId: clientId,
          },
        ),
      );
      return data;
    } catch(e: unknown) {
      const { message, status } = <AxiosError> e;
      console.error(message);
      throw new InternalServerErrorException(
        `Twitch API subscription error. Please contact administrator for more information [${status}]`
      );
    }
  }

  async getChannelById(broadcasterId: string): Promise<ITwitchApiChannelNormalizedModel> {
    const app = await this.getLeastLoadedApp();
    if (!app) {
      throw new InternalServerErrorException('Cannot find Twitch app');
    }
    try {
      const { data: { data, }, } = await firstValueFrom(
        this.httpService.get<ITwitchChannelApiResponseModel>('/helix/channels', <ITwitchHttpConfigModel> {
          params: { broadcaster_id: broadcasterId },
          twitchClientId: app.clientId,
        }),
      );
      if (!data || data.length < 1) {
        throw new NotFoundException(
          `Cannot find broadcaster channel with id: ${broadcasterId}`
        );
      }
      return this.twitchApiMapper.twitchApiChannelToNormalized(data[0]);
    } catch(e: unknown) {
      const { message, status } = <AxiosError> e;
      console.error(message);
      throw new InternalServerErrorException(
        `Twitch API error. Please contact administrator for more information [${status}]`
      );
    }
  }

  async deleteSubscription(subscriptionId: string, clientId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(
          'helix/eventsub/subscriptions',
          <ITwitchHttpConfigModel> {
            params: { id: subscriptionId },
            twitchClientId: clientId,
          },
        ),
      );
    } catch(e: unknown) {
      const { message, status } = <AxiosError> e;
      console.error(message);
      throw new InternalServerErrorException(
        `Twitch subscription delete failed. Please contact administrator for more information [${status}]`
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
