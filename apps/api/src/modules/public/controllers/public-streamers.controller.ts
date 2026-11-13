import { Controller, Get, Header } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicStreamersService } from '../services';
import { IPublicStreamersShowcaseModel } from '../models';
import { PUBLIC_SHOWCASE_CACHE_CONTROL } from '../public.constants';

/** Unauthenticated, read-only endpoints for the public site. Keep payloads free of internal data. */
@ApiTags('Public')
@Controller('api/public/streamers')
export class PublicStreamersController {
  constructor(
    private readonly publicStreamersService: PublicStreamersService,
  ) {}

  @Get('showcase')
  @Header('Cache-Control', PUBLIC_SHOWCASE_CACHE_CONTROL)
  @ApiOperation({ summary: 'Public streamers showcase for the welcome page (top 20 by recent activity + platform stats)' })
  async getShowcase(): Promise<IPublicStreamersShowcaseModel> {
    return this.publicStreamersService.getShowcase();
  }
}
