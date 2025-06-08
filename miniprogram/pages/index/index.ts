import { login } from "../../api/auth";
import { redirectPage } from "../../utils/helper";


Page({
  data: {
  },
  toRecord() {
    wx.navigateTo ({
      url: '/pages/record/record',
    });
  },
  onLoad(e) {
    login().then((userInfo) => {
      console.log('onLoad userInfo 🚀🚀🚀', userInfo);
      this.setData({
        calorieTarget: userInfo.calorieTarget,
      });
      console.log('onLoad e 🚀🚀🚀', e);
      const pageKey = e.t;
      if (pageKey) {
        redirectPage(pageKey);
      }
    });
  },
})