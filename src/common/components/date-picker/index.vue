<template>
    <div @click="handleShow">
        <slot />
        <popup :option="option" v-model="visible">
            <div class="picker-box">
                <div class="picker-title flex-between">
                    <span class="cancel" @click="handleCancel">取消</span>
                    <span class="title" v-if="title">{{ title }}</span>
                    <span class="ok" @click="handleOk">确定</span>
                </div>
                <div class="picker-content flex-center">
                    <div
                        @touchstart="onTouchStart($event, index)"
                        @touchmove.stop.prevent="onTouchMove($event, index)"
                        @touchend="onTouchEnd($event, index)"
                        class="picker-move"
                        v-for="(item, index) in pickerList"
                        :key="index"
                    >
                        <ul class="picker-items scrolling" :style="getPickerStyle(index)">
                            <li class="picker-item" v-for="child in item" :key="child.value">{{ child.label }}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </popup>
    </div>
</template>

<script>
import { px2px } from 'lib/util/viewport';
import calendar from 'lib/util/calendar';

export default {
    name: 'picker',
    props: {
        /****
         * 格式为YYYY-MM-DD
         */
        modelValue: [Number, String, Array],
        // 选择器的标题
        title: String,
        // 当 range 是一个 Object Array 时，通过 range-key 来指定 Object 中 key 的值作为选择器显示内容
        rangeKey: {
            type: String,
            default: 'label'
        },
        // 当 range 是一个 Object Array 时，通过 range-id 来指定 Object 中 id 的值作为传输值
        rangeId: {
            type: String,
            default: 'value'
        },
        // 选择器类型	selector|multiSelector|time|date
        mode: {
            type: String,
            default: 'selector'
        },
        /****
         * mode 为 date 时：表示有效日期范围的开始，字符串格式为"YYYY-MM-DD"
         */
        start: String,
        /****
         * mode 为 date 时：表示有效日期范围的结束，字符串格式为"YYYY-MM-DD"
         */
        end: String,
        defaultDate: {
            type: String,
            default: ''
        },
        // mode 为 date 时有效：有效值 year,month,day，表示选择器的粒度
        fields: {
            type: String,
            default: 'day'
        },
        // 是否禁用
        disabled: {
            type: Boolean,
            default: false
        },
        /**
         * 被禁用的日期
         */
        disabledValue: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    data() {
        return {
            visible: false,
            option: {
                autoHide: true,
                animate: {
                    name: 'bottom'
                },
                left: 0,
                bottom: 0
            },
            tops: [0, 0, 0],
            time: 0,
            lineHeight: Math.floor(px2px(98)),
            value: []
        };
    },
    emits: ['update:modelValue', 'change', 'ok', 'cancel', 'dateShow'],
    computed: {
        enableStartDate() {
            if (this.disabledValue.some((item) => item === this.start)) {
                return this.getEnableStartDate(this.start);
            }
            return this.start;
        },
        pickerList() {
            let year = [],
                month = [],
                day = [];
            if (!this.enableStartDate || !this.end) {
                return [year, month, day];
            }
            const { year: minYear, month: minMonth, date: minDate } = this.getBoundary(this.enableStartDate);
            const { year: maxYear, month: maxMonth, date: maxDate } = this.getBoundary(this.end);

            const range = {
                minYear,
                minMonth,
                minDate,
                maxYear,
                maxMonth,
                maxDate
            };

            // 选中年为最小年及最大年
            if (this.value[0] === minYear && this.value[0] === maxYear) {
                range.minMonth = minMonth;
                range.maxMonth = maxMonth;
                if (this.value[1] === minMonth && this.value[1] === maxMonth) {
                    range.minDate = minDate;
                    range.maxDate = maxDate;
                } else if (this.value[1] === minMonth) {
                    range.minDate = minDate;
                    range.maxDate = calendar.getMonthDay(minYear, minMonth - 1);
                } else if (this.value[1] === maxMonth) {
                    range.minDate = 1;
                    range.maxDate = maxDate;
                } else {
                    range.minDate = 1;
                    range.maxDate = calendar.getMonthDay(minYear, this.value[1] - 1);
                }
            } else if (this.value[0] === minYear) {
                // 选中年为最小年
                range.minMonth = minMonth;
                range.maxMonth = 12;
                if (this.value[1] === minMonth) {
                    range.minDate = minDate;
                    range.maxDate = calendar.getMonthDay(minYear, minMonth - 1);
                } else {
                    range.minDate = 1;
                    range.maxDate = calendar.getMonthDay(minYear, this.value[1] - 1);
                }
            } else if (this.value[0] === maxYear) {
                // 选中年为最大年
                range.minMonth = 1;
                range.maxMonth = maxMonth;
                if (this.value[1] === maxMonth) {
                    range.minDate = 1;
                    range.maxDate = Math.min(maxDate, calendar.getMonthDay(maxYear, maxMonth - 1));
                } else {
                    range.minDate = 1;
                    range.maxDate = calendar.getMonthDay(maxYear, this.value[1] - 1);
                }
            } else {
                // 选中年为其他年份
                range.minMonth = 1;
                range.maxMonth = 12;
                range.minDate = 1;
                range.maxDate = calendar.getMonthDay(this.value[0], this.value[1] - 1);
            }

            for (let i = range.minYear; i <= range.maxYear; i++) {
                if (!(this.fields === 'year' && this.disabledValue.includes(i + ''))) {
                    year.push({ value: i, label: `${i}年` });
                }
            }

            if (this.fields !== 'year') {
                // 不可用月份
                const disabledMonth =
                    this.fields === 'month'
                        ? this.disabledValue
                              .filter((item) => item.includes(this.value[0]))
                              ?.map((item) => Number(calendar.format(item, 'MM')))
                        : [];

                // 当前选中月的天数
                const curMonthDay = calendar.getMonthDay(this.value[0], this.value[1] - 1);
                for (let i = range.minMonth; i <= range.maxMonth; i++) {
                    // 判断当前日期是否全部不可用
                    const disabledDay = this.disabledValue
                        .filter((item) => item.includes(`${this.value[0]}-${this.getTwoNum(i)}`))
                        ?.map((item) => Number(calendar.format(item, 'dd')));
                    if (!(disabledMonth.includes(i) || disabledDay.length === curMonthDay)) {
                        const val = i < 10 ? `0${i}` : i;
                        month.push({ value: Number(val), label: `${val}月` });
                    }
                }
            }

            if (this.fields === 'day') {
                const disabledDay = this.disabledValue
                    .filter((item) => item.includes(`${this.value[0]}-${this.getTwoNum(this.value[1])}`))
                    ?.map((item) => Number(calendar.format(item, 'dd')));

                for (let i = range.minDate; i <= range.maxDate; i++) {
                    if (!disabledDay.includes(i)) {
                        const val = i < 10 ? `0${i}` : i;
                        day.push({ value: Number(val), label: `${val}日` });
                    }
                }

                return [year, month, day];
            } else if (this.fields === 'month') {
                return [year, month];
            } else if (this.fields === 'year') {
                return [year];
            }

            return [[]];
        }
    },
    watch: {
        modelValue(v) {
            if (v) {
                this.redirectTop();
            }
        },
        defaultDate(v) {
            if (v) {
                this.redirectTop();
            }
        },
        start(v) {
            if (v) {
                this.redirectTop();
            }
        },
        end(v) {
            if (v) {
                this.redirectTop();
            }
        }
    },
    mounted() {
        this.redirectTop();
    },
    methods: {
        getEnableStartDate(date) {
            const res = calendar.getOffsetDateStr(date, 1, 'yyyy-MM-dd');
            if (this.disabledValue.some((item) => item === res)) {
                return this.getEnableStartDate(res);
            }
            return res;
        },
        // 重定向位置
        redirectTop() {
            if (!this.enableStartDate || !this.end) {
                return;
            }
            let value = [];
            if (
                this.defaultDate &&
                calendar.parse(this.defaultDate)?.getTime() >= calendar.parse(this.enableStartDate)?.getTime() &&
                calendar.parse(this.defaultDate)?.getTime() <= calendar.parse(this.end)?.getTime()
            ) {
                const { year: minYear, month: minMonth, date: minDate } = this.getBoundary(this.defaultDate);
                this.value = [minYear, minMonth, minDate];
            } else {
                const { year, month, date } = this.getBoundary(this.enableStartDate);
                this.value = [year, month, date];
            }

            value = this.modelValue?.split('-')?.map((r) => Number(r)) || this.value;
            this.pickerList?.forEach((item, index) => {
                const top = item.findIndex((c) => c.value === value[index]);
                if (top > -1) {
                    this.tops[index] = -top * this.lineHeight;
                    this.value[index] = item[top].value;
                }
            });
        },
        getPickerStyle(i) {
            return {
                transform: `translate3d(0, ${this.tops[i]}px, 0)`,
                transition: `transform ${this.time}ms`
            };
        },
        getTwoNum(v) {
            return v < 10 ? `0${v}` : v;
        },
        onTouchStart(ev, index) {
            this._pageY = ev.touches[0].pageY - this.tops[index];
        },
        onTouchMove(ev, index) {
            const pageY = ev.touches[0].pageY;
            this.time = 0;
            const max = (this.pickerList[index].length - 1) * this.lineHeight;
            this.tops[index] = Math.min(0, Math.max(-max, pageY - this._pageY));
        },
        onTouchEnd(ev, index) {
            const top = Math.abs(this.tops[index]);
            const val = Math.abs(top % this.lineHeight);
            // 滑动超过一半，直接过
            this.time = 300;
            if (val >= this.lineHeight / 2) {
                const count = Math.ceil(top / this.lineHeight);
                this.tops[index] = -this.lineHeight * count;
                this.value[index] = this.pickerList[index][count]?.value;
            } else {
                const count = Math.round(top / this.lineHeight);
                this.tops[index] = -this.lineHeight * count;
                this.value[index] = this.pickerList[index][count]?.value;
            }

            this.$nextTick(() => {
                // 如果选择了日期，并且选择了月份，天数有可能会变化，需重新计算
                if (this.fields === 'day') {
                    if (index === 1) {
                        this.value[2] = this.pickerList[2][0].value;
                        const maxTop = 0;
                        this.tops[2] = maxTop;
                    } else if (index === 0) {
                        this.value[1] = this.pickerList[1][0].value;
                        const maxTop = 0;
                        this.tops[1] = maxTop;
                        this.value[2] = this.pickerList[2][0].value;
                        const maxTop2 = 0;
                        this.tops[2] = maxTop2;
                    }
                }

                const data = {};

                data.value = this.value[0];
                data.year = this.value[0];

                if (this.fields === 'month' || this.fields === 'day') {
                    data.value += `-${this.getTwoNum(this.value[1])}`;
                    data.month = this.value[1];
                }

                if (this.fields === 'day') {
                    data.value += `-${this.getTwoNum(this.value[2])}`;
                    data.day = this.value[2];
                }

                this.$emit('change', data);
            });
        },
        handleOk() {
            let data = null;
            const formats = ['yyyy'];
            const dates = [this.value[0], '01', '01'];
            let current = `${this.value[0]}-${this.getTwoNum(this.value[1])}-${this.getTwoNum(this.value[2])}`;
            if (this.fields === 'month' || this.fields === 'day') {
                dates[1] = this.getTwoNum(this.value[1]);
                formats.push('MM');
            }
            if (this.fields === 'day') {
                dates[2] = this.getTwoNum(this.value[2]);
                formats.push('dd');
            }

            const date = dates.join('-');
            const regDate = /^(\d{4}\-\d{1,2}\-\d{1,2})$/;
            // 如果两个值都有，end<start, 则当异常处理
            let dateCatch =
                regDate.test(this.enableStartDate) &&
                regDate.test(this.end) &&
                calendar.getCompareDateDay(this.enableStartDate, this.end) < 0;

            if (!dateCatch && regDate.test(this.enableStartDate)) {
                // 如果只有start, 当前值>=start
                if (calendar.getCompareDateDay(this.enableStartDate, date) < 0) {
                    current = this.enableStartDate;
                }
            }

            if (!dateCatch && regDate.test(this.end)) {
                // 如果只有end, 当前值<=end
                if (calendar.getCompareDateDay(this.end, date) > 0) {
                    current = this.end;
                }
            }

            data = calendar.format(current, formats.join('-'));
            this.$emit('update:modelValue', data);
            this.$emit('ok', data);
            this.handleCancel();
        },
        handleCancel() {
            this.visible = false;
            this.$emit('cancel');
        },
        handleShow() {
            this.visible = true;
            this.$emit('dateShow');
        },
        // 返回日期
        getBoundary(innerValue) {
            const value = innerValue?.split('-') || innerValue?.split('/') || [];
            return {
                year: Number(value?.[0]),
                month: Number(value?.[1]),
                date: Number(value?.[2])
            };
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.picker-box {
    width: 100vw;
    background-color: $white;

    .picker-title {
        height: 104px;
        border-bottom: 1px solid $page-gray;
        background-color: $white;
        padding: 0 24px;
        box-sizing: border-box;

        .cancel,
        .ok,
        .title {
            font-size: $fs32;
            color: $gray-light;
        }

        .title {
            color: $gray-dark;
            font-weight: bold;
        }

        .ok {
            color: $purple;
        }
    }

    .picker-content {
        .picker-move {
            position: relative;
            width: 100%;
            height: 480px;
            flex: 1;
            overflow: hidden;

            &:before,
            &:after {
                content: '';
                width: 100%;
                height: 186px;
                border-bottom: 1px solid $page-gray;
                position: absolute;
                top: 0;
                left: 0;
                @include gradient-vertical(rgba($white, 0.85), rgba($white, 0.3));
                z-index: 9;
            }

            &:after {
                top: auto;
                bottom: 0;
                border-bottom: 0 none;
                border-top: 1px solid $page-gray;
                @include gradient-vertical(rgba($white, 0.3), rgba($white, 0.85));
            }
        }

        .picker-items {
            width: 100%;
            margin-top: 192px;
        }

        .picker-item {
            line-height: 98px;
            text-align: center;
            color: $gray-dark;
            font-size: $fs24;
        }
    }
}
</style>
