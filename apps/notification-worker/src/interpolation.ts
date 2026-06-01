import type { ITwitchStreamOnlineEvent } from '@libs/queue';

export function buildStreamOnlineVars(event: ITwitchStreamOnlineEvent): Record<string, string> {
  return {
    streamerName:  event.broadcaster_user_name,
    streamerLogin: event.broadcaster_user_login,
    streamerId:    event.broadcaster_user_id,
    streamType:    event.type,
    startedAt:     event.started_at,
  };
}

export function interpolatePayload(payload: unknown, vars: Record<string, string>): unknown {
  if (payload == null) return payload;
  const interpolated = JSON.stringify(payload).replace(
    /\$\{(\w+)\}/g,
    (_, key: string) => vars[key] ?? `\${${key}}`,
  );
  return JSON.parse(interpolated);
}
