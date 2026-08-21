<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Xelar Notify

Notification automation platform that turns Twitch streamer events into real-time Discord alerts (and outgoing webhooks), without polling. An operator configures, once, which Twitch events should notify which Discord channel or webhook; the system then reacts end to end as those events happen on Twitch.

## Business overview

- Twitch push events (currently stream online, with offline, update, raid, subscribe and cheer modeled in the domain) are received via EventSub and verified.
- Each event is matched against the destinations configured for that streamer, applying optional game filters.
- Matching notifications are delivered as Discord bot messages, Discord incoming webhooks, or arbitrary outgoing webhooks, using templated, interpolated message content.
- Every delivery attempt is logged for auditing, and webhooks that fail repeatedly are automatically suspended to avoid wasted or abusive traffic.
- A REST admin API backs authentication (including Discord OAuth), Twitch app and streamer management, and destination configuration, all persisted to PostgreSQL.

## Architecture

The system is deliberately split into small, independently deployable services connected by a message broker, rather than a single monolith:

- **Service decomposition by responsibility.** Four independent NestJS applications: `api` (REST admin surface and auth), `webhook-receiver` (Twitch EventSub ingestion), `notification-worker` (event matching, templating and dispatch), and `discord-bot` (Discord delivery and slash commands). Each service can be scaled, deployed and reasoned about independently.
- **Asynchronous decoupling via RabbitMQ.** Services communicate through typed queues and routing patterns rather than direct calls, so a slow or failing consumer cannot block the producer, and each stage of the pipeline can be retried or scaled on its own.
- **Least-privilege messaging.** Each service authenticates to RabbitMQ with its own dedicated credentials, so a compromised or misbehaving service is limited to the queues it actually needs.
- **Synchronous RPC only where it belongs.** The `discord-bot` talks to `api` over a typed TCP transport for operations that need an immediate response (for example, slash commands), keeping the rest of the system fully asynchronous.
- **Shared libraries for cross-cutting concerns.** Database entities and migrations, queue access, Redis access, RPC exception handling and configuration are factored into shared libs consumed by every app, avoiding duplicated infrastructure code.
- **Fail-fast configuration.** Environment configuration is validated against a schema at boot, so misconfiguration is caught immediately instead of surfacing as a runtime failure later.
- **Idempotent ingestion.** Incoming Twitch events are deduplicated in Redis before being queued, protecting the rest of the pipeline from duplicate deliveries.
- **Migrations as a first-class deployment step.** A dedicated migration step runs to completion before the API starts, keeping schema changes explicit, ordered and auditable rather than applied implicitly at runtime.

## Data flow

1. Twitch sends an event to `webhook-receiver`, which verifies the signature, deduplicates it, and publishes it to RabbitMQ.
2. `notification-worker` consumes the event, resolves the active notification destinations for that streamer, applies filters and templating, writes a delivery log entry, and publishes per-destination payloads.
3. `discord-bot` consumes Discord-bound payloads and delivers them; direct webhook destinations are called by `notification-worker` itself.
4. `discord-bot` uses a synchronous RPC call to `api` for operations that require live data, such as slash commands.

## Tech stack

NestJS, TypeScript, PostgreSQL with TypeORM, RabbitMQ, Redis, Zod, Docker.

## Getting started

```bash
npm install
npm run start:dev:docker   # starts postgres, redis and rabbitmq
npm run migration:run
npm run start:dev          # runs all four apps concurrently
```

Individual apps can also be run separately, for example `npm run start:dev:api`, `npm run start:dev:webhook-receiver`, `npm run start:dev:notification-worker`, `npm run start:dev:discord-bot`. See `.env.example` for the full list of required environment variables.

## Tests

```bash
npm run test
npm run test:e2e
npm run test:cov
```
