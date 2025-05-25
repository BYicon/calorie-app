// 添加食物页面逻辑
import { Meal, FoodItem } from "../../../typings/models/calories";
import { aiChat } from "../../api/ai";
import * as caloriesApi from "../../api/calories";
import { EnumMealType, EnumMealTypeLabel } from "../../enum/meal-type";
import dayjs from "dayjs";

Page({
  data: {
    mealId: "",
    mealType: EnumMealType.BREAKFAST,
    mealTypeText: EnumMealTypeLabel[EnumMealType.BREAKFAST],
    aiInputText: "",
    isAiLoading: false,
    foodList: [] as FoodItem[],
    currentDate: "",
  },

  // AI输入框内容变化
  onAiInputChange(e: WechatMiniprogram.Input) {
    this.setData({
      aiInputText: e.detail.value,
    });
  },

  // AI识别提交
  onAiSubmit() {
    if (!this.data.aiInputText.trim()) {
      wx.showToast({
        title: "请输入食物描述",
        icon: "none",
      });
      return;
    }

    this.setData({
      isAiLoading: true,
    });

    aiChat({message: this.data.aiInputText,})
      .then((res) => {
        console.log("aiChat res 🟢🟢🟢", res);
        const foods = res.data.message;
        const newFoodList = [...foods, ...this.data.foodList];
        this.setData({
          foodList: newFoodList,
          isAiLoading: false,
          aiInputText: "",
        });
        wx.showToast({
          title: "食物识别完成",
          icon: "success",
        });
      })
      .finally(() => {
        this.setData({
          isAiLoading: false,
        });
      });
  },

  // 手动添加食物项
  addManualFood() {
    const newFood = this.generateFoodItem("新食物", "1份", 0);
    this.setData({
      foodList: [...this.data.foodList, newFood],
    });
  },

  // 生成食物项
  generateFoodItem(name: string, serving: string, calories: number): FoodItem {
    return {
      id: Date.now().toString() + Math.floor(Math.random() * 1000),
      name,
      calories,
      caloriesPer100g: 0,
      grams: 0,
      serving,
    };
  },

  // 食物名称变更
  onFoodNameChange(e: WechatMiniprogram.Input) {
    const { index } = e.currentTarget.dataset;
    const { value } = e.detail;
    const newList = [...this.data.foodList];
    newList[index].name = value;
    this.setData({
      foodList: newList,
    });
  },

  // 食物热量变更
  onFoodCaloriesChange(e: WechatMiniprogram.Input) {
    const { index } = e.currentTarget.dataset;
    const value = parseFloat(e.detail.value) || 0;
    const newList = [...this.data.foodList];
    newList[index].calories = value;
    this.setData({
      foodList: newList,
    });
  },

  // 删除食物项
  deleteFoodItem(e: WechatMiniprogram.BaseEvent) {
    const { index } = e.currentTarget.dataset;
    const newList = this.data.foodList.filter((_, i) => i !== index);
    this.setData({
      foodList: newList,
    });
  },

  // 返回按钮处理
  onBack() {
    // 如果有未保存的食物，提示用户
    if (this.data.foodList.length > 0) {
      wx.showModal({
        title: "提示",
        content: "您有未保存的食物记录，确定要返回吗？",
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        },
      });
    } else {
      wx.navigateBack();
    }
  },

  // 保存按钮处理
  onSave() {
    console.log("onSave foodList 🚀🚀🚀", this.data.foodList);

    const userId = wx.getStorageSync("userInfo").id;
    const mealParams: Meal = {
      type: this.data.mealType,
      date: this.data.currentDate,
      userId: userId,
      foods: this.data.foodList.map((food) => ({
        name: food.name,
        serving: food.serving,
        grams: Number(food.grams),
        calories: Number(food.calories),
        caloriesPer100g: Number(food.caloriesPer100g),
      })),
    };

    if (this.data.foodList.length === 0) {
      wx.showToast({
        title: "没有食物可保存",
        icon: "none",
      });
      return;
    }

    let action = caloriesApi.createMeal;
    if (this.data.mealId) {
      action = caloriesApi.updateMeal;
      mealParams.id = this.data.mealId;
    }

    action(mealParams)
      .then(() => {
        wx.showToast({
          title: "保存成功",
          icon: "success",
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      })
      .catch(() => {
        wx.showToast({
          title: "保存失败，请重试",
          icon: "none",
        });
      });
  },

  getMeal(id: string) {
    return caloriesApi.getMeal(id).then((res) => {
      console.log("getMeal res 🟢🟢🟢", res);
    });
  },

  onLoad(options) {
    const { type, date, id } = options;
    console.log("onLoad type 🚀🚀🚀", type);
    console.log("onLoad date 🚀🚀🚀", date);
    console.log("onLoad id 🚀🚀🚀", id);
    this.setData({
      mealId: id,
      currentDate: dayjs(date).format("YYYY-MM-DD"),
      mealType: type as EnumMealType,
      mealTypeText: EnumMealTypeLabel[type as EnumMealType],
    });
    if (id) {
      caloriesApi.getMeal(id).then((res) => {
        console.log("getMeal res 🟢🟢🟢", res);
        const meal = res.data;
        this.setData({
          foodList: meal.foods,
        });
      });
    }

    wx.setNavigationBarTitle({
      title: ` ${this.data.currentDate} - ${this.data.mealTypeText}`,
    });
  },
});
