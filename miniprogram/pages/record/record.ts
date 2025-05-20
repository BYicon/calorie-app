// pages/record/record.ts
import { login } from "../../api/login";
import { getDailyCalories } from "../../api/calories";
import { EnumStorageKey } from "../../enum/common";
import dayjs from "dayjs";
import { EnumMealType, EnumMealTypeLabel } from "../../enum/meal-type";
import { Meal } from "../../../typings/models/calories";
import { queryParams } from "../../utils/util";

const app = getApp<IAppOption>();

Page({
  data: {
    active: 0,
    todayDate: new Date() as Date,
    selectedDate: new Date().getTime(),
    currentDateText: "",
    currentMonth: "",
    calorieGoal: 1200,
    totalCalories: 0,
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
    minDate: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).getTime(),
    maxDate: Date.now(),
    formatter(day: any) {
      const month = day.date.getMonth() + 1;
      const date = day.date.getDate();

      if (month === 5) {
        if (date === 1) {
          day.bottomInfo = "200";
        } else if (date === 4) {
          day.bottomInfo = "200";
        } else if (date === new Date().getDate()) {
          day.text = "今天";
        }
      }
      return day;
    },
  },

  // 切换tab
  onChange(e: any) {
    this.setData({
      active: e.detail.index,
    });
  },

  initDate() {
    this.setData({
      selectedDate: Date.now(),
      currentDateText: dayjs(this.data.todayDate).format("YYYY-MM-DD"),
      currentMonth: dayjs(this.data.todayDate).format("YYYY-MM"),
    });
    this.getDailyCalories();
  },

  onSelectDate(e: any) {
    this.setData({
      selectedDate: new Date(e.detail).getTime(),
    });
  },

  getDailyCalories() {
    const userInfo = wx.getStorageSync(EnumStorageKey.USER_INFO);
    getDailyCalories(
      userInfo.id,
      dayjs(this.data.selectedDate).format("YYYY-MM-DD")
    ).then((res) => {
      const resData = res.data;
      const mealList: Partial<Meal>[] = []; // TODO: optimize type
      Object.values(EnumMealType).forEach((mealType: string) => {
        if(resData[mealType]) {
          mealList.push({
            ...resData[mealType],
            type: mealType,
            label: EnumMealTypeLabel[mealType as EnumMealType],
          });
        } else {
          mealList.push({
            type: mealType as EnumMealType,
            label: EnumMealTypeLabel[mealType as EnumMealType],
            totalCalories: 0,
            foods: [],
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
    
    const urlParams = {
      type: mealType,
      date: dayjs(this.data.selectedDate).format("YYYY-MM-DD"),
      id: e.currentTarget.dataset.id,
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
    this.getDailyCalories();
  },

  onLoad() {
    login();
    this.initDate();
  },
});
