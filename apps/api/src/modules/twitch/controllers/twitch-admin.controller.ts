import { Body, Controller, Delete, Get, Param, Post, Put as Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TwitchAdminService } from '../services';
import { JwtAccessGuard } from '../../auth';
import { IGenericListPayloadResponse } from 'apps/api/src/shared';
import { ITwitchAppShortModel } from '../models';
import { AddTwitchAppDto, EditTwitchAppDto, GetTwitchAppsDto } from '../dto';

@ApiTags('Twitch Admin')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller('api/twitch/admin')
export class TwitchAdminController {
  constructor(
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
}
