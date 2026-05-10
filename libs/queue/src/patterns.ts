export const QueuePatterns = {
  discord: {
    notifications: {
      send:     'discord.notifications.send',
    },
  },
  telegram: {
    notifications: {
      send:     'telegram.notifications.send',
    },
  },
  twitch: {
    subscription: {
      verified:  'twitch.subscription.verified',
      revoked:   'twitch.subscription.revoked',
    },
    stream: {
      online:    'stream.online',
    },
  },
} as const;
