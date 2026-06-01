import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { IAccessTokenPayload } from '../../auth';
import { JwtAccessGuard } from '../../auth/guards/jwt-access.guard';
import { DiscordGuard } from '../guards';
import { DiscordGuildService } from '../services';

@Controller('api/discord')
@ApiTags('Discord')
export class DiscordController {
  constructor(private readonly discordGuildService: DiscordGuildService) {}

  @Get('guilds')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  getUserGuildsWithBot(@Req() request) {
    const { sub } = <IAccessTokenPayload>request.user;
    return this.discordGuildService.getUserGuildsWithBot(sub);
  }
}
