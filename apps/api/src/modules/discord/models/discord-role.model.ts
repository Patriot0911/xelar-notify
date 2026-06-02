export interface IDiscordApiRoleModel {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
};

export interface IDiscordRoleModel {
  id: string;
  name: string;
  color: number;
  position: number;
  mentionable: boolean;
};
