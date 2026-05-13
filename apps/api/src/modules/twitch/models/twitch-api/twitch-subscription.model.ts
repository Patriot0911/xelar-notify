import { TwitchStreamerEvents } from '@libs/database';
import { ITwitchApiPaginationModel } from '../twitch-api-pagination.model';

export type TTwitchSubscriptionStatus =
 'enabled' // - The subscription is enabled.
 | 'webhook_callback_verification_pending' // — The subscription is pending verification of the specified callback URL.
 | 'webhook_callback_verification_failed' // — The specified callback URL failed verification.
 | 'notification_failures_exc eeded' // — The notification delivery failure rate was too high.
 | 'authorization_revoked' //— The authorization was revoked for one or more users specified in the Condition object.
 | 'moderator_removed' // — The moderator that authorized the subscription is no longer one of the broadcaster's moderators.
 | 'user_removed' // — One of the users specified in the Condition object was removed.
 | 'version_removed' // — The subscription to subscription type and version is no longer supported.
 | 'beta_maintenance' // — The subscription to the beta subscription type was removed due to maintenance.
 | 'websocket_disconnected' // — The client closed the connection.
 | 'websocket_failed_ping_pong' // — The client failed to respond to a ping message.
 | 'websocket_received_inbound_traffic' // — The client sent a non-pong message. Clients may only send pong messages (and only in response to a ping message).
 | 'websocket_connection_unused' // — The client failed to subscribe to events within the required time.
 | 'websocket_internal_error' // — The Twitch WebSocket server experienced an unexpected error.
 | 'websocket_network_timeout' // — The Twitch WebSocket server timed out writing the message to the client.
 | 'websocket_network_error'; // — The Twitch WebSocket server experienced a network error writing the message to the client.

export interface ITwitchGetSubscriptionsApiResponseModel {
  data: ITwitchApiSubscriptionModel[];
  total: number;
  total_cost: number;
  max_total_cost: number;
  pagination: ITwitchApiPaginationModel;
};

export interface ITwitchApiSubscriptionModel {
  id: string;
  status: TTwitchSubscriptionStatus;
  type: string;
  version: TwitchStreamerEvents;
  condition: Record<string, unknown>;
  created_at: string;
  transport: {
    method: string;
    callback: string;
  };
  cost: number;
};

export interface ITwitchApiSubscriptionNormalizedModel {
  id: string;
  status: TTwitchSubscriptionStatus;
  type: string;
  version: TwitchStreamerEvents;
  condition: Record<string, unknown>;
  createdAt: Date;
  cost: number;
};
