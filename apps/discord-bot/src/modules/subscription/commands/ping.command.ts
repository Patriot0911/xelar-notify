import { Injectable } from '@nestjs/common';
import { Command } from 'apps/discord-bot/src/shared/decorators';
import { ChatInputCommandInteraction } from 'discord.js';
import pingCommandMeta from './ping.meta';

@Injectable()
export class PingCommand {
  @Command(pingCommandMeta())
  handle(interaction: ChatInputCommandInteraction) {
    const apiPing = interaction.client.ws.ping;
    interaction.reply(`Pong! (${apiPing} ms)`);
  }
}
