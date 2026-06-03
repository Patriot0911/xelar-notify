import { BadRequestException, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { IDiscordApiWebhookModel } from '../models/discord-webhook.model';
import { AxiosResponse } from 'axios';

@Injectable()
export class DiscordWebhookService {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  async validateWebhookUrl(url: string, guildId: string): Promise<void> {
    const webhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;

    if (!webhookRegex.test(url)) {
      throw new BadRequestException('Invalid Discord webhook URL format');
    }

    let response: AxiosResponse<IDiscordApiWebhookModel>;

    try {
      response = await firstValueFrom(
        this.httpService.get<IDiscordApiWebhookModel>(url),
      );
    } catch {
      throw new BadRequestException('Discord webhook URL is not accessible');
    }

    if (response.data.guild_id !== guildId) {
      throw new BadRequestException('Webhook does not belong to the specified guild');
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
