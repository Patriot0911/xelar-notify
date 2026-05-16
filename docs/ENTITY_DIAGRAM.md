# Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        uuid id PK
        string displayName
        string email
        string discordId
        string password
        string refreshToken
        string discordAccessToken
        string discordRefreshToken
        float creditsUsed
        timestamp createdAt
        timestamp updatedAt
    }

    TWITCH_STREAMER {
        uuid id PK
        string broadcasterId
        string twitchLogin
        string displayName
        timestamp createdAt
        timestamp updatedAt
    }

    TWITCH_APP {
        uuid id PK
        string name
        string clientId
        string clientSecret
        string webhookSecret
        string accessToken
        int currentCost
        int maxCost
        enum status
        timestamp createdAt
        timestamp updatedAt
    }

    TWITCH_STREAMER_EVENT {
        uuid id PK
        uuid streamerId FK
        uuid twitchAppId FK
        enum event
        enum eventStatus
        string subscriptionId
        timestamp createdAt
        timestamp updatedAt
    }

    DISCORD_NOTIFICATION_DESTINATION {
        uuid id PK
        uuid streamerEventId FK
        uuid creditOwnerId FK
        enum type
        string channelId
        string guildId
        string webhookUrl
        json messagePayload
        float creditCost
        timestamp createdAt
        timestamp updatedAt
    }

    USER ||--o| TWITCH_STREAMER : "owns"
    USER ||--o{ DISCORD_NOTIFICATION_DESTINATION : "creditOwner"

    TWITCH_STREAMER ||--o{ TWITCH_STREAMER_EVENT : "has"
    TWITCH_APP ||--o{ TWITCH_STREAMER_EVENT : "manages"

    TWITCH_STREAMER_EVENT ||--o{ DISCORD_NOTIFICATION_DESTINATION : "triggers"
```

---

## Enum-значення

### `TwitchApp.status`
| Значення | Опис |
|---------|------|
| `ACTIVE` | Додаток активний, приймає підписки |
| `INACTIVE` | Виведений з обігу |

### `TwitchStreamerEvent.event`
| Значення | Twitch EventSub тип |
|---------|-------------------|
| `STREAM_ONLINE` | `stream.online` |
| `STREAM_OFFLINE` | `stream.offline` |
| `CHANNEL_UPDATE` | `channel.update` |
| `CHANNEL_RAID` | `channel.raid` |
| `CHANNEL_SUBSCRIBE` | `channel.subscribe` |
| `CHANNEL_CHEER` | `channel.cheer` |

### `TwitchStreamerEvent.eventStatus`
| Значення | Опис |
|---------|------|
| `PENDING` | Підписка зареєстрована, очікує верифікації |
| `VERIFIED` | Twitch підтвердив підписку (webhook challenge пройдено) |
| `REVOKED` | Twitch скасував підписку (токен прострочений / app змінено) |

### `DiscordNotificationDestination.type`
| Значення | Механізм доставки |
|---------|-----------------|
| `DISCORD_BOT` | Відправка через Discord Bot в канал (`channelId` + `guildId`) |
| `DISCORD_WEBHOOK` | Відправка через Discord Incoming Webhook (`webhookUrl`) |
