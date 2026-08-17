import { Controller, Param, Post, Headers, BadRequestException, Body, HttpCode, Req, Logger } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { TwitchDedupService, TwitchReceiverService, TwitchSecretService } from '../services';

@Controller('twitch')
export class TwitchReceiverController {
  private readonly logger = new Logger(TwitchReceiverController.name);

  constructor(
    private readonly twitchSecretService: TwitchSecretService,
    private readonly twitchReceiverService: TwitchReceiverService,
    private readonly twitchDedupService: TwitchDedupService
  ) {}

  @Post(':clientId/:eventId')
  @HttpCode(200)
  async handleTwitchWebhook(
    @Headers('twitch-eventsub-message-id') messageId: string,
    @Headers('twitch-eventsub-message-type') messageType: string,
    @Headers('twitch-eventsub-message-timestamp') timestamp: string,
    @Headers('twitch-eventsub-message-signature') signature: string,
    @Param('clientId') clientId: string,
    @Param('eventId')  eventId: string,
    @Req() req: RawBodyRequest<Request>,
    @Body() body: any,
  ) {
    const startedAt = Date.now();
    // Cloudflare (or any reverse proxy in front of this endpoint) rewrites the socket
    // peer address, so the real client IP travels in this header instead of req.ip.
    const clientIp = (req.headers['cf-connecting-ip'] as string) ?? req.ip;
    const ref = `${clientId}/${eventId} msg=${messageId ?? 'n/a'}`;

    this.logger.log(
      `[received] ${ref} type=${messageType ?? 'n/a'} ip=${clientIp} bodyBytes=${req.rawBody?.length ?? 0}`,
    );

    if (!req.rawBody || !clientId || !eventId) {
      this.logger.warn(`[rejected] ${ref} reason=missing-body-or-params ip=${clientIp}`);
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
      this.logger.warn(`[rejected] ${ref} reason=invalid-signature ip=${clientIp}`);
      return { status: 'invalid signature' };
    }
    this.logger.log(`[verified] ${ref} signature=ok`);

    if (messageType === 'webhook_callback_verification') {
      this.twitchReceiverService.acknowledgeEvent(eventId);
      this.logger.log(`[processed] ${ref} branch=callback-verification durationMs=${Date.now() - startedAt}`);
      return body.challenge;
    }

    if (messageType === 'revocation') {
      this.twitchReceiverService.revokeTwitchSubscription(eventId);
      this.logger.log(`[processed] ${ref} branch=revocation durationMs=${Date.now() - startedAt}`);
      return { status: 'ok' };
    }

    const isNew = await this.twitchDedupService.markIfNew(messageId, messageType);
    if (!isNew) {
      this.logger.log(`[skipped] ${ref} reason=duplicate durationMs=${Date.now() - startedAt}`);
      return { status: 'duplicate' };
    }
    this.logger.log(`[dedup] ${ref} status=new`);

    try {
      await this.twitchReceiverService.handleEvent(body);
    } catch (e: unknown) {
      this.logger.error(`[failed] ${ref} branch=notification durationMs=${Date.now() - startedAt}`, e);
      throw e;
    }

    this.logger.log(`[processed] ${ref} branch=notification durationMs=${Date.now() - startedAt}`);
    return { status: 'ok' };
  }
}
