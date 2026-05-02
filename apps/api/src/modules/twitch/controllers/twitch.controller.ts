import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TwitchApiService } from '../services';
import { JwtAccessGuard } from '../../auth';
import { TSearchTwitchChannelsResponseModel } from '../models';

@ApiTags('Twitch')
@Controller('api/twitch')
export class TwitchController {
  constructor(
    private readonly twitchApiService: TwitchApiService,
  ) {}

  @Get('channels')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  async getAllApps(@Query('search') searchParam: string): Promise<TSearchTwitchChannelsResponseModel> {
    return await this.twitchApiService.getChannels(searchParam);
  }
}
