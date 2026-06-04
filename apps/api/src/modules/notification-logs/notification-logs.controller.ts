import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationLogsService } from './notification-logs.service';
import { GetNotificationLogsDto } from './dto/get-notification-logs.dto';
import { JwtAccessGuard, PermissionsGuard } from '../auth/guards';
import { Permissions } from '../auth/decorator/permissions.decorator';
import { Permission } from '@libs/database';
import { IAccessTokenPayload } from '../auth/models';

@ApiTags('Notification Logs')
@Controller('api/notification-logs')
export class NotificationLogsController {
  constructor(private readonly logsService: NotificationLogsService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard, PermissionsGuard)
  @Permissions(Permission.ADMIN)
  getAll(@Query() params: GetNotificationLogsDto) {
    return this.logsService.getAll(params);
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  getMy(@Query() params: GetNotificationLogsDto, @Req() req) {
    const user = <IAccessTokenPayload>req.user;
    return this.logsService.getMy(user.sub, params);
  }

  @Get('guild/:guildId')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  getByGuild(
    @Param('guildId') guildId: string,
    @Query() params: GetNotificationLogsDto,
    @Req() req,
  ) {
    const user = <IAccessTokenPayload>req.user;
    return this.logsService.getByGuild(guildId, user, params);
  }
}
