import { getRecentDays } from '../../shared/index';
import * as CaloriesApi from '../../api/calories';
import { getCalorieTargetFromStorage } from '../../shared/helper';
import dayjs from 'dayjs';
import * as echarts from '../../vendor/echarts.min';

const DEFAULT_PRESET_KEY = '7d';

interface PresetPeriod {
  key: string;
  days: number;
  label: string;
}

interface Stats {
  averageDailyIntake: number;
  overStandardDays: number;
  highestIntake: number;
  lowestIntake: number;
}

interface TrendSummary {
  totalIntake: number;
  totalBurned: number;
  averageNetCalories: number;
  recordRate: number;
  totalDays: number;
  recordedDays: number;
}

interface DailyStatsData {
  date: string;
  intakeCalories: number;
  burnedCalories: number;
  netCalories: number;
}

interface DateRangeStatsResponse extends Stats {
  startDate: string;
  endDate: string;
  dailyStats: DailyStatsData[];
  totalDays: number;
  recordedDays: number;
}

interface DailyTrendPoint {
  date: string;
  label: string;
  intakeCalories: number | null;
  burnedCalories: number | null;
  netCalories: number | null;
  hasRecord: boolean;
}

let trendChart: any = null;
let pendingTrendOption: any = null;

const applyTrendOption = (option: any) => {
  pendingTrendOption = option;
  if (trendChart) {
    trendChart.setOption(option, true);
  }
};

function initTrendChart(canvas: any, width: number, height: number, dpr: number) {
  trendChart = echarts.init(canvas, null, {
    width,
    height,
    devicePixelRatio: dpr,
  });
  canvas.setChart(trendChart);

  if (pendingTrendOption) {
    trendChart.setOption(pendingTrendOption, true);
  }

  return trendChart;
}

const formatRangeLabel = (startDate: string, endDate: string) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (start.isSame(end, 'day')) {
    return start.format('YYYY.MM.DD');
  }

  if (start.year() === end.year()) {
    return `${start.format('MM.DD')} - ${end.format('MM.DD')}`;
  }

  return `${start.format('YYYY.MM.DD')} - ${end.format('YYYY.MM.DD')}`;
};

const buildTrendPoints = (dailyStats: DailyStatsData[]) => {
  return [...dailyStats]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item): DailyTrendPoint => ({
      date: item.date,
      label: dayjs(item.date).format('MM/DD'),
      intakeCalories: item.intakeCalories,
      burnedCalories: item.burnedCalories,
      netCalories: item.netCalories,
      hasRecord: true,
    }));
};

const buildTrendSummary = (data: DateRangeStatsResponse): TrendSummary => {
  const totals = data.dailyStats.reduce((result, item) => {
    result.totalIntake += item.intakeCalories;
    result.totalBurned += item.burnedCalories;
    result.totalNet += item.netCalories;
    return result;
  }, {
    totalIntake: 0,
    totalBurned: 0,
    totalNet: 0,
  });

  const totalDays = data.totalDays || 0;
  const recordedDays = data.recordedDays || 0;

  return {
    totalIntake: totals.totalIntake,
    totalBurned: totals.totalBurned,
    averageNetCalories: recordedDays > 0 ? Math.round(totals.totalNet / recordedDays) : 0,
    recordRate: totalDays > 0 ? Math.round((recordedDays / totalDays) * 100) : 0,
    totalDays,
    recordedDays,
  };
};

const formatTooltipValue = (value: number | null) => {
  return value === null ? '未记录' : `${value} 千卡`;
};

const buildTrendOption = (points: DailyTrendPoint[], calorieTarget: number) => {
  const pointMap = new Map(points.map((item) => [item.date, item]));
  const intakeValues = points.map((item) => [item.date, item.intakeCalories]);
  const burnedValues = points.map((item) => [item.date, item.burnedCalories]);
  const hasData = points.some((item) => item.hasRecord);
  const isCrossYear = points.length > 1 && dayjs(points[0].date).year() !== dayjs(points[points.length - 1].date).year();
  const axisDateFormat = isCrossYear ? 'YY/MM/DD' : 'MM/DD';
  const showSymbols = points.length > 0 && points.length <= 60;

  return {
    animation: true,
    color: ['#FF7A59', '#2FBF8F'],
    grid: {
      left: 24,
      right: 20,
      top: 48,
      bottom: 24,
      containLabel: true,
    },
    legend: {
      top: 0,
      left: 'center',
      itemWidth: 14,
      itemHeight: 8,
      itemGap: 20,
      textStyle: {
        color: '#7E6259',
        fontSize: 11,
      },
    },
    tooltip: {
      trigger: 'axis',
      confine: true,
      renderMode: 'richText',
      backgroundColor: 'rgba(46, 33, 29, 0.92)',
      borderWidth: 0,
      padding: [10, 12],
      textStyle: {
        color: '#FFF7F3',
        fontSize: 12,
        lineHeight: 18,
      },
      formatter: (params: any) => {
        const items = Array.isArray(params) ? params : [params];
        const axisValue = items.length > 0 ? (Array.isArray(items[0].value) ? items[0].value[0] : items[0].axisValue) : '';
        const point = pointMap.get(dayjs(axisValue).format('YYYY-MM-DD'));

        if (!point) {
          return '';
        }

        return [
          dayjs(point.date).format('YYYY年MM月DD日'),
          `摄入：${formatTooltipValue(point.intakeCalories)}`,
          `消耗：${formatTooltipValue(point.burnedCalories)}`,
          `净摄入：${formatTooltipValue(point.netCalories)}`,
        ].join('\n');
      },
    },
    xAxis: {
      type: 'time',
      boundaryGap: false,
      minInterval: 24 * 60 * 60 * 1000,
      splitNumber: 5,
      axisTick: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: '#E5CEC6',
        },
      },
      axisLabel: {
        color: '#9C7D74',
        fontSize: 10,
        hideOverlap: true,
        formatter: (value: number) => dayjs(value).format(axisDateFormat),
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      splitNumber: 4,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#9C7D74',
        fontSize: 10,
      },
      splitLine: {
        lineStyle: {
          color: '#F4E1DB',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: '摄入',
        type: 'line',
        smooth: 0.35,
        smoothMonotone: 'x',
        connectNulls: false,
        data: intakeValues,
        showSymbol: showSymbols,
        showAllSymbol: showSymbols,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: '#FF7A59',
        },
        itemStyle: {
          color: '#FF7A59',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 122, 89, 0.28)' },
            { offset: 1, color: 'rgba(255, 122, 89, 0.03)' },
          ]),
        },
        markLine: {
          symbol: 'none',
          label: {
            formatter: `目标${calorieTarget}千卡`,
            color: '#D66A4B',
            backgroundColor: 'rgba(255, 247, 243, 0.96)',
            padding: [4, 8],
            borderRadius: 12,
            position: 'insideEndTop',
            distance: 8,
          },
          lineStyle: {
            color: '#FFB49B',
            type: 'dashed',
            width: 1.5,
          },
          data: [{ yAxis: calorieTarget }],
        },
      },
      {
        name: '消耗',
        type: 'line',
        smooth: 0.35,
        smoothMonotone: 'x',
        connectNulls: false,
        data: burnedValues,
        showSymbol: showSymbols,
        showAllSymbol: showSymbols,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2.5,
          color: '#2FBF8F',
        },
        itemStyle: {
          color: '#2FBF8F',
        },
      },
    ],
    graphic: hasData ? [] : [{
      type: 'text',
      left: 'center',
      top: 'middle',
      silent: true,
      style: {
        text: '所选区间暂无记录',
        fill: '#A7857A',
        fontSize: 14,
        fontWeight: 500,
      },
    }],
  };
};

Page({
  data: {
    echarts,
    ec: {
      onInit: initTrendChart,
    },
    calorieTarget: getCalorieTargetFromStorage(),
    periodList: [
      { key: '7d', days: 7, label: '7天' },
      { key: '30d', days: 30, label: '30天' },
      { key: '90d', days: 90, label: '90天' },
      { key: '365d', days: 365, label: '365天' },
    ] as PresetPeriod[],
    selectedRangeKey: DEFAULT_PRESET_KEY,
    currentDateRange: '',
    isLoadingTrend: false,
    trendSummary: {
      totalIntake: 0,
      totalBurned: 0,
      averageNetCalories: 0,
      recordRate: 0,
      totalDays: 0,
      recordedDays: 0,
    } as TrendSummary,
    stats: {
      averageDailyIntake: 0,
      overStandardDays: 0,
      highestIntake: 0,
      lowestIntake: 0,
    } as Stats,
  },

  onLoad() {},

  onShow() {
    this.setData({
      calorieTarget: getCalorieTargetFromStorage(),
    }, () => {
      this.refreshCurrentRange();
    });
  },

  onUnload() {
    if (trendChart) {
      trendChart.dispose();
      trendChart = null;
    }
    pendingTrendOption = null;
  },

  refreshCurrentRange() {
    const currentPreset = (this.data.periodList as PresetPeriod[]).find((item) => item.key === this.data.selectedRangeKey)
      || (this.data.periodList as PresetPeriod[])[0];

    this.loadPresetRange(currentPreset.days, currentPreset.key);
  },

  changePeriod(e: any) {
    const days = Number(e.currentTarget.dataset.days);
    const key = e.currentTarget.dataset.key as string;

    if (!days || !key) {
      return;
    }

    this.loadPresetRange(days, key);
  },

  loadPresetRange(days: number, key: string) {
    const { startDate, endDate } = getRecentDays(days);
    this.loadRangeData(startDate, endDate, key);
  },

  loadRangeData(startDate: string, endDate: string, rangeKey: string) {
    this.setData({
      isLoadingTrend: true,
      selectedRangeKey: rangeKey,
      currentDateRange: formatRangeLabel(startDate, endDate),
    });

    CaloriesApi.getDateRangeStats(startDate, endDate).then((res) => {
      const data = res.data as DateRangeStatsResponse;
      const trendPoints = buildTrendPoints(data.dailyStats || []);
      const trendSummary = buildTrendSummary(data);

      this.setData({
        currentDateRange: formatRangeLabel(data.startDate || startDate, data.endDate || endDate),
        trendSummary,
        stats: {
          averageDailyIntake: data.averageDailyIntake || 0,
          overStandardDays: data.overStandardDays || 0,
          highestIntake: data.highestIntake || 0,
          lowestIntake: data.lowestIntake || 0,
        },
      });

      applyTrendOption(buildTrendOption(trendPoints, this.data.calorieTarget));
    }).finally(() => {
      this.setData({
        isLoadingTrend: false,
      });
    });
  },

  onShareAppMessage() {
    return {
      path: 'pages/index/index',
      title: '快来记录每日热量吧～',
      imagePath: 'https://wx.qlogo.cn/mmhead/Xmnun9Io49RB3BicJVsFAch4V5aqRkuZbDfffIR6EBia1X5ptBt9AS5P4bYpn5WFrVqkHhzd41M9E/0',
    };
  },
});
