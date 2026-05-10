import { twitchWebhookSecret } from '@libs/redis';
import { RedisService } from '@libs/redis/redis.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TwitchSecretCacheService {
  private readonly TTL = 4 * 60 * 60; // 4 h

  constructor(
    private readonly redisService: RedisService,
  ) {}

  async getSecret(clientId: string): Promise<string | null> {
    return this.redisService.get<string>(twitchWebhookSecret(clientId));
  }

  async setSecret(clientId: string, secret: string): Promise<void> {
    await this.redisService.set(twitchWebhookSecret(clientId), secret, this.TTL);
  }

  async invalidate(clientId: string): Promise<void> {
    await this.redisService.delete(twitchWebhookSecret(clientId));
  }
}
