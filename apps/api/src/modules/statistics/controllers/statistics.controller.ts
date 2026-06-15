import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard } from '../../auth/guards';
import { StatisticsService } from '../services';
import { IDailyStatsModel, IPlatformStatsModel, IUserStatsModel } from '../models';

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
  async getMyStatistics(): Promise<IUserStatsModel> {
    return this.statisticsService.getUserStats('me');
  }
}
