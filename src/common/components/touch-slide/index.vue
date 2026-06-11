<template>
    <div class="m-touch-slide">
        <div
            class="overlay"
            @touchstart.stop.prevent="handleClose"
            :style="overlayStyle"></div>
        <div
            :style="slideStyle"
            @touchstart="touchStart"
            @touchmove="touchMove"
            @touchend="touchEnd"
            class="slide-bar flex-left">
            <slot/>
        </div>
    </div>
</template>

<script>

export default {
    name: 'touch-slide',
    props: {
        // 滑动距离rpx
        distance: {
            type: Number,
            default: 180
        },
        // 动画时长s
        duration: {
            type: Number,
            default: 0.5
        },
        // 阻止冒泡class
        stop: {
            type: String,
            default: '_stop'
        },
        // 是否禁用
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            left: 0,
            pageX: 0,
            isStopTouch: false,
            isStopScroll: false,
            slideStyle: {},
            overlayStyle: {}
        };
    },
    watch: {
        disabled(v) {
            if (v) {
                this.touchEnd();
            }
        }
    },
    methods: {
        touchStart(ev) {
            if (this.disabled || this.isStopTouch) {
                return false;
            }

            this.style = {
                transform: `translate3d(0, 0, 0)`,
                transition: `transform 0s`
            };

            this.pageX = ev.touches[0].pageX;
            this._pageY = ev.touches[0].pageY;
        },
        touchMove(ev) {
            if (this.disabled || this.isStopTouch) {
                return false;
            }

            const pageX = ev.touches[0].pageX;
            const pageY = ev.touches[0].pageY;
            if (!this.isStopScroll && !this.isStopTouch) {
                if (Math.abs(pageY - this._pageY) > 3) {// 有上下移动，禁止滑动
                    this.isStopTouch = true;
                } else if (Math.abs(pageX - this.pageX) > 3) {
                    this.isStopScroll = true;
                    this.$emit('slide', true);
                }
            }

            if ((!this.isStopScroll && !this.isStopTouch) || this.isStopTouch) {
                return false;
            }

            if (this.isStopScroll) {
                ev.preventDefault();
                ev.stopPropagation();
            }


            this.left = Math.max(-this.distance * 1.2, Math.min(0, pageX - this.pageX));
            this.slideStyle = {
                transform: `translate3d(${this.left}px, 0, 0)`,
                transition: `transform 0s`
            };

            clearTimeout(this._timer);
            this._timer = setTimeout(() => {
                this.touchEnd();
            }, 1200);
        },
        touchEnd() {
            this.isStopTouch = false;
            this.isStopScroll = false;
            setTimeout(() => {
                this.$emit('slide', false);
            }, 80);
            if (Math.abs(this.left * 2) > this.distance) {
                this.slideStyle = {
                    transform: `translate3d(${-this.distance}px, 0, 0)`,
                    transition: `transform ${this.duration}s`
                };
                this.overlayStyle = {
                    display: 'block',
                    transform: `translate3d(${-this.distance}px, 0, 0)`
                };
            } else {
                this.slideStyle = {
                    transform: `translate3d(0, 0, 0)`,
                    transition: `transform ${this.duration}s`
                };
                this.overlayStyle = {};
            }

            // 数据重置
            this.left = 0;
            this.pageX = 0;
            clearTimeout(this._timer);
        },
        handleClose() {
            this.slideStyle = {
                transform: `translate3d(0, 0, 0)`,
                transition: `transform ${this.duration}s`
            };
            this.overlayStyle = {};
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.m-touch-slide {
    width: 100%;
    overflow: hidden;
    position: relative;

    .overlay {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        background-color: transparent;
        display: none;
        z-index: 9;
    }

    .slide-bar {
        width: 200%;
    }
}
</style>
