import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { TwitchAppsRepository } from '../repositories';
import { ITwitchChannelsApiResponseModel, ITwitchHttpConfigModel, TSearchTwitchChannelsResponseModel } from '../models';
import { TwitchApiMapper } from '../mappers';

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

  private async getLeastLoadedApp() {
    const app = await this.twitchAppsRepository.findLeastLoaded();
    if (!app) {
      throw new InternalServerErrorException('No Twitch app available');
    }
    return app;
  }
}
