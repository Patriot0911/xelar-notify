import { Body, Controller, ForbiddenException, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { IAccessTokenPayload } from '../../auth';
import { JwtAccessGuard } from '../../auth/guards/jwt-access.guard';
import { DiscordChannelsService, DiscordGuildService } from '../services';
import { DiscordRolesService } from '../services/discord-roles.service';
import { DiscordGuildAccessService } from '../services/discord-guild-access.service';
import { SetManagerRoleDto } from '../dto/set-manager-role.dto';
import { Permission } from '@libs/database';

@Controller('api/discord')
@ApiTags('Discord')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
export class DiscordController {
  constructor(
    private readonly discordGuildService: DiscordGuildService,
    private readonly discordChannelsService: DiscordChannelsService,
    private readonly discordRolesService: DiscordRolesService,
    private readonly discordGuildAccessService: DiscordGuildAccessService,
  ) {}

  @Get('guilds')
  getUserGuildsWithBot(@Req() request) {
    const { sub } = <IAccessTokenPayload>request.user;
    return this.discordGuildService.getUserGuildsWithBot(sub);
  }

  @Get('guilds/:guildId')
  getGuildInfo(@Param('guildId') guildId: string) {
    return this.discordGuildService.getGuildInfo(guildId);
  }

  @Get('guilds/:guildId/channels')
  getGuildTextChannels(@Param('guildId') guildId: string) {
    return this.discordChannelsService.getGuildTextChannels(guildId);
  }

  @Get('guilds/:guildId/roles')
  getGuildRoles(@Param('guildId') guildId: string) {
    return this.discordRolesService.getGuildRoles(guildId);
  }

  @Patch('guilds/:guildId/manager-role')
  async setManagerRole(
    @Param('guildId') guildId: string,
    @Body() body: SetManagerRoleDto,
    @Req() req,
  ) {
    const user = <IAccessTokenPayload>req.user;
    const isAppAdmin = user.permissions.includes(Permission.ADMIN);

    if (!isAppAdmin) {
      const isGuildAdmin = await this.discordGuildAccessService.isDiscordAdminInGuild(user.sub, guildId);
      if (!isGuildAdmin) throw new ForbiddenException('Only Discord guild administrators can configure the manager role');
    }

    await this.discordGuildService.setManagerRole(guildId, body.roleId);
    await this.discordGuildAccessService.invalidateGuildCache(guildId);

    return { success: true };
  }
}
