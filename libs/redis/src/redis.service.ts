import { firstValueFrom, map, Observable, race, switchMap, take, timer } from 'rxjs';
import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { REDIS_CHANNEL_CLIENT, REDIS_CLIENT } from './redis.constants';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly client: Redis,
    @Inject(REDIS_CHANNEL_CLIENT)
    private readonly subscriber: Redis,
  ) {}

  async publish(channel: string, message: string): Promise<void> {
    await this.client.publish(channel, message);
  }

  async subscribe(channel: string, handler: (message: string) => void): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) handler(msg);
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }

  private waitForCacheReady<T>(
    cacheKey: string,
    channelKey: string,
    timeoutMs: number,
  ): Promise<T> {
    const message$ = new Observable<T>((observer) => {
      this.subscribe(channelKey, (message) => {
        observer.next(JSON.parse(message));
        observer.complete();
      });
      return () => this.unsubscribe(channelKey);
    });

    const onMessage$ = message$.pipe(take(1));

    const onTimeout$: Observable<T> = timer(timeoutMs).pipe(
      take(1),
      switchMap(() => this.get<T>(cacheKey)),
      map((cached) => {
        if (cached !== null) {
          return cached;
        }
        throw new InternalServerErrorException(`Timeout waiting for cache key "${cacheKey}" to be set`);
      }),
    );

    return firstValueFrom(race(onMessage$, onTimeout$));
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async getOrSet<T>(
    cacheKey: string,
    resolver: () => Promise<T>,
    ttl: number,
    timeoutMs = 3000,
  ): Promise<T> {
    const cached = await this.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const lockKey = `lock:${cacheKey}`;
    const channelKey = `notify:${cacheKey}`;

    const acquired = await this.setNX(lockKey, '1', 10);

    if (!acquired) {
      return this.waitForCacheReady<T>(cacheKey, channelKey, timeoutMs);
    }

    try {
      // double-check
      const cached = await this.get<T>(cacheKey);
      if (cached !== null) return cached;

      const result = await resolver();
      await this.set(cacheKey, result, ttl);
      await this.publish(channelKey, JSON.stringify(result));
      return result;
    } finally {
      await this.delete(lockKey);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async setNX<T>(key: string, value: T, ttlSeconds: number): Promise<boolean> {
    const serialized = JSON.stringify(value);
    const result = await this.client.set(key, serialized, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async deleteByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length) await this.client.del(keys);
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.subscriber.quit();
  }
}