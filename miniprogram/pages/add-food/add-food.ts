Page({
  data: {
    selectedMeal: 'breakfast', // 默认选中早餐
    emojiOptions: ['🍎', '🍗', '🥗', '🍚', '🥛', '🍞', '🥩', '🍜', '🥪', '🍲', '🍠', '🥑'],
    selectedEmoji: '🍎', // 默认选中的食物图标
    servingUnits: ['份', '克', '毫升', '个', '片', '杯'],
    servingUnitIndex: 0, // 默认选中"份"
    selectedDate: '',
    foodInfo: {
      name: '',
      calories: '',
      servingAmount: '',
      carbs: '',
      protein: '',
      fat: '',
      fiber: ''
    }
  },

  onLoad(options: any) {
    // 获取当前日期
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    // 设置初始日期
    this.setData({
      selectedDate: formattedDate
    });
    
    // 如果从其他页面跳转过来，设置已选择的餐食类型
    if (options && options.meal) {
      this.setData({
        selectedMeal: options.meal
      });
    }
    
    // 如果带有食物信息，填充表单
    if (options && options.foodInfo) {
      try {
        const foodInfo = JSON.parse(decodeURIComponent(options.foodInfo));
        this.setData({
          foodInfo,
          selectedEmoji: foodInfo.emoji || this.data.selectedEmoji
        });
        
        // 设置份量单位
        const unitIndex = this.data.servingUnits.indexOf(foodInfo.servingUnit);
        if (unitIndex >= 0) {
          this.setData({
            servingUnitIndex: unitIndex
          });
        }
      } catch (error) {
        console.error('解析食物信息失败', error);
      }
    }
  },
  
  // 选择餐食类型
  selectMeal(e: any) {
    const meal = e.currentTarget.dataset.meal;
    this.setData({
      selectedMeal: meal
    });
  },
  
  // 选择食物图标
  selectEmoji(e: any) {
    const emoji = e.currentTarget.dataset.emoji;
    this.setData({
      selectedEmoji: emoji
    });
  },
  
  // 选择份量单位
  onServingUnitChange(e: any) {
    this.setData({
      servingUnitIndex: e.detail.value
    });
  },
  
  // 选择日期
  onDateChange(e: any) {
    this.setData({
      selectedDate: e.detail.value
    });
  },
  
  // 保存食物
  saveFood(e: any) {
    const formValues = e.detail.value;
    
    // 基本验证
    if (!formValues.foodName || !formValues.calories) {
      wx.showToast({
        title: '请填写食物名称和卡路里',
        icon: 'none'
      });
      return;
    }
    
    // 构建食物数据对象
    const foodData = {
      name: formValues.foodName,
      emoji: this.data.selectedEmoji,
      calories: parseFloat(formValues.calories),
      amount: formValues.servingAmount + this.data.servingUnits[this.data.servingUnitIndex],
      servingAmount: formValues.servingAmount,
      servingUnit: this.data.servingUnits[this.data.servingUnitIndex],
      // 营养成分
      carbs: formValues.carbs ? parseFloat(formValues.carbs) : 0,
      protein: formValues.protein ? parseFloat(formValues.protein) : 0,
      fat: formValues.fat ? parseFloat(formValues.fat) : 0,
      fiber: formValues.fiber ? parseFloat(formValues.fiber) : 0,
      // 添加日期和餐食类型
      date: this.data.selectedDate,
      mealType: this.data.selectedMeal
    };
    
    console.log('保存食物数据:', foodData);
    
    // 实际项目中，这里应该将数据保存到数据库
    
    // 返回到记录页面并传递新添加的食物数据
    const pages = getCurrentPages();
    const recordPage = pages[pages.length - 2]; // 上一页面
    
    // 在记录页面设置数据
    recordPage.setData({
      addedFood: {
        emoji: foodData.emoji,
        name: foodData.name,
        amount: foodData.amount,
        calories: foodData.calories
      },
      addedMeal: this.data.selectedMeal
    });
    
    wx.navigateBack();
    
    // 弹出提示
    wx.showToast({
      title: '食物已添加',
      icon: 'success'
    });
  },
  
  // 跳转到食物搜索页面
  goToSearch() {
    wx.switchTab({
      url: '/pages/search/search'
    });
  },
  
  // 跳转到AI搜索功能
  goToAiSearch() {
    wx.navigateTo({
      url: '/pages/search/search?mode=ai'
    });
  }
}); 