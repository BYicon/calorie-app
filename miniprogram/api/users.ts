import { post } from "../utils/request";

export const updateCalorieTarget = (data: {
  calorieTarget: number;
}) => {
  return post("/users/calorie-target", data);
};


export const updateUserInfo = (data: {
  userId: string;
  nickname: string;
  birthday?: string;
  gender?: number;
  avatar?: string;
}) => {
  return post("/users/update", data);
};
