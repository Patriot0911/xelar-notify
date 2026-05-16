import { IGenericRpcResponse } from './rpc-result.model';

export interface IAddDestinationPayload {
  discordId: string;
  guildId: string;
  channelId: string;
  broadcasterId: string;
};

export interface IAddDestinationResult {
  channelId: string;
  cost: number;
  eventType: string;
  // remainingCredits: number;
};
