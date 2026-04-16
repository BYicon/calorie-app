import * as CaloriesApi from "../../api/calories";
import dayjs from "dayjs";
import { throttle } from "../../shared/util";

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    timestamp: {
      type: Number,
      value: 0,
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    dailyStats: {
      targetCalories: 0,
      intakeCalories: 0,
      burnedCalories: 0,
      netCalories: 0,
      remainingCalories: 0,
      goalProgress: 0,
    },
  },
  observers: {
    'timestamp': function() {
      // 在 numberA 或者 numberB 被设置时，执行这个函数
      this.getDailyStatsThrottled();
    }
  },
  pageLifetimes: {
    show: function () {
      if (this.data.timestamp) {
        this.getDailyStats();
      }
      // 页面被展示
    },
    hide: function () {
      // 页面被隐藏
    },
    resize: function () {
      // 页面尺寸变化
    },
  },
  lifetimes: {
    attached() {
      if (this.data.timestamp) {
        this.getDailyStatsThrottled();
      }
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getDailyStats() {
      CaloriesApi.getDailyStats(
        dayjs(this.data.timestamp).format("YYYY-MM-DD")
      ).then((res) => {
        console.log("组件内 getDailyStats 🚀🚀🚀", res);
        const data = res.data;
        data.remainingCalories = data.targetCalories - data.netCalories;
        this.setData({
          dailyStats: data,
        });
      });
    },
    getDailyStatsThrottled() {
      throttle(this.getDailyStats, 1000);
    }
  },
});
