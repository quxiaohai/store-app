<template>
    <div class="m-dropdown" @click="initDropdown">
        <slot/>
        <popup :option="option" v-model="visible" @hide="handleHide">
            <slot name="overlay"/>
        </popup>
    </div>
</template>

<script>
import getOffset from 'lib/dom/getOffset';
import { isNumber } from 'lib/util/dataType';

export default {
    name: 'drop-down',
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        disabled: {// 是否禁用
            type: Boolean,
            default: false
        },
        offset: Object,// 偏移量
        direct: {// 方向,默认以左为点显示
            type: String,
            default: 'left'// right
        },
        // 目标元素是否跟随滚动
        scroll: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            option: {},
            visible: false
        };
    },
    watch: {
        modelValue(v) {
            if (v) {
                this.initDropdown();
            } else {
                this.handleHide();
            }
        }
    },
    methods: {
        handleHide() {
            this.visible = false;
            this.$emit('update:modelValue', false);
        },
        initDropdown() {
            if (this.visible) {
                return false;
            }
            // 获取偏移量
            const offset = getOffset(this.$el);

            // 如果不滚动，需要清除滚动值
            if (!this.scroll) {
                offset.top -= offset.scrollTop;
                offset.left -= offset.scrollLeft;
            }

            const height = Math.min(this.$el.offsetHeight + 2, 80);
            const oLeft = isNumber(this.offset?.left) ? this.offset.left : 0;
            const oTop = isNumber(this.offset?.top) ? this.offset.top : 0;

            const option = {
                autoHide: true,
                overlay: {
                    opacity: 0
                }
            };
            let top = offset.top + height + 2;// 默认在下面显示
            option.top = top + oTop;
            option.animate = { name: 'skew-bottom' };

            // 以右边为坐标点来显示
            if (this.direct === 'right') {
                const width = this.$el.offsetWidth;
                option.right = window.innerWidth - offset.left - width + oLeft;
            } else {
                option.left = offset.left + oLeft;
            }

            this.option = option;
            this.$nextTick(_ => {
                this.visible = true;
                this.$emit('update:modelValue', true);
            });
        }
    }
};
</script>