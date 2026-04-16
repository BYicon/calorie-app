// 添加食物页面逻辑
import { ExerciseItem } from "../../../typings/models/calories";
import * as aiApi from "../../api/ai";
import * as caloriesApi from "../../api/calories";
import dayjs from "dayjs";
import { EnumAiChatType } from "../../enum/index";
import { showRequestErrorToast } from "../../shared/request";

Page({
  data: {
    aiInputText: "",
    isAiLoading: false,
    exerciseList: [] as ExerciseItem[],
    currentDate: "",
  },

  // AI输入框内容变化
  onAiInputChange(e: WechatMiniprogram.Input) {
    this.setData({
      aiInputText: e.detail.value,
    });
  },

  /*
   * AI识别提交
   */
  onAiSubmit() {
    if (!this.data.aiInputText.trim()) {
      wx.showToast({
        title: "请输入运动描述",
        icon: "none",
      });
      return;
    }

    this.setData({
      isAiLoading: true,
    });

    aiApi
      .aiChat({ message: this.data.aiInputText, type: EnumAiChatType.EXERCISE })
      .then((res) => {
        const exercises = res.data.message;
        console.log("exercises 🟢🟢🟢", exercises);
        if (exercises.length === 0) {
          wx.showToast({
            title: "未识别到运动",
            icon: "none",
          });
          this.setData({
            isAiLoading: false,
          });
          return;
        }
        const newExerciseList = [...exercises, ...this.data.exerciseList];
        this.setData({
          exerciseList: newExerciseList,
          isAiLoading: false,
          aiInputText: "",
        });
        wx.showToast({
          title: "食物识别完成",
          icon: "success",
        });
      })
      .finally(() => {
        this.setData({
          isAiLoading: false,
        });
      });
  },

  /*
   * 手动添加食物项
   */
  addManualExercise() {
    const newExercise = this.generateExerciseItem("", 0);
    this.setData({
      exerciseList: [...this.data.exerciseList, newExercise],
    });
  },

  /*
   * 生成食物项
   */
  generateExerciseItem(name: string, calories: number): ExerciseItem {
    return {
      id: Date.now().toString() + Math.floor(Math.random() * 1000),
      name,
      calories,
      notes: "",
    };
  },

  /*
   * 食物项字段变化
   */
  onFieldChange(e: WechatMiniprogram.Input) {
    const { index, field } = e.currentTarget.dataset as {
      index: number;
      field: keyof ExerciseItem;
    };
    const { value } = e.detail;
    const newList: ExerciseItem[] = [...this.data.exerciseList];
    const target: any = newList[index];

    if (field === "calories") {
      target[field] = parseFloat(value) || 0;
    } else {
      target[field] = value;
    }
    console.log("onFieldChange index 🟢🟢🟢", index);
    console.log("onFieldChange field 🟢🟢🟢", field);
    console.log("onFieldChange value 🟢🟢🟢", value);
    console.log("onFieldChange newList 🟢🟢🟢", newList);
    this.setData({
      exerciseList: newList,
    });
  },

  /*
   * 删除食物项
   */
  deleteExerciseItem(e: WechatMiniprogram.BaseEvent) {
    const { index } = e.currentTarget.dataset;
    const newList = this.data.exerciseList.filter((_, i) => i !== index);
    this.setData({
      exerciseList: newList,
    });
  },

  // 返回按钮处理
  onBack() {
    // 如果有未保存的食物，提示用户
    if (this.data.exerciseList.length > 0) {
      wx.showModal({
        title: "提示",
        content: "您有未保存的食物记录，确定要返回吗？",
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        },
      });
    } else {
      wx.navigateBack();
    }
  },

  validateExerciseList() {
    const validExerciseList = this.data.exerciseList.filter(
      (exercise) => exercise.name && exercise.calories
    );
    if (validExerciseList.length !== this.data.exerciseList.length) {
      return false;
    }
    return true;
  },

  // 保存按钮处理
  onSave() {
    if (!this.validateExerciseList()) {
      wx.showToast({
        title: "运动名称和热量不能为空",
        icon: "none",
      });
      return;
    }
    const exerciseParams: ExerciseItem[] = this.data.exerciseList.map(
      (item) => {
        return {
          name: item.name,
          calories: item.calories,
          notes: item.notes,
        };
      }
    );

    caloriesApi
      .updateExerciseByDate(this.data.currentDate, exerciseParams)
      .then(() => {
        wx.showToast({
          title: "保存成功",
          icon: "success",
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      })
      .catch((error) => {
        showRequestErrorToast(error, "保存失败，请重试");
      });
  },

  getExerciseByDate() {
    return caloriesApi.getExerciseByDate(this.data.currentDate).then((res) => {
      console.log("getExerciseByDate res 🟢🟢🟢", res);
      const exerciseList = res.data.exercises.map((exercise: any) => {
        return {
          ...exercise,
          note: exercise.notes,
        };
      });
      this.setData({
        exerciseList,
      });
    });
  },

  onLoad(options) {
    const { date } = options;
    console.log("onLoad date 🚀🚀🚀", date);
    const currentDate = dayjs(date).format("YYYY-MM-DD");
    this.setData({
      currentDate: currentDate,
    });

    this.getExerciseByDate();

    const currentDateText = dayjs(currentDate).format("YYYY年MM月DD日");
    wx.setNavigationBarTitle({
      title: ` ${currentDateText}`,
    });
  },
  onShareAppMessage() {
    return {
      path: 'pages/index/index',
      title: '快来记录每日热量吧～',
      imagePath: 'https://wx.qlogo.cn/mmhead/Xmnun9Io49RB3BicJVsFAch4V5aqRkuZbDfffIR6EBia1X5ptBt9AS5P4bYpn5WFrVqkHhzd41M9E/0',
    }
  }
});
