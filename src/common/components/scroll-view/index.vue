<template>
    <div
        class="m-scroll-view hide-scroll-bar"
        :class="{'scroll-y': scrollY, 'scroll-x': !scrollY && scrollX}">
        <slot/>
    </div>
</template>

<script>
import pageScroll from 'common/util/page-scroll';

export default {
    name: 'scroll-view',
    props: {
        scrollY: {
            type: Boolean,
            default: false
        },
        scrollX: {
            type: Boolean,
            default: false
        },
        // 滚动指定位置，是否有动画，默认有
        scrollWithAnimation: {
            type: Boolean,
            default: true
        },
        // 滚动到指定位置
        scrollTop: {
            type: Number,
            default: 0
        },
        scrollLeft: {
            type: Number,
            default: 0
        }
    },
    emits: ['scroll'],
    mounted() {
        pageScroll.on(this.$el, this.onPageScroll);
    },
    unmounted() {
        pageScroll.off(this.$el, this.onPageScroll);
    },
    watch: {
        scrollTop(y) {
            if (!this.scrollY) {
                return false;
            }
            pageScroll.scrollTo.call(this.$el, 0, y, this.scrollWithAnimation ? 300 : 0);
        },
        scrollLeft(x) {
            if (this.scrollY || !this.scrollX) {
                return false;
            }
            pageScroll.scrollTo.call(this.$el, x, 0, this.scrollWithAnimation ? 300 : 0);
        }
    },
    methods: {
        onPageScroll(ev) {
            this.$emit('scroll', ev);
        }
    }
};
</script>

<style lang="scss" scoped>
@import "common/style/static";

.m-scroll-view {
    &.scroll-x {
        white-space: nowrap;
        overflow-x: scroll !important;
        overflow-y: hidden !important;
    }

    &.scroll-y {
        overflow-x: hidden !important;
        @extend %scrolling;
    }
}
</style>