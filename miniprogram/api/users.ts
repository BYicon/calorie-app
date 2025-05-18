import { post } from "../utils/request";

export const updateCalorieTarget = (data: {
  userId: string;
  calorieTarget: number;
}) => {
  return post("/users/calorie-target", data);
};
