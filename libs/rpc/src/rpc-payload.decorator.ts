import { ValidationPipe } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';

export const RpcPayload = () =>
  Payload(new ValidationPipe({ transform: true, whitelist: true }));
