import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard } from '../../auth/guards';
import { IAccessTokenPayload } from '../../auth/models';
import { StatisticsService } from '../services';
import { IDailyStatsModel, INotificationSplitModel, IPlatformStatsModel, ITopStreamerModel, IUserStatsModel } from '../models';

@ApiTags('Statistics')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller('api/statistics')
export class StatisticsController {
  constructor(
    private readonly statisticsService: StatisticsService,
  ) {}

  @Get('platform')
  @ApiOperation({ summary: 'Get platform statistics' })
  async getPlatformStatistics(): Promise<IPlatformStatsModel> {
    return this.statisticsService.getPlatformStats();
  }

  @Get('daily')
  @ApiOperation({ summary: 'Get daily statistics for last 7 days' })
  async getDailyStatistics(): Promise<IDailyStatsModel[]> {
    return this.statisticsService.getDailyStats();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my statistics' })
  async getMyStatistics(@Req() req): Promise<IUserStatsModel> {
    const user = <IAccessTokenPayload>req.user;
    return this.statisticsService.getUserStats(user.sub);
  }

  @Get('top-streamers')
  @ApiOperation({ summary: 'Get top 5 streamers by notification count' })
  async getTopStreamers(): Promise<ITopStreamerModel[]> {
    return this.statisticsService.getTopStreamers();
  }

  @Get('notification-split')
  @ApiOperation({ summary: 'Get discord vs webhook notification split' })
  async getNotificationSplit(): Promise<INotificationSplitModel> {
    return this.statisticsService.getNotificationSplit();
  }
}
