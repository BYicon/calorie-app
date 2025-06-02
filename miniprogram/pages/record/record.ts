// pages/record/record.ts
import dayjs from "dayjs";
import { login } from "../../api/auth";
import * as CaloriesApi from "../../api/calories";
import { EnumMealType, EnumMealTypeLabel } from "../../enum/meal-type";
import { queryParams } from "../../utils/util";
import { DEFAULT_TARGET_CALORIE } from "../../config/index";
import { hasLogin } from "../../utils/helper";
import { CalendarData, FoodItem, Meal } from "../../../typings/models/calories";
import { MEAL_TYPE_ICON } from "../../config/common";

const app = getApp<IAppOption>();

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const currentDate = today.getDate();

let calendarData = [] as CalendarData[];

Page({
  data: {
    today: today,
    selectedDate: today.getTime(),
    currentDateText: dayjs(today).format("YYYY-MM-DD"),
    currentMonth: dayjs(today).format("YYYY-MM"),
    calorieTarget: DEFAULT_TARGET_CALORIE,
    totalCalories: 0,
    showCalendar: false,
    mealList: [
      {
        type: EnumMealType.BREAKFAST,
        label: EnumMealTypeLabel[EnumMealType.BREAKFAST],
        totalCalories: 0,
        foods: [],
      },
      {
        type: EnumMealType.LUNCH,
        label: EnumMealTypeLabel[EnumMealType.LUNCH],
        totalCalories: 0,
        foods: [],
      },
      {
        type: EnumMealType.DINNER,
        label: EnumMealTypeLabel[EnumMealType.DINNER],
        totalCalories: 0,
        foods: [],
      },
      {
        type: EnumMealType.MORNING_SNACK,
        label: EnumMealTypeLabel[EnumMealType.MORNING_SNACK],
        totalCalories: 0,
        foods: [],
      },
      {
        type: EnumMealType.AFTERNOON_SNACK,
        label: EnumMealTypeLabel[EnumMealType.AFTERNOON_SNACK],
        totalCalories: 0,
        foods: [],
      },
      {
        type: EnumMealType.EVENING_SNACK,
        label: EnumMealTypeLabel[EnumMealType.EVENING_SNACK],
        totalCalories: 0,
        foods: [],
      },
    ] as Partial<Meal>[],
    /** 日历 */
    minDate: new Date('2025/01/01').getTime(),
    maxDate: Date.now(),
    formatter(day: any) {
      console.log("formatter day 🚀🚀🚀", day);
      const _year = day.date.getFullYear();
      const _month = day.date.getMonth();
      const _date = day.date.getDate();
      const _dateText = dayjs(day.date).format("YYYY-MM-DD");
      const _calendarData = calendarData.find((item: any) => item.date === _dateText);
      if(_calendarData) {
        day.bottomInfo = _calendarData.totalCalories;
      }
      // 如果是本月的今天则显示今天
      if (_year === currentYear &&  _month === currentMonth && _date === currentDate) {
        day.text = "今天";
      }
      return day;
    },
  },

  openCalendar() {
    const startDate = dayjs(this.data.minDate).format("YYYY-MM-DD");
    const endDate = dayjs(this.data.maxDate).format("YYYY-MM-DD");
    CaloriesApi.getCalendarData(startDate, endDate).then((res) => {
      console.log("openCalendar res 🚀🚀🚀", res);
      calendarData = res.data;
      console.log("openCalendar calendarData 🚀🚀🚀", calendarData);
      
      this.setData({
        showCalendar: true,
      });
    });

  },

  onCloseCalendar() {
    this.setData({
      showCalendar: false,
    });
  },

  onSelectDate(e: any) {
    const date = new Date(e.detail);
    this.setData({
      selectedDate: date.getTime(),
      currentDateText: dayjs(date).format("YYYY-MM-DD"),
      currentMonth: dayjs(date).format("YYYY-MM"),
      showCalendar: false,
    }, () => {
      this.getDailyCalories();
    });
  },

  getDailyCalories() {
    CaloriesApi.getDailyCalories(
      dayjs(this.data.selectedDate).format("YYYY-MM-DD")
    ).then((res) => {
      const resData = res.data;
      const mealList: Partial<Meal>[] = [];
      Object.values(EnumMealType).forEach((mealType: string) => {
        if(resData[mealType]) {
          const foods = resData[mealType].foods.map((food: FoodItem) => {
            return {
              ...food,
              servingText: food.grams + "g" || food.serving,
            };
          });
          mealList.push({
            ...resData[mealType],
            type: mealType,
            label: EnumMealTypeLabel[mealType as EnumMealType],
            foods,
            icon: MEAL_TYPE_ICON[mealType as EnumMealType],
          });
        } else {
          mealList.push({
            type: mealType as EnumMealType,
            label: EnumMealTypeLabel[mealType as EnumMealType],
            totalCalories: 0,
            foods: [],
            icon: MEAL_TYPE_ICON[mealType as EnumMealType],
          });
        }
      });
      const totalCalories = mealList.reduce((sum, meal) => sum + (meal.totalCalories as number), 0);
      console.log("getDailyCalories totalCalories 🚀🚀🚀", totalCalories);
      console.log("getDailyCalories mealList 🚀🚀🚀", mealList);
      this.setData({
        totalCalories,
        mealList,
      });
    });
  },

  // 将minDate设置为上个月的第一天，将maxDate设置为上个月的最后一天
  prevDayMonth() {},

  // 将minDate设置为下个月的第一天，将maxDate设置为下个月的最后一天
  nextDayMonth() {},

  // 判断是否可以切换到下个月
  disableNextMonth() {
    const currentMonth = this.data.currentMonth;
    const year = parseInt(currentMonth.split("-")[0]);
    const month = parseInt(currentMonth.split("-")[1]);
    const nextMonthFirstDay = new Date(year, month, 1);
    return nextMonthFirstDay > new Date();
  },

  // 根据日期加载饮食数据
  loadMealDataByDate() {
    this.getDailyCalories();
  },

  // 判断是否为今天
  isToday(date: Date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  },

  // 添加食物
  addFood(e: any) {
    const mealType = e.currentTarget.dataset.type;
    const mealId = e.currentTarget.dataset.id;
    const urlParams = {
      id: mealId,
      type: mealType,
      date: dayjs(this.data.selectedDate).format("YYYY-MM-DD"),
    };
    wx.navigateTo({
      url: "/pages/add-food/add-food?" + queryParams(urlParams),
    });
  },

  // 更新餐饮类别中的食物
  updateMealWithFood(mealType: string, food: any) {
    // 使用类型断言，处理动态属性访问
    const data = this.data as any;
    const meal = data[mealType];
    const newFoods = [...meal.foods, food];

    // 计算新的总卡路里
    const newTotalCalories = newFoods.reduce(
      (sum, food) => sum + food.calories,
      0
    );

    // 更新数据
    this.setData({
      [`${mealType}.foods`]: newFoods,
      [`${mealType}.totalCalories`]: newTotalCalories,
    });

    // 更新总卡路里
    this.updateTotalCalories();
  },

  // 更新总卡路里
  updateTotalCalories() {
    const { mealList } = this.data;
    const total = mealList.reduce((sum, meal: Partial<Meal>) => sum + (meal.totalCalories as number), 0);

    this.setData({
      totalCalories: total,
    });
  },

  // 这个方法将在从搜索页面返回时调用，用于更新食物列表
  onShow() {
    if (hasLogin()) {
      this.getDailyCalories();
    }
  },

  onLoad() {
    login().then((userInfo) => {
      console.log("onLoad userInfo 🚀🚀🚀", userInfo);
      this.setData({
        calorieTarget: userInfo.calorieTarget,
      });
      this.getDailyCalories();
    });
  },
});
