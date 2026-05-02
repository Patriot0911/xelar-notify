import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TwitchNotificationsService } from '../services';

@ApiTags('Twitch Notifications')
@Controller('api/notifications/twitch/stream-online')
export class TwitchNotificationsController {
  constructor(
    private readonly twitchNotificationsService: TwitchNotificationsService,
  ) {}

  @Post()
  async addStreamOnlineNotification(@Body() body: any): Promise<any> {
    return await this.twitchNotificationsService.addNotification(body);
  }
}
