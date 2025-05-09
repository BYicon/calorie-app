Page({
  data: {
    userInfo: {
      name: '小粉丝',
      daysRecorded: 28,
    },
    stats: {
      daysLogged: 28,
      targetDays: 5,
      avgCalories: 2.8
    },
    achievements: [
      {
        id: 1,
        icon: '🔥',
        name: '连续记录7天',
        date: '2023-05-20',
        unlocked: true
      },
      {
        id: 2,
        icon: '🥗',
        name: '健康饮食达人',
        date: '2023-05-28',
        unlocked: true
      },
      {
        id: 3,
        icon: '🏃',
        name: '运动达人',
        date: '未解锁',
        unlocked: false
      },
      {
        id: 4,
        icon: '📊',
        name: '数据分析师',
        date: '未解锁',
        unlocked: false
      }
    ]
  },
  
  onLoad() {
    // 加载用户数据
    this.loadUserData();
  },

  loadUserData() {
    // 在实际应用中，这里应该从服务器或本地存储加载用户数据
    console.log('加载用户数据');
    // 这里只是模拟数据，实际应用中应该替换为真实的数据获取逻辑
  },
  
  // 编辑个人资料
  editProfile() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },
  
  // 目标设置
  goToGoalSetting() {
    wx.showToast({
      title: '目标设置功能开发中',
      icon: 'none'
    });
  },
  
  // 提醒设置
  goToReminderSetting() {
    wx.showToast({
      title: '提醒设置功能开发中',
      icon: 'none'
    });
  },
  
  // 隐私设置
  goToPrivacySetting() {
    wx.showToast({
      title: '隐私设置功能开发中',
      icon: 'none'
    });
  },
  
  // 使用帮助
  goToHelp() {
    wx.showToast({
      title: '帮助中心功能开发中',
      icon: 'none'
    });
  },
  
  // 关于我们
  goToAbout() {
    wx.showToast({
      title: '关于页面开发中',
      icon: 'none'
    });
  },
  
  // 去评分
  goToRate() {
    // 打开小程序评分功能
    wx.showToast({
      title: '评分功能开发中',
      icon: 'none'
    });
  },
  
  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态
          console.log('用户确认退出登录');
          // 跳转到登录页
          wx.reLaunch({
            url: '/pages/index/index'
          });
        }
      }
    });
  }
}); 