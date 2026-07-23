import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard, PermissionsGuard } from '../../auth/guards';
import { Permissions } from '../../auth/decorator/permissions.decorator';
import { Permission } from '@libs/database';
import { IGenericListPayloadResponse } from 'apps/api/src/shared';
import { StreamersService } from '../services';
import { GetStreamersRequestDto, UpdateStreamerDto } from '../dto';
import { IStreamerItemModel, IStreamerListItemModel, IStreamerNotificationLogModel } from '../models';

@ApiTags('Streamers')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, PermissionsGuard)
@Permissions(Permission.ADMIN)
@Controller('api/streamers')
export class StreamersController {
  constructor(
    private readonly streamersService: StreamersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all streamers' })
  async getAllStreamers(@Query() params: GetStreamersRequestDto): Promise<IGenericListPayloadResponse<IStreamerListItemModel>> {
    return this.streamersService.getAll(params);
  }

  @Get(':streamerId')
  @ApiOperation({ summary: 'Get streamer by id' })
  async getStreamer(@Param('streamerId') streamerId: string): Promise<IStreamerItemModel> {
    return this.streamersService.getById(streamerId);
  }

  @Patch(':streamerId')
  @ApiOperation({ summary: 'Update editable streamer fields' })
  async updateStreamer(
    @Param('streamerId') streamerId: string,
    @Body() body: UpdateStreamerDto,
  ): Promise<IStreamerItemModel> {
    return this.streamersService.update(streamerId, body);
  }

  @Post(':streamerId/sync')
  @ApiOperation({ summary: 'Re-sync streamer profile info from Twitch' })
  async syncStreamer(@Param('streamerId') streamerId: string): Promise<IStreamerItemModel> {
    return this.streamersService.syncFromTwitch(streamerId);
  }

  @Get(':streamerId/notification-logs')
  @ApiOperation({ summary: 'Get notification logs for a streamer' })
  async getStreamerNotificationLogs(@Param('streamerId') streamerId: string): Promise<IStreamerNotificationLogModel[]> {
    return this.streamersService.getNotificationLogs(streamerId);
  }
}
