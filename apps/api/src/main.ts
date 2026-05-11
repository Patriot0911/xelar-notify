import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter, ResponseInterceptor } from './shared';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@libs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Queues } from '@libs/queue';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  const config = app.get(ConfigService<AppConfig>);

  const rabbitUrl = buildAmqpUrl(
    config.get('RABBIT_API_USER')!,
    config.get('RABBIT_API_PASSWORD')!,
    config.get('RABBIT_HOST')!,
    config.get('RABBIT_PORT')!,
    config.get('RABBIT_VHOST')!,
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: Queues.TWITCH_SUBSCRIPTIONS,
      queueOptions: { durable: true },
      wildcards: true,
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: Queues.STREAM_EVENTS,
      queueOptions: { durable: true },
      wildcards: true,
      noAck: false,
    },
  });

  if (config.get('NODE_ENV') !== 'production') {
    const options = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('Med Scheduler API')
      .setDescription('')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/api/docs', app, document, {
      useGlobalPrefix: true,
        customCssUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
        customJs: [
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
        ],
    });
  }

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.startAllMicroservices();
  await app.listen(config.get('API_PORT') ?? 3000);
}
bootstrap();

function buildAmqpUrl(
  user: string,
  password: string,
  host: string,
  port: string,
  vhost: string,
): string {
  return `amqp://${user}:${password}@${host}:${port}/${encodeURIComponent(vhost)}`;
}
