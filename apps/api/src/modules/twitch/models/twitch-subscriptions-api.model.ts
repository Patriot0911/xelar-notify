import { TwitchStreamerEvents } from '@libs/database';

export interface ITwitchStreamOnlineApiModel {
  id: string;
  status: 'webhook_callback_verification_pending';
  type: TwitchStreamerEvents;
  version: string;
  condition: {
    broadcaster_user_id: string;
  };
  created_at: string;
  transport: Record<string, any>;
  cost: number;
};

export interface ITwitchEventRegistrationResponseModel {
  data: ITwitchStreamOnlineApiModel[];
  total: number;
  max_total_cost: number;
  total_cost: 1;
};
