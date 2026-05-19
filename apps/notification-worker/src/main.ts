import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NotificationWorkerModule } from './notification-worker.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Queues } from '@libs/queue';

async function bootstrap() {
  const {
    RABBIT_WORKER_USER,
    RABBIT_WORKER_PASSWORD,
    RABBIT_HOST = 'localhost',
    RABBIT_PORT = '5672',
    RABBIT_VHOST = '/',
  } = process.env;

  const rabbitUrl = `amqp://${RABBIT_WORKER_USER}:${RABBIT_WORKER_PASSWORD}@${RABBIT_HOST}:${RABBIT_PORT}/${encodeURIComponent(RABBIT_VHOST)}`;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationWorkerModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitUrl],
        queue: Queues.STREAM_EVENTS,
        queueOptions: { durable: true },
        noAck: false,
      },
    },
  );
  await app.listen();
}
bootstrap();
