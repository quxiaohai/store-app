/**
 * //返回时间
 */
import calendar from 'lib/util/calendar'

export default function (v, showYear = false) {
  let day = calendar.getCompareDateDay(v, calendar.getDate());

  const hour = day * 24;
  const minute = hour * 60;

  if (minute < 1) {
    return '刚刚';
  } else if (hour < 1) {
    return parseInt(minute) + '分钟前';
  } else if (day < 1) {
    return parseInt(hour) + '小时前';
  } else if (day < 30) {
    return parseInt(day) + '天前';
  } else if (day < 360) {
    return parseInt(day / 30) + '月前';
  } else if (showYear) {
    return parseInt(day / 360) + '年前';
  }

  return calendar.format(v, 'yyyy-MM-dd HH:mm');
}
