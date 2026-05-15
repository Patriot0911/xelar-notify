import { BadRequestException, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { IDiscordApiWebhookModel } from '../models/discord-webhook.model';

@Injectable()
export class DiscordWebhookiService {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  async validateWebhook(webhook: string, guildId: string): Promise<boolean> {
    const webhookRegex = /^https:\/\/discord.com\/api\/webhooks\/\d+\/[\w-]+$/;
    if (!webhookRegex.test(webhook)) {
      throw new BadRequestException('Invalid Discord webhook URL format');
    }
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<IDiscordApiWebhookModel>(webhook)
      );
      return data.guildId === guildId;
    } catch (error) {
      throw new BadRequestException('Failed to validate Discord webhook URL');
    }
  }

  async sendNotification(webhook: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(webhook, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    } catch (error) {
      throw new BadRequestException('Failed to send notification to Discord');
    }
  }
}
