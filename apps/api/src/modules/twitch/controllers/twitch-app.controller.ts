import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard } from '../../auth';
import { ITwitchAppShortModel } from '../models';
import { TwitchAppService } from '../services';
import { IGenericListPayloadResponse } from 'apps/api/src/shared';
import { AddTwitchAppDto, EditTwitchAppDto, GetTwitchAppsDto } from '../dto';

@ApiTags('Twitch Apps')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller('api/twitch/apps')
export class TwitchAppController {
  constructor(
    private readonly twitchAppService: TwitchAppService,
  ) {}

  @Get()
  async getAllApps(@Query() params: GetTwitchAppsDto): Promise<IGenericListPayloadResponse<ITwitchAppShortModel>> {
    return await this.twitchAppService.getAllTwitchApps(params);
  }

  @Post()
  async addTwitchApp(@Body() body: AddTwitchAppDto): Promise<ITwitchAppShortModel> {
    return await this.twitchAppService.addTwitchApp(body);
  }

  @Patch(':appId')
  async editTwitchApp(
    @Param('appId') appId: string,
    @Body() body: EditTwitchAppDto
  ): Promise<ITwitchAppShortModel> {
    return await this.twitchAppService.editTwitchApp(appId, body);
  }

  @Delete(':appId')
  async deleteTwitchApp(@Param('appId') appId: string): Promise<boolean> {
    return await this.twitchAppService.deleteTwitchApp(appId);
  }
}
