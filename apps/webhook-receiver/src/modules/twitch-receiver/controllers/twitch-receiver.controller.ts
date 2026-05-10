import { Controller, Param, Post, Headers, BadRequestException, Body, HttpCode, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { TwitchDedupService, TwitchReceiverService, TwitchSecretService } from '../services';

@Controller('twitch')
export class TwitchReceiverController {
  constructor(
    private readonly twitchSecretService: TwitchSecretService,
    private readonly twitchReceiverService: TwitchReceiverService,
    private readonly twitchDedupService: TwitchDedupService
  ) {}

  @Post(':clientId')
  @HttpCode(200)
  async handleTwitchWebhook(
    @Headers('twitch-eventsub-message-id') messageId: string,
    @Headers('twitch-eventsub-message-type') messageType: string,
    @Headers('twitch-eventsub-message-timestamp') timestamp: string,
    @Headers('twitch-eventsub-message-signature') signature: string,
    @Param('clientId') clientId: string,
    @Req() req: RawBodyRequest<Request>,
    @Body() body: any,
  ) {
    if (!req.rawBody || !clientId) {
      throw new BadRequestException('Invalid request body');
    }

    const isValid = this.twitchSecretService.verify(
      clientId,
      messageId,
      timestamp,
      req.rawBody,
      signature,
    );

    if (!isValid) {
      return { status: 'invalid signature' };
    }

    if (messageType === 'webhook_callback_verification') {
      const eventId = body?.subscription.id;
      this.twitchReceiverService.acknowledgeEvent(eventId);
      return body.challenge;
    }

    if (messageType === 'revocation') {
      this.twitchReceiverService.revokeTwitchSubscription();
      return { status: 'ok' };
    }

    const isNew = await this.twitchDedupService.markIfNew(messageId, messageType);
    if (!isNew) {
      return { status: 'duplicate' };
    }

    await this.twitchReceiverService.handleEvent(body);

    return { status: 'ok' };
  }
}
