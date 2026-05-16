import { RpcService } from '@libs/rpc';
import { Injectable } from '@nestjs/common';
import { Command } from 'apps/discord-bot/src/shared/decorators';
import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits } from 'discord.js';
import addDestinationCommandMeta from './add-destination.meta';
import { RpcPatterns } from '@libs/rpc/patterns';
import { IAddDestinationPayload, IAddDestinationResult, IErrorResponse } from '@libs/shared';

@Injectable()
export class AddDestinationCommand {
  constructor(
    private readonly rpc: RpcService,
  ) {}

  @Command(addDestinationCommandMeta())
  async handle(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: 'You need administrator permissions to use this command.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    try {
      console.log('Received add-destination command from user');
      const result = await this.rpc.call<IAddDestinationResult>(
        RpcPatterns.discord.addDestination,
        <IAddDestinationPayload> {
          discordId: interaction.user.id,
          guildId:   interaction.guildId,
          channelId: interaction.options.getChannel('channel')?.id
            ?? interaction.channelId,
          broadcasterId:  interaction.options.getString('broadcaster', true),
          eventType: interaction.options.getString('type') ?? 'stream.online',
        },
      );

      await this.handleSuccessResult(interaction, result);
    } catch (e: unknown) {
      const error = <IErrorResponse<unknown>> e;
      await this.handleError(interaction, error);
    }
  }

  private async handleError(
    interaction: ChatInputCommandInteraction,
    error: IErrorResponse<unknown>,
  ) {
    console.error('Error response from RPC service:', error);
    let userMessage = 'An unexpected error occurred. Please try again later.';

    switch (error.message) {
      case 'NOT_REGISTERED':
        userMessage = 'You are not registered in the system. Please register before adding a notification.';
        break;
      case 'STREAMER_NOT_FOUND':
        userMessage = 'The specified Twitch broadcaster was not found. Please check the broadcaster ID and try again.';
        break;
      case 'INSUFFICIENT_CREDITS':
        userMessage = 'You do not have enough credits to add this notification. Please check your credits and try again.';
        break;
      case 'DESTINATION_EXISTS':
        userMessage = 'A notification for this channel and event type already exists. Please choose a different channel or event type.';
        break;
      case 'VALIDATION_ERROR':
        userMessage = 'There was a validation error with your input. Please check your command parameters and try again.';
        break;
      case 'INTERNAL_ERROR':
        userMessage = 'The server encountered an internal error while processing your request. Please try again later.';
        break;
    }
    interaction.editReply({
      content: userMessage,
    });
  }

  private async handleSuccessResult(
    interaction: ChatInputCommandInteraction,
    result: IAddDestinationResult,
  ) {
    console.log('Received response from RPC service:', result);

    return interaction.editReply({
      embeds: [{
        title: '✅ Підписку додано',
        color: 0x00b894,
        fields: [
          // { name: 'Стрімер',  value: result.data.streamerName,            inline: true },
          { name: 'Канал',    value: `<#${result.channelId}>`,       inline: true },
          { name: 'Подія',    value: result.eventType,               inline: true },
          { name: 'Вартість', value: `${result.cost} кредит(ів)`,   inline: true },
          // { name: 'Залишок',  value: `${result.data.remainingCredits} кредит(ів)`, inline: true },
        ],
      }],
    });
  }
}