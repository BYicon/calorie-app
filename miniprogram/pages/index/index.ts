import { login } from "../../api/auth";
import { redirectPage } from "../../shared/helper";
import { STATIC_FILE_URL } from "../../config/env";


Page({
  data: {
    todayTimestamp: 0,
    welcomeImage: `${STATIC_FILE_URL}/welcome.png`,
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
      }
    });
  },
})