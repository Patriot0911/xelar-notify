export const RpcPatterns = {
  discord: {
    authenticate: 'discord.authenticate',
    addDestination: 'discord.add-destination',
    removeDestination: 'discord.remove-destination',
    listDestinations: 'discord.list-destinations',
    getCredits: 'discord.get-credits',
    suspendNotification: 'discord.notifications.suspend',
    searchStreamers: 'discord.search-streamers',
  },
  bot: {
    getGuildRoles:       'bot.discord.guild-roles',
    getGuildMemberRoles: 'bot.discord.guild-member-roles',
  },
} as const;
