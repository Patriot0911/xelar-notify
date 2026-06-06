export interface IRemoveDestinationPayload {
  discordId: string;
  notificationId: string;
  guildId?: string;
}

export interface IRemoveDestinationResult {
  success: true;
}
