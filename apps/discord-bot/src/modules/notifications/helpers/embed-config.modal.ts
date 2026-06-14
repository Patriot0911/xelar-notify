import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { EmbedDraft } from './embed-draft.model';

export function buildEmbedConfigModal(customId: string, draft: EmbedDraft): ModalBuilder {
  const contentInput = new TextInputBuilder()
    .setCustomId('content')
    .setLabel('Message content')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(2000)
    .setValue(draft.content);

  const titleInput = new TextInputBuilder()
    .setCustomId('title')
    .setLabel('Embed title')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(256)
    .setValue(draft.title);

  const descriptionInput = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('Embed description')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(1000)
    .setValue(draft.description);

  const colorInput = new TextInputBuilder()
    .setCustomId('color')
    .setLabel('Embed color (hex)')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(7)
    .setPlaceholder('#9146FF')
    .setValue(draft.color);

  const imageUrlInput = new TextInputBuilder()
    .setCustomId('imageUrl')
    .setLabel('Image URL')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(300)
    .setValue(draft.imageUrl);

  return new ModalBuilder()
    .setCustomId(customId)
    .setTitle('Configure notification message')
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(contentInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(imageUrlInput),
    );
}
