import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { IErrorResponse, RpcError } from '@libs/shared';

const ERROR_EMBEDS: Record<string, { title: string; description: string }> = {
  [RpcError.NOT_REGISTERED]: {
    title: '❌ Account not connected',
    description: 'Your Discord account is not linked to the system. Click the button below to authorize.',
  },
  [RpcError.STREAMER_NOT_FOUND]: {
    title: '❌ Streamer not found',
    description: 'The specified Twitch broadcaster was not found. Please check the broadcaster ID and try again.',
  },
  [RpcError.INSUFFICIENT_CREDITS]: {
    title: '❌ Insufficient credits',
    description: 'You do not have enough credits for this action. Top up your balance and try again.',
  },
  [RpcError.DESTINATION_EXISTS]: {
    title: '❌ Subscription already exists',
    description: 'A notification for this channel and event already exists. Choose a different channel or event type.',
  },
  [RpcError.VALIDATION_ERROR]: {
    title: '❌ Validation error',
    description: 'Invalid command parameters. Please check your input and try again.',
  },
};

const FALLBACK_EMBED = {
  title: '❌ Internal error',
  description: 'An unexpected error occurred. Please try again later.',
};

export function buildRpcErrorReply(error: IErrorResponse<unknown>) {
  const { title, description } = ERROR_EMBEDS[error.message] ?? FALLBACK_EMBED;
  const embed = { title, description, color: 0xe74c3c };

  const authUrl = (error.data as { authUrl?: string } | undefined)?.authUrl;
  if (error.message === RpcError.NOT_REGISTERED && authUrl) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Connect account')
        .setURL(authUrl)
        .setStyle(ButtonStyle.Link),
    );
    return { embeds: [embed], components: [row] };
  }

  return { embeds: [embed] };
}
