import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard } from '../../auth';
import { TwitchSubscriptionService } from '../services';
import { AddStreamOnlineDto } from '../dto';

@ApiTags('Twitch Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller('api/twitch/subscriptions')
export class TwitchSubscriptionsController {
  constructor(
    private readonly twitchSubscriptionService: TwitchSubscriptionService,
  ) {}

  @Post('stream-online')
  async addTwitchOnlineEvent(@Body() body: AddStreamOnlineDto): Promise<any> {
    return await this.twitchSubscriptionService.registerStreamOnlineSubscription(body.broadcasterId, body.appId);
  }

  @Get()
  async getTwitchEvents(): Promise<any> {
    return await this.twitchSubscriptionService.getAllTwitchSubscriptions();
  }
}
