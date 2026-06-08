export const hasDiscordPermission = (permissions: string, flag: string): boolean => {
  const required = BigInt(flag);
  return (BigInt(permissions) & required) === required;
};
