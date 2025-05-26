import { post } from "../utils/request";
import { EnumStorageKey } from "../enum/index";

/**
 * 登录
 * @returns 用户信息
 */
export const login = () => new Promise((resolve, reject) => {
  wx.login({
    success(res) {
      if (res.code) {
        console.log("res.code 🚀🚀🚀", res.code);
        //发起网络请求
        post("/auth/login", {
          js_code: res.code,
        }).then((res) => {
          console.log("登录成功 🟢🟢🟢", res);
          wx.setStorageSync(EnumStorageKey.TOKEN, res.data.access_token);
          wx.setStorageSync(EnumStorageKey.USER_INFO, res.data.user);
          resolve(res.data.user);
        });
      } else {
        console.log("登录失败！" + res.errMsg);
        reject();
      }
    },
  });
});
