import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { IAccessTokenPayload, JwtAccessGuard } from '../../auth';
import { DiscordGuard } from '../../discord/guards';
import { CreateDiscordNotificationDto, CreateWebhookNotificationDto } from '../dto';
import { TwitchNotificationsService } from '../services/twitch-notifications.service';

@Controller('api/twitch-notifications')
@UseGuards(JwtAccessGuard)
@ApiBearerAuth()
export class DiscordNotificationsController {
  constructor(
    private readonly twitchNotificationsService: TwitchNotificationsService,
  ) {}

  @Get()
  getUserNotifications(@Req() request) {
    const { sub } = <IAccessTokenPayload>request.user;
    return this.twitchNotificationsService.getUserNotifications(sub);
  }

  @Get('discord/:discordGuildId')
  @UseGuards(DiscordGuard)
  getGuildNotifications(
    @Req() request,
    @Param('discordGuildId') discordGuildId: string,
  ) {
    const { sub } = <IAccessTokenPayload>request.user;
    return this.twitchNotificationsService.getGuildNotifications(sub, discordGuildId);
  }

  @Post('discord')
  createDiscordNotification(@Req() request, @Body() body: CreateDiscordNotificationDto) {
    const { sub } = <IAccessTokenPayload> request.user;
    return this.twitchNotificationsService.createDiscordNotification(body, sub);
  }

  @Post('discord/:guildId/webhook')
  createDiscordWebhookNotification(
    @Req() request,
    @Param('guildId') guildId: string,
    @Body() body: CreateWebhookNotificationDto
  ) {
    const { sub } = <IAccessTokenPayload> request.user;
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
}
