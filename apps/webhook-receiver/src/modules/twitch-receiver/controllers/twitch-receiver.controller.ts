import { Controller, Post, Headers, BadRequestException, Body, HttpCode, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { TwitchSecretService } from '../services';

@Controller('twitch')
export class TwitchReceiverController {
  constructor(
    private readonly twitchSecretService: TwitchSecretService
  ) {}

  @Post()
  @HttpCode(200)
  async handleTwitchWebhook(
    @Headers('twitch-eventsub-message-id')         messageId: string,
    @Headers('twitch-eventsub-message-type')       messageType: string,
    @Headers('twitch-eventsub-message-timestamp')  timestamp: string,
    @Headers('twitch-eventsub-message-signature')  signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Body() body: any,
  ) {
    const clientId = body?.subscription?.transport?.client_id
      ?? body?.subscription?.condition?.client_id;

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
      return body.challenge;
    }

    // if (messageType === 'revocation') {
    //   await this.queueService.publish('twitch.subscription.revoked', body);
    //   return { status: 'ok' };
    // }

    // const isNew = await this.dedupService.markIfNew(messageId, messageType);
    // if (!isNew) {
    //   return { status: 'duplicate' };
    // }

    // await this.queueService.publish('stream.online', {
    //   messageId,
    //   event: body.event,
    //   subscription: body.subscription,
    // });

    return { status: 'ok' };
  }
}
