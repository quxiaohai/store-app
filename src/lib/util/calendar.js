/**
 * 日期操作工具
 * by 璩
 */
import formatDate from './formatDate';

export default {
    getDate() {
        return new Date();
    },
    /**********
     * 将字符串转成日期
     * @param date
     */
    parse(date) {
        if (date instanceof Date) {
            return date;
        }
        return new Date(this.format(date).replace(/\-/g, '/'));
    },
    /******************
     * 将日期转成字符串
     * @param date
     * @param format
     * @returns {*}
     */
    format(date, format) {
        return formatDate(date, format);
    },
    /******************
     * 返回时间戳, 北京时间
     * @type {that.now}
     */
    now(date) {
        date = !!date ? this.parse(date) : this.getDate();
        // const offsetTime = (0 - date.getTimezoneOffset() / 60) * 60 * 60 * 1000;
        // return Date.parse(date.toUTCString()) + offsetTime;
        return date.getTime();
    },
    /**********
     * 返回当前星期
     * @param date
     */
    getWeek(date) {
        let week = ['日', '一', '二', '三', '四', '五', '六'];
        let day = this.parse(date).getDay();
        return week[day];
    },
    /**************
     *返回当月天数
     * @param year
     * @param month
     * @returns {number}
     */
    getMonthDay(year, month) {
        if (year instanceof Date) {
            month = year.getMonth();
            year = year.getFullYear();
        }
        const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (0 === year % 4 && (0 !== year % 100 || 0 === year % 400) && month === 1) {
            return 29;
        } else {
            return months[month];
        }
    },
    /********************
     * 返回一个日期向前或向后多少天的新日期
     * @param date
     * @param value
     */
    getOffsetDate(date, value) {
        let time = value * 24 * 3600 * 1000;
        let newTime = this.now(date) + time;
        return this.parse(newTime);
    },
    /********************
     * 返回一个日期向前或向后多少小时的新日期
     * @param date
     * @param value
     */
    getOffsetHour(date, value) {
        let time = value * 3600 * 1000;
        let newTime = this.now(date) + time;
        return this.parse(newTime);
    },
    /*******
     * 返回当前日期的第一天
     * @param date
     */
    getCurDateFirst(date) {
        date = this.parse(date);
        let day = date.getDate();
        return this.getOffsetDate(date, -day + 1);
    },
    /**********
     * 返回当前日期的上一月的第一天
     * @param date
     */
    getPrevDateFirst(date) {
        let prevDate = this.getPrevDateLast(date);
        let day = this.getMonthDay(prevDate);
        return this.getOffsetDate(prevDate, -day + 1);
    },
    /**********
     * 返回当前日期的上一月的最后一天
     * @param date
     */
    getPrevDateLast(date) {
        date = this.parse(date);
        let day = date.getDate();
        return this.getOffsetDate(date, -day);
    },
    /**********
     * 返回当前日期的下一月的第一天
     * @param date
     */
    getNextDateFirst(date) {
        date = this.parse(date);
        let day = this.getMonthDay(date) - date.getDate();
        return this.getOffsetDate(date, day + 1);
    },
    /**********
     * 返回当前日期的下一月的最后一天
     * @param date
     */
    getNextDateLast(date) {
        let nextDate = this.getNextDateFirst(date);
        let day = this.getMonthDay(nextDate);
        return this.getOffsetDate(nextDate, day - 1);
    },
    /*****************
     * 比较两个日期相差多少天
     * @param date1
     * @param date2
     * @returns {number}
     */
    getCompareDateDay(date1, date2) {
        var time1 = this.now(date1);
        var time2 = this.now(date2);
        return (time2 - time1) / (1000 * 3600 * 24);
    },
    /*****************
     * 比较两个日期相差值
     * @param date1
     * @param date2
     * @returns {number}
     */
    getCompareDateTimestamp(date1, date2) {
        var time1 = this.now(date1);
        var time2 = this.now(date2);
        return time2 - time1;
    },
    /****************
     * 比较两个时间相差多少天
     * @param time1
     * @param time2
     * @returns {number}
     */
    getCompareTimeDay(time1, time2) {
        let date = this.format(this.getDate(), 'yyyy-MM-dd');
        return this.getCompareDateDay(date + ' ' + time1, date + ' ' + time2);
    },
    /***********
     * 返回一个日期向前或向后多少天的新日期字符串
     * @param date
     * @param value
     * @param format
     * @returns {*}
     */
    getOffsetDateStr(date, value, format) {
        return this.format(this.getOffsetDate(date, value), format || 'yyyy-MM-dd');
    },
    /*************
     * 判断是不是今天
     * @param date
     */
    isToday(date) {
        return this.format(date, 'yyyyMMdd') === this.format(this.getDate(), 'yyyyMMdd');
    },
    /*************
     * 判断是不是明天
     * @param date
     */
    isTomorrow(date) {
        return this.format(date, 'yyyyMMdd') === this.getOffsetDateStr(this.getDate(), 1, 'yyyyMMdd');
    },
    /*************
     * 判断是不是后天
     * @param date
     */
    isAfterTomorrow(date) {
        return this.format(date, 'yyyyMMdd') === this.getOffsetDateStr(this.getDate(), 2, 'yyyyMMdd');
    },
    /*************
     * 判断是不是昨天
     * @param date
     */
    isYesterday(date) {
        return this.format(date, 'yyyyMMdd') === this.getOffsetDateStr(this.getDate(), -1, 'yyyyMMdd');
    },
    /**
     * @param {*} date 被比较的时间 yyyy-MM-dd
     * @param {*} startTime 开始时间 yyyy-MM-dd
     * @param {*} endTime 结束时间 yyyy-MM-dd
     * @param {*} disabledDateList 不可用时间列表 ['yyyy-MM-dd', 'yyyy-MM-dd']
     * @returns
     */
    isDateDisable(date, startTime, endTime, disabledDateList = []) {
        const start = this.getCompareDateTimestamp(date, startTime);
        const end = this.getCompareDateTimestamp(date, endTime);
        // 小于开始时间 || 大于结束时间 || 包含在禁止时间内
        return start > 0 || end < 0 || disabledDateList.some((item) => item === date);
    }
};
