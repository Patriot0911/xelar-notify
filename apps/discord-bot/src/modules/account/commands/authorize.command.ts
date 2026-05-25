import { RpcService } from '@libs/rpc';
import { RpcPatterns } from '@libs/rpc/patterns';
import { IAuthenticatePayload, IAuthenticateResult } from '@libs/shared';
import { Injectable } from '@nestjs/common';
import { Command } from 'apps/discord-bot/src/shared/decorators';
import { buildRpcErrorReply } from 'apps/discord-bot/src/shared/helpers/rpc-error.helper';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import authorizeMeta from './authorize.meta';

@Injectable()
export class AuthorizeCommand {
  constructor(private readonly rpc: RpcService) {}

  @Command(authorizeMeta())
  async handle(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    const res = await this.rpc.callSafe<IAuthenticateResult, IAuthenticatePayload>(
      RpcPatterns.discord.authenticate,
      { discordId: interaction.user.id },
    );

    if (!res.status) {
      if (res.data?.isRegistered) {
        return interaction.editReply({
          embeds: [{
            title: '✅ Account connected',
            description: 'Your Discord account is already linked to Xelar Notify.',
            color: 0x00b894,
          }],
        });
      }
      return interaction.editReply(buildRpcErrorReply(res));
    }


    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Connect account')
        .setURL(res.data.authUrl!)
        .setStyle(ButtonStyle.Link),
    );

    return interaction.editReply({
      embeds: [{
        title: '🔗 Authorization required',
        description: 'Click the button below to link your Discord account to Xelar Notify.',
        color: 0x0984e3,
      }],
      components: [row],
    });
  }
}
