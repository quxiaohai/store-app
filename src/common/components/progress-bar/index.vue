<!-- borrowed from Nuxt! -->

<template>
    <div class="progress" :style="getStyle"></div>
</template>

<script>
import { SCROLL_POS } from 'common/util/constant';
import storage from 'lib/util/storage';
import pageScroll from 'common/util/page-scroll';
import { $broadcast } from 'common/util/global-properties';

export default {
    data() {
        return {
            percent: 0,
            show: false,
            skeletonShow: false,
            canSuccess: true,
            duration: 3000,
            height: '2px',
            color: '#00ef6c',
            failedColor: '#ff0000',
            type: ''
        };
    },
    computed: {
        getStyle() {
            return {
                'width': this.percent + '%',
                'height': this.height,
                'background-color': this.canSuccess ? this.color : this.failedColor,
                'opacity': this.show ? 1 : 0
            };
        }
    },
    methods: {
        scrollTo() {
            const obj = storage.get(SCROLL_POS);
            if (obj) {
                storage.clear(SCROLL_POS);
                pageScroll.scrollTo(0, obj.y, 200);
            }
        },
        start(type) {
            this.type = type;
            this.show = true;
            this.skeletonShow = true;
            this.canSuccess = true;
            if (this._timer) {
                clearInterval(this._timer);
                this.percent = 0;
            }
            this._cut = 10000 / Math.floor(this.duration);
            this._timer = setInterval(() => {
                this.increase(this._cut * Math.random());
                if (this.percent > 95) {
                    this.finish();
                }
            }, 100);
            return this;
        },
        set(num) {
            this.show = true;
            this.canSuccess = true;
            this.percent = Math.floor(num);
            return this;
        },
        get() {
            return Math.floor(this.percent);
        },
        increase(num) {
            this.percent = this.percent + Math.floor(num);
            return this;
        },
        decrease(num) {
            this.percent = this.percent - Math.floor(num);
            return this;
        },
        finish() {
            this.percent = 100;
            this.hide();
            this.skeletonShow = false;
            $broadcast.emit('loaded');
            setTimeout(() => {
                this.scrollTo();
            }, 50);
            return this;
        },
        pause() {
            clearInterval(this._timer);
            return this;
        },
        hide() {
            clearInterval(this._timer);
            this._timer = null;
            setTimeout(() => {
                this.show = false;
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.percent = 0;
                    }, 200);
                });
            }, 500);
            return this;
        },
        fail() {
            this.canSuccess = false;
            return this;
        }
    }
};
</script>

<style lang="scss" scoped>
@import "common/style/static.scss";

.progress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    width: 0;
    transition: width 0.2s, opacity 0.4s;
    opacity: 1;
    background-color: $green;
    z-index: 999999;
    overflow: hidden;

    &:after {
        content: '';
        width: 50px;
        height: 4px;
        @include gradient-horizontal(rgba($white, 0.2), $white-simple, rgba($white, 0.2));
        position: absolute;
        top: 0;
        left: 0;
        @include animation(move_modules 2s ease infinite);
    }
}

@include keyframes(move_modules) {
    0% {
        @include translateX(0);
    }
    100% {
        @include translateX(100vw);
    }
}
</style>
