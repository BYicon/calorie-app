import { EnumMealType } from "../enum/meal-type";

export const DEFAULT_TARGET_CALORIE = 2000;

/**
 * 餐食类型图标
 */
export const MEAL_TYPE_ICON = {
  [EnumMealType.BREAKFAST]: "/static/images/breakfast.png",
  [EnumMealType.LUNCH]: "/static/images/lunch.png",
  [EnumMealType.DINNER]: "/static/images/dinner.png",
  [EnumMealType.MORNING_SNACK]: "/static/images/snack.png",
  [EnumMealType.AFTERNOON_SNACK]: "/static/images/snack.png",
  [EnumMealType.EVENING_SNACK]: "/static/images/snack.png",
};