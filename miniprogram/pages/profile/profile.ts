import * as usersApi from "../../api/users";
import { FILE_URL, DEFAULT_AVATAR } from "../../config/index";
import { EnumStorageKey } from "../../enum/index";
import * as CaloriesApi from "../../api/calories";
Page({
  data: {
    avatarUrl: DEFAULT_AVATAR,
    userInfo: {},
    stats: {
      achievementRate: 23,
      averageBurnedCalories: 100,
      averageIntakeCalories: 761,
      averageNetCalories: 661,
      targetAchievedDays: 3,
      totalDays: 13,
    },
    achievements: [
      {
        id: 1,
        icon: "🔥",
        name: "连续记录7天",
        date: "2023-05-20",
        unlocked: true,
      },
      {
        id: 2,
        icon: "🥗",
        name: "健康饮食达人",
        date: "2023-05-28",
        unlocked: true,
      },
      {
        id: 3,
        icon: "🏃",
        name: "运动达人",
        date: "未解锁",
        unlocked: false,
      },
      {
        id: 4,
        icon: "📊",
        name: "数据分析师",
        date: "未解锁",
        unlocked: false,
      },
    ],
    showGoalDialog: false,
    calorieGoal: "",
    currentGoal: 0,
  },

  onShow() {
    this.loadUserData();
    this.getUserStats();
  },

  onLoad() {
    console.log("onLoad 🚀🚀🚀");
    // 加载用户数据
    this.loadUserData();
  },

  loadUserData() {
    // 在实际应用中，这里应该从服务器或本地存储加载用户数据
    console.log("加载用户数据");
    // 获取用户的卡路里目标
    const calorieGoal = wx.getStorageSync(EnumStorageKey.USER_INFO).calorieTarget || 0;
    const userInfo = wx.getStorageSync(EnumStorageKey.USER_INFO);
    this.setData({
      currentGoal: calorieGoal,
      userInfo,
      avatarUrl: userInfo.avatar ? FILE_URL + userInfo.avatar : DEFAULT_AVATAR,
    });
  },

  getUserStats() {
    CaloriesApi.getUserStats().then((res) => {
      console.log("getUserStats 🚀🚀🚀", res);
      const data = res.data;
      this.setData({
        stats: data,
      });
    });
  },
  

  // 编辑个人资料
  editProfile() {
    wx.navigateTo({
      url: '/pages/profile-edit/profile-edit'
    });
  },

  // 目标设置
  goToGoalSetting() {
    this.setData({
      showGoalDialog: true,
      calorieGoal: this.data.currentGoal.toString(),
    });
  },

  // 关闭目标设置对话框
  onCloseGoalDialog() {
    this.setData({
      showGoalDialog: false,
    });
  },

  // 输入框内容变化
  onCalorieGoalChange(event: any) {
    this.setData({
      calorieGoal: event.detail,
    });
  },

  // 保存卡路里目标
  saveCalorieGoal() {
    const calorieGoal = parseInt(this.data.calorieGoal);
    if (isNaN(calorieGoal) || calorieGoal <= 0) {
      wx.showToast({
        title: "请输入有效的卡路里目标",
        icon: "none",
      });
      return;
    }

    usersApi.updateCalorieTarget({
      calorieTarget: calorieGoal,
    })
      .then((res) => {
        console.log(res);
        this.setData({
          currentGoal: calorieGoal,
          showGoalDialog: false,
        });
        wx.showToast({
          title: "目标设置成功",
          icon: "success",
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  // 提醒设置
  goToReminderSetting() {
    wx.showToast({
      title: "提醒设置功能开发中",
      icon: "none",
    });
  },

  // 隐私设置
  goToPrivacySetting() {
    wx.showToast({
      title: "隐私设置功能开发中",
      icon: "none",
    });
  },

  // 使用帮助
  goToHelp() {
    wx.showToast({
      title: "帮助中心功能开发中",
      icon: "none",
    });
  },

  // 关于我们
  goToAbout() {
    wx.showToast({
      title: "关于页面开发中",
      icon: "none",
    });
  },

  // 去评分
  goToRate() {
    // 打开小程序评分功能
    wx.showToast({
      title: "评分功能开发中",
      icon: "none",
    });
  },
});
