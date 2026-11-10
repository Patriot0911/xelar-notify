import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IAccessTokenPayload, JwtAccessGuard } from '../../auth';
import { DiscordGuard } from '../../discord/guards';
import {
  CreateDiscordNotificationDto,
  CreateWebhookNotificationDto,
  GetGuildNotificationsDto,
  UpdateDiscordNotificationDto,
  UpdateWebhookNotificationDto,
} from '../dto';
import { TwitchNotificationsService } from '../services';
import { DiscordGuildAccessService } from '../../discord/services';

@Controller('api/twitch-notifications')
@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
export class DiscordNotificationsController {
  constructor(
    private readonly twitchNotificationsService: TwitchNotificationsService,
    private readonly discordGuildAccessService: DiscordGuildAccessService,
  ) {}

  @Get('bot')
  @ApiOperation({ summary: 'Get paginated Discord bot notifications created by the current user' })
  getMyBotNotifications(@Req() request, @Query() params: GetGuildNotificationsDto) {
    const { sub } = <IAccessTokenPayload>request.user;
    return this.twitchNotificationsService.getMyBotNotifications(sub, params);
  }

  @Get('webhook')
  @ApiOperation({ summary: 'Get paginated webhook notifications created by the current user' })
  getMyWebhookNotifications(@Req() request, @Query() params: GetGuildNotificationsDto) {
    const { sub } = <IAccessTokenPayload>request.user;
    return this.twitchNotificationsService.getMyWebhookNotifications(sub, params);
  }

  @Get('discord/:discordGuildId/bot')
  @UseGuards(DiscordGuard)
  @ApiOperation({ summary: 'Get paginated Discord bot notifications of a guild' })
  async getGuildBotNotifications(
    @Req() request,
    @Param('discordGuildId') discordGuildId: string,
    @Query() params: GetGuildNotificationsDto,
  ) {
    const { sub } = <IAccessTokenPayload> request.user;
    await this.discordGuildAccessService.assertAccess(sub, discordGuildId);
    return this.twitchNotificationsService.getGuildBotNotifications(discordGuildId, params);
  }

  @Get('discord/:discordGuildId/webhook')
  @UseGuards(DiscordGuard)
  @ApiOperation({ summary: 'Get paginated webhook notifications of a guild' })
  async getGuildWebhookNotifications(
    @Req() request,
    @Param('discordGuildId') discordGuildId: string,
    @Query() params: GetGuildNotificationsDto,
  ) {
    const { sub } = <IAccessTokenPayload> request.user;
    await this.discordGuildAccessService.assertAccess(sub, discordGuildId);
    return this.twitchNotificationsService.getGuildWebhookNotifications(discordGuildId, params);
  }

  @Post('discord')
  @UseGuards(DiscordGuard)
  async createDiscordNotification(@Req() request, @Body() body: CreateDiscordNotificationDto) {
    const { sub } = <IAccessTokenPayload> request.user;
    await this.discordGuildAccessService.assertAccess(sub, body.guildId);
    return this.twitchNotificationsService.createDiscordNotification(body, sub);
  }

  @Post('discord/:guildId/webhook')
  @UseGuards(DiscordGuard)
  async createDiscordWebhookNotification(
    @Req() request,
    @Param('guildId') guildId: string,
    @Body() body: CreateWebhookNotificationDto
  ) {
    const { sub } = <IAccessTokenPayload> request.user;
    await this.discordGuildAccessService.assertAccess(sub, guildId);
    return this.twitchNotificationsService.createWebhookNotification(body, sub, guildId);
  }

  @Post('webhook')
  createWebhookNotification(
    @Req() request,
    @Body() body: CreateWebhookNotificationDto
  ) {
    const { sub } = <IAccessTokenPayload> request.user;
    return this.twitchNotificationsService.createWebhookNotification(body, sub);
  }

  @Patch('discord/:id')
  updateDiscordNotification(
    @Req() request,
    @Param('id') id: string,
    @Body() body: UpdateDiscordNotificationDto,
  ) {
    const { sub } = <IAccessTokenPayload>request.user;
    return this.twitchNotificationsService.updateDiscordNotification(id, body, sub);
  }

  @Patch('webhook/:id')
  updateWebhookNotification(
    @Req() request,
    @Param('id') id: string,
    @Body() body: UpdateWebhookNotificationDto,
  ) {
    const { sub } = <IAccessTokenPayload>request.user;
    return this.twitchNotificationsService.updateWebhookNotification(id, body, sub);
  }

  @Delete('discord/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDiscordNotification(@Req() request: any, @Param('id') id: string) {
    const { sub } = <IAccessTokenPayload>request.user;
    return this.twitchNotificationsService.deleteDiscordNotification(id, sub);
  }

  @Delete('webhook/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteWebhookNotification(@Req() request: any, @Param('id') id: string) {
    const { sub } = <IAccessTokenPayload>request.user;
    return this.twitchNotificationsService.deleteWebhookNotification(id, sub);
  }
}
