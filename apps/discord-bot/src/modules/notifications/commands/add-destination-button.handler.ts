import { RpcService } from '@libs/rpc';
import { RpcPatterns } from '@libs/rpc/patterns';
import { IAddDestinationPayload, IAddDestinationResult } from '@libs/shared';
import { Injectable } from '@nestjs/common';
import { ButtonClick } from 'apps/discord-bot/src/shared/decorators';
import { buildRpcErrorReply } from 'apps/discord-bot/src/shared/helpers/rpc-error.helper';
import { ButtonInteraction, MessageFlags } from 'discord.js';
import { buildEmbedConfigModal, buildMessagePayload } from '../helpers';
import { PendingDestinationStore } from '../services';

@Injectable()
export class AddDestinationButtonHandler {
  constructor(
    private readonly rpc: RpcService,
    private readonly pendingStore: PendingDestinationStore,
  ) {}

  @ButtonClick('add-destination:edit')
  async handleEdit(interaction: ButtonInteraction) {
    const token = interaction.customId.split(':').pop()!;
    const pending = this.pendingStore.get(token);

    if (!pending || pending.userId !== interaction.user.id) {
      return interaction.reply({
        content: 'This session has expired. Please run /add-destination again.',
        flags: MessageFlags.Ephemeral,
      });
    }

    return interaction.showModal(buildEmbedConfigModal(`add-destination:modal:${token}`, pending.draft));
  }

  @ButtonClick('add-destination:accept')
  async handleAccept(interaction: ButtonInteraction) {
    const token = interaction.customId.split(':').pop()!;
    const pending = this.pendingStore.get(token);

    if (!pending || pending.userId !== interaction.user.id) {
      return interaction.reply({
        content: 'This session has expired. Please run /add-destination again.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferUpdate();

    const res = await this.rpc.callSafe<IAddDestinationResult, IAddDestinationPayload>(
      RpcPatterns.discord.addDestination,
      <IAddDestinationPayload> {
        discordId: interaction.user.id,
        discordGuildId: pending.discordGuildId,
        channelId: pending.channelId,
        broadcasterId: pending.broadcasterId,
        eventType: pending.eventType,
        payload: buildMessagePayload(pending.draft),
      },
    );

    this.pendingStore.delete(token);

    if (!res.status) {
      return interaction.editReply({ ...buildRpcErrorReply(res), components: [] });
    }

    return interaction.editReply({
      embeds: [{
        title: '✅ Subscription added',
        color: 0x00b894,
        fields: [
          { name: 'Channel', value: `<#${res.data.channelId}>`,   inline: true },
          { name: 'Event',   value: res.data.eventType,           inline: true },
          { name: 'Cost',    value: `${res.data.cost} credit(s)`, inline: true },
        ],
      }],
      components: [],
    });
  }
}
