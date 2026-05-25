import { SlashCommandBuilder } from 'discord.js';

export default function authorizeMeta() {
  const commandBuilder = new SlashCommandBuilder()
    .setName('authorize')
    .setDescription('Link your Discord account to Xelar Notify');
  return commandBuilder.toJSON();
}
