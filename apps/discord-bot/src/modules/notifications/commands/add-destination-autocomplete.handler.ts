import { RpcService } from '@libs/rpc';
import { RpcPatterns } from '@libs/rpc/patterns';
import { ISearchStreamersPayload, ISearchStreamersResult } from '@libs/shared';
import { Injectable } from '@nestjs/common';
import { Autocomplete } from 'apps/discord-bot/src/shared/decorators';
import { AutocompleteInteraction } from 'discord.js';

const MIN_QUERY_LENGTH = 3;

@Injectable()
export class AddDestinationAutocompleteHandler {
  constructor(private readonly rpc: RpcService) {}

  @Autocomplete('add-destination')
  async handle(interaction: AutocompleteInteraction) {
    const focused = interaction.options.getFocused(true);

    if (focused.name !== 'broadcaster') {
      return interaction.respond([]);
    }

    const query = focused.value.trim();

    if (query.length < MIN_QUERY_LENGTH) {
      return interaction.respond([]);
    }

    const res = await this.rpc.callSafe<ISearchStreamersResult, ISearchStreamersPayload>(
      RpcPatterns.discord.searchStreamers,
      { search: query },
    );

    if (!res.status) {
      return interaction.respond([]);
    }

    return interaction.respond(
      res.data.items.slice(0, 25).map(item => ({
        name: `${item.displayName} (${item.broadcasterLogin})`,
        value: item.broadcasterId,
      })),
    );
  }
}
