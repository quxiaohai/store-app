<template>
    <header class="m-navigation-bar" :class="{hidden: !show}">
        <div class="flex-left bar-wrap" :class="{'bd-b': bd}">
            <div class="bar-left" v-if="!hideLeft">
                <slot v-if="$slots.left" name="left" />
                <span class="bar-prev flex-center" v-href="-1">
                    <i class="iconfont icon-arrow-left"></i>
                </span>
            </div>
            <div class="bar-center flex-center" v-if="!hideCenter">
                <slot v-if="$slots.center" name="center" />
                <span class="han-serif title">{{title }}</span>
            </div>
            <div class="bar-content" v-else>
                <template v-if="$slots.content">
                    <slot name="content" />
                </template>
            </div>
            <div class="bar-right" v-if="$slots.right">
                <slot name="right"></slot>
            </div>
        </div>
    </header>
</template>

<script>

export default {
    name: 'NavigationBar',
    props: {
        show: {
            type: Boolean,
            default: true
        },
        // 底部的线
        bd: {
            type: Boolean,
            default: true
        },
        // 标题
        title: {
            type: String,
            default: ''
        },
        // 隐藏左
        hideLeft: {
            type: Boolean,
            default: false
        },
        // 隐藏中
        hideCenter: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
        }
    },

    mounted() {
    },
    methods: {
    }
}
</script>

<style lang="scss" scoped>
@import "common/style/static";

%bar-height {
    height: $navigation-bar-height;
    overflow: hidden;
}

%position {
    left: 0;
    top: 0;
    right: 0;
    z-index: 99;
}
.m-navigation-bar {
    // 内撑高
    @extend %bar-height;
    position: relative;
    background-color: $white;
    .m-navigation-bar{
        @include transition(all 0.5s);
        &.hidden, .bar-wrap{
            @include translateY(-$navigation-bar-height);
        }
    }
    .bar-wrap {
        font-size: 18px;
        width: 100%;
        box-sizing: border-box;
        @extend %bar-height;
        background-color: $white;
        color: $gray-dark;
        position: fixed;
        @extend %position;
        @include transition(all 0.5s);
        .bar-prev, .bar-btn {
            @include wh($navigation-bar-height);
            margin-left: 6px;
            .iconfont{
                font-size: 24px;
                line-height: 24px;
            }
        }

        .bar-center{
            @include center;
            max-width: 280px;
            @extend %ellipsis-basic;
            .title{
                font-size: 18px;
            }
        }
        .bar-right{
            @include top_center;
            right: 0;
        }
        .bar-content{
            width: 100%;
        }
    }
}

</style>
