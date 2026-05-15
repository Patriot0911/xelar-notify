import { BadRequestException, Injectable } from '@nestjs/common';
import { DiscordWebhookPayloadSchema, TDiscordWebhookPayload } from '../schemas';
import z from 'zod';

@Injectable()
export class DiscordPayloadService {
  validatePayload(payload: Record<string, unknown>): boolean {
    const result = DiscordWebhookPayloadSchema.safeParse(payload);
    if (!result.success) {
      throw new BadRequestException(z.treeifyError(result.error));
    }
    return true;
  }

  interpolatePayload(
    payload: TDiscordWebhookPayload,
    context: any, // todo: add proper typing for context
  ): TDiscordWebhookPayload {
    const raw = JSON.stringify(payload);

    const interpolated = raw.replace(
      /\{\{(\w+)\}\}/g,
      (_, key) => context[key as keyof any] ?? '',
    );

    return JSON.parse(interpolated);
  }
}
