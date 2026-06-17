export interface IGetProfilePayload {
  discordId: string;
  discordGuildId?: string;
}

export interface IGetProfileGuildStats {
  balance: number;
  subscriptionsCount: number;
}

export interface IGetProfileResult {
  balance: number;
  subscriptionsCount: number;
  guild?: IGetProfileGuildStats;
}
