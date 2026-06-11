/**
 * //返回时间
 */
import calendar from 'lib/util/calendar'

export default function (v) {

  const now = calendar.getDate();
  const tDate = calendar.format(v, 'yyyy-MM-dd');
  const nDate = calendar.format(now, 'yyyy-MM-dd');

  const date = calendar.format(v, 'yyyy-MM-dd HH:mm');
  let rs = calendar.format(v, 'MM-dd HH:mm');
  const time = calendar.format(v, 'HH:mm');

  if (tDate === nDate) {
    rs = time;
  } else if (calendar.format(v, 'yyyy') !== calendar.format(now, 'yyyy')) {
    rs = date;
  }

  return rs;
}
