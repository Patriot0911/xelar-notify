import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TwitchApiService } from '../services';
import { JwtAccessGuard } from '../../auth';
import { TSearchTwitchChannelsResponseModel } from '../models';
import { SearchTwtichChannelsDto } from '../dto';

@ApiTags('Twitch')
@Controller('api/twitch')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
export class TwitchController {
  constructor(
    private readonly twitchApiService: TwitchApiService,
  ) {}

  @Get('channels')
  async getExternalApiChannels(@Query() query: SearchTwtichChannelsDto): Promise<TSearchTwitchChannelsResponseModel> {
    return await this.twitchApiService.getChannels(query.search, query.cursor);
  }
}
