interface IRegisterBaseModel {
  password: string;
};

export interface IRegisterByEmailModel extends IRegisterBaseModel {
  email: string;
  displayName: string;
};
