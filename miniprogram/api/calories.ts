import { ExerciseItem, Meal } from "../../typings/models/calories";
import { post, get } from "../utils/request";


/**
 * 获取每日总结（包含摄入和消耗）
 * @param date 日期
 * @returns 
 */
export const getDailySummary = (date: string) => {
  return get(`/calories/summary/daily?date=${date}`);
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


/**
 * 创建运动
 * @param date 日期
 * @param data 运动数据
 * @returns 
 */
export const createExerciseByDate = (date: string, data: ExerciseItem[]) => {
  return post("/calories/exercises/byDate", {
    date,
    data,
  });
};


/**
 * 更新运动
 * @param date 日期
 * @param data 
 * @returns 
 */
export const updateExerciseByDate = (date: string, data: ExerciseItem[]) => {
  return post(`/calories/exercises/updateByDate`, {
    date,
    data,
  });
};


/**
 * 获取运动列表
 * @param date 日期
 * @returns 
 */
export const getExerciseByDate = (date: string) => {
  return get(`/calories/exercises/byDate?date=${date}`);
};  


/**
 * 获取每日统计
 * @param date 日期
 * @returns 
 */
export const getDailyStats = (date: string) => {
  return get(`/calories/statistics/dailyStats?date=${date}`);
};


/**
 * 获取用户统计
 * @returns 
 */
export const getUserStats = () => {
  return get(`/calories/statistics/userStats`);
};


/**
 * 获取日视图数据
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 
 */
export const getDateRangeStats = (startDate: string, endDate: string) => {
  return get(`/calories/statistics/dateRangeStats?startDate=${startDate}&endDate=${endDate}`);
};
