import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TwitchNotificationsService } from '../services';
import { JwtAccessGuard } from '../../auth';

@ApiTags('Twitch Notifications')
@Controller('api/notifications/twitch/stream-online')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
export class TwitchNotificationsController {
  constructor(
    private readonly twitchNotificationsService: TwitchNotificationsService,
  ) {}

  @Post()
  async addStreamOnlineNotification(@Body() body: any): Promise<any> {
    return await this.twitchNotificationsService.addNotification(body);
  }
}
