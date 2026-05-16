export const RpcPatterns = {
  discord: {
    authenticate:      'discord.authenticate',
    addDestination:    'discord.add-destination',
    removeDestination: 'discord.remove-destination',
    listDestinations:  'discord.list-destinations',
    getCredits:        'discord.get-credits',
  },
} as const;
