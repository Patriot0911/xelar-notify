export interface IListDestinationsPayload {
  discordId: string;
  discordGuildId?: string;
}

export interface IDestinationItem {
  id: string;
  streamerLogin: string;
  streamerDisplayName: string;
  eventType: string;
  channelId: string;
  costType: string;
  isOwn: boolean;
}

export interface IListDestinationsResult {
  items: IDestinationItem[];
}
