import { login } from "../../api/auth";
import { redirectPage } from "../../shared/helper";
import { STATIC_FILE_URL } from "../../config/env";


Page({
  data: {
    todayTimestamp: 0,
    hasLogin: false,
  },
  toRecord() {
    wx.switchTab ({
      url: '/pages/record/record',
    });
  },
  agree() {
    console.log('agree 🚀🚀🚀');
  },
  disagree() {
    console.log('disagree 🚀🚀🚀');
  },
  onLoad(e) {
    wx.showLoading({
      title: '载入中...',
    })
    login().then((userInfo) => {
      console.log('onLoad userInfo 🚀🚀🚀', userInfo);
      this.setData({
        calorieTarget: userInfo.calorieTarget,
        hasLogin: true,
        todayTimestamp: Date.now(),
      });
      console.log('onLoad e 🚀🚀🚀', e);
      const pageKey = e.t;
      if (pageKey) {
        redirectPage(pageKey);
      } else {
        wx.switchTab ({
          url: '/pages/record/record',
        });
      }
      wx.hideLoading();
    });
  },
  onShareAppMessage() {
    return {
      path: 'pages/index/index',
      title: '快来记录每日热量吧～',
      imagePath: 'https://wx.qlogo.cn/mmhead/Xmnun9Io49RB3BicJVsFAch4V5aqRkuZbDfffIR6EBia1X5ptBt9AS5P4bYpn5WFrVqkHhzd41M9E/0',
    }
  }
})