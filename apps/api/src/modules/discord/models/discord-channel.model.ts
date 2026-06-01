export interface IDiscordApiChannelModel {
  id: string;
  type: number;
  name: string;
  position: number;
  parent_id: string | null;
  topic?: string | null;
}

export interface IDiscordChannelModel {
  id: string;
  name: string;
  position: number;
  parentId: string | null;
  topic: string | null;
}

/** Discord channel types we expose */
export const TEXT_CHANNEL_TYPES = new Set([
  0,  // GUILD_TEXT
  5,  // GUILD_ANNOUNCEMENT
]);
