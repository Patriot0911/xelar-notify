import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TwitchAdminService, TwitchApiService } from '../services';
import { JwtAccessGuard } from '../../auth';
import { ITwitchAppShortModel, TSearchTwitchChannelsResponseModel } from '../models';
import { AddTwitchAppDto, EditTwitchAppDto, GetTwitchAppsDto, SearchTwtichChannelsDto } from '../dto';
import { IGenericListPayloadResponse } from 'apps/api/src/shared';

@ApiTags('Twitch')
@Controller('api/twitch')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
export class TwitchController {
  constructor(
    private readonly twitchApiService: TwitchApiService,
    private readonly twitchAdminService: TwitchAdminService,
  ) {}

  @Get('apps')
  async getAllApps(@Query() params: GetTwitchAppsDto): Promise<IGenericListPayloadResponse<ITwitchAppShortModel>> {
    return await this.twitchAdminService.getAllTwitchApps(params);
  }

  @Post('apps')
  async addTwitchApp(@Body() body: AddTwitchAppDto): Promise<ITwitchAppShortModel> {
    return await this.twitchAdminService.addTwitchApp(body);
  }

  @Patch('apps/:appId')
  async editTwitchApp(
    @Param('appId') appId: string,
    @Body() body: EditTwitchAppDto
  ): Promise<ITwitchAppShortModel> {
    return await this.twitchAdminService.editTwitchApp(appId, body);
  }

  @Delete('apps/:appId')
  async deleteTwitchApp(@Param('appId') appId: string): Promise<boolean> {
    return await this.twitchAdminService.deleteTwitchApp(appId);
  }

  @Get('channels')
  async getExternalApiChannels(@Query() query: SearchTwtichChannelsDto): Promise<TSearchTwitchChannelsResponseModel> {
    return await this.twitchApiService.getChannels(query.search, query.cursor);
  }
}
