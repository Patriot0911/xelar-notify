# xelar-notify — Архітектурна документація

## Що це і навіщо

**xelar-notify** — платформа автоматизації сповіщень з онлайн-медіа-платформ у месенджери.
Поточна реалізація покриває пару Twitch → Discord. В найближчій перспективі — YouTube та Telegram.

Ідея: стример або адмін сервера налаштовує одного разу, що і куди відправляти, а система сама слідкує за подіями та доставляє повідомлення в реальному часі без будь-яких опитувань (polling).

---

## Монорепозиторій: чому і як

Проєкт організований як **npm workspaces monorepo** із ручною структурою (без NX/Turborepo як build-оркестратора):

```
xelar-notify/
├── apps/              # Виконувані сервіси
│   ├── api                 — головний REST API + брокер мікросервісів
│   ├── discord-bot         — Discord-мікросервіс (bot + webhook)
│   ├── webhook-receiver    — легковажний Twitch EventSub receiver
│   └── telegram-bot        — Telegram-мікросервіс (заглушка, WIP)
└── libs/              # Спільні бібліотеки
    ├── config              — ENV-валідація (Zod)
    ├── database            — TypeORM-сутності, міграції, data-source
    ├── queue               — RabbitMQ-абстракція
    ├── redis               — ioredis-клієнт
    ├── rpc                 — TCP RPC-клієнт/паттерни
    └── shared              — утиліти (крипто тощо)
```

**Переваги монорепо перед окремими репозиторіями:**
- Зміна спільної сутності (наприклад, `DiscordNotificationDestination`) атомарно розповсюджується на всі сервіси — немає версійного hell.
- Локальна розробка не потребує публікувати пакети — `@xelar/database` резолвиться локально.
- Один pipeline CI/CD, єдина версія TypeScript, єдині лінтинг-правила.

---

## Технологічний стек

| Шар | Технологія | Обґрунтування вибору |
|-----|-----------|---------------------|
| Фреймворк | **NestJS 11** | DI-контейнер, декоратори, вбудована підтримка мікросервісів (RMQ, TCP), Guards, Pipes — зменшує boilerplate |
| Мова | **TypeScript 5.7** | Типобезпека між сервісами через спільні DTO/Entity типи |
| БД | **PostgreSQL 16** | Реляційна модель, ACID-транзакції для кредитної системи |
| ORM | **TypeORM 0.3** | Міграції, декоратори сутностей, ActiveRecord-compatible з NestJS |
| Черги | **RabbitMQ 3** | Гарантована доставка (AMQP), topic exchange, per-service user isolation |
| Кеш / дедупл. | **Redis 7** | Швидкий TTL-кеш для дедуплікації webhook-подій і JWT blacklist |
| Валідація ENV | **Zod 4** | Типова валідація конфігурації на старті, не runtime |
| Контейнери | **Docker / docker-compose** | Відтворюване оточення для dev і prod |

---

## Сервіси та їх відповідальності

### `api` — серце системи

**Порти:** `3000` (HTTP REST), `3010` (TCP RPC для Discord Bot)

Відповідає за:

- **Аутентифікацію:** email + Discord OAuth 2.0 через JWT (access + refresh стратегії Passport.js).
- **Twitch-інтеграцію:** реєстрація EventSub webhooks через Twitch API, зберігання `TwitchApp` (clientId, secret, cost tracking), управління `TwitchStreamer` + `TwitchStreamerEvent`.
- **Кредитну систему:** кожен `User` має `creditsUsed`; кожна `DiscordNotificationDestination` коштує `creditCost`. Запобігає зловживанням.
- **Обробку потоку подій:** консюмить RabbitMQ-повідомлення з `webhook-receiver`, вирішує кому надіслати сповіщення, публікує в `discord.notifications`.
- **Адмін-панель:** ендпоінти управління `TwitchApp`, перегляд підписок.

**Чому один великий API, а не окремі мікросервіси для кожної функції?**
На поточному масштабі це виправдано: бізнес-логіка тісно пов'язана (user ↔ twitch ↔ notification), а транзакційна цілісність зручніша в одному процесі. При зростанні навантаження модулі готові до виділення (вони вже ізольовані через NestJS модулі).

---

### `webhook-receiver` — ізольований EventSub listener

**Порт:** `3001`  
**Ендпоінт:** `POST /twitch/:clientId/:eventId`

Навмисно **мінімальний**: перевіряє HMAC-підпис Twitch (SHA-256), дедуплікує події через Redis TTL, публікує в RabbitMQ.

**Чому він винесений окремо від `api`?**
- Twitch EventSub вимагає публічно доступного URL — розміщення окремо дозволяє тримати `api` за internal-мережею.
- Різні вимоги до масштабування: webhook receiver отримує сплески трафіку (початок стриму у 1000 стримерів одночасно), тоді як `api` — рівномірне навантаження.
- Ізоляція відповідальності: жодна бізнес-логіка сюди не потрапляє.

**Захист від дублювань:** Redis-ключ `twitch_event:{messageId}` з TTL 10 хвилин (вікно, яке Twitch гарантує для повторних доставок).

---

### `discord-bot` — Discord-мікросервіс

**Транспорт:** RabbitMQ consumer (черга `discord.notifications`) + TCP RPC клієнт на `api:3010`

Два режими роботи:
1. **Passive (notification consumer):** отримує з черги готовий payload, надсилає в Discord канал або через webhook.
2. **Active (slash commands):** обробляє `/add-destination` та інші команди Discord, для авторизації та даних звертається до `api` через TCP RPC.

**Чому RPC (TCP) для команд, а не HTTP?**
- Slash-команда має низький latency requirement — RPC через TCP в локальній мережі Docker швидший і простіший, ніж HTTP round-trip.
- NestJS `ClientProxy` (TCP) вже вбудований, не потребує додаткової маршрутизації.

---

### `telegram-bot` (WIP)

Заглушка з аналогічною структурою до `discord-bot`. Черга: `telegram.notifications`. Активується після реалізації Telegram Bot API інтеграції.

---

## Комунікація між сервісами

### Асинхронна (RabbitMQ)

**Переваги над прямими HTTP-дзвінками між сервісами:**
- `api` не знає, чи Discord Bot живий — повідомлення збережеться в черзі й буде доставлено після перезапуску.
- Легко додати новий consumer (Telegram, Slack) без змін в publisher.
- Природня back-pressure: якщо Discord Bot перевантажений — черга буфер.

**Черги та їх призначення:**

| Черга | Publisher | Consumer | Зміст |
|-------|-----------|----------|-------|
| `twitch.subscriptions` | `webhook-receiver` | `api` | EventSub webhook payload |
| `stream.events` | `webhook-receiver` | `api` | (резерв для розширення) |
| `discord.notifications` | `api` | `discord-bot` | Готовий Discord-payload для відправки |
| `telegram.notifications` | `api` | `telegram-bot` | (WIP) |

**Ізоляція користувачів RabbitMQ:** кожен сервіс має власний RabbitMQ user з мінімально необхідними правами (принцип найменших привілеїв).

### Синхронна (TCP RPC)

Використовується виключно для Discord Bot → API, де потрібна відповідь в рамках одного запиту (наприклад, перевірка автентифікації при slash-команді).

### Зовнішні API (HTTP/HTTPS)

- `api` → Twitch API: управління EventSub підписками, оновлення токенів.
- `api` → Discord API: OAuth, guild info, webhook management.
- `discord-bot` → Discord API: відправка повідомлень, реєстрація slash-команд.

---

## База даних

### Стратегія міграцій

Міграції TypeORM зберігаються в `libs/database/src/migrations/`. Для prod-оточення є окремий Docker-сервіс `migrate` (Dockerfile.migrate), який запускає `migration:run` перед стартом `api`. Це гарантує що схема завжди консистентна без ручного втручання.

### Кредитна система

Кожен `User` має `creditsUsed: number`. Кожна `DiscordNotificationDestination` зберігає `creditCost` (вартість на момент створення). Це дозволяє:
- Фіксувати вартість на момент підключення (не ретроактивний перерахунок).
- Давати знижки (partner_cost_modifier) без міграції існуючих записів.
- Перевіряти ліміт перед будь-яким додаванням нового призначення.

---

## Конфігурація та середовища

Вся конфігурація проходить через `libs/config`, де Zod-схема валідує ENV-змінні при старті. Якщо змінна відсутня або некоректна — сервіс не запуститься, а не впаде в runtime. Це fail-fast підхід.

**Feature flags у ENV:**
- `FEATURE_REGISTER_EMAIL` — вмикає/вимикає email реєстрацію.
- `FEATURE_REGISTER_DISCORD` — вмикає/вимикає Discord OAuth реєстрацію.

Це дозволяє проводити м'який rollout без деплою нового коду.

---

## Розгортання

```
docker-compose.yml (prod)
├── postgres       — PostgreSQL з healthcheck
├── redis          — Redis з healthcheck
├── rabbitmq       — кастомний образ з init-users.sh (створює vhost та users)
├── migrate        — одноразово запускає migration:run, потім завершується
├── api            — depends_on: migrate, postgres, redis, rabbitmq
├── webhook-receiver — depends_on: redis, rabbitmq
├── discord-bot    — depends_on: rabbitmq
└── telegram-bot   — (закоментовано, WIP)
```

**Multi-stage Dockerfile:** зменшує фінальний образ — build-stage містить devDependencies, production-stage копіює лише `node_modules` + `dist`.

---

## Архітектурні паттерни

| Паттерн | Де використовується |
|---------|-------------------|
| **Repository pattern** | `TwitchAppsRepository`, TypeORM repositories |
| **Service layer** | Вся бізнес-логіка в `*Service` класах, контролери — тонкі |
| **DTO + Mapper** | Вхідні дані валідуються через DTO, маппяться в Entity |
| **Guard + Strategy** | JWT guards на роутах, Passport strategies |
| **EventPattern** | Async RMQ consumers через декоратори NestJS |
| **MessagePattern** | TCP RPC handlers |
| **Dependency Injection** | NestJS IoC-контейнер, модульна система |
| **Cron jobs** | `TwitchSubscriptionsCronService` — перевірка стану підписок |

---

## Що буде далі (roadmap)

| Напрямок | Статус |
|---------|--------|
| Telegram Bot | В розробці (сервіс-заглушка готова) |
| YouTube integration | Заплановано |
| Web UI | Імовірно, окремий `apps/web` |
| Горизонтальне масштабування | Архітектура вже готова (stateless сервіси + черги) |
