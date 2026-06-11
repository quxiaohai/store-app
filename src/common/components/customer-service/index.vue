<template>
    <div
        class="m-customer-service"
        @touchmove.stop.prevent="handleTouchMove"
        @touchend.stop.prevent="handleTouchEnd"
        :class="{ move: isMove }"
    >
        <div
            ref="service"
            class="customer-service"
            :style="boxStyle"
            :class="className"
            @touchstart.stop.prevent="handleTouchStart"
        >
            <div class="service-wrap">
                <img alt="" class="service-icon" src="https://image-www.narwal.com/applet/images/common/service.png"/>
                <div class="eye-left"></div>
                <div class="eye-right"></div>
            </div>
            <div class="service-name" v-if="showText">在线客服</div>
        </div>
    </div>
</template>

<script>
import getOffset from 'lib/dom/getOffset';
import { px2px } from 'lib/util/viewport';

export default {
    name: 'Service',
    props: {
        type: {
            type: String,
            default: 'default'
        },
        // 是否回调
        call: {
            type: Boolean,
            default: false
        },
        scrollTop: Number
    },
    data() {
        return {
            pageX: 0,
            pageY: 0,
            // 当前状诚
            state: 0, // 0默认，1靠左，2靠右
            isMove: false,
            isTap: true,
            className: '',
            boxStyle: {},
            showText: false,
            isHide: false
        };
    },
    mounted() {
        this._timer = setTimeout(() => {
            this.initParams();
        }, 300);
    },
    unmounted() {
        clearTimeout(this._timer);
    },
    watch: {
        scrollTop() {
            this.onHide();
        }
    },
    methods: {
        // 隐藏
        onHide() {
            if (!this._info) {
                return false;
            }

            if (!this.isHide) {
                this.isHide = true;
                this.showText = false;
                const x = this._info.right + this._size / 2.6;
                this.boxStyle = {
                    transform: `translate3d(${x}px, ${this._y}px, 0) rotate(-45deg)`,
                    transition: `transform 0.3s`
                };
            }

            clearTimeout(this._timer);
            this._timer = setTimeout(() => {
                this.isHide = false;
                this.showText = true;
                this.boxStyle = {
                    transform: `translate3d(${this._x}px, ${this._y}px, 0)`,
                    transition: `transform 0.3s`
                };
            }, 500);
        },
        // 初始化参数
        initParams() {
            this._x = 0;
            this._y = 0;

            this._info = getOffset(this.$refs.service);
            if (this._info) {
                this._info.top = this._info.top - px2px(400);
                this._info.bottom = px2px(100);
                this._info.right = px2px(40);
                this._size = px2px(92);
                this.className = this.type === 'home' ? 'ani' : '';

                setTimeout(() => {
                    this.showText = true;
                }, this.type === 'home' ? 2200 : 500);
            } else {
                setTimeout(() => {
                    this.initParams();
                }, 1000);
            }
        },
        handleTouchStart(ev) {
            // 不支持双指
            if (ev.touches.length > 1 || !this._info) {
                return false;
            }
            this._initX = ev.touches[0].pageX;
            this._initY = ev.touches[0].pageY;
            this.pageX = this._initX - this._x;
            this.pageY = this._initY - this._y;
            this._offsetX = 0;
            this._offsetY = 0;
            this.isMove = true;
            this.isTap = true;
            // this._now = Date.now();
        },
        handleTouchMove(ev) {
            // 不支持双指
            if (ev.touches.length > 1 || !this._info) {
                return false;
            }

            const pageX = ev.touches[0].pageX;
            const pageY = ev.touches[0].pageY;

            const left = Math.max(0, Math.min(this._info.right, pageX - this.pageX));
            const top = Math.max(-this._info.top, Math.min(this._info.bottom, pageY - this.pageY));

            this._offsetX = pageX - this._initX;
            this._offsetY = pageY - this._initY;
            this._x = left;
            this._y = top;

            this.boxStyle = {
                transform: `translate3d(${left}px, ${top}px, 0)`,
                transition: `transform 0s`
            };

            if (this.isTap && (Math.abs(this._offsetX) >= 20 || Math.abs(this._offsetY) >= 20)) {
                this.isTap = false;
            }
        },
        handleTouchEnd() {
            this.isMove = false;
            // 当做点击处理
            if (this.isTap && Math.abs(this._offsetX) < 20 && Math.abs(this._offsetY) < 20) {
                if (this.call) {
                    this.$emit('tap');
                    return false;
                } else {
                    this.$router.push('/echat');
                    return false;
                }
            }

            this.className = 'ani-two';
            setTimeout(() => {
                this.className = '';
            }, 1200);

            // setTimeout(() => {
            //     // 判断是否靠边
            //     if (this._x > this._info.right - 40) {
            //         // 靠右边
            //         this._x = this._info.right + this._size / 3.2;
            //         this.boxStyle = {
            //             transform: `translate3d(${this._x}px, ${this._y}px, 0) rotate(-45deg)`,
            //             transition: `transform 0.3s`
            //         };
            //         this.state = 2;
            //     } else if (this._x < -this._info.left + 40) {
            //         // 靠左边
            //         this._x = -this._info.left - this._size / 3.2;
            //         this.boxStyle = {
            //             transform: `translate3d(${this._x}px, ${this._y}px, 0) rotate(45deg)`,
            //             transition: `transform 0.3s`
            //         };
            //         this.state = 1;
            //     } else {
            //         this.state = 0;
            //     }
            //
            //     this.className = 'ani-two';
            //     setTimeout(() => {
            //         this.className = '';
            //     }, 1200);
            // }, 300);
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

@include keyframes(blink-eye) {
    0%,
    15%,
    30%,
    45%,
    50%,
    60% {
        @include scaleY(1);
    }
    8%,
    23%,
    36% {
        @include scaleY(0.2);
    }

    70% {
        @include scaleY(0.2);
    }
    80% {
        @include scaleY(1);
    }

    90% {
        @include scaleY(0.2);
    }

    100% {
        @include scaleY(1);
    }
}

@include keyframes(blink-eye-two) {
    0%,
    50%,
    100% {
        @include scaleY(1);
    }
    25%,
    75% {
        @include scaleY(0.2);
    }
}

@include keyframes(spring-coil) {
    0% {
        @include translateY(0);
    }
    10% {
        @include translateY(-18px);
    }
    20% {
        @include translateY(-24px);
    }
    30% {
        @include translateY(-10px);
    }
    40% {
        @include translateY(0);
    }
    50% {
        @include translateY(-12px);
    }
    60% {
        @include translateY(-20px);
    }
    75% {
        @include translateY(0);
    }
    80% {
        @include translateY(-5px);
    }
    85% {
        @include translateY(-10px);
    }
    90% {
        @include translateY(-5px);
    }
    100% {
        @include translateY(0);
    }
}

.m-customer-service {
    &.move {
        width: 100%;
        position: fixed;
        height: 100%;
        background-color: rgba($black, 0);
        top: 0;
        left: 0;
        z-index: 99;
    }
}

.customer-service {
    position: fixed;
    z-index: 9;
    bottom: 300px;
    right: 40px;
    width: 80px;
    height: 100px;

    .service-wrap {
        width: 80px;
        height: 80px;
        position: relative;
        margin: 0 auto;
    }

    &.ani {
        @include animation(spring-coil 1.2s ease 0.5s);

        .eye-left,
        .eye-right {
            @include animation(blink-eye 3s ease 0.5s);
        }
    }

    &.ani-two {
        .eye-left,
        .eye-right {
            @include animation(blink-eye-two 0.6s ease 0.5s);
        }
    }

    .eye-left,
    .eye-right {
        position: absolute;
        width: 8.5px;
        height: 13px;
        background-color: $purple;
        border-radius: 10px;
    }

    .eye-left {
        top: 38px;
        left: 24px;
    }

    .eye-right {
        top: 38px;
        right: 24px;
    }

    .service-icon {
        width: 80px;
        height: 80px;
        user-select: none;
        pointer-events: none;
    }

    .service-name {
        font-size: $fs20;
        color: rgba($black, 0.8);
        line-height: 20px;
        font-weight: 300;
    }
}
</style>
