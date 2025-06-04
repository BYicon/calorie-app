import { EnumPage, tabbarPageKeyList } from "../config/index";
import { EnumStorageKey } from "../enum/index";


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