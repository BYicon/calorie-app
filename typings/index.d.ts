/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    navBarHeight?: number
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}