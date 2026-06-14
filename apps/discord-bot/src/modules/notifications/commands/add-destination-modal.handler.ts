import { Injectable } from '@nestjs/common';
import { ModalSubmit } from 'apps/discord-bot/src/shared/decorators';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ModalSubmitInteraction } from 'discord.js';
import { buildMessagePayload, EmbedDraft, interpolateForPreview } from '../helpers';
import { PendingDestinationStore } from '../services';

@Injectable()
export class AddDestinationModalHandler {
  constructor(private readonly pendingStore: PendingDestinationStore) {}

  @ModalSubmit('add-destination:modal')
  async handle(interaction: ModalSubmitInteraction) {
    const token = interaction.customId.split(':').pop()!;
    const pending = this.pendingStore.get(token);

    if (!pending) {
      return interaction.reply({
        content: 'This session has expired. Please run /add-destination again.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const draft: EmbedDraft = {
      content: interaction.fields.getTextInputValue('content'),
      title: interaction.fields.getTextInputValue('title'),
      description: interaction.fields.getTextInputValue('description'),
      color: interaction.fields.getTextInputValue('color'),
      imageUrl: interaction.fields.getTextInputValue('imageUrl'),
    };

    this.pendingStore.update(token, draft);

    const payload = buildMessagePayload(draft, interpolateForPreview);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`add-destination:accept:${token}`)
        .setLabel('Accept')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`add-destination:edit:${token}`)
        .setLabel('Edit')
        .setStyle(ButtonStyle.Secondary),
    );

    const message = {
      content: payload.content,
      embeds: payload.embeds ?? [],
      components: [row],
    };

    if (interaction.isFromMessage()) {
      return interaction.update(message);
    }

    return interaction.reply({ ...message, flags: MessageFlags.Ephemeral });
  }
}
