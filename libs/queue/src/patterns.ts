export const QueuePatterns = {
  twitch: {
    subscriptions: {
      verified: 'twitch.subscriptions.verified',
      revoked: 'twitch.subscriptions.revoked',
    },
    events: {
      stream: {
        online: 'twitch.events.stream.online',
      },
    },
  },
  discord: {
    notifications: {
      send: 'discord.notifications.send',
    },
  },
} as const;
