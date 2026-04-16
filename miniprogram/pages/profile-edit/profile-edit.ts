import * as usersApi from "../../api/users";
import { EnumStorageKey, EnumGenderLabel } from "../../enum/index";
import * as uploadApi from "../../api/upload";
import { User } from "../../../typings/models/response";
import { DEFAULT_AVATAR, FILE_URL } from "../../config/index";
import { showRequestErrorToast } from "../../shared/request";
import { formatBirthday, parseBirthday } from "../../shared/util";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: DEFAULT_AVATAR, // 用于显示头像
    userInfo: {
      nickname: "",
      birthday: "",
      gender: 3,
      avatar: "",
      calorieTarget: 2000,
    } as User,
    genderText: EnumGenderLabel.SECRET,
    genderOptions: [{
      label: EnumGenderLabel.MALE,
      value: 1,
    }, {
      label: EnumGenderLabel.FEMALE,
      value: 2,
    }, {
      label: EnumGenderLabel.SECRET,
      value: 3,
    }],
    genderIndex: -1,
    originalUserInfo: {}, // 保存原始数据，用于取消时恢复
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad () {
    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo () {
    usersApi.getUserInfo().then((res) => {
      console.log(' 获取用户信息 🟢🟢🟢', res);
      // 1 男 2 女 3 保密
      const genderText = this.data.genderOptions.find(item => item.value === res.data.gender)?.label;
      console.log('genderText 🚀🚀🚀', genderText);
      const formattedBirthday = parseBirthday(res.data.birthday);
      this.setData({
        userInfo: {
          ...res.data,
          birthday: formattedBirthday
        },
        avatarUrl: FILE_URL + res.data.avatar,
        genderIndex: res.data.gender - 1,
        genderText
      });
    });
  },

  /**
   * 选择头像
   */
  onChooseAvatar () {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: function (res) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        console.log('上传头像 tempFilePath 🚀🚀🚀', tempFilePath);
        uploadApi.uploadFile(tempFilePath).then((res) => {
          console.log('上传头像成功 🟢🟢🟢', res);
          that.setData({
            avatarUrl: tempFilePath,
            "userInfo.avatar": res.data.filename,
          });
        }).catch((error) => {
          that.setData({
            avatarUrl: DEFAULT_AVATAR,
          });
          showRequestErrorToast(error, "上传头像失败");
        });

      },
      fail: function (err) {
        console.error("选择头像失败:", err);
        // errMsg: "chooseMedia:fail cancel"
        if (err.errMsg === "chooseMedia:fail cancel") {
          return;
        }
        wx.showToast({
          title: "选择头像失败",
          icon: "none",
        });
      },
    });
  },

  /**
   * 昵称输入变化
   */
  onNicknameChange(e: any) {
    this.setData({
      "userInfo.nickname": e.detail.value,
    });
  },

  /**
   * 性别选择变化
   */
  onGenderChange(e: any) {
    const index = e.detail.value;
    this.setData({
      genderIndex: index,
      "userInfo.gender": index + 1,
      genderText: this.data.genderOptions[index].label,
    });
  },

  /**
   * 生日选择变化
   */
  onBirthdayChange(e: any) {
    // 确保生日格式为 YYYY-MM-DD
    const formattedBirthday = formatBirthday(e.detail.value);
    this.setData({
      "userInfo.birthday": formattedBirthday,
    });
  },

  /**
   * 卡路里目标输入变化
   */
  onCalorieTargetChange(e: any) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({
      "userInfo.calorieTarget": value,
    });
  },

  /**
   * 验证表单数据
   */
  validateForm() {
    const { userInfo } = this.data;

    if (!userInfo.nickname) {
      wx.showToast({
        title: "请输入昵称",
        icon: "none",
      });
      return false;
    }

    if (userInfo.calorieTarget && (userInfo.calorieTarget < 800 || userInfo.calorieTarget > 5000)) {
      wx.showToast({
        title: "卡路里目标应在800-5000之间",
        icon: "none",
      });
      return false;
    }

    return true;
  },

  /**
   * 取消编辑
   */
  onCancel() {
    wx.showModal({
      title: "确认取消",
      content: "确定要取消编辑吗？",
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      },
    });
  },

  /**
   * 保存用户信息
   */
  onSave() {
    if (!this.validateForm()) {
      return;
    }

    wx.showLoading({
      title: "保存中...",
    });

    const userId = wx.getStorageSync(EnumStorageKey.USER_INFO).id;

    // 确保生日格式正确
    const formattedBirthday = formatBirthday(this.data.userInfo.birthday);

    usersApi.updateUserInfo({
      id: userId,
      nickname: this.data.userInfo.nickname || "",
      birthday: formattedBirthday,
      gender: this.data.userInfo.gender,
      avatar: this.data.userInfo.avatar || "",
      calorieTarget: this.data.userInfo.calorieTarget || 2000,
    }).then((res) => {
      // 保存成功后的处理
      wx.showToast({
        title: "保存成功",
        icon: "success",
        duration: 1500,
        success: () => {
          wx.setStorageSync(EnumStorageKey.USER_INFO, res.data);
          // 延迟返回，让用户看到提示
          setTimeout(() => {
            // 可以通过事件总线或全局状态管理通知其他页面更新用户信息
            wx.navigateBack();
          }, 1500);
        },
      });
    });
  },

  /**
   * 页面卸载时的处理
   */
  onUnload() {
    // 页面卸载时可以进行一些清理工作
  },

  onShareAppMessage() {
    return {
      path: 'pages/index/index',
      title: '记录卡路里，开始健康生活',
      imagePath: 'https://wx.qlogo.cn/mmhead/Xmnun9Io49RB3BicJVsFAch4V5aqRkuZbDfffIR6EBia1X5ptBt9AS5P4bYpn5WFrVqkHhzd41M9E/0',
    }
  }
});
