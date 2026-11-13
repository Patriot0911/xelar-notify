import { IPublicStreamerModel } from './public-streamer.model';
import { IPublicStreamersStatsModel } from './public-streamers-stats.model';

export interface IPublicStreamersShowcaseModel {
  streamers: IPublicStreamerModel[];
  stats: IPublicStreamersStatsModel;
  /** Length of the "recent activity" window used for ranking, in days. */
  activityWindowDays: number;
  generatedAt: string;
}
