import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TwitchAdminService } from '../services';
import { GetTwitchAppsRequestDto } from '../dto/get-twitch-apps-request.dto';
import { JwtAccessGuard } from '../../auth';
import { IGenericListPayloadResponse } from 'apps/api/src/shared';
import { ITwitchAppShortModel } from '../models';

@ApiTags('Twitch')
@Controller('api/twitch/admin')
export class TwitchAdminController {
  constructor(
    private readonly twitchAdminService: TwitchAdminService,
  ) {}

  @Get('apps')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  async getAllApps(@Query() params: GetTwitchAppsRequestDto): Promise<IGenericListPayloadResponse<ITwitchAppShortModel>> {
    return await this.twitchAdminService.getAllTwitchApps(params);
  }
}
