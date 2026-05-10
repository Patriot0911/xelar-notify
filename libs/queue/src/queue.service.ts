import { Injectable, Inject } from '@nestjs/common';
import { Channel } from 'amqplib';
import { QUEUE_CHANNEL } from './queue.constants';

@Injectable()
export class QueueService {
  constructor(
    @Inject(QUEUE_CHANNEL)
    private readonly channel: Channel,
  ) {}

  async emit<T>(queue: string, data: T): Promise<void> {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(data)),
      { persistent: true },
    );
  }
}