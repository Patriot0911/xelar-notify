import { Injectable } from '@nestjs/common';
import { Command } from 'apps/discord-bot/src/shared/decorators';
import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { buildEmbedConfigModal, DEFAULT_EMBED_DRAFT } from '../helpers';
import { PendingDestinationStore } from '../services';
import addDestinationCommandMeta from './add-destination.meta';

@Injectable()
export class AddDestinationCommand {
  constructor(private readonly pendingStore: PendingDestinationStore) {}

  @Command(addDestinationCommandMeta())
  async handle(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: 'You need administrator permissions to use this command.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const token = this.pendingStore.create({
      userId: interaction.user.id,
      guildId: interaction.guildId!,
      channelId: interaction.options.getChannel('channel')?.id ?? interaction.channelId,
      broadcasterId: interaction.options.getString('broadcaster', true),
      eventType: interaction.options.getString('type') ?? 'stream.online',
      draft: DEFAULT_EMBED_DRAFT,
    });

    return interaction.showModal(buildEmbedConfigModal(`add-destination:modal:${token}`, DEFAULT_EMBED_DRAFT));
  }
}
