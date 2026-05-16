import { TwitchStreamerEvents } from '@libs/database';
import { SlashCommandBuilder } from 'discord.js';

export default function addDestinationCommandMeta() {
  const commandBuilder = new SlashCommandBuilder()
    .setName('add-destination')
    .setDescription('Add a notification destination for a streamer event')
    .addStringOption(option =>
      option.setName('broadcaster')
        .setDescription('Twitch broadcaster ID to receive notifications from')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Discord channel to send notifications to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of event to receive notifications for (default: stream.online)')
        .setRequired(false)
        .addChoices(
          { name: 'Stream Online', value: TwitchStreamerEvents.STREAM_ONLINE },
        )
    );
  return commandBuilder.toJSON();
}
