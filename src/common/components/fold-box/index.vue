<template>
    <div
        class="fold-box"
        :style="foldStyle"
        @click="handleToggle">
        <div
            class="content"
            :class="{more: moreShow}"
            :style="boxStyle">
            <slot/>
            <!--            <div class="up flex-right" v-if="moreShow">-->
            <!--                <i class="iconfont icon-arrow-top" v-if="moreShow" v-show="foldShow"></i>-->
            <!--            </div>-->
        </div>
        <div class="open flex-right" v-if="moreShow" v-show="!foldShow">
            <span class="iconfont icon-arrow-down"></span>
        </div>
    </div>
</template>

<script>
import { px2px } from 'lib/util/viewport';

export default {
    name: 'fold-box',
    props: {
        // 最小显示几行
        row: {
            type: Number,
            required: true
        },
        // 行高
        lineHeight: {
            type: Number,
            default: 40
        }
    },
    data() {
        return {
            // 是否需要显示更多钮
            moreShow: false,
            // 详情是否更多
            foldShow: false,
            scrollHeight: 0
        };
    },
    computed: {
        foldStyle() {
            if (this.moreShow) {
                return {};
            } else {
                return {
                    maxHeight: this.row * this.boxHeight + 'px',
                    overflow: 'hidden'
                };
            }
        },
        boxHeight() {
            return px2px(this.lineHeight);
        },
        boxStyle() {
            const sty = { lineHeight: this.boxHeight + 'px' };
            if (this.moreShow && this.foldShow) {
                sty.height = this.scrollHeight + 'px';
            } else if (this.moreShow && !this.foldShow) {
                sty.height = this.row * this.boxHeight + 'px';
            }
            return sty;
        }
    },
    mounted() {
        this.initFold();
    },
    methods: {
        /********
         * 展开收缩切换
         */
        handleToggle() {
            // this.foldShow = !this.foldShow;
            this.foldShow = true;
        },
        // 初始化
        initFold() {
            setTimeout(() => {
                this.scrollHeight = this.$el.scrollHeight;
                if (this.scrollHeight > this.row * this.boxHeight) {
                    this.moreShow = true;
                }
            }, 100);
        }
    }
};
</script>

<style lang="scss" scoped>
@import "common/style/static";

.fold-box {
    position: relative;

    .content {
        max-height: 1000px;
        overflow: hidden;
        height: auto;
        word-break: break-word;
        text-align: left;
        @include transition(all 0.3s);

        .up {
            height: 40px;
        }
    }

    .iconfont {
        font-size: $fs36;
        line-height: 40px;
        color: rgba($black, 0.8);
    }

    .open {
        width: 40px;
        height: 40px;
        position: absolute;
        right: 0;
        bottom: 0;
        z-index: 9;
        background-color: $gray-disabled;
        cursor: pointer;

        &:before {
            content: '';
            position: absolute;
            width: 40px;
            height: 100%;
            @include gradient-horizontal(rgba($gray-disabled, 0.2), rgba($gray-disabled, 1));
            left: -38px;
            top: 0;
            z-index: -1;
        }
    }
}
</style>
