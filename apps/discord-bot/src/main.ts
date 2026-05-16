import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DiscordBotModule } from './discord-bot.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const {
    RABBIT_DISCORD_USER,
    RABBIT_DISCORD_PASSWORD,
    RABBIT_HOST = 'localhost',
    RABBIT_PORT = '5672',
    RABBIT_VHOST = '/',
  } = process.env;

  const url = `amqp://${RABBIT_DISCORD_USER}:${RABBIT_DISCORD_PASSWORD}@${RABBIT_HOST}:${RABBIT_PORT}/${encodeURIComponent(RABBIT_VHOST)}`;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    DiscordBotModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [url],
        queue: 'discord.notifications',
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  app.enableShutdownHooks();

  await app.listen();
}
bootstrap();