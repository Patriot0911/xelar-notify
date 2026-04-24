import { NestFactory } from '@nestjs/core';
import { TelegramBotModule } from './telegram-bot.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TelegramBotModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [''],
        // process.env.RABBITMQ_URL
        queue: 'telegram.notifications',
      },
    },
  );
  await app.listen();
}
bootstrap();
