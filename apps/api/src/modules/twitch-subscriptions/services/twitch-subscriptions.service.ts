import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TwitchAppsRepository } from '../../twitch/repositories';
import { TwitchApiService } from '../../twitch/services';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@libs/config';

@Injectable()
export class TwitchSubscriptionService {
  constructor(
    private readonly twitchAppsRepository: TwitchAppsRepository,
    private readonly twitchApiService: TwitchApiService,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  async registerStreamOnlineSubscription(broadcasterId: string, appId?: string) {
    const app = await this.findTwitchApp(appId);

    if (!app) {
      throw new InternalServerErrorException('No Twitch app available');
    }

    const webhookBaseUrl = this.configService.get<string>('WEBHOOK_URL');

    const twtichResData = await this.twitchApiService.registerStreamOnlineEvent(
      app.clientId,
      `${webhookBaseUrl}/${app.clusterTag}`,
      app.webhookSecret,
      broadcasterId
    );

    return twtichResData;
  }

  private async findTwitchApp(appId?: string) {
    if (appId) {
      const app = await this.twitchAppsRepository.findOne(
        { where: { id: appId, } }, true, { webhookSecret: true, }
      );
      return app;
    }
    return this.twitchAppsRepository.findLeastLoaded(true, { webhookSecret: true });
  }
}
