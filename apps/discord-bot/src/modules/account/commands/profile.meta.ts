import { SlashCommandBuilder } from 'discord.js';

export default function profileMeta() {
  const commandBuilder = new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Show your Xelar Notify balance and subscriptions');
  return commandBuilder.toJSON();
}
