import { Client, Events, GatewayIntentBits } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { DISCORD_CLIENT } from '../../shared/constants/discord.constants';
import { AppConfig } from '@libs/config';

export const discordProvider = {
  provide: DISCORD_CLIENT,
  useFactory: async (config: ConfigService<AppConfig, true>) => {
    const client = new Client({
      intents: [GatewayIntentBits.Guilds],
    });

    await client.login(config.get('DISCORD_TOKEN'));

    await new Promise<void>((resolve) => {
      client.once(Events.ClientReady, () => {
        console.log(`Discord bot ready to battle! (${client.user!.tag})`);
        resolve();
      });
    });

    return client;
  },
  inject: [ConfigService],
};
