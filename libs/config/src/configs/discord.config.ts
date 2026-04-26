import { registerAs } from '@nestjs/config';
import { IDiscordConfigModel } from '../models';

const DISCORD_KEY = 'discord';

export const discordConfig = registerAs<IDiscordConfigModel>(DISCORD_KEY, () => ({
  redirectUri: process.env.DISCORD_REDIRECT_URI!,
  clientId: process.env.DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  apiUrl: process.env.DISCORD_API_URL!,
}));

export type DiscordConfig = ReturnType<typeof discordConfig>;
