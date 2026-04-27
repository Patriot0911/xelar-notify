import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TwitchApiService, TwitchAuthService } from '../services';

@ApiTags('Twitch')
@Controller('api/twitch')
export class TwitchController {
  constructor(
    private readonly twitchApiService: TwitchApiService,
    private readonly twitchAuthService: TwitchAuthService,
  ) {}

  @Get('apps')
  async getTwitchApps() {
    return await this.twitchAuthService.getTwitchApps();
  }
}
