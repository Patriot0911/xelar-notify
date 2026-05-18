import { RpcService } from '@libs/rpc';
import { RpcPatterns } from '@libs/rpc/patterns';
import { IAddDestinationPayload, IAddDestinationResult } from '@libs/shared';
import { Injectable } from '@nestjs/common';
import { Command } from 'apps/discord-bot/src/shared/decorators';
import { buildRpcErrorReply } from 'apps/discord-bot/src/shared/helpers/rpc-error.helper';
import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits } from 'discord.js';
import addDestinationCommandMeta from './add-destination.meta';

@Injectable()
export class AddDestinationCommand {
  constructor(private readonly rpc: RpcService) {}

  @Command(addDestinationCommandMeta())
  async handle(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: 'You need administrator permissions to use this command.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const res = await this.rpc.callSafe<IAddDestinationResult, IAddDestinationPayload>(
      RpcPatterns.discord.addDestination,
      <IAddDestinationPayload> {
        discordId:    interaction.user.id,
        guildId:      interaction.guildId,
        channelId:    interaction.options.getChannel('channel')?.id ?? interaction.channelId,
        broadcasterId: interaction.options.getString('broadcaster', true),
        eventType:    interaction.options.getString('type') ?? 'stream.online',
      },
    );

    if (!res.status) {
      return interaction.editReply(buildRpcErrorReply(res));
    }

    return interaction.editReply({
      embeds: [{
        title: '✅ Subscription added',
        color: 0x00b894,
        fields: [
          { name: 'Channel', value: `<#${res.data.channelId}>`,      inline: true },
          { name: 'Event',   value: res.data.eventType,              inline: true },
          { name: 'Cost',    value: `${res.data.cost} credit(s)`,    inline: true },
        ],
      }],
    });
  }
}
