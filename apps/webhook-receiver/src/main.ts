import { NestFactory } from '@nestjs/core';
import { WebhookReceiverModule } from './webhook-receiver.module';

async function bootstrap() {
  const app = await NestFactory.create(
    WebhookReceiverModule,
    { rawBody: true, }
  );
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
