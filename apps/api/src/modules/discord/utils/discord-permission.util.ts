export const hasDiscordPermission = (permissions: string, flag: string): boolean => {
  const perms = BigInt(permissions);
  const required = BigInt(flag);
  return (perms & required) === required;
};
