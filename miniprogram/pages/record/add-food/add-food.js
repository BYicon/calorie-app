Page({
  /**
   * 页面的初始数据
   */
  data: {
    aiInput: '',
    isLoading: false,
    foodList: [
      {
        id: 1,
        name: '牛肉面',
        amount: '1碗',
        calories: 450
      },
      {
        id: 2,
        name: '全麦面包',
        amount: '2片',
        calories: 200
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 如果从其他页面传递了数据，可以在这里处理
  },

  /**
   * AI输入框内容变化
   */
  onAiInputChange: function (e) {
    this.setData({
      aiInput: e.detail.value
    });
  },

  /**
   * 点击AI识别按钮
   */
  onAiSubmit: function () {
    if (!this.data.aiInput.trim()) {
      wx.showToast({
        title: '请输入食物描述',
        icon: 'none'
      });
      return;
    }

    this.setData({
      isLoading: true
    });

    // 模拟AI处理过程，实际项目中替换为真实API调用
    setTimeout(() => {
      // 根据输入识别食物
      // 这里只是示例，实际上应该调用后端API
      const newFood = {
        id: Date.now(), // 使用时间戳作为临时ID
        name: '苹果',
        amount: '1个',
        calories: 52
      };

      // 更新食物列表
      const foodList = this.data.foodList.concat(newFood);

      this.setData({
        foodList: foodList,
        isLoading: false,
        aiInput: '' // 清空输入框
      });
    }, 2000);
  },

  /**
   * 食物名称变化
   */
  onFoodNameChange: function (e) {
    const index = e.currentTarget.dataset.index;
    const foodList = this.data.foodList;
    
    foodList[index].name = e.detail.value;
    
    this.setData({
      foodList: foodList
    });
  },

  /**
   * 食物份量变化
   */
  onAmountChange: function (e) {
    const index = e.currentTarget.dataset.index;
    const foodList = this.data.foodList;
    
    foodList[index].amount = e.detail.value;
    
    this.setData({
      foodList: foodList
    });
  },

  /**
   * 食物热量变化
   */
  onCaloriesChange: function (e) {
    const index = e.currentTarget.dataset.index;
    const foodList = this.data.foodList;
    
    foodList[index].calories = e.detail.value;
    
    this.setData({
      foodList: foodList
    });
  },

  /**
   * 删除食物项
   */
  onDeleteFood: function (e) {
    const index = e.currentTarget.dataset.index;
    const foodList = this.data.foodList.filter((_, i) => i !== index);
    
    this.setData({
      foodList: foodList
    });
  },

  /**
   * 手动添加食物
   */
  onAddManualFood: function () {
    const newFood = {
      id: Date.now(), // 使用时间戳作为临时ID
      name: '新食物',
      amount: '1份',
      calories: 0
    };

    const foodList = this.data.foodList.concat(newFood);

    this.setData({
      foodList: foodList
    });
  },

  /**
   * 返回按钮点击事件
   */
  onBack: function () {
    wx.navigateBack();
  },

  /**
   * 保存按钮点击事件
   */
  onSave: function () {
    // 验证数据
    if (this.data.foodList.length === 0) {
      wx.showToast({
        title: '请至少添加一项食物',
        icon: 'none'
      });
      return;
    }

    // 遍历检查每项食物
    let hasError = false;
    this.data.foodList.forEach(food => {
      if (!food.name.trim() || !food.amount.trim()) {
        hasError = true;
      }
    });

    if (hasError) {
      wx.showToast({
        title: '请填写完整的食物信息',
        icon: 'none'
      });
      return;
    }

    // 保存数据，这里应该调用API保存到服务器
    // 这里只是示例
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        // 延迟返回，让用户看到提示
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    });
  }
}); 