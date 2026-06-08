export enum DiscordPermissionFlag {
  KICK_MEMBERS     = '2',
  BAN_MEMBERS      = '4',
  ADMINISTRATOR    = '8',
  MANAGE_CHANNELS  = '16',
  MANAGE_GUILD     = '32',
  MANAGE_MESSAGES  = '8192',
  MANAGE_ROLES     = '268435456',
  MANAGE_WEBHOOKS  = '536870912',
  MODERATE_MEMBERS = '1099511627776',
}

export interface IManagerPermissionOption {
  value: string;
  label: string;
}

export const MANAGER_PERMISSION_OPTIONS: IManagerPermissionOption[] = [
  { value: DiscordPermissionFlag.MANAGE_GUILD,     label: 'Manage Server' },
  { value: DiscordPermissionFlag.MANAGE_ROLES,     label: 'Manage Roles' },
  { value: DiscordPermissionFlag.MANAGE_CHANNELS,  label: 'Manage Channels' },
  { value: DiscordPermissionFlag.MANAGE_MESSAGES,  label: 'Manage Messages' },
  { value: DiscordPermissionFlag.MANAGE_WEBHOOKS,  label: 'Manage Webhooks' },
  { value: DiscordPermissionFlag.MODERATE_MEMBERS, label: 'Moderate Members' },
  { value: DiscordPermissionFlag.KICK_MEMBERS,     label: 'Kick Members' },
  { value: DiscordPermissionFlag.BAN_MEMBERS,      label: 'Ban Members' },
];
