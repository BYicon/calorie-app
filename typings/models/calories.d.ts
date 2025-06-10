import { EnumMealType } from "../../miniprogram/enum/meal-type";

  interface FoodItem {
    id?: string;
    name: string;
    serving: string;
    grams: number;
    calories: number;
    caloriesPer100g: number;
  }

  interface ExerciseItem {
    id?: string;
    name: string;
    calories: number;
    notes: string;
  }

export interface Meal {
  id?: string;
  type: EnumMealType;
  label?: string;
  date: string;
  notes?: string;
  userId: number;
  foods?: FoodItem[];
  totalCalories?: number;
  icon?: string;
}

export interface ExerciseItem {
  id?: string;
  name: string;
  calories: number;
  notes: string;
}


export interface CalendarData {
  date: string;
  totalCalories: number;
}