import { getBaseUrlByEnv } from "./helper";
import { EnumStorageKey } from "../enum/index";

// 定义请求选项接口
interface RequestOptions extends WechatMiniprogram.RequestOption {
  baseUrl?: string;
  headers?: WechatMiniprogram.IAnyObject;
  skipErrorHandler?: boolean;
}

// 定义响应数据结构，根据你的后端实际返回调整
interface ResponseData<T = any> {
  code: number;
  msg: string;
  message?: string;
  statusCode?: number;
  data: T;
}

interface RequestErrorData extends Partial<ResponseData> {
  error?: string | string[];
  toastShown?: boolean;
}

export const BASE_URL = getBaseUrlByEnv();

const normalizeResponseData = (rawData: unknown) => {
  if (rawData && typeof rawData === 'object') {
    return rawData as Record<string, any>;
  }

  if (typeof rawData === 'string') {
    const trimmed = rawData.trim();
    if (!trimmed) {
      return {};
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<string, any>;
      }
    } catch (_error) {
      return {
        message: trimmed,
      };
    }

    return {
      message: trimmed,
    };
  }

  return {};
};

const getResponseMessage = (response?: Partial<ResponseData> | Record<string, any>) => {
  if (!response || typeof response !== 'object') {
    return '';
  }

  const { message, msg, error } = response as Record<string, any>;
  if (Array.isArray(message) && message.length > 0) {
    return message.join('；');
  }
  if (typeof message === 'string' && message.trim()) {
    return message;
  }
  if (Array.isArray(msg) && msg.length > 0) {
    return msg.join('；');
  }
  if (typeof msg === 'string' && msg.trim()) {
    return msg;
  }
  if (Array.isArray(error) && error.length > 0) {
    return error.join('；');
  }
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return '';
};

export const getRequestErrorMessage = (error: unknown, fallback = '请求失败') => {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const response = error as Record<string, any>;
    return (
      getResponseMessage(response) ||
      getResponseMessage(response.data) ||
      fallback
    );
  }

  return fallback;
};

export const showRequestErrorToast = (error: unknown, fallback = '请求失败') => {
  if (error && typeof error === 'object' && (error as RequestErrorData).toastShown) {
    return;
  }

  wx.showToast({
    title: getRequestErrorMessage(error, fallback),
    icon: 'none',
    duration: 2000,
  });
};

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

    wx.request({
      url: `${options.baseUrl || BASE_URL}${url}`, // 拼接基础 URL
      method,
      data,
      header: finalHeader,
      success: (res) => {
        // --- 响应拦截器 ---
        const response = normalizeResponseData(res.data) as ResponseData<T>;

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
            const errorMessage = getResponseMessage(response) || '请求失败';
            if (!skipErrorHandler) {
              wx.showToast({
                title: errorMessage,
                icon: 'none',
                duration: 2000,
              });
            }
            reject({
              ...response,
              message: errorMessage,
              toastShown: !skipErrorHandler,
            });
          }
        } else {
          // HTTP 状态码错误
          const errorMessage = getResponseMessage(response) || `请求错误 ${res.statusCode}`;
          if (!skipErrorHandler) {
            wx.showToast({
              title: errorMessage,
              icon: 'none',
              duration: 2000,
            });
          }
          reject({
            ...response,
            statusCode: res.statusCode,
            message: errorMessage,
            toastShown: !skipErrorHandler,
          });
        }
      },
      fail: (err) => {
        // --- 错误处理 ---
        const errorMessage = getRequestErrorMessage(err, '网络错误，请稍后重试');
        if (!skipErrorHandler) {
          wx.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 2000,
          });
        }
        reject({
          ...err,
          message: errorMessage,
          toastShown: !skipErrorHandler,
        });
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
