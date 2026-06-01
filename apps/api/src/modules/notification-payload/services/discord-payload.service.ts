import { BadRequestException, Injectable } from '@nestjs/common';
import {
  DiscordBotPayloadSchema,
  DiscordWebhookPayloadSchema,
  TDiscordBotPayload,
  TDiscordWebhookPayload,
} from '../schemas';
import z from 'zod';

@Injectable()
export class DiscordPayloadService {
  validateBotPayload(payload: Record<string, unknown>): boolean {
    const result = DiscordBotPayloadSchema.safeParse(payload);
    if (!result.success) {
      throw new BadRequestException(z.treeifyError(result.error));
    }
    return true;
  }

  validateWebhookPayload(payload: Record<string, unknown>): boolean {
    const result = DiscordWebhookPayloadSchema.safeParse(payload);
    if (!result.success) {
      throw new BadRequestException(z.treeifyError(result.error));
    }
    return true;
  }

  interpolateBotPayload(
    payload: TDiscordBotPayload,
    context: Record<string, string>,
  ): TDiscordBotPayload {
    return this.interpolate(payload, context);
  }

  interpolateWebhookPayload(
    payload: TDiscordWebhookPayload,
    context: Record<string, string>,
  ): TDiscordWebhookPayload {
    return this.interpolate(payload, context);
  }

  private interpolate<T>(payload: T, context: Record<string, string>): T {
    const interpolated = JSON.stringify(payload).replace(
      /\$\{(\w+)\}/g,
      (_, key: string) => context[key] ?? `\${${key}}`,
    );
    return JSON.parse(interpolated);
  }
}
