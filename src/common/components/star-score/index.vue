<template>
    <div
        class="flex-left star-box"
        :class="size"
        :style="getStyle"
        @touchstart="handleTouch"
        @touchmove="handleTouch">
        <div class="star-icon flex-center" v-for="item in starList" :key="item.value">
            <i
                :class="{full: current >= item.value}"
                class="icon-star iconfont"></i>
        </div>
        <div class="message" v-if="showText">{{ getMessage }}</div>
    </div>
</template>

<script>
import { px2px } from 'lib/util/viewport';
import getOffset from 'lib/dom/getOffset';

export default {
    name: 'star-score',
    props: {
        modelValue: {
            type: Number,
            default: 0
        },
        touch: {
            type: Boolean,
            default: false
        },
        size: {
            type: String,
            default: 'small'//large
        },
        // 显示文案
        showText: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue'],
    computed: {
        getStyle() {
            if (this.size === 'large') {
                return {
                    width: px2px(328) + 'px'
                };
            }
            return {
                width: px2px(196) + 'px'
            };
        },
        getMessage() {
            return this.starList[this.modelValue - 1]?.label || '';
        }
    },
    data() {
        return {
            current: this.modelValue,
            starList: [
                { value: 1, label: '很不满意' },
                { value: 2, label: '不满意' },
                { value: 3, label: '一般' },
                { value: 4, label: '满意' },
                { value: 5, label: '非常满意' }
            ]
        };
    },
    mounted() {
        this.initStar();
    },
    methods: {
        initStar() {
            if (this.touch) {
                setTimeout(() => {
                    this._starRect = {
                        width: this.$el.offsetWidth,
                        ...getOffset(this.$el)
                    };
                }, 200);
            }
        },
        handleTouch(ev) {
            if (!this.touch) {
                return false;
            }
            let x = ev.touches[0].pageX - this._starRect?.left;
            this.current = Math.ceil(Math.max(Math.min(5, (x / this._starRect?.width) * 5), 1));
            if (this.current !== this.score) {
                this.$emit('update:modelValue', this.current);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.star-box {

    position: relative;

    .message {
        white-space: nowrap;
        font-size: $fs24;
        color: rgba($black, 0.7);
        font-weight: 400;
        position: absolute;
        z-index: 1;
        @include top_center;
        left: 100%;
        @include translate3D(32px, -50%, 0);
    }

    &.large {
        .star-icon {
            width: 56px;
            height: 56px;
            margin-right: 12px;

            .iconfont {
                font-size: $fs56;
            }

            &:last-of-type {
                margin-right: 0;
            }
        }
    }

    .star-icon {
        width: 36px;
        height: 36px;
        margin-right: 4px;

        &:last-of-type {
            margin-right: 0;
        }

        .iconfont {
            font-size: $fs36;
            color: rgba($black, 0.1);

            &.full {
                color: $purple;
            }
        }
    }
}
</style>
