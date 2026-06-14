export interface IAddDestinationPayload {
  discordId: string;
  guildId: string;
  channelId: string;
  broadcasterId: string;
  eventType?: string;
  payload?: Record<string, unknown>;
};

export interface IAddDestinationResult {
  channelId: string;
  cost: number;
  eventType: string;
  // remainingCredits: number;
};
