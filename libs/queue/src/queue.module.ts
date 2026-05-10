// libs/queue/src/queue.module.ts
import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { QUEUE_CHANNEL } from './queue.constants';
import { QueueService } from './queue.service';
import { AppConfig } from '@libs/config';

export interface QueueCredentials {
  user:     string;
  password: string;
}

@Module({})
export class QueueModule {
  static forRootAsync(options: {
    inject:     any[];
    useFactory: (...args: any[]) => QueueCredentials;
  }): DynamicModule {
    return {
      module: QueueModule,
      providers: [
        {
          provide: QUEUE_CHANNEL,
          inject: [ConfigService, ...options.inject],
          useFactory: async (config: ConfigService<AppConfig>, ...args: any[]) => {
            const { user, password } = options.useFactory(...args);
            const host  = config.get('RABBIT_HOST');
            const port  = config.get('RABBIT_PORT');
            const vhost = encodeURIComponent(config.get('RABBIT_VHOST')!);

            const connection = await amqp.connect(
              `amqp://${user}:${password}@${host}:${port}/${vhost}`,
            );
            return connection.createChannel();
          },
        },
        QueueService,
      ],
      exports: [QueueService],
    };
  }
}