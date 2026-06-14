import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DiscordBotModule } from './discord-bot.module';
import { MicroserviceOptions, TcpOptions, Transport } from '@nestjs/microservices';
import { Queues } from '@libs/queue';
import { RpcExceptionFilter } from '@libs/rpc';

async function bootstrap() {
  const {
    RABBIT_DISCORD_USER,
    RABBIT_DISCORD_PASSWORD,
    RABBIT_HOST = 'localhost',
    RABBIT_PORT = '5672',
    RABBIT_VHOST = '/',
    BOT_TCP_PORT = '3011',
  } = process.env;

  const rmqUrl = `amqp://${RABBIT_DISCORD_USER}:${RABBIT_DISCORD_PASSWORD}@${RABBIT_HOST}:${RABBIT_PORT}/${encodeURIComponent(RABBIT_VHOST)}`;

  const app = await NestFactory.create(DiscordBotModule, { logger: ['error', 'warn', 'log'] });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: Queues.DISCORD_NOTIFICATIONS,
      queueOptions: { durable: true },
    },
  });

  app.connectMicroservice<TcpOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: Number(BOT_TCP_PORT),
    },
  });

  app.enableShutdownHooks();

  await app.startAllMicroservices();
  await app.init();
}
bootstrap();
