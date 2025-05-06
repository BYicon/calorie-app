// pages/analyze/analyze.ts

interface ChartItem {
  value: number;
  label: string;
  height: string;
}

interface ChartDataSet {
  data: ChartItem[];
  dateRange: string;
}

interface Stats {
  avgCalories: number;
  overLimitDays: number;
  maxCalories: number;
  minCalories: number;
}

interface Analysis {
  insight: string;
  suggestion: string;
}

Page({
  data: {
    period: 'week',
    calorieGoal: 1200,
    chartDataList: [] as ChartDataSet[],
    currentSwiperIndex: 0,
    currentDateRange: '',
    stats: {
      avgCalories: 0,
      overLimitDays: 0,
      maxCalories: 0,
      minCalories: 0
    } as Stats,
    analysis: {
      insight: '',
      suggestion: ''
    } as Analysis
  },

  onLoad() {
    this.loadWeekData();
  },

  // 切换周期
  changePeriod(e: any) {
    const period = e.currentTarget.dataset.period;
    this.setData({ 
      period,
      currentSwiperIndex: 0
    });

    // 根据不同周期加载数据
    switch (period) {
      case 'day':
        this.loadDayData();
        break;
      case 'week':
        this.loadWeekData();
        break;
      case 'month':
        this.loadMonthData();
        break;
      case 'year':
        this.loadYearData();
        break;
    }
  },

  // swiper切换事件
  onSwiperChange(e: any) {
    const currentIndex = e.detail.current;
    
    this.setData({
      currentSwiperIndex: currentIndex,
      currentDateRange: this.data.chartDataList[currentIndex].dateRange
    });
    
    // 更新统计和分析数据
    this.updateStatsAndAnalysis(this.data.chartDataList[currentIndex].data);
  },

  // 加载日视图数据
  loadDayData() {
    // 获取多天的数据用于滑动
    const chartDataList = [
      {
        dateRange: '2023年6月15日 星期四',
        data: [
          { value: 320, label: '早餐' },
          { value: 430, label: '午餐' },
          { value: 380, label: '晚餐' },
          { value: 150, label: '零食' }
        ]
      },
      {
        dateRange: '2023年6月14日 星期三',
        data: [
          { value: 280, label: '早餐' },
          { value: 520, label: '午餐' },
          { value: 420, label: '晚餐' },
          { value: 90, label: '零食' }
        ]
      },
      {
        dateRange: '2023年6月13日 星期二',
        data: [
          { value: 350, label: '早餐' },
          { value: 380, label: '午餐' },
          { value: 450, label: '晚餐' },
          { value: 70, label: '零食' }
        ]
      }
    ];

    this.processChartDataList(chartDataList);
  },

  // 加载周视图数据
  loadWeekData() {
    // 获取多周的数据用于滑动
    const chartDataList = [
      {
        dateRange: '2023年6月12日 - 6月18日',
        data: [
          { value: 1100, label: '周一' },
          { value: 1250, label: '周二' },
          { value: 1450, label: '周三' },
          { value: 1180, label: '周四' },
          { value: 900, label: '周五' },
          { value: 1550, label: '周六' },
          { value: 750, label: '周日' }
        ]
      },
      {
        dateRange: '2023年6月5日 - 6月11日',
        data: [
          { value: 1050, label: '周一' },
          { value: 1200, label: '周二' },
          { value: 1320, label: '周三' },
          { value: 950, label: '周四' },
          { value: 1100, label: '周五' },
          { value: 1400, label: '周六' },
          { value: 880, label: '周日' }
        ]
      },
      {
        dateRange: '2023年5月29日 - 6月4日',
        data: [
          { value: 980, label: '周一' },
          { value: 1150, label: '周二' },
          { value: 1220, label: '周三' },
          { value: 1050, label: '周四' },
          { value: 1300, label: '周五' },
          { value: 1500, label: '周六' },
          { value: 920, label: '周日' }
        ]
      }
    ];

    this.processChartDataList(chartDataList);
  },

  // 加载月视图数据
  loadMonthData() {
    // 获取多月的数据用于滑动
    const chartDataList = [
      {
        dateRange: '2023年6月',
        data: [
          { value: 1150, label: '第1周' },
          { value: 1250, label: '第2周' },
          { value: 1050, label: '第3周' },
          { value: 1320, label: '第4周' }
        ]
      },
      {
        dateRange: '2023年5月',
        data: [
          { value: 1100, label: '第1周' },
          { value: 1180, label: '第2周' },
          { value: 1230, label: '第3周' },
          { value: 1150, label: '第4周' }
        ]
      },
      {
        dateRange: '2023年4月',
        data: [
          { value: 1050, label: '第1周' },
          { value: 1120, label: '第2周' },
          { value: 1300, label: '第3周' },
          { value: 1200, label: '第4周' }
        ]
      }
    ];

    this.processChartDataList(chartDataList);
  },

  // 加载年视图数据
  loadYearData() {
    // 获取多年的数据用于滑动
    const chartDataList = [
      {
        dateRange: '2023年',
        data: [
          { value: 1100, label: '1月' },
          { value: 1050, label: '2月' },
          { value: 1150, label: '3月' },
          { value: 1200, label: '4月' },
          { value: 1250, label: '5月' },
          { value: 1300, label: '6月' },
          { value: 1350, label: '7月' },
          { value: 1400, label: '8月' },
          { value: 1250, label: '9月' },
          { value: 1200, label: '10月' },
          { value: 1150, label: '11月' },
          { value: 1300, label: '12月' }
        ]
      },
      {
        dateRange: '2022年',
        data: [
          { value: 1050, label: '1月' },
          { value: 1100, label: '2月' },
          { value: 1200, label: '3月' },
          { value: 1150, label: '4月' },
          { value: 1300, label: '5月' },
          { value: 1350, label: '6月' },
          { value: 1250, label: '7月' },
          { value: 1300, label: '8月' },
          { value: 1200, label: '9月' },
          { value: 1150, label: '10月' },
          { value: 1100, label: '11月' },
          { value: 1250, label: '12月' }
        ]
      }
    ];

    this.processChartDataList(chartDataList);
  },

  // 处理多组图表数据
  processChartDataList(chartDataList: { dateRange: string, data: { value: number, label: string }[] }[]) {
    // 对每组数据计算柱高
    const processedChartDataList = chartDataList.map(dataSet => {
      const maxValue = Math.max(...dataSet.data.map(item => item.value));
      
      // 计算每个柱子的高度
      const processedData = dataSet.data.map(item => ({
        value: item.value,
        label: item.label,
        height: `${Math.max(5, (item.value / maxValue) * 100)}%`
      }));
      
      return {
        dateRange: dataSet.dateRange,
        data: processedData
      };
    });
    
    this.setData({
      chartDataList: processedChartDataList,
      currentDateRange: processedChartDataList[0].dateRange,
      currentSwiperIndex: 0
    });
    
    // 更新统计和分析
    this.updateStatsAndAnalysis(processedChartDataList[0].data);
  },

  // 更新统计和分析数据
  updateStatsAndAnalysis(chartData: ChartItem[]) {
    // 计算统计数据
    const totalCalories = chartData.reduce((sum, item) => sum + item.value, 0);
    const avgCalories = Math.round(totalCalories / chartData.length);
    const overLimitDays = chartData.filter(item => item.value > this.data.calorieGoal).length;
    const maxCalories = Math.max(...chartData.map(item => item.value));
    const minCalories = Math.min(...chartData.map(item => item.value));

    // 更新统计数据
    this.setData({
      stats: {
        avgCalories,
        overLimitDays,
        maxCalories,
        minCalories
      }
    });

    // 生成智能分析
    this.generateAnalysis(chartData);
  },

  // 生成智能分析
  generateAnalysis(data: ChartItem[]) {
    // 获取超标的日期
    const overLimitDays = data.filter(item => item.value > this.data.calorieGoal);
    
    // 查找摄入量最高和最低的日期
    const maxDay = data.reduce((prev, current) => (prev.value > current.value) ? prev : current);
    const minDay = data.reduce((prev, current) => (prev.value < current.value) ? prev : current);
    
    // 生成分析内容
    let insight = '';
    let suggestion = '';
    
    if (overLimitDays.length > 0) {
      const overDayLabels = overLimitDays.map(day => day.label).join('和');
      insight = `您在${overDayLabels}摄入超过目标卡路里。${maxDay.label}的摄入量尤其高，建议检查这些天的饮食记录，找出可能的原因。整体而言，${minDay.label}控制得最好，可以参考这天的食物选择。`;
      
      suggestion = `考虑在高热量摄入的日子准备健康餐点，避免外出就餐导致的高热量摄入。保持${minDay.label}的良好习惯，多摄入蛋白质食物和蔬菜，减少加工食品的比例。`;
    } else {
      insight = `您的热量摄入控制良好，所有时间段都在目标范围内。${maxDay.label}的摄入量相对较高，${minDay.label}的摄入量最低。`;
      
      suggestion = `继续保持良好的饮食习惯，确保摄入足够的营养物质。可以适当增加一些健康的零食，如水果、坚果等，保持能量水平。`;
    }
    
    this.setData({
      'analysis.insight': insight,
      'analysis.suggestion': suggestion
    });
  }
}); 