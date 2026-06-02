import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { IAccessTokenPayload } from '../../auth';
import { JwtAccessGuard } from '../../auth/guards/jwt-access.guard';
import { DiscordGuard } from '../guards';
import { DiscordChannelsService, DiscordGuildService } from '../services';
import { DiscordRolesService } from '../services/discord-roles.service';

@Controller('api/discord')
@ApiTags('Discord')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
export class DiscordController {
  constructor(
    private readonly discordGuildService: DiscordGuildService,
    private readonly discordChannelsService: DiscordChannelsService,
    private readonly discordRolesService: DiscordRolesService,
  ) {}

  @Get('guilds')
  getUserGuildsWithBot(@Req() request) {
    const { sub } = <IAccessTokenPayload>request.user;
    return this.discordGuildService.getUserGuildsWithBot(sub);
  }

  @Get('guilds/:guildId/channels')
  getGuildTextChannels(@Param('guildId') guildId: string) {
    return this.discordChannelsService.getGuildTextChannels(guildId);
  }

  @Get('guilds/:guildId/roles')
  getGuildRoles(@Param('guildId') guildId: string) {
    return this.discordRolesService.getGuildRoles(guildId);
  }
}
