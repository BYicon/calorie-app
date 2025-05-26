Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      username: '',
      email: '',
      nickname: '',
      birthday: '',
      gender: '',
      avatar: '',
      calorieTarget: 2000
    },
    genderOptions: ['男', '女', '保密'],
    genderIndex: -1,
    originalUserInfo: {} // 保存原始数据，用于取消时恢复
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo: function () {
    // 这里应该从服务器或本地存储加载用户信息
    // 示例数据
    const userInfo = {
      username: '',
      email: '',
      nickname: '',
      birthday: '',
      gender: '',
      avatar: '',
      calorieTarget: 2000
    };

    // 设置性别选择器的索引
    const genderIndex = this.data.genderOptions.indexOf(userInfo.gender) || 0;

    this.setData({
      userInfo: userInfo,
      originalUserInfo: JSON.parse(JSON.stringify(userInfo)), // 深拷贝
      genderIndex: genderIndex >= 0 ? genderIndex : -1
    });
  },

  /**
   * 选择头像
   */
  onChooseAvatar: function () {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        // 这里应该上传图片到服务器，获取图片URL
        // 暂时使用本地路径
        that.setData({
          'userInfo.avatar': tempFilePath
        });
        
        wx.showToast({
          title: '头像已更新',
          icon: 'success'
        });
      },
      fail: function (err) {
        console.error('选择头像失败:', err);
        wx.showToast({
          title: '选择头像失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 用户名输入变化
   */
  onUsernameChange: function (e) {
    this.setData({
      'userInfo.username': e.detail.value
    });
  },

  /**
   * 昵称输入变化
   */
  onNicknameChange: function (e) {
    this.setData({
      'userInfo.nickname': e.detail.value
    });
  },

  /**
   * 邮箱输入变化
   */
  onEmailChange: function (e) {
    this.setData({
      'userInfo.email': e.detail.value
    });
  },

  /**
   * 性别选择变化
   */
  onGenderChange: function (e) {
    const index = e.detail.value;
    this.setData({
      genderIndex: index,
      'userInfo.gender': this.data.genderOptions[index]
    });
  },

  /**
   * 生日选择变化
   */
  onBirthdayChange: function (e) {
    this.setData({
      'userInfo.birthday': e.detail.value
    });
  },

  /**
   * 卡路里目标输入变化
   */
  onCalorieTargetChange: function (e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({
      'userInfo.calorieTarget': value
    });
  },

  /**
   * 验证邮箱格式
   */
  validateEmail: function (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * 验证表单数据
   */
  validateForm: function () {
    const { userInfo } = this.data;

    if (!userInfo.username || userInfo.username.trim() === '') {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      });
      return false;
    }

    if (userInfo.username.length > 50) {
      wx.showToast({
        title: '用户名不能超过50个字符',
        icon: 'none'
      });
      return false;
    }

    // if (userInfo.email && !this.validateEmail(userInfo.email)) {
    //   wx.showToast({
    //     title: '请输入正确的邮箱格式',
    //     icon: 'none'
    //   });
    //   return false;
    // }

    if (userInfo.calorieTarget < 800 || userInfo.calorieTarget > 5000) {
      wx.showToast({
        title: '卡路里目标应在800-5000之间',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  /**
   * 取消编辑
   */
  onCancel: function () {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消编辑吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  /**
   * 保存用户信息
   */
  onSave: function () {
    if (!this.validateForm()) {
      return;
    }

    wx.showLoading({
      title: '保存中...'
    });

    // 这里应该调用API保存用户信息到服务器
    // 模拟API调用
    setTimeout(() => {
      wx.hideLoading();
      
      // 保存成功后的处理
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500,
        success: () => {
          // 延迟返回，让用户看到提示
          setTimeout(() => {
            // 可以通过事件总线或全局状态管理通知其他页面更新用户信息
            wx.navigateBack();
          }, 1500);
        }
      });
    }, 1000);
  },

  /**
   * 页面卸载时的处理
   */
  onUnload: function () {
    // 页面卸载时可以进行一些清理工作
  }
}); 