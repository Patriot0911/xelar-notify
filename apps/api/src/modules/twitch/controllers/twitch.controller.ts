import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitchStreamerEntity } from '@libs/database';
import { TwitchApiService, TwitchGamesService } from '../services';
import { JwtAccessGuard } from '../../auth/guards/jwt-access.guard';
import { ITwitchApiCategoryNormalizedModel, TSearchTwitchCategoriesResponseModel, TSearchTwitchChannelsResponseModel } from '../models';
import { SearchTwitchCategoriesDto, SearchTwtichChannelsDto } from '../dto';

@ApiTags('Twitch')
@Controller('api/twitch')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
export class TwitchController {
  constructor(
    private readonly twitchApiService: TwitchApiService,
    private readonly twitchGamesService: TwitchGamesService,
    @InjectRepository(TwitchStreamerEntity)
    private readonly twitchStreamerRepository: Repository<TwitchStreamerEntity>,
  ) {}

  @Get('channels')
  async getExternalApiChannels(@Query() query: SearchTwtichChannelsDto): Promise<TSearchTwitchChannelsResponseModel> {
    return await this.twitchApiService.getChannels(query.search, query.cursor);
  }

  @Get('categories')
  async searchCategories(@Query() query: SearchTwitchCategoriesDto): Promise<TSearchTwitchCategoriesResponseModel> {
    return await this.twitchApiService.searchCategories(query.search, query.cursor);
  }

  @Get('games')
  async getGamesByIds(@Query('ids') ids: string): Promise<ITwitchApiCategoryNormalizedModel[]> {
    const gameIds = (ids ?? '').split(',').map((id) => id.trim()).filter(Boolean);
    return await this.twitchGamesService.resolveNames(gameIds);
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
