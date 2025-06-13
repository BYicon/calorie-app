import { get, post } from "../shared/request";

export const updateCalorieTarget = (data: {
  calorieTarget: number;
}) => {
  return post("/users/calorie-target", data);
};


export const getUserInfo = () => {
  return get("/users/detail");
};


export const updateUserInfo = (data: {
  userId: string;
  nickname: string;
  birthday?: string;
  gender?: number;
  avatar?: string;
  calorieTarget?: number;
}) => {
  return post("/users/update", data);
};
