export enum EnumMealType {
  BREAKFAST = "breakfast",
  LUNCH = "lunch",
  DINNER = "dinner",
  MORNING_SNACK = "morning_snack",
  AFTERNOON_SNACK = "afternoon_snack",
  EVENING_SNACK = "evening_snack",
}


export const EnumMealTypeLabel = {
  [EnumMealType.BREAKFAST]: "早餐",
  [EnumMealType.LUNCH]: "午餐",
  [EnumMealType.DINNER]: "晚餐",
  [EnumMealType.MORNING_SNACK]: "上午加餐",
  [EnumMealType.AFTERNOON_SNACK]: "下午加餐",
  [EnumMealType.EVENING_SNACK]: "晚上加餐",
}