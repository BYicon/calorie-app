import { Response } from "../../typings/models/response";
import { UPLOAD_URL } from "../config/index";
import { getToken } from "../shared/index";

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
        if (res.statusCode.toString().startsWith('2')) {
          const data = res.data;
          console.log(' 上传文件 🟢🟢🟢', res);
          resolve(JSON.parse(data));
        } else {
          console.log(' 上传文件失败 🔴🔴🔴', res);
          reject(JSON.parse(res.data));
        }
      },
      fail(err) {
        console.log(' 上传文件失败 🔴🔴🔴', err);
        reject(err);
      },
    });
  });
};
