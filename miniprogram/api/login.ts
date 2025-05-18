import { post } from "../utils/request";
import { EnumStorageKey } from "../enum/index";

export const login = () => {
  console.log("login 🚀🚀🚀");
  wx.login({
    success(res) {
      if (res.code) {
        console.log("res.code 🚀🚀🚀", res.code);
        //发起网络请求
        post('/users/login', {
          js_code: res.code,
        }).then(res => {
          console.log("登录成功 🟢🟢🟢", res);
          wx.setStorageSync(EnumStorageKey.TOKEN, res.data.token);
          wx.setStorageSync(EnumStorageKey.USER_INFO, res.data);
        })
      } else {
        console.log("登录失败！" + res.errMsg);
      }
    },
  });
};
