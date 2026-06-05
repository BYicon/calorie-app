import * as CaloriesApi from "../../api/calories";
import dayjs from "dayjs";

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
    isLoading: true,
    summarySkeletonList: [1, 2, 3, 4],
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
    'timestamp': function(timestamp: number) {
      if (timestamp) {
        (this as any).skipNextShowRefresh = true;
        this.getDailyStats();
      }
    }
  },
  pageLifetimes: {
    show: function () {
      if (!this.data.timestamp) {
        return;
      }

      if ((this as any).skipNextShowRefresh) {
        (this as any).skipNextShowRefresh = false;
        return;
      }

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
  /**
   * 组件的方法列表
   */
  methods: {
    getDailyStats() {
      const requestId = `${this.data.timestamp}-${Date.now()}`;
      (this as any).latestRequestId = requestId;

      this.setData({
        isLoading: true,
      });

      CaloriesApi.getDailyStats(
        dayjs(this.data.timestamp).format("YYYY-MM-DD")
      ).then((res) => {
        if ((this as any).latestRequestId !== requestId) {
          return;
        }

        const data = res.data;
        data.remainingCalories = data.targetCalories - data.netCalories;
        this.setData({
          dailyStats: data,
          isLoading: false,
        });
      }).catch(() => {
        if ((this as any).latestRequestId !== requestId) {
          return;
        }

        this.setData({
          isLoading: false,
        });
      });
    }
  },
});
