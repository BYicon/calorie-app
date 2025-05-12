// pages/record/record.ts
import { login } from "../../api/login";

Page({
  data: {
    currentDate: '',
    currentDateObj: new Date() as Date,
    calorieGoal: 1200,
    totalCalories: 750,
    breakfast: {
      totalCalories: 320,
      foods: [
        {
          emoji: '🍞',
          name: '全麦面包',
          amount: '2片',
          calories: 200
        },
        {
          emoji: '🥛',
          name: '牛奶',
          amount: '250ml',
          calories: 120
        }
      ]
    },
    lunch: {
      totalCalories: 430,
      foods: [
        {
          emoji: '🥗',
          name: '鸡胸肉沙拉',
          amount: '',
          calories: 350
        },
        {
          emoji: '🥤',
          name: '柠檬水',
          amount: '',
          calories: 80
        }
      ]
    },
    dinner: {
      totalCalories: 0,
      foods: []
    },
    snacks: {
      totalCalories: 0,
      foods: []
    }
  },

  onLoad() {
    console.log("onLoad 🚀🚀🚀");
    login();
    // 设置当前日期
    this.setCurrentDate(new Date());
  },

  // 设置当前日期
  setCurrentDate(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 获取星期几
    const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()];
    
    const formattedDate = `${year}年${month}月${day}日 ${weekday}`;
    
    this.setData({
      currentDate: formattedDate,
      currentDateObj: date
    });
    
    // 实际项目中，根据日期加载对应的饮食数据
    this.loadMealDataByDate(date);
  },

  // 上一天
  prevDay() {
    const currentDate = this.data.currentDateObj;
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    
    this.setCurrentDate(prevDate);
  },

  // 下一天
  nextDay() {
    const currentDate = this.data.currentDateObj;
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    this.setCurrentDate(nextDate);
  },

  // 根据日期加载饮食数据
  loadMealDataByDate(date: Date) {
    // 实际项目中，应该从数据库或服务器加载对应日期的数据
    console.log('加载日期数据:', date);
    
    // 这里仅作为示例，使用默认数据
    // 如果是当前日期，使用默认数据，否则清空数据
    if (this.isToday(date)) {
      // 使用默认数据（已在data中设置）
    } else {
      // 清空数据
      this.setData({
        totalCalories: 0,
        breakfast: { totalCalories: 0, foods: [] },
        lunch: { totalCalories: 0, foods: [] },
        dinner: { totalCalories: 0, foods: [] },
        snacks: { totalCalories: 0, foods: [] }
      });
    }
  },

  // 判断是否为今天
  isToday(date: Date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  },

  // 添加食物
  addFood(e: any) {
    const meal = e.currentTarget.dataset.meal;
    console.log('添加食物到:', meal);
    
    // 跳转到添加食物页面
    wx.navigateTo({
      url: '/pages/add-food/add-food?meal=' + meal
    });
  },

  // 这个方法将在从搜索页面返回时调用，用于更新食物列表
  onShow() {
    // 检查是否有从搜索页面带回的参数
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    
    if (currentPage.data.addedFood && currentPage.data.addedMeal) {
      const { addedFood, addedMeal } = currentPage.data;
      this.updateMealWithFood(addedMeal, addedFood);
      
      // 清除临时数据
      currentPage.setData({
        addedFood: null,
        addedMeal: null
      });
    }
  },

  // 更新餐饮类别中的食物
  updateMealWithFood(mealType: string, food: any) {
    // 使用类型断言，处理动态属性访问
    const data = this.data as any;
    const meal = data[mealType];
    const newFoods = [...meal.foods, food];
    
    // 计算新的总卡路里
    const newTotalCalories = newFoods.reduce((sum, food) => sum + food.calories, 0);
    
    // 更新数据
    this.setData({
      [`${mealType}.foods`]: newFoods,
      [`${mealType}.totalCalories`]: newTotalCalories
    });
    
    // 更新总卡路里
    this.updateTotalCalories();
  },

  // 更新总卡路里
  updateTotalCalories() {
    const { breakfast, lunch, dinner, snacks } = this.data;
    const total = breakfast.totalCalories + lunch.totalCalories + dinner.totalCalories + snacks.totalCalories;
    
    this.setData({
      totalCalories: total
    });
  }
}); 