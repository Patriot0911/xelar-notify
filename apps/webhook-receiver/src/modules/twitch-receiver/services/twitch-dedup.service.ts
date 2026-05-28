import { twitchWebhookMessage, RedisService } from '@libs/redis';
import { Injectable } from '@nestjs/common';

interface WebhookRecord {
  receivedAt: string;
  type: string;
}

@Injectable()
export class TwitchDedupService {
  private readonly TTL = 20 * 60; // 20 m

  constructor(
    private readonly redis: RedisService,
  ) {}

  async markIfNew(messageId: string, type: string): Promise<boolean> {
    return this.redis.setNX<WebhookRecord>(
      twitchWebhookMessage(messageId),
      { receivedAt: new Date().toISOString(), type },
      this.TTL,
    );
  }

  async isDuplicate(messageId: string): Promise<boolean> {
    return this.redis.exists(twitchWebhookMessage(messageId));
  }
}