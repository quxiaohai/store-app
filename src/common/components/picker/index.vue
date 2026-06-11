<template>
    <div @click="handleShow">
        <slot/>
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
                        :key="index">
                        <ul class="picker-items" :style="getPickerStyle(index)">
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
import { isObject } from 'lib/util/dataType';
import calendar from 'lib/util/calendar';

export default {
    name: 'picker',
    props: {
        /****
         * mode 为 selector 时，值为number或者string
         * mode 为 multiSelector 时，值为数组
         * mode 为 time 时，格式为hh:mm
         * mode 为 date 时，格式为YYYY-MM-DD
         */
        modelValue: [Number, String, Array],
        // 选择器的标题
        title: String,
        // mode 为 selector 或 multiSelector 时，range 有效 支持, 最多支持3列
        range: {
            type: Array,
            default() {
                return [];
            }
        },
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
         * mode 为 time 时：表示有效时间范围的开始，字符串格式为"hh:mm"
         * mode 为 date 时：表示有效日期范围的开始，字符串格式为"YYYY-MM-DD"
         */
        start: String,
        /****
         * mode 为 time 时：表示有效时间范围的结束，字符串格式为"hh:mm"
         * mode 为 date 时：表示有效日期范围的结束，字符串格式为"YYYY-MM-DD"
         */
        end: String,
        // mode 为 date 时有效：有效值 year,month,day，表示选择器的粒度
        fields: {
            type: String,
            default: 'day'
        },
        // 是否禁用
        disabled: {
            type: Boolean,
            default: false
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
            lineHeight: px2px(96),
            value: []
        };
    },
    emits: ['update:modelValue', 'change', 'ok', 'cancel'],
    computed: {
        pickerList() {
            if (this.mode === 'selector') {
                return [
                    this.range.map((item, i) => {
                        if (isObject(item)) {
                            return {
                                label: item[this.rangeKey],
                                value: item[item.rangeId]
                            };
                        }

                        return {
                            label: item,
                            value: i
                        };
                    })
                ];
            } else if (this.mode === 'multiSelector') {
                return this.range.slice(0, 3).map(r => {
                    return r.map((item, i) => {
                        if (isObject(item)) {
                            return {
                                label: item[this.rangeKey],
                                value: item[item.rangeId]
                            };
                        }

                        return {
                            label: item,
                            value: i
                        };
                    });
                });
            } else if (this.mode === 'time') {
                const hours = [], minute = [];
                for (let i = 0; i < 24; i++) {
                    const val = i < 10 ? `0${i}` : i;
                    hours.push({ value: Number(val), label: val });
                }
                for (let i = 0; i < 60; i++) {
                    const val = i < 10 ? `0${i}` : i;
                    minute.push({ value: Number(val), label: val });
                }
                return [hours, minute];
            } else if (this.mode === 'date') {
                const year = [], month = [], day = [];
                for (let i = 1900; i <= 2100; i++) {
                    year.push({ value: i, label: `${i}年` });
                }
                for (let i = 1; i <= 12; i++) {
                    const val = i < 10 ? `0${i}` : i;
                    month.push({ value: Number(val), label: `${val}月` });
                }

                if (this.fields === 'day') {
                    const max = this.value ? calendar.getMonthDay(this.value[0], this.value[1] - 1) : 30;
                    for (let i = 1; i <= max; i++) {
                        const val = i < 10 ? `0${i}` : i;
                        day.push({ value: Number(val), label: `${val}日` });
                    }

                    return [year, month, day];
                } else if (this.fields === 'month') {
                    return [year, month];
                } else if (this.fields === 'year') {
                    return [year];
                }
            }

            return [[]];
        }
    },
    watch: {
        modelValue() {
            this.redirectTop();
        },
        range() {
            if (this.mode === 'selector' || this.mode === 'multiSelector') {
                this.resetTop();
            }
        }
    },
    mounted() {
        this.redirectTop();
    },
    methods: {
        // 重置位置
        resetTop() {
            this.pickerList.forEach((list, index) => {
                const max = list.length - 1;
                const current = Math.round(this.tops[index] / this.lineHeight);
                const i = Math.min(max, current);
                this.tops[index] = -i * this.lineHeight;
                this.value[index] = list[i].value;
            });
        },
        // 重定向位置
        redirectTop() {
            let value = [];
            let date = calendar.getDate();
            switch (this.mode) {
                case 'selector':
                    value = [this.modelValue];
                    this.value = [];
                    break;
                case 'multiSelector':
                    value = this.modelValue || [];
                    this.value = [];
                    break;
                case 'time':
                    this.value = [Number(calendar.format(date, 'HH')), Number(calendar.format(date, 'mm'))];
                    value = this.modelValue?.split(':')?.map(r => Number(r)) || this.value;
                    break;
                case 'date':
                    this.value = [
                        Number(calendar.format(date, 'yyyy')),
                        Number(calendar.format(date, 'MM')),
                        Number(calendar.format(date, 'dd'))
                    ];
                    value = this.modelValue?.split('-')?.map(r => Number(r)) || this.value;
                    break;
            }

            this.pickerList.forEach((item, index) => {
                const top = item.findIndex(c => c.value === value[index]);
                if (top > -1) {
                    this.tops[index] = -top * this.lineHeight;
                    switch (this.mode) {
                        case 'selector':
                            this.value = item[top].value;
                            break;
                        case 'multiSelector':
                        case 'time':
                        case 'date':
                            this.value[index] = item[top].value;
                            break;
                    }
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
                const count = Math.floor(top / this.lineHeight);
                this.tops[index] = -this.lineHeight * count;
                this.value[index] = this.pickerList[index][count]?.value;
            }

            this.$nextTick(() => {
                // 如果选择了日期，并且选择了月份，天数有可能会变化，需重新计算
                if (this.mode === 'date' && this.fields === 'day') {
                    if (index === 1) {// 操作了月
                        const max = this.pickerList[2].length - 1;
                        this.value[2] = Math.min(this.value[2], this.pickerList[2][max].value);
                        const maxTop = max * this.lineHeight;
                        this.tops[2] = Math.max(this.tops[2], -maxTop);
                    }
                }

                const data = { mode: this.mode };
                switch (this.mode) {
                    case 'selector':
                        data.value = this.value[0];
                        break;
                    case 'multiSelector':
                        data.value = this.value;
                        break;
                    case 'time':
                        data.value = `${this.getTwoNum(this.value[0])}:${this.getTwoNum(this.value[1])}`;
                        data.hour = this.value[0];
                        data.minute = this.value[1];
                        break;
                    case 'date':
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

                        break;
                }

                this.$emit('change', data);
            });
        },
        handleOk() {
            let data = null;
            switch (this.mode) {
                case 'selector':
                    data = this.value[0];
                    break;
                case 'multiSelector':
                    data = this.value;
                    break;
                case 'time':
                    const regTime = /^(\d{1,2}\:\d{1,2})$/;
                    data = `${this.getTwoNum(this.value[0])}:${this.getTwoNum(this.value[1])}`;
                    // 如果两个值都有，end<start, 则当异常处理
                    let timeCatch = regTime.test(this.start) && regTime.test(this.end) && calendar.getCompareTimeDay(this.start, this.end) < 0;

                    if (!timeCatch && regTime.test(this.start)) {
                        // 如果只有start, 当前值>=start
                        if (calendar.getCompareTimeDay(this.start, data) < 0) {
                            data = this.start;
                        }
                    }

                    if (!timeCatch && data !== this.start && regTime.test(this.end)) {
                        // 如果只有end, 当前值<=end
                        if (calendar.getCompareTimeDay(this.end, data) > 0) {
                            data = this.end;
                        }
                    }
                    break;
                case 'date':
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
                    let dateCatch = regDate.test(this.start) && regDate.test(this.end) && calendar.getCompareDateDay(this.start, this.end) < 0;

                    if (!dateCatch && regDate.test(this.start)) {
                        // 如果只有start, 当前值>=start
                        if (calendar.getCompareDateDay(this.start, date) < 0) {
                            current = this.start;
                        }
                    }

                    if (!dateCatch && regDate.test(this.end)) {
                        // 如果只有end, 当前值<=end
                        if (calendar.getCompareDateDay(this.end, date) > 0) {
                            current = this.end;
                        }
                    }

                    data = calendar.format(current, formats.join('-'));
                    break;
            }
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

        .cancel, .ok, .title {
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

            &:before, &:after {
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
                @include gradient-vertical(rgba($white, 0.3), rgba($white, 0.85))
            }
        }

        .picker-items {
            width: 100%;
            margin-top: 192px;
        }

        .picker-item {
            line-height: 96px;
            text-align: center;
            color: $gray-dark;
            font-size: $fs24;
        }
    }
}
</style>