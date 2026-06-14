import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { Client, REST, Routes, ChatInputCommandInteraction, ButtonInteraction, ModalSubmitInteraction, AutocompleteInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { COMMAND_METADATA, EVENT_METADATA, MODAL_METADATA, BUTTON_METADATA, AUTOCOMPLETE_METADATA } from '../../shared/decorators';
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
    const modalHandlers = new Map<string, (i: ModalSubmitInteraction) => Promise<void>>();
    const buttonHandlers = new Map<string, (i: ButtonInteraction) => Promise<void>>();
    const autocompleteHandlers = new Map<string, (i: AutocompleteInteraction) => Promise<void>>();

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

        const modalPrefix: string = this.reflector.get(MODAL_METADATA, instance[method]);
        if (modalPrefix) {
          modalHandlers.set(modalPrefix, instance[method].bind(instance));
        }

        const buttonPrefix: string = this.reflector.get(BUTTON_METADATA, instance[method]);
        if (buttonPrefix) {
          buttonHandlers.set(buttonPrefix, instance[method].bind(instance));
        }

        const autocompleteCommand: string = this.reflector.get(AUTOCOMPLETE_METADATA, instance[method]);
        if (autocompleteCommand) {
          autocompleteHandlers.set(autocompleteCommand, instance[method].bind(instance));
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
      if (interaction.isChatInputCommand()) {
        const handler = handlers.get(interaction.commandName);
        if (handler) {
          await handler(interaction);
        }
        return;
      }

      if (interaction.isModalSubmit()) {
        const prefix = interaction.customId.substring(0, interaction.customId.lastIndexOf(':'));
        const handler = modalHandlers.get(prefix);
        if (handler) {
          await handler(interaction);
        }
        return;
      }

      if (interaction.isButton()) {
        const prefix = interaction.customId.substring(0, interaction.customId.lastIndexOf(':'));
        const handler = buttonHandlers.get(prefix);
        if (handler) {
          await handler(interaction);
        }
        return;
      }

      if (interaction.isAutocomplete()) {
        const handler = autocompleteHandlers.get(interaction.commandName);
        if (handler) {
          await handler(interaction);
        }
        return;
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