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


/**
 * 根据餐食类型获取食物
 * @param date 日期
 * @param mealType 餐食类型
 * @returns 
 */
export const findFoodsByMealType = (date: string, mealType: string) => {
  return get(`/calories/foods/byMealType?date=${date}&mealType=${mealType}`);
};  


/**
 * 获取日历数据
 * @param startDate 开始日期 格式: YYYY-MM-DD
 * @param endDate 结束日期 格式: YYYY-MM-DD
 * @returns 
 */
export const getCalendarData = (startDate: string, endDate: string) => {
  return get(`/calories/calendar?startDate=${startDate}&endDate=${endDate}`);
};