import { DEFAULT_TARGET_CALORIE, EnumPage, tabbarPageKeyList } from "../config/index";
import { EnumStorageKey } from "../enum/index";
import { BASE_URL_CONFIGS } from "../config/env";


/**
 * 判断是否登录
 * @returns 是否登录
 */
export const hasLogin = () => {
  const token = wx.getStorageSync(EnumStorageKey.TOKEN);
  return token !== "";
};


/**
 * 根据参数跳转页面
 * @param pageKey 参数key
 * @returns 
 */
export const redirectPage = (pageKey: string) => {
  const pagePath = EnumPage[pageKey as keyof typeof EnumPage];
  console.log('redirectPage pagePath 🚀🚀🚀', pagePath);
  if (tabbarPageKeyList.includes(pageKey)) {
    wx.switchTab({
      url: pagePath,
    });
  } else {
    wx.navigateTo({
      url: pagePath,
    });
  }
};

export const getToken = () => {
  return wx.getStorageSync(EnumStorageKey.TOKEN);
};

/**
 * 清除缓存
 */
export const removeCache = () => {
  wx.removeStorageSync(EnumStorageKey.TOKEN);
  wx.removeStorageSync(EnumStorageKey.USER_INFO);
};

/**
 * 获取用户目标卡路里
 * @returns 
 */
export const getCalorieTargetFromStorage = () => {
  if (hasLogin()) {
    const userInfo = wx.getStorageSync(EnumStorageKey.USER_INFO);
    return userInfo.calorieTarget;
  }
  return DEFAULT_TARGET_CALORIE;
};

/**
 * 根据当前环境获取BaseUrl
 * @returns
 */
export const getBaseUrlByEnv = function () {
  const accountInfo = wx.getAccountInfoSync();
  switch (accountInfo.miniProgram.envVersion) {
    case "develop":
      return BASE_URL_CONFIGS.dev;
      break;
    case "trial":
      return BASE_URL_CONFIGS.prod;
      break;
    case "release":
      return BASE_URL_CONFIGS.prod;
    default:
      return BASE_URL_CONFIGS.prod;
      break;
  }
};