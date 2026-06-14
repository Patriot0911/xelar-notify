export const RpcPatterns = {
  discord: {
    authenticate: 'discord.authenticate',
    addDestination: 'discord.add-destination',
    removeDestination: 'discord.remove-destination',
    listDestinations: 'discord.list-destinations',
    getCredits: 'discord.get-credits',
    suspendNotification: 'discord.notifications.suspend',
  },
  bot: {
    getGuildRoles:       'bot.discord.guild-roles',
    getGuildMemberRoles: 'bot.discord.guild-member-roles',
  },
} as const;
