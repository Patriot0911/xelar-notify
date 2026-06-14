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

  async validateDiscordWebhook(url: string, guildId: string): Promise<void> {
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
}
