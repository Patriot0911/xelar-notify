import { TTwitchSubscriptionStatus } from './twitch-api/twitch-subscription.model';

export interface IGetTwitchSubscriptionParamsModel {
  after?: string;
  subscriptionIds?: string[];
  userIds?: string[];
  statuses?: TTwitchSubscriptionStatus[],
};
