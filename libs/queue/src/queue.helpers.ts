import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { IQueueCredentials } from './queue.model';
import { QUEUE_CHANNEL } from './queue.constants';
import { AppConfig } from '@libs/config';

export function buildAmqpUrl(
  config: ConfigService<AppConfig>,
  user: string,
  password: string,
): string {
  const host  = config.get('RABBIT_HOST');
  const port  = config.get('RABBIT_PORT');
  const vhost = encodeURIComponent(config.get('RABBIT_VHOST')!);
  return `amqp://${user}:${password}@${host}:${port}/${vhost}`;
}

export function buildChannelProvider(options: {
  inject:     any[];
  useFactory: (...args: any[]) => IQueueCredentials;
}) {
  return {
    provide:    QUEUE_CHANNEL,
    inject:     [ConfigService, ...options.inject],
    useFactory: async (config: ConfigService, ...args: any[]) => {
      const { user, password } = options.useFactory(...args);
      const url = buildAmqpUrl(config, user, password);

      const connection = await amqp.connect(url);
      const channel = await connection.createChannel();

      connection.on('error', (err) =>
        console.error('[RabbitMQ] Connection error:', err.message),
      );
      connection.on('close', () =>
        console.warn('[RabbitMQ] Connection closed'),
      );

      return channel;
    },
  };
}
