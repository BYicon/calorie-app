// pages/search/search.ts
Page({
  data: {
    activeTab: 'popular',
    searchKeyword: '',
    aiInput: '',
    aiResponse: '',
    foodList: [
      {
        emoji: '🍎',
        name: '苹果',
        calories: 52,
        carbs: 14,
        protein: 0.3,
        fat: 0.2
      },
      {
        emoji: '🍚',
        name: '白米饭',
        calories: 130,
        carbs: 28,
        protein: 2.7,
        fat: 0.3
      },
      {
        emoji: '🥑',
        name: '牛油果',
        calories: 160,
        carbs: 8.5,
        protein: 2,
        fat: 15
      }
    ],
    recentSearches: ['牛肉', '全麦面包', '酸奶', '三明治', '沙拉']
  },

  onLoad() {
    // 页面加载时执行的逻辑
  },

  // 搜索相关方法
  onSearchInput(e: any) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  onSearch() {
    const { searchKeyword, recentSearches } = this.data;
    if (!searchKeyword.trim()) return;
    
    // 实际项目中这里应该调用API进行搜索
    console.log('搜索关键词:', searchKeyword);
    
    // 将搜索词添加到最近搜索
    if (!recentSearches.includes(searchKeyword)) {
      this.setData({
        recentSearches: [searchKeyword, ...recentSearches].slice(0, 5)
      });
    }
  },

  // 选项卡切换
  switchTab(e: any) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
    
    // 根据选项卡加载不同的数据
    this.loadFoodListByTab(tab);
  },

  loadFoodListByTab(tab: string) {
    // 实际项目中应该根据不同的选项卡从服务器获取数据
    console.log('加载', tab, '选项卡的数据');
    
    // 这里仅作为示例，使用默认数据
  },

  // 添加食物到每日记录
  addFood(e: any) {
    const index = e.currentTarget.dataset.index;
    const food = this.data.foodList[index];
    
    // 实际项目中，这里应该将食物添加到用户的记录中
    console.log('添加食物:', food);
    
    wx.showToast({
      title: `已添加${food.name}`,
      icon: 'success'
    });
  },

  // 点击最近搜索项
  onRecentSearchTap(e: any) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({
      searchKeyword: keyword
    });
    
    // 执行搜索
    this.onSearch();
  },

  // AI助手相关方法
  onAiInputChange(e: any) {
    this.setData({
      aiInput: e.detail.value
    });
  },

  askAi() {
    const { aiInput } = this.data;
    if (!aiInput.trim()) return;
    
    // 实际项目中，这里应该调用AI服务
    console.log('AI问题:', aiInput);
    
    // 模拟AI回复
    this.setData({
      aiResponse: `根据分析，${aiInput}的热量大约为300-350卡路里/100克，具体取决于烹饪方法和配料。主要营养成分包括蛋白质、脂肪和碳水化合物。建议适量食用。`
    });
  }
}); 