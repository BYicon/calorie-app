// pages/record/record.ts
import dayjs from "dayjs";
import * as CaloriesApi from "../../api/calories";
import { EnumMealType, EnumMealTypeLabel } from "../../enum/meal-type";
import { getMonthFirstAndLastDay, queryParams, formatLocaleDate } from "../../shared/util";
import { DEFAULT_TARGET_CALORIE } from "../../config/index";
import { hasLogin } from "../../shared/helper";
import { CalendarData, FoodItem, Meal } from "../../../typings/models/calories";
import { MEAL_TYPE_ICON } from "../../config/common";
import { EnumStorageKey } from "../../enum/index";

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const currentDate = today.getDate();
const { firstDay, lastDay } = getMonthFirstAndLastDay(today);

let calendarData = [] as CalendarData[];
// 添加月份数据缓存
let monthDataCache = new Map<string, CalendarData[]>();
// 防抖计时器
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEFAULT_MEAL_ORDER = [
  EnumMealType.BREAKFAST,
  EnumMealType.LUNCH,
  EnumMealType.DINNER,
  EnumMealType.SNACK,
];
const LUNCH_PRIORITY_MEAL_ORDER = [
  EnumMealType.LUNCH,
  EnumMealType.DINNER,
  EnumMealType.BREAKFAST,
  EnumMealType.SNACK,
];
const DINNER_PRIORITY_MEAL_ORDER = [
  EnumMealType.DINNER,
  EnumMealType.BREAKFAST,
  EnumMealType.LUNCH,
  EnumMealType.SNACK,
];

const isTodaySelected = (timestamp: number) => dayjs(timestamp).isSame(dayjs(), "day");

const getMealDisplayOrder = (timestamp: number): EnumMealType[] => {
  if (!isTodaySelected(timestamp)) {
    return DEFAULT_MEAL_ORDER;
  }

  const currentHour = new Date().getHours();
  if (currentHour < 11) {
    return DEFAULT_MEAL_ORDER;
  }

  if (currentHour < 16) {
    return LUNCH_PRIORITY_MEAL_ORDER;
  }

  return DINNER_PRIORITY_MEAL_ORDER;
};

const createEmptyMealItem = (mealType: EnumMealType): Partial<Meal> => ({
  type: mealType,
  label: EnumMealTypeLabel[mealType],
  totalCalories: 0,
  foods: [],
  icon: MEAL_TYPE_ICON[mealType],
});

const buildMealList = (timestamp: number, mealsData?: Record<string, any>): Partial<Meal>[] => {
  return getMealDisplayOrder(timestamp).map((mealType) => {
    const currentMeal = mealsData?.[mealType];
    if (!currentMeal) {
      return createEmptyMealItem(mealType);
    }

    const foods = (currentMeal.foods || []).map((food: FoodItem) => ({
      ...food,
      servingText: food.grams ? `${food.grams}g` : food.serving,
    }));

    return {
      ...currentMeal,
      type: mealType,
      label: EnumMealTypeLabel[mealType],
      foods,
      icon: MEAL_TYPE_ICON[mealType],
    };
  });
};

/**
 * 创建日历格式化函数
 * @returns 
 */
const createFormatter = () => {
  const formatter = function(day: any) {
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
  }
  return formatter;
}

Page({
  data: {
    today: today,
    selectedDate: today.getTime(), // timestamp
    currentDateText: formatLocaleDate(today), // 当前日期文本
    currentMonthText: dayjs(today).format("YYYY年MM月"), // 当前月份文本
    calorieTarget: DEFAULT_TARGET_CALORIE,
    totalCalories: 0,
    totalExerciseCalories: 0,
    showCalendar: false,
    // 添加加载状态
    isLoadingCalendar: false,
    isPageLoading: true,
    // 添加 Math 对象供模板使用
    Math: Math,
    skeletonMealList: [1, 2, 3, 4],
    skeletonFoodList: [1, 2],
    exerciseList: [] as any[],
    mealList: buildMealList(today.getTime()),
    /** 日历 */
    minDate: firstDay, // timestamp
    maxDate: lastDay, // timestamp
    formatter: createFormatter(),
  },

  /**
   * 根据日期范围获取日历数据（带缓存）
   * @param startDate 开始日期 timestamp
   * @param endDate 结束日期 timestamp
   */
  getCalendarData(startDate: number, endDate: number) {
    return new Promise((resolve, reject) => {
      const startDateStr = dayjs(startDate).format('YYYY-MM-DD');
      const endDateStr = dayjs(endDate).format('YYYY-MM-DD');
      const cacheKey = `${startDateStr}_${endDateStr}`;
      
      // 检查缓存
      if (monthDataCache.has(cacheKey)) {
        calendarData = monthDataCache.get(cacheKey)!;
        resolve(calendarData);
        return;
      }

      CaloriesApi.getCalendarData(startDateStr, endDateStr).then((res) => {
        calendarData = res.data;
        // 存入缓存
        monthDataCache.set(cacheKey, calendarData);
        resolve(calendarData);
      }).catch(reject);
    });
  },

  /**
   * 防抖加载日历数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param delay 延迟时间（毫秒）
   */
  debounceLoadCalendarData(startDate: number, endDate: number, delay: number = 300) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      if (!this.data.isLoadingCalendar) {
        this.setData({ isLoadingCalendar: true });
        this.getCalendarData(startDate, endDate).then((calendarData) => {
          const _formatter = createFormatter();
          if (this.data.showCalendar) {
            this.setData({ calendarData, formatter: _formatter });
          }
        }).finally(() => {
          this.setData({ isLoadingCalendar: false });
        });
      }
    }, delay);
  },

  /**
   * 打开日历
   */
  openCalendar() {
    this.getCalendarData(this.data.minDate, this.data.maxDate).then((calendarData) => {
      const _formatter = createFormatter();
      this.setData({
        calendarData,
        showCalendar: true,
        formatter: _formatter,
      });
    });
  },
  onCloseCalendar() {
    this.setData({
      showCalendar: false,
    });
  },

  /**
   * 上个月
   */
  prevDayMonth() {
    const { minDate } = this.data;
    const prevMonth = dayjs(minDate).subtract(1, 'month').toDate();
    const { firstDay, lastDay } = getMonthFirstAndLastDay(prevMonth);
    const _currentMonthText = dayjs(prevMonth).format('YYYY年MM月');
    this.setData({
      minDate: firstDay,
      maxDate: lastDay,
      currentMonthText: _currentMonthText,
    });
    // 使用防抖机制延迟加载数据
    this.debounceLoadCalendarData(firstDay, lastDay);
  },

  /**
   * 下个月
   */
  nextDayMonth() {
    const { maxDate } = this.data;
    const nextMonth = dayjs(maxDate).add(1, 'month').toDate();
    const { firstDay, lastDay } = getMonthFirstAndLastDay(nextMonth);
    const _currentMonthText = dayjs(nextMonth).format('YYYY年MM月');
    this.setData({
      minDate: firstDay,
      maxDate: lastDay,
      currentMonthText: _currentMonthText,
    });
    // 使用防抖机制延迟加载数据
    this.debounceLoadCalendarData(firstDay, lastDay);
  },

  /**
   * 选择日期
   */
  onSelectDate(e: any) {
    this.setData({
      selectedDate: e.detail.getTime(),
      showCalendar: false,
      currentDateText: formatLocaleDate(new Date(e.detail.getTime())),
    }, () => {
      this.getDailySummary();
    });
  },

  /**
   * 获取每日饮食数据
   */
  getDailySummary() {
    this.setData({
      isPageLoading: true,
    });

    CaloriesApi.getDailySummary(
      dayjs(this.data.selectedDate).format("YYYY-MM-DD")
    ).then((res) => {
      const resData = res.data;
      const mealList = buildMealList(this.data.selectedDate, resData.meals);
      const totalCalories = mealList.reduce((sum, meal) => sum + (meal.totalCalories as number), 0);

      const exerciseData = resData.exercises;
      const totalExerciseCalories = exerciseData.totalBurnedCalories;
      const exerciseList = exerciseData.exercises.map((exercise: any) => {
        return {
          ...exercise,
          note: exercise.notes,
        };
      });

      this.setData({
        totalCalories,
        mealList,
        exerciseList,
        totalExerciseCalories,
      });
    }).catch(() => {
      this.setData({
        totalCalories: 0,
        totalExerciseCalories: 0,
        mealList: buildMealList(this.data.selectedDate),
        exerciseList: [],
      });
    }).finally(() => {
      this.setData({
        isPageLoading: false,
      });
    });
  },

  /**
   * 添加食物
   */
  addFood(e: any) {
    const { type, id } = e.currentTarget.dataset;
    const urlParams = {
      id,
      type,
      date: dayjs(this.data.selectedDate).format("YYYY-MM-DD"),
    };
    wx.navigateTo({
      url: "/pages/add-food/add-food?" + queryParams(urlParams),
    });
  },

  /**
   * 添加运动
   */
  addExercise() {
    const urlParams = {
      date: dayjs(this.data.selectedDate).format("YYYY-MM-DD"),
    };
    wx.navigateTo({
      url: "/pages/add-exercise/add-exercise?" + queryParams(urlParams),
    });
  },

  onBack() {
    wx.navigateBack();
  },

  onShow() {
    const userInfo = wx.getStorageSync(EnumStorageKey.USER_INFO) || {};
    this.setData({
      calorieTarget: userInfo.calorieTarget || DEFAULT_TARGET_CALORIE,
    });

    if (hasLogin()) {
      monthDataCache.clear();
      this.getDailySummary();
    } else {
      // 即使未登录也刷新运动数据（本地存储）
      this.getDailySummary();
    }
  },

  onLoad() {
    const userInfo = wx.getStorageSync(EnumStorageKey.USER_INFO);
    this.setData({
      calorieTarget: userInfo.calorieTarget || DEFAULT_TARGET_CALORIE,
    });
  },

  /**
   * 页面卸载时清理资源
   */
  onUnload() {
    // 清理防抖计时器
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    // 限制缓存大小，只保留最近10个月的数据
    if (monthDataCache.size > 10) {
      const keys = Array.from(monthDataCache.keys());
      const oldestKeys = keys.slice(0, keys.length - 10);
      oldestKeys.forEach(key => monthDataCache.delete(key));
    }
  },
  onShareAppMessage() {
    return {
      path: 'pages/index/index',
      title: '快来记录每日热量吧～',
      imagePath: 'https://wx.qlogo.cn/mmhead/Xmnun9Io49RB3BicJVsFAch4V5aqRkuZbDfffIR6EBia1X5ptBt9AS5P4bYpn5WFrVqkHhzd41M9E/0',
    }
  }
});
