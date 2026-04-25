import { SetMetadata } from '@nestjs/common';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';

export const COMMAND_METADATA = 'discord:command';

export const Command = (metadata: RESTPostAPIChatInputApplicationCommandsJSONBody) =>
  SetMetadata(COMMAND_METADATA, metadata);
