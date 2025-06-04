export interface User {
  readonly id: number;
  username?: string;
  password?: string;
  email?: string;
  nickname?: string;
  openid?: string;
  unionid?: string;
  birthday?: string;
  gender?: number;
  avatar?: string;
  calorieTarget?: number;
}

export interface Response<T> {
    code: number;
    message: string;
    data: T;
  }
  
  