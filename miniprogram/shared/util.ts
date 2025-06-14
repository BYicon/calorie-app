import dayjs from "dayjs";

export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}

/**
 * 解析url参数
 * @param obj 
 * @returns 
 */
export const queryParams = (obj: any) => {
  return Object.entries(obj).map(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return '';
    }
    if (typeof value === 'string') {
      return `${key}=${encodeURIComponent(value)}`;
    }
    return `${key}=${value}`;
  }).join('&');
}

/**
 * 根据日期获取当前月的第一天和最后一天 返回时间戳(日历控件的最大最小时间，格式是时间戳timestamp)
 * @param date 日期
 * @returns { firstDay: timestamp, lastDay: timestamp }
 */
export const getMonthFirstAndLastDay = (date: Date): { firstDay: number, lastDay: number } => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getTime();
  const lastDay = new Date(year, month + 1, 0).getTime();
  return { firstDay, lastDay };
}


const WEEK_DAY_MAP = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
}

/**
 * 将日期转为 'YYYY年MM月DD日 周几'
 * @param date 日期
 * @returns 
 */
export const formatLocaleDate = (date: Date) => {
  const weekDay = date.getDay()
  return `${date.getMonth() + 1}月${date.getDate()}日 ${WEEK_DAY_MAP[weekDay as keyof typeof WEEK_DAY_MAP]}`
}

/**
 * 获取最近days天日期，返回startDate和endDate
 * @param days 天数
 * @returns 
 */
export const getRecentDays = (days: number) => {
  const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
  const endDate = new Date(Date.now());
  return { startDate: dayjs(startDate).format('YYYY-MM-DD'), endDate: dayjs(endDate).format('YYYY-MM-DD') };
}


/**
 * 节流函数
 * @param func 函数
 * @param delay 延迟时间
 * @returns 
 */
export const throttle = (func: Function, delay: number) => {
  let timer: any = null;
  return (...args: any[]) => {
    if (!timer) {
      timer = setTimeout(() => {
        func.apply(this, args);
        timer = null;
      }, delay);
    }
  }
}