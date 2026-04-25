import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { Client, REST, Routes, ChatInputCommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { COMMAND_METADATA, EVENT_METADATA } from '../../shared/decorators';
import { DISCORD_CLIENT } from '../../shared/constants/discord.constants';
import { AppConfig } from '@libs/config';

@Injectable()
export class DiscordExplorer implements OnModuleInit {
  constructor(
    @Inject(DISCORD_CLIENT) private readonly client: Client,
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async onModuleInit() {
    await this.registerCommands();
    this.registerEventListeners();
  }

  private async registerCommands() {
    const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    const handlers = new Map<string, (i: ChatInputCommandInteraction) => Promise<void>>();

    const wrappers = this.discovery.getProviders();

    for (const wrapper of wrappers) {
      if (!wrapper.instance) continue;

      const instance = wrapper.instance;
      const prototype = Object.getPrototypeOf(instance);

      this.scanner.getAllMethodNames(prototype).forEach((method) => {
        const metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = this.reflector.get(
          COMMAND_METADATA,
          instance[method],
        );

        if (metadata) {
          commands.push({
            ...metadata,
          });
          handlers.set(metadata.name, instance[method].bind(instance));
        }
      });
    }

    const discordToken = this.config.get('DISCORD_TOKEN');
    const clientId = this.config.get('DISCORD_CLIENT_ID');
    if (!discordToken || !clientId) {
      console.warn('Discord token or client ID not found in config');
      return;
    }
    const rest = new REST().setToken(discordToken);
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const handler = handlers.get(interaction.commandName);
      if (handler) {
        await handler(interaction);
      }
    });

    console.log(`Registered ${commands.length} slash commands`);
  }

  private registerEventListeners() {
    const wrappers = this.discovery.getProviders();

    for (const wrapper of wrappers) {
      if (!wrapper.instance) continue;

      const instance = wrapper.instance;
      const prototype = Object.getPrototypeOf(instance);

      this.scanner.getAllMethodNames(prototype).forEach((method) => {
        const event = this.reflector.get(
          EVENT_METADATA,
          instance[method],
        );

        if (event) {
          this.client.on(event, instance[method].bind(instance));
          console.log(`Registered event listener: ${event}`);
        }
      });
    }
  }
}