import type { ITwitchApiPaginationModel } from '../twitch-api-pagination.model';

export interface ITwitchApiCategoryModel {
  id: string;
  name: string;
  box_art_url: string;
};

export interface ITwitchApiCategoryNormalizedModel {
  id: string;
  name: string;
  boxArtUrl: string;
};

export interface ITwitchCategoriesApiResponseModel {
  data: ITwitchApiCategoryModel[];
  pagination: ITwitchApiPaginationModel;
};

export interface ITwitchGamesApiResponseModel {
  data: ITwitchApiCategoryModel[];
};
