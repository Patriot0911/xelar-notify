import { IStreamOnlineMessage, QueuePatterns, Queues, QueueService } from '@libs/queue';
import { RpcPatterns } from '@libs/rpc/patterns';
import { RpcService } from '@libs/rpc';
import type { ITwitchChannelInfoResult, ITwitchGetChannelInfoPayload } from '@libs/shared';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TwitchReceiverService {
  private readonly logger = new Logger(TwitchReceiverService.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly rpcService: RpcService,
  ) {}

  acknowledgeEvent(eventId: string) {
    this.queueService.emit(
      Queues.TWITCH_SUBSCRIPTIONS,
      QueuePatterns.twitch.subscriptions.verified,
      { eventId, }
    );
  }

  revokeTwitchSubscription(eventId: string) {
    this.queueService.emit(
      Queues.TWITCH_SUBSCRIPTIONS,
      QueuePatterns.twitch.subscriptions.revoked,
      { eventId, }
    );
  }

  async handleEvent(dto: any) {
    const subscriptionType: string = dto?.subscription?.type;

    if (!subscriptionType) {
      this.logger.warn('Received event without subscription type');
      return;
    }

    if (subscriptionType === 'stream.online') {
      const channelInfo = await this.rpcService.callSafe<ITwitchChannelInfoResult, ITwitchGetChannelInfoPayload>(
        RpcPatterns.twitch.getChannelInfo,
        { broadcasterId: dto.event.broadcaster_user_id },
      );

      const payload: IStreamOnlineMessage = {
        subscription: { id: dto.subscription.id },
        event: dto.event,
        channelInfo: channelInfo.status ? channelInfo.data ?? undefined : undefined,
      };
      this.queueService.emit(
        Queues.STREAM_EVENTS,
        QueuePatterns.twitch.events.online,
        payload,
      );
      return;
    }

    this.logger.warn(`Unhandled Twitch event type: ${subscriptionType}`);
  }
}
