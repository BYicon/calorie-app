// pages/analyze/analyze.ts

import dayjs from "dayjs";

interface ChartItem {
  value: number;
  label: string;
  height: string;
  showLabel: boolean;
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
    period: 'day7',
    calorieGoal: 1200,
    currentDateRange: '',
    chartData: [] as ChartItem[],
    selectedIndex: -1,
    selectedBar: {
      label: '',
      value: 0
    },
    tooltipLeft: 0,
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
    this.loadDayData(7);
    wx.showToast({
      title: '开发中，敬请期待',
      icon: 'none',
      duration: 10000000
    });
  },

  // 切换周期
  changePeriod(e: any) {
    const period = e.currentTarget.dataset.period;
    const days = parseInt(e.currentTarget.dataset.days);
    this.setData({ 
      period,
      selectedIndex: -1 // 重置选中状态
    });

    this.loadDayData(days);
  },

  // 生成模拟热量数据
  generateMockCalorieData(): number {
    // 生成800-1600之间的随机热量值，大部分在目标范围内
    const random = Math.random();
    if (random < 0.7) {
      // 70%的数据在目标范围内 (800-1200)
      return Math.floor(Math.random() * 400) + 800;
    } else if (random < 0.9) {
      // 20%的数据稍微超标 (1200-1400)
      return Math.floor(Math.random() * 200) + 1200;
    } else {
      // 10%的数据明显超标 (1400-1600)
      return Math.floor(Math.random() * 200) + 1400;
    }
  },

  // 加载日视图数据
  loadDayData(days: number) {
    const currentDate = dayjs();
    const startDate = currentDate.subtract(days - 1, 'day');
    
    // 生成日期范围字符串
    const dateRange = `${startDate.format('MM/DD')} - ${currentDate.format('MM/DD')}`;

    const chartData: ChartItem[] = [];
    
    // 生成模拟数据
    for (let i = days - 1; i >= 0; i--) {
      const date = currentDate.subtract(i, 'day');
      let label: string;
      
      // 根据天数决定标签格式
      if (days <= 7) {
        label = date.format('MM/DD');
      } else if (days <= 30) {
        label = date.format('MM/DD');
      } else {
        label = date.format('MM/DD');
      }

      const value = this.generateMockCalorieData();
      
      chartData.push({
        value,
        label,
        height: '0%', // 初始高度，后面会计算
        showLabel: this.shouldShowLabel(days - 1 - i, days) // 计算是否显示标签
      });
    }

    // 使用定时器模拟数据加载动画
    setTimeout(() => {
      this.processChartData(chartData, dateRange);
    }, 300);
  },

  // 判断是否应该显示标签
  shouldShowLabel(index: number, totalDays: number): boolean {
    if (totalDays <= 7) {
      // 7天及以下，显示所有标签
      return true;
    } else if (totalDays <= 30) {
      // 30天，每2个显示一个
      return index % 2 === 0;
    } else {
      // 90天，只显示几个关键时间点：开始、1/4、1/2、3/4、结束
      const keyPoints = [0, Math.floor(totalDays / 4), Math.floor(totalDays / 2), Math.floor(totalDays * 3 / 4), totalDays - 1];
      return keyPoints.includes(index);
    }
  },

  // 图表触摸移动事件
  onChartTouchMove(e: any) {
    const touch = e.touches[0];
    const query = this.createSelectorQuery();
    
    query.select('.chart-bars').boundingClientRect((rect: any) => {
      if (!rect) return;
      
      const relativeX = touch.clientX - rect.left;
      const barWidth = rect.width / this.data.chartData.length;
      const index = Math.floor(relativeX / barWidth);
      
      if (index >= 0 && index < this.data.chartData.length) {
        const selectedBar = this.data.chartData[index];
        const tooltipLeft = rect.left + (index + 0.5) * barWidth;
        
        this.setData({
          selectedIndex: index,
          selectedBar: {
            label: selectedBar.label,
            value: selectedBar.value
          },
          tooltipLeft: tooltipLeft - rect.left
        });
      }
    }).exec();
  },

  // 图表触摸结束事件
  onChartTouchEnd() {
    setTimeout(() => {
      this.setData({
        selectedIndex: -1,
        tooltipLeft: 0
      });
    }, 1000); // 1秒后隐藏提示
  },

  // 处理图表数据
  processChartData(chartData: ChartItem[], dateRange: string) {
    // 计算最大值，用于计算柱子高度
    const maxValue = Math.max(...chartData.map(item => item.value));
    const minValue = Math.min(...chartData.map(item => item.value));
    
    // 计算每个柱子的高度（相对于最大值的百分比）
    const processedData = chartData.map(item => ({
      value: item.value,
      label: item.label,
      height: `${Math.max(10, (item.value / maxValue) * 80)}%`, // 最小10%，最大80%
      showLabel: item.showLabel
    }));
    
    this.setData({
      chartData: processedData,
      currentDateRange: dateRange
    });
    
    // 更新统计和分析
    this.updateStatsAndAnalysis(processedData);
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
    const { calorieGoal } = this.data;
    const overLimitDays = data.filter(item => item.value > calorieGoal);
    const totalDays = data.length;
    const avgCalories = Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length);
    
    // 查找摄入量最高和最低的日期
    const maxDay = data.reduce((prev, current) => (prev.value > current.value) ? prev : current);
    const minDay = data.reduce((prev, current) => (prev.value < current.value) ? prev : current);
    
    // 生成分析内容
    let insight = '';
    let suggestion = '';
    
    if (overLimitDays.length > 0) {
      const overRate = Math.round((overLimitDays.length / totalDays) * 100);
      insight = `在过去${totalDays}天中，您有${overLimitDays.length}天超过目标热量（${overRate}%）。平均每日摄入${avgCalories}千卡，${maxDay.label}摄入最高（${maxDay.value}千卡），${minDay.label}控制最好（${minDay.value}千卡）。`;
      
      if (overRate > 30) {
        suggestion = `超标天数较多，建议：1) 减少高热量食物摄入；2) 增加蔬菜和蛋白质比例；3) 控制零食和饮料；4) 规律三餐时间。`;
      } else {
        suggestion = `整体控制良好，继续保持。建议参考${minDay.label}的饮食习惯，在超标日子适当调整食物选择。`;
      }
    } else {
      insight = `恭喜！过去${totalDays}天的热量摄入都在目标范围内。平均每日摄入${avgCalories}千卡，${maxDay.label}摄入相对较高（${maxDay.value}千卡），${minDay.label}摄入最低（${minDay.value}千卡）。`;
      
      suggestion = `继续保持良好的饮食习惯！可以适当增加一些健康零食如坚果、水果，确保营养均衡。注意不要过度限制热量摄入。`;
    }
    
    this.setData({
      'analysis.insight': insight,
      'analysis.suggestion': suggestion
    });
  }
}); 