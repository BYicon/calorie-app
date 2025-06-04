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

  /*
   * AI识别提交
   */
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

    aiChat({ message: this.data.aiInputText })
      .then((res) => {
        const foods = res.data.message;
        console.log("foods 🟢🟢🟢", foods);
        if (foods.length === 0) {
          wx.showToast({
            title: "未识别到食物",
            icon: "none",
          });
          this.setData({
            isAiLoading: false,
          });
          return;
        }
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

  /*
   * 手动添加食物项
   */
  addManualFood() {
    const newFood = this.generateFoodItem("", "", 0);
    this.setData({
      foodList: [...this.data.foodList, newFood],
    });
  },

  /*
   * 生成食物项
   */
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

  /*
   * 食物项字段变化
   */
  onFieldChange(e: WechatMiniprogram.Input) {
    const { index, field } = e.currentTarget.dataset as {
      index: number;
      field: keyof FoodItem;
    };
    const { value } = e.detail;
    const newList: FoodItem[] = [...this.data.foodList];
    const target: any = newList[index];

    if (field === "grams" || field === "caloriesPer100g") {
      target[field] = parseFloat(value) || 0;
      target.calories = Math.round(
        (target.grams * target.caloriesPer100g) / 100
      );
    } else {
      target[field] = value;
    }

    this.setData({
      foodList: newList,
    });
  },

  /*
   * 删除食物项
   */
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

  /*
   * 校验食物列表
   * 1. 食物名称不能为空
   * 2. 重量不能为空
   * 3. 热量不能为空
   */
  validateFoodList() {
    const validFoodList = this.data.foodList.filter(
      (food) => food.name && food.grams && food.caloriesPer100g
    );
    if (validFoodList.length !== this.data.foodList.length) {
      return false;
    }
    return true;
  },

  // 保存按钮处理
  onSave() {
    if (!this.validateFoodList()) {
      wx.showToast({
        title: "食物名称、重量和热量不能为空",
        icon: "none",
      });
      return;
    }
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
    const currentDate = dayjs(date).format("YYYY-MM-DD");
    this.setData({
      mealId: id,
      currentDate: currentDate,
      mealType: type as EnumMealType,
      mealTypeText: EnumMealTypeLabel[type as EnumMealType],
    });
    if (id) {
      caloriesApi.getMeal(id).then((res) => {
        console.log("getMeal res 🟢🟢🟢", res);
        const foods = res.data.foods || [];
        this.setData({
          foodList: foods,
        });
      });
    }
    const currentDateText = dayjs(currentDate).format("YYYY年MM月DD日");
    wx.setNavigationBarTitle({
      title: ` ${currentDateText}【${this.data.mealTypeText}】`,
    });
  },
});
