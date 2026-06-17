export interface IRemoveDestinationPayload {
  discordId: string;
  notificationId: string;
  discordGuildId?: string;
}

export interface IRemoveDestinationResult {
  success: true;
}
