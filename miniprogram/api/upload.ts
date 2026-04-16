import { Response } from "../../typings/models/response";
import { UPLOAD_URL } from "../config/index";
import { getToken } from "../shared/index";

const normalizeUploadResponse = (rawData: unknown) => {
  if (rawData && typeof rawData === "object") {
    return rawData as Record<string, any>;
  }

  if (typeof rawData === "string") {
    const trimmed = rawData.trim();
    if (!trimmed) {
      return {};
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") {
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

/**
 * 上传文件
 * @param tempFilePath 临时文件路径
 * @returns 
 */
export const uploadFile = (tempFilePath: string) => {
  const token = getToken();
  const url = `${UPLOAD_URL}/upload/file`;
  return new Promise<Response<any>>((resolve, reject) => {
    wx.uploadFile({
      url,
      filePath: tempFilePath,
      name: "file",
      header: {
        Authorization: `Bearer ${token}`,
      },
      success(res) {
        const response = normalizeUploadResponse(res.data);
        if (res.statusCode.toString().startsWith('2')) {
          console.log(' 上传文件 🟢🟢🟢', res);
          resolve(response as Response<any>);
        } else {
          console.log(' 上传文件失败 🔴🔴🔴', res);
          reject({
            ...response,
            statusCode: res.statusCode,
          });
        }
      },
      fail(err) {
        console.log(' 上传文件失败 🔴🔴🔴', err);
        reject({
          ...err,
          message: err.errMsg || "上传失败，请稍后重试",
        });
      },
    });
  });
};
