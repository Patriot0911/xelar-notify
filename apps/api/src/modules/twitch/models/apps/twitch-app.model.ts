export interface ITwitchAppShortModel {
  id: string;
  clientId: string;
  name: string;
  createdAt: Date;
};

export interface ITwitchAppEncryptOptionsModel {
  webhookSecret?: boolean;
  accessToken?: boolean;
  clientSecret?: boolean;
};
