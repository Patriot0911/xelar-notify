import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard } from '../../auth';
import { AddStreamOnlineSubscriptionDto, GetTwitchSubscriptionsDto } from '../dto';
import { AdminService } from '../services';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller('api/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Post('twitch/events/stream-online')
  async addTwitchOnlineEvent(@Body() body: AddStreamOnlineSubscriptionDto): Promise<any> {
    return await this.adminService.addTwitchEventStreamOnline(body);
  }

  @Get('twitch/events')
  async getTwitchEvents(@Query() query: GetTwitchSubscriptionsDto): Promise<any> {
    return await this.adminService.getTwitchEvents(query);
  }
}
