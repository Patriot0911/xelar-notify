import { SlashCommandBuilder } from 'discord.js';

export default function pingCommandMeta() {
  const commandBuilder = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong and API ping in ms!');
  return commandBuilder.toJSON();
}
