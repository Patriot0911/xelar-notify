import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitchStreamerEntity } from '@libs/database';
import { TwitchApiService } from '../services';
import { JwtAccessGuard } from '../../auth/guards/jwt-access.guard';
import { TSearchTwitchChannelsResponseModel } from '../models';
import { SearchTwtichChannelsDto } from '../dto';

@ApiTags('Twitch')
@Controller('api/twitch')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
export class TwitchController {
  constructor(
    private readonly twitchApiService: TwitchApiService,
    @InjectRepository(TwitchStreamerEntity)
    private readonly twitchStreamerRepository: Repository<TwitchStreamerEntity>,
  ) {}

  @Get('channels')
  async getExternalApiChannels(@Query() query: SearchTwtichChannelsDto): Promise<TSearchTwitchChannelsResponseModel> {
    return await this.twitchApiService.getChannels(query.search, query.cursor);
  }

  @Get(':broadcasterId/allow-personal-subscriptions')
  async getAllowPersonalSubscriptions(@Param('broadcasterId') broadcasterId: string): Promise<{ allowed: boolean }> {
    const streamer = await this.twitchStreamerRepository.findOne({
      where: { broadcasterId },
      select: { allowPersonalSubscriptions: true },
    });
    return { allowed: streamer?.allowPersonalSubscriptions ?? false };
  }
}
