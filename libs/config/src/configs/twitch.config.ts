import { registerAs } from '@nestjs/config';
import { ITwitchAuthConfigModel } from '../models';

const TWITCH_AUTH_KEY = 'twitchAuth';

export const twitchAuthConfig = registerAs<ITwitchAuthConfigModel>(TWITCH_AUTH_KEY, () => ({
  redirectUri: process.env.TWITCH_AUTH_REDIRECT_URI!,
  scopes: 'channel:read:subscriptions bits:read',
}));

export type TwitchAuthConfig = ReturnType<typeof twitchAuthConfig>;
