// 添加食物页面逻辑
import { aiChat } from "../../api/ai";

Page({
  data: {
    aiInputText: "",
    isAiLoading: false,
    foodList: [] as FoodItem[],
    currentDate: "",
  },

  onLoad(options) {
    // 获取当前日期，如果没有通过参数传递，则使用今天的日期
    const date = options.date || this.formatDate(new Date());
    this.setData({
      currentDate: date,
    });

    // 如果有通过参数传递的餐食类型，可以预设默认值
    const mealType = options.mealType || "breakfast";
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

    aiChat({
      userId: "1",
      message: this.data.aiInputText,
    })
      .then((res) => {
        console.log("aiChat res 🟢🟢🟢", res);
        const foods = res.data.message;
        const newFoodList = [ ...foods, ...this.data.foodList];
        this.setData({
          foodList: newFoodList,
          isAiLoading: false,
          aiInputText: ''
        });
        wx.showToast({
          title: '食物识别完成',
          icon: 'success'
        });
      })
      .finally(() => {
        this.setData({
          isAiLoading: false,
        });
      });
    // 模拟AI食物识别过程
    // setTimeout(() => {
    //   // 假设我们解析出了一些食物
    //   const parsedFoods = [
    //     this.generateFoodItem('牛肉面', '1碗', 450),
    //     this.generateFoodItem('矿泉水', '1瓶', 0)
    //   ];

    //   const newFoodList = [...this.data.foodList, ...parsedFoods];

    //   this.setData({
    //     foodList: newFoodList,
    //     isAiLoading: false,
    //     aiInputText: '' // 清空输入框
    //   });

    //   wx.showToast({
    //     title: '食物识别完成',
    //     icon: 'success'
    //   });
    // }, 2000);

    // 实际项目中需要调用后端AI接口进行识别
    /*
    wx.request({
      url: 'https://your-api.com/analyze-food',
      method: 'POST',
      data: {
        text: this.data.aiInputText
      },
      success: (res) => {
        // 处理响应数据
        const foods = res.data.foods;
        const newFoodList = [...this.data.foodList, ...foods];
        
        this.setData({
          foodList: newFoodList,
          isAiLoading: false,
          aiInputText: ''
        });
      },
      fail: () => {
        this.setData({
          isAiLoading: false
        });
        wx.showToast({
          title: '识别失败，请重试',
          icon: 'none'
        });
      }
    });
    */
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
      calories_per_100g: 0,
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
    if (this.data.foodList.length === 0) {
      wx.showToast({
        title: "没有食物可保存",
        icon: "none",
      });
      return;
    }

    // 保存食物到本地存储或发送到服务器
    this.saveToStorage()
      .then(() => {
        wx.showToast({
          title: "保存成功",
          icon: "success",
        });

        // 延迟返回，让用户看到保存成功的提示
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

  // 保存到本地存储
  saveToStorage(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 获取之前的食物记录
        const storageKey = `food_records_${this.data.currentDate}`;
        let existingRecords = wx.getStorageSync(storageKey) || [];

        // 将新食物添加到记录中
        existingRecords = [...existingRecords, ...this.data.foodList];

        // 保存回本地存储
        wx.setStorageSync(storageKey, existingRecords);

        // 更新每日卡路里总数
        this.updateDailyCalories(existingRecords);

        resolve();
      } catch (error) {
        console.error("保存食物记录失败", error);
        reject(error);
      }
    });
  },

  // 更新每日卡路里总数
  updateDailyCalories(foodRecords: FoodItem[]) {
    // 计算当天的总卡路里
    const totalCalories = foodRecords.reduce((total, food) => {
      return total + (food.calories || 0);
    }, 0);

    // 将每日总卡路里保存到单独的存储中
    const dailyCaloriesKey = "daily_calories";
    let dailyCalories = wx.getStorageSync(dailyCaloriesKey) || {};
    dailyCalories[this.data.currentDate] = totalCalories;
    wx.setStorageSync(dailyCaloriesKey, dailyCalories);
  },

  // 格式化日期为 YYYY-MM-DD 格式
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },
});
