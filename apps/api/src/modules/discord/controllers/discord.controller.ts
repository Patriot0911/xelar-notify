import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { IAccessTokenPayload } from '../../auth';
import { JwtAccessGuard } from '../../auth/guards/jwt-access.guard';
import { DiscordBotService, DiscordGuildService } from '../services';
import { DiscordGuildAccessService } from '../services/discord-guild-access.service';
import { SetManagerPermissionDto } from '../dto/set-manager-permission.dto';
import { IDiscordChannelModel, IDiscordUserGuildItemModel } from '../models';
import { IDiscordRoleModel } from '../models/discord-role.model';
import { DiscordGuard } from '../guards';

@Controller('api/discord')
@ApiTags('Discord')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, DiscordGuard)
export class DiscordController {
  constructor(
    private readonly discordGuildService: DiscordGuildService,
    private readonly discordGuildAccessService: DiscordGuildAccessService,
    private readonly discordBotService: DiscordBotService,
  ) {}

  @Get('guilds')
  getUserGuilds(@Req() req): Promise<IDiscordUserGuildItemModel[]> {
    const { sub } = <IAccessTokenPayload> req.user;
    return this.discordGuildService.getUserGuilds(sub);
  }

  @Get('guilds/:guildId')
  async getGuildInfo(
    @Req() req,
    @Param('guildId') guildId: string
  ): Promise<IDiscordUserGuildItemModel> {
    const user = <IAccessTokenPayload> req.user;
    await this.discordGuildAccessService.assertAccess(user.sub, guildId);
    return this.discordGuildService.getUserGuildInfo(user.sub, guildId);
  }

  @Get('guilds/:guildId/channels')
  async getGuildTextChannels(
    @Req() req,
    @Param('guildId') guildId: string
  ): Promise<IDiscordChannelModel[]> {
    const user = <IAccessTokenPayload> req.user;
    await this.discordGuildAccessService.assertAccess(user.sub, guildId);
    return this.discordBotService.getGuildTextChannels(guildId);
  }

  @Get('guilds/:guildId/roles')
  async getGuildRoles(
    @Req() req,
    @Param('guildId') guildId: string
  ): Promise<IDiscordRoleModel[]> {
    const user = <IAccessTokenPayload> req.user;
    await this.discordGuildAccessService.assertAccess(user.sub, guildId);
    return this.discordBotService.getGuildRoles(guildId);
  }

  @Patch('guilds/:guildId/manager-permission')
  async setManagerPermission(
    @Param('guildId') guildId: string,
    @Body() body: SetManagerPermissionDto,
    @Req() req,
  ) {
    const user = <IAccessTokenPayload> req.user;
    await this.discordGuildAccessService.assertAccessAdmin(user.sub, guildId);

    await this.discordGuildService.setManagerPermission(guildId, body.permission);

    return { success: true };
  }
}
