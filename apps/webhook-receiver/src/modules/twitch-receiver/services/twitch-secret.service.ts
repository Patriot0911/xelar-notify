import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TwitchSecretCacheService } from './twitch-secret-cache.service';
import { TwitchAppEntity } from '@libs/database';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoService } from '@libs/shared';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';

@Injectable()
export class TwitchSecretService {
  constructor(
    @InjectRepository(TwitchAppEntity)
    private readonly appsRepository: Repository<TwitchAppEntity>,
    private readonly cryptoService: CryptoService,
    private readonly twitchSecretCacheService: TwitchSecretCacheService,
  ) {}

  async verify(
    clientId: string,
    messageId: string,
    timestamp: string,
    rawBody: Buffer,
    signature: string,
  ): Promise<boolean> {
    const secret = await this.getSecret(clientId);
    if (!secret) {
      throw new InternalServerErrorException(`Cannot find app with clientId "${clientId}"`);
    }

    const message = messageId + timestamp + rawBody.toString('utf8');

    const expected = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signature),
      );
    } catch {
      return false;
    }
  }

  private async getSecret(clientId: string): Promise<string | null> {
    const cached = await this.twitchSecretCacheService.getSecret(clientId);
    if (cached) {
      return cached;
    }

    const app = await this.appsRepository.findOne({
      where: { clientId },
      select: { webhookSecret: true, clientId: true },
    });

    if (!app?.webhookSecret) {
      return null;
    }

    const secret = this.cryptoService.decrypt(app.webhookSecret);
    await this.twitchSecretCacheService.setSecret(clientId, secret);
    return secret;
  }
}
