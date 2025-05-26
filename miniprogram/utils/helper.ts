import { EnumStorageKey } from "../enum";


/**
 * 判断是否登录
 * @returns 是否登录
 */
export const hasLogin = () => {
  const token = wx.getStorageSync(EnumStorageKey.TOKEN);
  return token !== "";
};