import { Meal } from "../../typings/models/calories";
import { post, get } from "../utils/request";


/**
 * 获取每日卡路里
 * @param date 日期
 * @returns 
 */
export const getDailyCalories = (date: string) => {
  return get(`/calories/meals/daily?date=${date}`);
};


/**
 * 添加餐食
 * @param data 
 * @returns 
 */
export const createMeal = (data: Meal) => {
  return post("/calories/meals", data);
};


/**
 * 获取餐食
 * @param id 餐食id
 * @returns 
 */
export const getMeal = (id: string) => {
  return get(`/calories/meals/detail?id=${id}`);
};

/**
 * 更新餐食
 * @param data 
 * @returns 
 */
export const updateMeal = (data: Meal) => {
  return post("/calories/meals/update", data);
};
