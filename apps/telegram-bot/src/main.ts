import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { TelegramBotModule } from './telegram-bot.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const {
    RABBIT_TELEGRAM_USER,
    RABBIT_TELEGRAM_PASSWORD,
    RABBIT_HOST = 'localhost',
    RABBIT_PORT = '5672',
    RABBIT_VHOST = '/',
  } = process.env;

  const url = `amqp://${RABBIT_TELEGRAM_USER}:${RABBIT_TELEGRAM_PASSWORD}@${RABBIT_HOST}:${RABBIT_PORT}/${encodeURIComponent(RABBIT_VHOST)}`;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TelegramBotModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [url],
        queue: 'notifications.telegram',
      },
    },
  );
  await app.listen();
}
bootstrap();
