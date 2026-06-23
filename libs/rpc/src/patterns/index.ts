export const RpcPatterns = {
  discord: {
    authenticate: 'discord.authenticate',
    addDestination: 'discord.add-destination',
    removeDestination: 'discord.remove-destination',
    listDestinations: 'discord.list-destinations',
    getCredits: 'discord.get-credits',
    getProfile: 'discord.get-profile',
    suspendNotification: 'discord.notifications.suspend',
    searchStreamers: 'discord.search-streamers',
  },
  bot: {
    getGuildRoles:       'bot.discord.guild-roles',
    getGuildMemberRoles: 'bot.discord.guild-member-roles',
    getGuildChannels:    'bot.discord.guild-channels',
    getGuildIds:         'bot.discord.guild-ids',
  },
  twitch: {
    getChannelInfo: 'twitch.get-channel-info',
  },
} as const;
