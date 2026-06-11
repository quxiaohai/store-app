<template>
    <div
        class="m-counter-box flex-center"
        @click.stop.prevent="() => false"
        :class="[type, size]">
        <div
            @click="handleCounter($event, -1)"
            class="minus-wrap">
            <div
                class="minus flex-center"
                :class="{disabled: modelValue <= min || disabled}">
                <i class="iconfont icon-minus"></i>
            </div>
        </div>
        <div class="counter-input oswald-medium flex-center">
            <input
                type="number"
                v-model="num"
                :disabled="disabled"
                @blur="handleChange"
                @focus="isFocus = true"
                @confirm="handleChange"
                :class="{focus: isFocus}"
                class="u-input oswald-medium"/>
        </div>
        <div
            @click="handleCounter($event, 1)"
            class="plus-warp">
            <div
                :class="{disabled: modelValue >= getMax || disabled}"
                class="plus flex-center">
                <i class="iconfont icon-add"></i>
            </div>
        </div>
    </div>
</template>

<script>
import pageEvent from 'common/util/page-event';

export default {
    name: 'u-counter',
    props: {
        min: {
            type: Number,
            default: 1
        },
        max: {
            type: Number,
            default: 9999
        },
        modelValue: {
            type: Number,
            default: 1
        },
        disabled: {
            type: Boolean,
            default: false
        },
        size: {
            type: String,
            default: 'medium'// large, medium
        },
        type: {
            type: String,
            default: 'primary'// grey
        }
    },
    data() {
        return {
            num: this.modelValue,
            isFocus: false
        };
    },
    watch: {
        modelValue(v) {
            this.num = v;
        }
    },
    emits: ['update:modelValue', 'change', 'err'],
    computed: {
        getMax() {
            return Math.min(this.max, 9999);
        }
        // getVal() {
        //     return Math.min(this.max, Math.max(this.min, this.value)) || 0;
        // }
    },
    unmounted() {
        if (!/(iPhone|iPod|iPad|Macintosh)/i.test(navigator.userAgent)) {
            pageEvent.off(window, 'resize', this.resetBlur);
        }
    },
    mounted() {
        if (!/(iPhone|iPod|iPad|Macintosh)/i.test(navigator.userAgent)) {
            this._originWindowHeight = window.innerHeight;
            pageEvent.on(window, 'resize', this.resetBlur);
        }
    },
    methods: {
        // 重置焦点
        resetBlur() {
            if (this.isFocus) {
                if (this._originWindowHeight !== window.innerHeight || document.activeElement?.nodeName === 'BODY') return;
                document.activeElement?.blur();
            }
        },
        /*******
         * 计步器
         * @param i
         * @param ev
         */
        handleCounter(ev, i) {
            if (this.disabled) {
                return;
            }

            let val = this.modelValue + i;
            val = Math.min(this.getMax, Math.max(this.min, val));
            const old = this.modelValue;

            // 拦截错误信息，比如数量超过了限制
            if (val > 0) {
                this.$emit('err', {
                    val: this.modelValue + i,
                    type: i > 0 ? 'plus' : 'minus'
                });
            }

            // 禁用时，不派发事件
            if (old === val || (i > 0 && this.modelValue >= this.getMax) || (i < 0 && this.modelValue <= this.min)) {
                return false;
            }

            this.$emit('update:modelValue', val);
            this.$emit('change', {
                oldVal: old,
                newVal: val,
                type: i > 0 ? 'plus' : 'minus'
            });
        },
        // 格式a
        handleFormat(ev) {
            const val = ev.target.value;
            const fVal = val.replace(/[^0-9]/, '');
            if (fVal !== val) {
                this.$emit('update:modelValue', fVal);
            }
        },
        /**********
         * 手动输入
         * @param ev
         */
        handleChange(ev) {
            this.isFocus = false;

            if (this.disabled) {
                this.num = this.modelValue;
                return;
            }

            const value = parseFloat(ev.target.value);
            let val = Math.min(this.getMax, Math.max(this.min, value || 0));
            const old = this.modelValue;

            if (val > 0) {
                this.$emit('err', {
                    val: value,
                    type: 'input'
                });
            }

            if (old === val) {
                this.num = this.modelValue;
                return;
            }
            this.$emit('update:modelValue', val);
            this.$emit('change', {
                oldVal: old,
                newVal: val,
                type: 'input'
            });
        }
    }
};
</script>

<style lang="scss" scoped>
@import "common/style/static";

.m-counter-box {
    min-width: 124px;
    min-height: 40px;
    background-color: $white;
    overflow: hidden;
    margin-right: -20px;

    .iconfont {
        font-size: $fs28;
        font-weight: bold;
        color: $gray;
    }

    .minus-wrap {
        padding: 8px 0 8px 20px;
    }

    .plus-warp {
        padding: 8px 20px 8px 0;
    }

    &.large {
        min-width: 188px;
        min-height: 48px;

        .minus, .plus {
            width: 60px;
            height: 48px;
        }

        .counter-input {
            width: 68px;
            height: 48px;

            .u-input {
                line-height: 48px;
                width: 68px;
            }
        }
    }

    .minus, .plus {
        height: 40px;
        width: 40px;
        cursor: pointer;
        background-color: $black;
        color: $white;
        position: relative;

        .iconfont {
            color: $white;
            line-height: 40px;
        }

        &.disabled {
            background-color: rgba($black, 0.1);
        }
    }

    &.grey {
        .minus, .plus {
            background-color: transparent;
            font-weight: bold;

            .iconfont {
                color: $black;
                font-size: $fs32;
            }

            &.disabled {
                background-color: transparent;

                .iconfont {
                    color: rgba($black, 0.1);;
                }
            }
        }
    }

    .minus {
        border-radius: 40px 0 0 40px;

        .iconfont {
            margin-left: 6px;
        }

        .extend {
            position: absolute;
            height: 100%;
            width: 150%;
            right: 0;
            top: 0;
        }
    }

    .plus {
        border-radius: 0 40px 40px 0;

        .extend {
            position: absolute;
            height: 100%;
            width: 150%;
            left: 0;
            top: 0;
        }
    }

    .counter-input {
        width: 44px;
        height: 40px;
        box-sizing: border-box;
        padding: 0 4px;
        overflow: hidden;
        position: relative;

        .u-input {
            border: 0 none;
            font-size: $fs28;
            font-weight: 600;
            text-align: center;
            background: none;
            line-height: 40px;
            width: 44px;
            min-width: 20px !important;
            color: $black;
        }
    }
}
</style>
