export const QueuePatterns = {
  twitch: {
    subscriptions: {
      verified: 'twitch.subscriptions.verified',
      revoked: 'twitch.subscriptions.revoked',
    },
    events: {
      online: 'stream.events.online',
    },
  },
  discord: {
    notifications: {
      send: 'discord.notifications.send',
    },
  },
} as const;
