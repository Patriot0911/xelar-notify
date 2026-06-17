import { RpcService } from '@libs/rpc';
import { RpcPatterns } from '@libs/rpc/patterns';
import { IGetProfilePayload, IGetProfileResult } from '@libs/shared';
import { Injectable } from '@nestjs/common';
import { Command } from 'apps/discord-bot/src/shared/decorators';
import { buildRpcErrorReply } from 'apps/discord-bot/src/shared/helpers/rpc-error.helper';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import profileMeta from './profile.meta';

@Injectable()
export class ProfileCommand {
  constructor(private readonly rpc: RpcService) {}

  @Command(profileMeta())
  async handle(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const res = await this.rpc.callSafe<IGetProfileResult, IGetProfilePayload>(
      RpcPatterns.discord.getProfile,
      <IGetProfilePayload> {
        discordId: interaction.user.id,
        discordGuildId: interaction.guildId ?? undefined,
      },
    );

    if (!res.status) {
      return interaction.editReply(buildRpcErrorReply(res));
    }

    const fields = [
      { name: 'Your balance', value: `${res.data.balance} credit(s)`, inline: true },
      { name: 'Your subscriptions', value: `${res.data.subscriptionsCount}`, inline: true },
    ];

    if (res.data.guild) {
      fields.push(
        { name: 'Server balance', value: `${res.data.guild.balance} credit(s)`, inline: true },
        { name: 'Server subscriptions', value: `${res.data.guild.subscriptionsCount}`, inline: true },
      );
    }

    return interaction.editReply({
      embeds: [{
        title: '👤 Your profile',
        color: 0x0984e3,
        fields,
      }],
    });
  }
}
