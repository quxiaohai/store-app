<template>
    <transition :name="animate.name"
                @before-enter="animate.beforeEnter"
                @enter="animate.enter"
                @leave="animate.leave"
                @after-enter="afterEnter"
                @after-leave="afterLeave"
                :css="true">
        <div
            v-show="isShow"
            class="m-popup"
            @click="handleAutoHide"
            :class="{center: option.showCenter}"
            :style="getStyle">
            <div class="progress-bar" v-if="progressBar.show && progressBar.showTime > 0">
                <div class="bar" :style="getTime" :class="control"></div>
            </div>
            <div class="pull-down-bar" v-if="option.pullDownHide" :style="pullStyle">{{ pullText }}关闭</div>
            <slot/>
        </div>
    </transition>
</template>
<script>
import OverlayManager from 'lib/layer/overlay';
import { getZIndex } from 'lib/util/digit';
import contains from 'lib/dom/contains';
import getSize from 'lib/util/getSize';
import animate from '../animate';
import { isString, isNumber, isNode, isObject } from 'lib/util/dataType';
import env from 'lib/comp/env';
import eventBus from 'lib/comp/event-bus';
import ComponentHistory from 'lib/util/history';
import closest from 'lib/dom/closest';

export default {
    name: 'popup',
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        option: {
            type: Object,
            default() {
                return {
                    /********
                     * 支持参数
                     absolute: {
                        type: Boolean,
                        default: false
                      },
                     top: {
                        type: [String, Number],
                        default: "auto"
                      },
                     left: {
                        type: [String, Number],
                        default: "auto"
                      },
                     right: {
                        type: [String, Number],
                        default: "auto"
                      },
                     bottom: {
                        type: [String, Number],
                        default: "auto"
                      },
                     width: {
                        type: [String, Number],
                        default: "auto"
                      },
                     height: {
                        type: [String, Number],
                        default: "auto"
                      },
                     progressBar: {
                        type: Object,
                        default () {
                          return {}
                        }
                      },
                     overlay: {
                        type: Object,
                        default () {
                          return {}
                        }
                      },
                     autoHide: {
                        type: Boolean,
                        default: false
                      },
                     showCenter: {// 显示的时候保持居中
                        type: Boolean,
                        default: false
                      },
                     animate: {
                        type: Object,
                        default () {
                          return {}
                        }
                      },
                     // 指定层级
                     zIndex: Number,
                     history: {//是否支持创建历史记录
                        type: Boolean,
                        default: false
                      },
                     forward: {//是否要支持浏览器前进显示
                        type: Boolean,
                        default: false
                      },
                     stop: {//是否禁止底层body滚动
                        type: Boolean,
                        default: false
                     },
                     pullDownHide: {//下拉关闭
                        type: Boolean,
                        default: false
                     },
                     // 滚动区域， stop为true的时候有效，值为选择器名称 默认.m-scroll-view
                     scrollView: String
                     ****/
                };
            }
        }
    },
    emits: ['update:modelValue', 'show', 'beforeShow', 'hide', 'beforeHide', 'progress'],
    data() {
        const $eventBus = eventBus();
        return {
            isShow: false,
            realShow: false,
            control: '',
            pullText: '下拉',
            pullStyle: {},
            insertNode: env.isClient() ? document.body : {},
            animate: Object.assign({// 自定义动画
                name: 'scale', // 支持scale, fade, slide, left, top, bottom, right
                beforeEnter: function() {
                },
                enter: function() {
                },
                leave: function() {
                },
                custom: false
            }, this.option.animate || {}),
            overlay: Object.assign({// 遮罩层
                show: true,
                color: '',
                opacity: '',
                type: 'change', // 创建类型：change只改变，不创建，create每次都创建新的
                zIndex: isNumber(this.option.zIndex) ? this.option.zIndex - 1 : undefined
            }, this.option.overlay || {}, {
                $event: $eventBus
            }),
            progressBar: Object.assign({// 进度条
                show: false,
                color: '#6AEE00',
                opacity: 1,
                showTime: 0//默认显示时间0ms,不自动关闭
            }, this.option.progressBar || {}),
            zIndex: getZIndex(),
            absolute: this.option.absolute,
            left: this.getUnit(this.option.left, 'auto'),
            top: this.getUnit(this.option.top, 'auto'),
            right: this.getUnit(this.option.right, 'auto'),
            bottom: this.getUnit(this.option.bottom, 'auto'),
            width: this.getUnit(this.option.width, 'auto'),
            height: this.getUnit(this.option.height, 'auto'),
            eventBus: $eventBus
        };
    },
    computed: {
        getStyle() {
            return {
                'position': this.absolute ? 'absolute' : undefined,
                'left': this.left,
                'top': this.top,
                'right': this.right,
                'bottom': this.bottom,
                'width': this.width,
                'height': this.height,
                'z-index': this.zIndex,
                'overflow': this.option.pullDownHide ? 'hidden' : null
            };
        },
        getTime() {
            return {
                'transition': `all ${this.progressBar.showTime}ms linear`,
                'background': this.progressBar.color
            };
        }
    },
    watch: {
        modelValue(v) {
            if (v) {
                this.show();
            } else {
                this.hide();
            }
        },
        option() {
            this.overlay = Object.assign(this.overlay, this.option.overlay || {});
            this.animate = Object.assign(this.animate, this.option.animate || {});
            this.left = this.getUnit(this.option.left, 'auto');
            this.top = this.getUnit(this.option.top, 'auto');
            this.right = this.getUnit(this.option.right, 'auto');
            this.bottom = this.getUnit(this.option.bottom, 'auto');
            this.width = this.getUnit(this.option.width, 'auto');
            this.height = this.getUnit(this.option.height, 'auto');
        }
    },
    mounted() {
        this.initPopup();
    },
    deactivated() {
        this.hide('deactivated');
    },
    beforeUnmount() {
        if (this.history) {
            this.history.destroy();
        } else if (this.isShow) {//如果显示，直接销毁
            this.insertNode.removeChild(this.$el);
            this.overlay.show && OverlayManager.close(this.overlay);
            this.unbindEvent();
        }
    },
    methods: {
        initPopup() {
            if (this.option.history) {
                this.history = new ComponentHistory({
                    hide: this.hide,
                    show: this.option.forward ? this.show : () => {
                    }
                });
            }

            if (this.option.pullDownHide) {
                this.touchOption = {
                    pageY: 0,
                    moveY: 0
                };
            }
        },
        // 自动关闭
        handleAutoHide(ev) {
            if (this.option.autoHide && this.option.showCenter) {
                if (ev.target === this.$el) {
                    this.hide('auto');
                }
            }
        },
        // 添加单位
        getUnit(value, def) {
            if (!isNaN(value)) {
                return value + 'px';
            } else if (isString(value)) {
                return value;
            }
            return def || value;
        },
        bindEvent() {
            if (this.option.autoHide) {
                if (this.overlay.show) {
                    this.eventBus.on('overlayClick', this.autoClickHide);
                } else {
                    document.body.addEventListener('click', this.autoClickHide);
                }

            }
            if (this.option.stop) {
                // 禁用底层滚动
                document.body.classList.add('popup-body-hidden');
                document.body.addEventListener('touchstart', this.stopStartScroll, { passive: false });
                document.body.addEventListener('touchmove', this.stopMoveScroll, { passive: false });
            }

            if (this.option.pullDownHide) {
                this.$el.addEventListener('touchstart', this.touchStart, { passive: false });
                this.$el.addEventListener('touchmove', this.touchMove, { passive: false });
                this.$el.addEventListener('touchend', this.touchEnd, { passive: false });
            }
        },
        unbindEvent() {
            if (this.option.autoHide) {
                if (this.overlay.show) {
                    this.eventBus.off('overlayClick', this.autoClickHide);
                } else {
                    document.body.removeEventListener('click', this.autoClickHide);
                }
            }
            if (this.option.stop) {
                // 解除底层滚动
                document.body.classList.remove('popup-body-hidden');
                document.body.removeEventListener('touchstart', this.stopStartScroll, { passive: false });
                document.body.removeEventListener('touchmove', this.stopMoveScroll, { passive: false });
            }

            if (this.option.pullDownHide) {
                this.$el.removeEventListener('touchstart', this.touchStart, { passive: false });
                this.$el.removeEventListener('touchmove', this.touchMove, { passive: false });
                this.$el.removeEventListener('touchend', this.touchEnd, { passive: false });
            }
        },
        touchStart(ev) {
            if (ev.touches.length === 1) {
                this.touchOption.pageY = ev.touches[0].pageY;
            }
        },
        touchMove(ev) {
            if (ev.touches.length === 1) {
                this.touchOption.moveY = Math.min(150, ev.touches[0].pageY - this.touchOption.pageY);
                this.pullStyle = {
                    transform: `translate3d(0, ${this.touchOption.moveY}px, 0)`,
                    transition: `transform 0s`
                };
                this.pullText = this.touchOption.moveY > 80 ? '释放' : '下拉';
            }
        },
        touchEnd() {
            const o = this.touchOption;
            if (o.pageY > 0 && o.moveY > 80) {
                this.hide(() => {
                    this.pullStyle = {
                        transform: `translate3d(0, 0, 0)`,
                        transition: `transform 0s`
                    };
                }, 'touch');
            } else {
                this.pullStyle = {
                    transform: `translate3d(0, 0, 0)`,
                    transition: `transform 0.3s`
                };
            }
            o.pageY = 0;
            o.moveY = 0;
        },
        autoClickHide(opt) {
            if (contains(this.$el, opt.el || opt.target)) return;
            this.hide('auto');
        },
        afterEnter() {// 显示动画结束
            this.eventBus.emit('animateShow');
        },
        afterLeave() {
            this.eventBus.emit('animateHide');
        },
        // 使用进度条
        useProgress() {
            if (this.progressBar.showTime > 0) {
                if (this.progressBar.show) {
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.control = 'progress-leave';
                        }, 50);
                    });
                }

                let time = 50;
                const timer = setInterval(() => {
                    if (time >= this.progressBar.showTime) {
                        this.hide(null, 'time');
                        clearInterval(timer);
                    }
                    this.$emit('progress', Math.max(0, this.progressBar.showTime - time));
                    time += 50;
                }, 50);
            }
        },
        initProgress() {
            this.progressBar.show && (this.control = '');
        },
        setMiddle() {
            const x = this.option.left || 0;
            const y = this.option.top || 0;
            this.setPosition(x, y);
        },
        setLayout(left, top, right, bottom) {
            if (this.option.showCenter) {// 居中
                this.setMiddle();
            } else {
                this.setPosition(left, top, right, bottom);
            }
        },
        stopStartScroll(e) {
            const selector = this.option.scrollView || '.m-scroll-view';
            const node = this.$el.querySelector(selector);
            if (node && node.scrollHeight === node.offsetHeight) {
                this._isScroll = false;
                return false;
            }
            this._isScroll = !!closest(e.target, selector, this.$el);
        },
        stopMoveScroll(e) {
            if (!this._isScroll) {
                e.preventDefault();
            }
        },
        // 创建动画样式
        createStyle() {
            const call = animate[this.animate.name];
            if (!call) {
                return;
            }
            const id = 'm-popup-style';
            let style = document.getElementById(id);
            if (style) {
                style.innerHTML = call(this._size, this.left, this.top, this.right, this.bottom);
            } else {
                style = document.createElement('style');
                style.id = id;
                style.innerHTML = call(this._size, this.left, this.top, this.right, this.bottom);
                document.getElementsByTagName('head')[0].appendChild(style);
            }
        },
        /*** ----以下方法，支持外部调用---- ****/
        // 显示
        show(state) {
            if (this.realShow) {
                return false;
            }

            this.realShow = true;
            if (this.overlay.show) {// 显示overlay
                OverlayManager.open(this.overlay);
                this.setTop();
            }

            this._size = getSize(this.$el);
            this.createStyle();
            this.setLayout();
            this.insertNode.appendChild(this.$el);

            // 显示之前
            const stateText = isObject(state) ? state.state : state;
            this.$emit('beforeShow', { type: 'beforeShow', state: stateText || 'show' });
            this.$nextTick(() => {
                setTimeout(() => {
                    this.isShow = true;
                    this.bindEvent();
                    this.useProgress();
                    if (this.history && !isObject(state)) {
                        this.history.push('popup');
                    }
                }, 0);
            });

            this.eventBus.once('animateShow', _ => {
                this.$emit('show', { type: 'show', state: stateText || 'show' });
            });
        },
        hide(state) {
            if (!this.isShow) {
                return false;
            }

            const stateText = isObject(state) ? state.state : state;
            this.eventBus.once('animateHide', _ => {
                this.initProgress();
                this.insertNode.removeChild(this.$el);
                this.overlay.show && OverlayManager.close(this.overlay);
                this.$emit('hide', { type: 'hide', state: stateText || 'close' });
                this.realShow = false;
            });

            this.$emit('beforeHide', { type: 'hide', state: stateText || 'close' });
            this.isShow = false;
            this.$emit('update:modelValue', false);
            this.unbindEvent();
            if (this.history && !isObject(state)) {
                this.history.back(state === 'close-all');
            }
        },
        // 插入节点
        setInsertNode(node) {
            if (isNode(node)) {
                this.insertNode = node;
            } else {
                this.insertNode = document.body;
            }
            return this;
        },
        setPosition(left, top, right, bottom) {
            if (isNumber(left) || isString(left)) {
                this.left = this.getUnit(left);
            }
            if (isNumber(top) || isString(top)) {
                this.top = this.getUnit(top);
            }
            if (isNumber(right) || isString(right)) {
                this.right = this.getUnit(right);
            }
            if (isNumber(bottom) || isString(bottom)) {
                this.bottom = this.getUnit(bottom);
            }
            return this;
        },
        // 顶层显示
        setTop(index) {
            if (isNumber(this.option.zIndex)) {
                this.zIndex = isNumber(index) ? index : this.option.zIndex;
            } else {
                this.zIndex = isNumber(index) ? index : getZIndex();
            }
            return this;
        }
    }
};
</script>
<style lang="scss" scoped>
.m-popup {
    position: fixed;
    left: 0;
    top: 0;

    &.center {
        width: 100vw !important;
        height: 100vh !important;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

.slide-enter-active, .slide-leave-active,
.left-enter-active, .left-leave-active,
.top-enter-active, .top-leave-active,
.right-enter-active, .right-leave-active,
.bottom-enter-active, .bottom-leave-active,
.fade-enter-active, .fade-leave-active,
.scale-enter-active, .scale-leave-active,
.skew-enter-active, .skew-leave-active {
    transition: all 0.2s linear;
}

.skew-top-enter-active, .skew-top-leave-active,
.skew-bottom-enter-active, .skew-bottom-leave-active {
    transition-duration: 0.15s;
    transition-property: transform, opacity;
}

.skew-bottom-enter-to {
    transform-origin: 50% 0 !important;
}

.skew-bottom-enter-from, .skew-bottom-leave-to {
    transform: scale(1, 0.8) !important;
    opacity: 0.5 !important;
    transform-origin: 50% 0 !important;
}

.skew-top-enter-to {
    transform-origin: 50% 100% !important;
}

.skew-top-enter-from, .skew-top-leave-to {
    transform: scale(1, 0.8) !important;
    opacity: 0.5 !important;
    transform-origin: 50% 100% !important;
}

.scale-enter-from, .scale-leave-to {
    transform: scale(0.8) !important;
    opacity: 0.2 !important;
}

.skew-enter-from {
    transform: scale(1, 0.7) !important;
    opacity: 0.5 !important;
    transform-origin: center top !important;
}

.skew-leave-to {
    opacity: 0 !important;
    transform: scale(1, 0.7) !important;
    -webkit-transform-origin: center bottom !important;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0 !important;
}

.slide-enter-from {
    transform: translateY(-100%) !important;
    opacity: 0 !important;
}

.slide-leave-to {
    transform: translateY(100%) !important;
    opacity: 0 !important;
}

.pull-down-bar {
    position: absolute;
    top: -50px;
    left: 50%;
    background-color: rgba(#fff, 0.9);
    box-shadow: 0 0 5px rgba(#000, 0.1);
    width: 100px;
    margin-left: -50px;
    line-height: 40px;
    border-radius: 40px;
    font-size: 12px;
    color: #BDBDBD;
    text-align: center;
    z-index: 999;
}

.progress-bar {
    width: 100%;
    height: 2px;
    z-index: 1000;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;

    .bar {
        width: 100%;
        background: #000;
        height: 2px;
        transform: translateZ(0);

        &.progress-leave {
            transform: translate3d(-100%, 0, 0);
        }
    }
}
</style>
