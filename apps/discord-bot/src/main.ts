import { NestFactory } from '@nestjs/core';
import { DiscordBotModule } from './discord-bot.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    DiscordBotModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [''],
        // process.env.RABBITMQ_URL
        queue: 'discord.notifications',
      },
    },
  );
  await app.listen();
}
bootstrap();
