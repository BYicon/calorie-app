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
 * 清除缓存
 */
export const removeCache = () => {
  wx.removeStorageSync(EnumStorageKey.TOKEN);
  wx.removeStorageSync(EnumStorageKey.USER_INFO);
};