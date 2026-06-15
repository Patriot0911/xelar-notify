import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard, PermissionsGuard } from '../../auth/guards';
import { AddStreamOnlineSubscriptionDto, DeleteTwitchSubscriptionDto, GetRawTwitchSubscriptionsDto, GetTwitchSubscriptionsDto } from '../dto';
import { AdminService } from '../services';
import { Permission } from '@libs/database';
import { Permissions } from '../../auth/decorator/permissions.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, PermissionsGuard)
@Permissions(Permission.ADMIN)
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
  @ApiOperation({ summary: 'List local subscription entities with app and streamer info' })
  async getTwitchEvents(@Query() query: GetTwitchSubscriptionsDto): Promise<any> {
    return await this.adminService.getTwitchEvents(query);
  }

  @Delete('twitch/events/:id')
  @ApiOperation({ summary: 'Delete local subscription entity and revoke it on Twitch' })
  async deleteLocalTwitchEvent(@Param('id') id: string): Promise<void> {
    return await this.adminService.deleteLocalTwitchEvent(id);
  }

  @Get('twitch/subscriptions/raw')
  @ApiOperation({ summary: 'List raw Twitch subscriptions for an app; isOrphaned=true means no local entity exists' })
  async getRawTwitchSubscriptions(@Query() query: GetRawTwitchSubscriptionsDto): Promise<any> {
    return await this.adminService.getRawTwitchSubscriptions(query);
  }

  @Delete('twitch/subscriptions/raw')
  @ApiOperation({ summary: 'Delete an orphaned Twitch subscription (no local entity) directly on Twitch' })
  async deleteTwitchOnlySubscription(@Body() body: DeleteTwitchSubscriptionDto): Promise<void> {
    return await this.adminService.deleteTwitchOnlySubscription(body);
  }
}
