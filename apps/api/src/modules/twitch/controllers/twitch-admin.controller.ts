import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TwitchAdminService } from '../services';
import { JwtAccessGuard } from '../../auth';
import { IGenericListPayloadResponse } from 'apps/api/src/shared';
import { ITwitchAppShortModel } from '../models';
import { AddTwitchAppDto, GetTwitchAppsDto } from '../dto';

@ApiTags('Twitch')
@Controller('api/twitch/admin')
export class TwitchAdminController {
  constructor(
    private readonly twitchAdminService: TwitchAdminService,
  ) {}

  @Get('apps')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  async getAllApps(@Query() params: GetTwitchAppsDto): Promise<IGenericListPayloadResponse<ITwitchAppShortModel>> {
    return await this.twitchAdminService.getAllTwitchApps(params);
  }

  @Post('apps')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  async addTwitchApp(@Body() body: AddTwitchAppDto): Promise<ITwitchAppShortModel> {
    return await this.twitchAdminService.addTwitchApp(body);
  }
}
