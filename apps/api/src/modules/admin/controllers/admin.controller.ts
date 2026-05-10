import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard } from '../../auth';
import { AddStreamOnlineSubscriptionDto, AddTwitchAppDto, EditTwitchAppDto, GetTwitchAppsDto, GetTwitchSubscriptionsDto } from '../dto';
import { AdminService, TwitchAdminAppService } from '../services';
import { IGenericListPayloadResponse } from 'apps/api/src/shared';
import { ITwitchAppShortModel } from '../../twitch/models';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller('api/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly twitchAdminAppService: TwitchAdminAppService,
  ) {}

  @Get('twitch/apps')
  async getAllApps(@Query() params: GetTwitchAppsDto): Promise<IGenericListPayloadResponse<ITwitchAppShortModel>> {
    return await this.twitchAdminAppService.getAllTwitchApps(params);
  }

  @Post('twitch/apps')
  async addTwitchApp(@Body() body: AddTwitchAppDto): Promise<ITwitchAppShortModel> {
    return await this.twitchAdminAppService.addTwitchApp(body);
  }

  @Patch('twitch/apps/:appId')
  async editTwitchApp(
    @Param('appId') appId: string,
    @Body() body: EditTwitchAppDto
  ): Promise<ITwitchAppShortModel> {
    return await this.twitchAdminAppService.editTwitchApp(appId, body);
  }

  @Delete('twitch/apps/:appId')
  async deleteTwitchApp(@Param('appId') appId: string): Promise<boolean> {
    return await this.twitchAdminAppService.deleteTwitchApp(appId);
  }

  @Post('twitch/events/stream-online')
  async addTwitchOnlineEvent(@Body() body: AddStreamOnlineSubscriptionDto): Promise<any> {
    return await this.adminService.addTwitchEventStreamOnline(body);
  }

  @Get('twitch/events')
  async getTwitchEvents(@Query() query: GetTwitchSubscriptionsDto): Promise<any> {
    return await this.adminService.getTwitchEvents(query);
  }
}
