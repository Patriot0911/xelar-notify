# Service Dependency & Data Flow Diagram

## Залежності між сервісами

```mermaid
graph TB
    subgraph External["Зовнішні системи"]
        TW["Twitch API\n(EventSub)"]
        DC["Discord API"]
        User["Користувач\n(Browser / Discord)"]
    end

    subgraph Infrastructure["Інфраструктура"]
        PG[("PostgreSQL 16")]
        RD[("Redis 7")]
        RMQ[["RabbitMQ 3\n(AMQP)"]]
    end

    subgraph Services["Мікросервіси"]
        WR["webhook-receiver\n:3001\n(HTTP)"]
        API["api\n:3000 HTTP\n:3010 TCP RPC"]
        DB_MIG["migrate\n(one-shot)"]
        DCB["discord-bot\n(RMQ consumer)"]
        TGB["telegram-bot\n:WIP"]
    end

    %% User interactions
    User -->|"REST :3000"| API
    User -->|"slash commands"| DCB

    %% Twitch → webhook-receiver
    TW -->|"POST /twitch/:clientId/:eventId\nHMAC-SHA256 verified"| WR

    %% webhook-receiver internals
    WR -->|"dedup check / set TTL"| RD
    WR -->|"publish twitch.subscriptions"| RMQ

    %% API interactions
    API -->|"subscribe / manage\nEventSub webhooks"| TW
    API -->|"OAuth / guild / webhook info"| DC
    API <-->|"read / write"| PG
    API <-->|"JWT blacklist / cache"| RD
    API -->|"consume twitch.subscriptions"| RMQ
    API -->|"publish discord.notifications"| RMQ
    API -->|"publish telegram.notifications"| RMQ

    %% Discord Bot
    DCB -->|"consume discord.notifications"| RMQ
    DCB -->|"send messages / webhooks"| DC
    DCB <-->|"TCP RPC :3010\n(auth / data)"| API

    %% Telegram Bot (WIP)
    TGB -.->|"consume telegram.notifications\n(WIP)"| RMQ

    %% Migration
    DB_MIG -->|"migration:run (once)"| PG

    %% Startup dependencies
    API -.->|"depends_on: healthy"| PG
    API -.->|"depends_on: healthy"| RD
    API -.->|"depends_on: healthy"| RMQ
    API -.->|"depends_on: completed"| DB_MIG
    WR -.->|"depends_on: healthy"| RD
    WR -.->|"depends_on: healthy"| RMQ
    DCB -.->|"depends_on: healthy"| RMQ

    %% Styles
    classDef external fill:#d4edda,stroke:#28a745,color:#000
    classDef infra fill:#cce5ff,stroke:#004085,color:#000
    classDef service fill:#fff3cd,stroke:#856404,color:#000
    classDef wip fill:#f8d7da,stroke:#721c24,color:#000,stroke-dasharray: 5 5

    class TW,DC,User external
    class PG,RD,RMQ infra
    class WR,API,DB_MIG,DCB service
    class TGB wip
```

---

## Потік даних: Stream Online подія (end-to-end)

```mermaid
sequenceDiagram
    participant TW as Twitch API
    participant WR as webhook-receiver
    participant RD as Redis
    participant RMQ as RabbitMQ
    participant API as api
    participant PG as PostgreSQL
    participant DCB as discord-bot
    participant DC as Discord API

    TW->>WR: POST /twitch/{clientId}/{eventId}<br/>X-Twitch-Eventsub-Message-Signature
    WR->>WR: Verify HMAC-SHA256 signature
    WR->>RD: GET twitch_event:{messageId}
    RD-->>WR: null (not duplicate)
    WR->>RD: SET twitch_event:{messageId} TTL=10min
    WR->>RMQ: publish → twitch.subscriptions
    WR-->>TW: 204 No Content

    RMQ->>API: consume twitch.subscriptions
    API->>PG: find TwitchStreamerEvent by subscriptionId
    PG-->>API: event + DiscordNotificationDestinations[]
    API->>API: build notification payloads
    API->>RMQ: publish → discord.notifications (per destination)
    API->>PG: update event processing state

    RMQ->>DCB: consume discord.notifications
    DCB->>DC: POST /channels/{id}/messages (bot)<br/>OR POST {webhookUrl} (webhook)
    DC-->>DCB: 200 OK
```

---

## Потік даних: Додавання Discord-призначення через slash-команду

```mermaid
sequenceDiagram
    participant U as Користувач Discord
    participant DC as Discord API
    participant DCB as discord-bot
    participant API as api (TCP RPC :3010)
    participant PG as PostgreSQL

    U->>DC: /add-destination [params]
    DC->>DCB: Interaction event
    DCB->>API: TCP RPC → ADD_DESTINATION<br/>{userId, guildId, channelId, streamerId, event}
    API->>PG: Verify user credits < max limit
    API->>PG: Find or create TwitchStreamerEvent
    API->>PG: Create DiscordNotificationDestination
    API->>PG: Update user.creditsUsed
    PG-->>API: saved entities
    API-->>DCB: {success: true, destination}
    DCB->>DC: Reply with embed confirmation
    DC-->>U: "Сповіщення налаштовано ✓"
```

---

## Docker Compose: порядок запуску

```mermaid
graph LR
    PG["postgres\n(healthcheck)"]
    RD["redis\n(healthcheck)"]
    RMQ["rabbitmq\n(healthcheck)"]
    MIG["migrate\n(one-shot runner)"]
    API["api"]
    WR["webhook-receiver"]
    DCB["discord-bot"]
    TGB["telegram-bot\n(WIP)"]

    PG --> MIG
    MIG --> API
    PG --> API
    RD --> API
    RMQ --> API

    RD --> WR
    RMQ --> WR

    RMQ --> DCB

    RMQ -.-> TGB

    classDef wip stroke-dasharray: 4 4
    class TGB wip
```
