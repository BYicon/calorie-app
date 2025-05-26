import { BASE_URL } from "../config/index";
import { EnumStorageKey } from "../enum/index";

// 定义请求选项接口
interface RequestOptions extends WechatMiniprogram.RequestOption {
  // 可以添加自定义选项
  skipErrorHandler?: boolean;
}

// 定义响应数据结构，根据你的后端实际返回调整
interface ResponseData<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 统一请求处理
 * @param options 请求选项
 */
const request = <T = any>(options: RequestOptions): Promise<ResponseData<T>> => {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data, header = {}, skipErrorHandler = false } = options;


    // --- 请求拦截器 ---
    const token = wx.getStorageSync(EnumStorageKey.TOKEN);
    const finalHeader: WechatMiniprogram.IAnyObject = {
      ...header,
      'Authorization': `Bearer ${token}`,
      'content-type': header['content-type'] || 'application/json',
    };
    if (token) {
      finalHeader['Authorization'] = `Bearer ${token}`; // 现在类型兼容了
    }

    const requestTask = wx.request({
      url: `${BASE_URL}${url}`, // 拼接基础 URL
      method,
      data,
      header: finalHeader,
      success: (res) => {
        // --- 响应拦截器 ---
        const response = res.data as ResponseData<T>;

        // 简单示例：根据后端返回的 code 判断
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (response.code === 0 || response.code === 200) { // 假设 0 或 200 为成功
            resolve(response);
          } else if (response.code === 401) { // 假设 401 为未授权
            // 清除本地 token
            wx.removeStorageSync(EnumStorageKey.TOKEN);
            // 跳转到登录页 (根据你的项目路由配置调整)
            wx.navigateTo({ url: '/pages/login/index' }); // 示例路径
            reject(new Error('请重新登录'));
          } else {
            // 其他业务错误
            if (!skipErrorHandler) {
              wx.showToast({
                title: response.msg || '请求失败',
                icon: 'none',
                duration: 2000,
              });
            }
            reject(response); // 可以根据需要 reject 错误信息或整个响应
          }
        } else {
          // HTTP 状态码错误
          if (!skipErrorHandler) {
            wx.showToast({
              title: `请求错误 ${res.statusCode}`,
              icon: 'none',
              duration: 2000,
            });
          }
          reject(new Error(`HTTP Error: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        // --- 错误处理 ---
        if (!skipErrorHandler) {
          wx.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none',
            duration: 2000,
          });
        }
        reject(err);
      },
      complete: () => {
        // 清理请求任务 (可选)
        // requestTasks.delete(taskId);
      },
    });

    // 存储请求任务 (可选)
    // const taskId = `${method}-${url}-${Date.now()}`;
    // requestTasks.set(taskId, requestTask);
  });
};

// 导出常用方法
export const get = <T = any>(url: string, data?: object, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>) => {
  return request<T>({ ...options, url, method: 'GET', data });
};

export const post = <T = any>(url: string, data?: object, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>) => {
  return request<T>({ ...options, url, method: 'POST', data });
};

export const put = <T = any>(url: string, data?: object, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>) => {
  return request<T>({ ...options, url, method: 'PUT', data });
};

export const del = <T = any>(url: string, data?: object, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>) => {
  return request<T>({ ...options, url, method: 'DELETE', data });
};

// 可以添加上传文件等其他方法

export default request; // 默认导出基础请求函数
