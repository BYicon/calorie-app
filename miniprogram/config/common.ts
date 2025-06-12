import { EnumMealType } from "../enum/meal-type";
import { STATIC_FILE_URL } from "./env";

export const DEFAULT_TARGET_CALORIE = 2000;

export const DEFAULT_AVATAR = STATIC_FILE_URL + "static/images/cute.png";

/**
 * 餐食类型图标
 */
export const MEAL_TYPE_ICON = {
  [EnumMealType.BREAKFAST]: "/static/images/breakfast.png",
  [EnumMealType.LUNCH]: "/static/images/lunch.png",
  [EnumMealType.DINNER]: "/static/images/dinner.png",
  [EnumMealType.SNACK]: "/static/images/snack.png",
};


// 底部导航栏页面key列表
export const tabbarPageKeyList = [
  'record',
  'analyze',
  'profile'
]
  
// 根据参数key跳转到的页面
export enum EnumPage {
  'record' = "/pages/record/record",
  'analyze' = "/pages/analyze/analyze",
  'profile' = "/pages/profile/profile",
  'add-food' = "/pages/add-food/add-food",
  'profile-edit' = "/pages/profile-edit/profile-edit"
}