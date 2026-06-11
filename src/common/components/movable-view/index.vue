<template>
    <div
        class="m-movable-area"
        :class="{done: this.width > 0}"
        @touchstart="handleTouchStart"
        @touchmove="handelTouchMove"
        @touchend="handleTouchEnd">
        <div ref="movableView" :style="moveStyle" class="movable-view">
            <slot/>
        </div>
    </div>
</template>

<script>

export default {
    name: 'movable-view',
    props: {
        // 向左偏移
        offsetLeft: {
            type: Number,
            default: 0
        },
        // 向上偏移
        offsetTop: {
            type: Number,
            default: 0
        },
        active: {
            type: Boolean,
            default: false
        }

    },
    data() {
        return {
            touch: {
                // 记录手指触摸坐标
                startX1: 0,
                startX2: 0,
                startY1: 0,
                startY2: 0,
                moveX1: 0,
                moveX2: 0,
                moveY1: 0,
                moveY2: 0,
                endX: 0,
                endY: 0,
                // 记录双指缩放大小
                startScale: 0,
                moveScale: 0,
                endScale: 1,
                // 记录手指触摸刚触摸屏幕的时间
                timeStamp: 0,
                // 是否多指
                multiFinger: false
            },
            scale: 1,// 模块缩放大小
            moveX: 0,// 模块X轴坐标
            moveY: 0,// 模块Y轴坐标
            width: 0,// 模块宽度
            areaWidth: 0,// 可拖动范围宽度
            height: 0,// 模块高度
            areaHeight: 0,// 可拖动范围高度
            initX: 0,// 初始X轴坐标位置
            initY: 0,// 初始Y轴坐标位置
            transition: 'transform 0ms',
            isTouch: true,// 是否可以触摸
            isEmit: false// 是否派发事件
        };
    },
    watch: {
        active(v) {
            v && this.initAreaSize();
        }
    },
    mounted() {
        if (this.active) {
            this.initAreaSize();
        }
    },
    computed: {
        moveStyle() {
            return {
                transition: `${this.transition}`,
                transform: `translate3d(${this.moveX + this.initX}px, ${this.moveY + this.initY}px, 0) scale3d(${this.scale}, ${this.scale}, ${this.scale})`
            };
        }
    },
    methods: {
        //  初始化尺寸信息
        initAreaSize() {
            if (this.width === 0) {
                this.width = this.$refs.movableView.offsetWidth;
                this.height = this.$refs.movableView.scrollHeight;
                this.areaWidth = window.innerWidth;
                this.areaHeight = window.innerHeight;
                if (this.width < this.areaWidth) {
                    this.initX = (this.areaWidth - this.width) / 2;
                }

                if (this.height < this.areaHeight) {
                    this.initY = (this.areaHeight - this.height) / 2;
                }
            }
        },
        // 重置数据
        onResetTouch() {
            this.scale = 1;
            this.transition = 'transform 0ms';
            this.moveX = 0;
            this.moveY = 0;
            this.touch.endScale = 1;
            this.touch.endX = 0;
            this.touch.endY = 0;
        },
        // 手指刚接触屏目
        handleTouchStart(ev) {
            if (this.width === 0 || !this.isTouch) {
                return false;
            }

            this.isEmit = false;
            this.transition = 'transform 0ms';
            this.touch.startX1 = ev.touches[0].pageX;
            this.touch.startY1 = ev.touches[0].pageY;
            if (ev.touches.length > 1) {//多指
                this.touch.startX2 = ev.touches[1].pageX;
                this.touch.startY2 = ev.touches[1].pageY;
                this.touch.startScale = Math.sqrt(Math.pow(this.touch.startX2 - this.touch.startX1, 2) + Math.pow(this.touch.startY2 - this.touch.startY1, 2));
                ev.preventDefault();
                ev.stopPropagation();
            } else if (ev.touches.length === 1) {// 单指
                this.touch.timeStamp = Date.now();
            }
        },
        // 手指在屏幕滑动
        handelTouchMove(ev) {
            if (this.width === 0 || !this.isTouch) {
                return false;
            }

            this.touch.moveX1 = ev.touches[0].pageX;
            this.touch.moveY1 = ev.touches[0].pageY;

            if (ev.touches.length > 1) {//多指
                this.touch.multiFinger = true;
                this.touch.moveX2 = ev.touches[1].pageX;
                this.touch.moveY2 = ev.touches[1].pageY;
                this.touch.moveScale = Math.sqrt(Math.pow(this.touch.moveX2 - this.touch.moveX1, 2) + Math.pow(this.touch.moveY2 - this.touch.moveY1, 2));
                this.scale = this.touch.endScale + (this.touch.moveScale - this.touch.startScale) / 200;
                this.scale = Math.min(3, Math.max(0.3, this.scale));
                this.moveX = this.touch.endX - (this.width * (this.scale - this.touch.endScale)) / 2;
                this.moveY = this.touch.endY - (this.height * (this.scale - this.touch.endScale)) / 2;
                ev.preventDefault();
                ev.stopPropagation();
            } else if (!this.touch.multiFinger && ev.touches.length === 1) {
                const pageX = this.touch.moveX1 - this.touch.startX1;
                const pageY = this.touch.moveY1 - this.touch.startY1;
                this.moveX = pageX + this.touch.endX;
                this.moveY = pageY + this.touch.endY;
                this.transition = 'transform 0ms';

                const maxWidth = this.width * this.scale - this.areaWidth;
                const maxHeight = this.height * this.scale - this.areaHeight;
                if (maxWidth <= 0) {
                    this.moveX = 0;
                }

                if (maxHeight <= 0) {
                    this.moveY = -maxHeight / 2 - this.initY;
                }

                // 判断是不是左右滑动
                if (this.moveX === 0) {
                    if (Math.abs(pageX) > Math.abs(pageY)) {
                        return false;
                    }
                }


                if (this.moveX !== 0 || this.moveY !== 0) {
                    // 判断是否在边边界，如果在边界，不用阻止默认行为
                    if (this.moveX > 50 || this.moveX + 50 < -maxWidth) {
                        if (!this.isEmit) {
                            this.isEmit = true;
                            this.$emit('touch', ev);
                        }
                        this.moveX = Math.min(50, Math.max(-maxWidth - 50, this.moveX));
                        return false;
                    }

                    ev.preventDefault();
                    ev.stopPropagation();
                }
            }
        },
        // 手指抬起
        handleTouchEnd(ev) {
            if (this.width === 0 || !this.isTouch) {
                return false;
            }

            this.isTouch = false;
            if (this.touch.multiFinger) {
                // 双指操作完，校正位置
                this.transition = 'transform 300ms';
                if (this.scale < 1) {
                    this.scale = 1;
                    this.moveX = 0;
                    this.moveY = 0;
                } else {
                    const maxWidth = this.width * this.scale - this.areaWidth;
                    const maxHeight = this.height * this.scale - this.areaHeight;
                    this.moveX = Math.min(-this.initX, Math.max(-maxWidth - this.initX, this.moveX));
                    if (maxHeight <= 0) {
                        this.moveY = -maxHeight / 2 - this.initY;
                    } else {
                        this.moveY = Math.min(-this.initY, Math.max(-maxHeight - this.initY, this.moveY));
                    }
                }
            } else if (this.touch.timeStamp !== 0) {
                // 单指拖动，实现惯性
                // 惯性原理: 产生的速度 = 移动距离 / 移动时间 距离 = 松开的坐标 - 上次的坐标 (距离差) 时间 = 松开的时间 - 按下的时间 (时间差)
                const mod = Date.now() - this.touch.timeStamp;
                const pageX = ev.changedTouches[0].pageX;
                const pageY = ev.changedTouches[0].pageY;
                const distanceX = pageX - this.touch.startX1;
                const distanceY = pageY - this.touch.startY1;
                const maxWidth = this.width * this.scale - this.areaWidth;
                const maxHeight = this.height * this.scale - this.areaHeight;
                const speedX = (distanceX / mod) * 200;
                const speedY = (distanceY / mod) * 200;
                this.transition = 'transform 500ms cubic-bezier(0.1, 0.57, 0.1, 1)';
                // 弹性
                if (this.moveX !== 0) {
                    this.moveX += speedX;
                    this.moveX = Math.min(-this.initX, Math.max(-maxWidth - this.initX, this.moveX));
                }

                // 判断拖动模块是否尺寸小于可拖动区域;
                if (maxHeight <= 0) {
                    this.moveY = -maxHeight / 2 - this.initY;
                } else {
                    this.moveY += speedY;
                    this.moveY = Math.min(-this.initY, Math.max(-maxHeight - this.initY, this.moveY));
                }

                const x = Math.abs(this.touch.startX1 - pageX) < 5;
                const y = Math.abs(this.touch.startY1 - pageY) < 5;
                this.touch.timeStamp = 0;
                this.touch.startX1 = 0;
                this.touch.startY1 = 0;
                if (mod < 200 && x && y) {
                    this.$emit('select', {
                        pageX,
                        pageY
                    });
                }
            }

            this.touch.endScale = this.scale;
            this.touch.endX = this.moveX;
            this.touch.endY = this.moveY;
            this.touch.multiFinger = false;
            setTimeout(() => {
                this.isTouch = true;
            }, 50);
        }
    }
};
</script>

<style lang="scss" scoped>
@import "common/style/static";

.m-movable-area {
    width: 100vw;
    height: auto;
    overflow: hidden;

    &.done {
        height: 100vh;
    }

    .movable-view {
        transform-origin: left top;
    }
}
</style>