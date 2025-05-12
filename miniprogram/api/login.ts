import { post } from "../utils/request";

export const login = () => {
  console.log("login 🚀🚀🚀");
  wx.login({
    success(res) {
      if (res.code) {
        console.log("res.code 🚀🚀🚀", res.code);
        //发起网络请求
        // wx.request({
        //   url: "https://example.com/onLogin",
        //   data: {
        //     code: res.code,
        //   },
        // });
      } else {
        console.log("登录失败！" + res.errMsg);
      }
    },
  });
};
