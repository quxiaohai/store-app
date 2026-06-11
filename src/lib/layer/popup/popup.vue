<template>
    <transition :name="animate.name"
                @before-enter="animate.beforeEnter"
                @enter="animate.enter"
                @leave="animate.leave"
                @after-enter="afterEnter"
                @after-leave="afterLeave"
                :css="true">
        <div v-show="isShow" class="m-popup" :style="getStyle">
            <div class="progress-bar" v-if="progressBar.show && progressBar.showTime > 0">
                <div class="bar" :style="getTime" :class="control"></div>
            </div>
            <div class="pull-down-bar" v-if="option.pullDownHide" :style="pullStyle">{{ pullText }}关闭</div>
        </div>
    </transition>
</template>
<script>
import OverlayManager from 'lib/layer/overlay';
import { getUniqueId, getZIndex } from 'lib/util/digit';
import { lock, isLock, unLock } from 'lib/util/lock';
import contains from 'lib/dom/contains';
import getSize from 'lib/util/getSize';
import animate from './animate';
import { isString, isNumber, isFunction, isNode, isObject } from 'lib/util/dataType';
import ComponentHistory from 'lib/util/history';
import env from 'lib/comp/env';
import { createApp } from 'vue';

export default {
    name: 'popup',
    props: {
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
                     指定层级
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
                     }
                     ****/
                };
            }
        }
    },
    created() {
        this.uniqueId = getUniqueId();
        this.overlay.$event = this.$event;
        if (this.option.history) {
            this.history = new ComponentHistory({
                hide: this.hide,
                show: this.option.forward ? this.show : () => {
                }
            });
        }
    },
    mounted() {
        this.$el.setAttribute('uid', this.uniqueId);
        if (this.option.pullDownHide) {
            this.touchOption = {
                pageY: 0,
                moveY: 0
            };
        }
    },
    data() {
        return {
            isShow: false,
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
            }, this.option.overlay || {}),
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
            popupMQ: []// 显隐队列
        };
    },
    computed: {
        getStyle() {
            return {
                'position': this.absolute ? 'absolute' : null,
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
    unmounted() {
        this.history && this.history.destroy();
    },
    methods: {
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
                    this.$event.on('overlayClick', this.autoClickHide);
                } else {
                    document.body.addEventListener('click', this.autoClickHide);
                }

            }
            if (this.option.stop) {
                // 禁用底层滚动
                document.body.addEventListener('touchmove', this.stopScroll, { passive: false });
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
                    this.$event.off('overlayClick', this.autoClickHide);
                } else {
                    document.body.removeEventListener('click', this.autoClickHide);
                }
            }
            if (this.option.stop) {
                // 解除底层滚动
                document.body.removeEventListener('touchmove', this.stopScroll, { passive: false });
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
            this.hide(null, 'auto');
        },
        afterEnter() {// 显示动画结束
            this.$event.emit('animateShow');
        },
        afterLeave() {
            this.$event.emit('animateHide');
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
                    this.$event.emit('progress', Math.max(0, this.progressBar.showTime - time));
                    time += 50;
                }, 50);
            }
        },
        initProgress() {
            this.progressBar.show && (this.control = '');
        },
        setMiddle(left, top) {
            const x = animate.format(this._size.screenWidth, left, (this._size.screenWidth - this._size.width) / 2);
            const y = animate.format(this._size.screenHeight, top, (this._size.screenHeight - this._size.height) / 2);
            this.setPosition(x, y);
        },
        setLayout(left, top, right, bottom) {
            if (this.option.showCenter) {// 居中
                this.setMiddle(left, top);
            } else {
                this.setPosition(left, top, right, bottom);
            }
        },
        stopScroll(e) {
            e.preventDefault();
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

        // 执行popup队列
        runMQ() {
            if (isLock(this.uniqueId)) {
                return;
            }

            const res = this.popupMQ.shift() || {};
            if (res.type === 'show') {
                this.popupShow.apply(this, res.args);
            } else if (res.type === 'hide') {
                this.popupHide.apply(this, res.args);
            }
        },

        // 显示Popup
        popupShow(left, top, right, bottom, callback) {
            if (this.getStatus()) {
                isFunction(callback) && callback();
                this.$el.classList.add('gently-move');
                setTimeout(() => {
                    this.$el.classList.remove('gently-move');
                }, 300);
                this.setLayout(left, top, right, bottom);
                return this;
            }

            lock(this.uniqueId);

            if (this.overlay.show) {// 显示overlay
                OverlayManager.open(this.overlay);
                this.setTop();
            }

            this._size = getSize(this.$el);
            this.createStyle();
            this.setLayout(left, top, right, bottom);
            this.insertNode.appendChild(this.$el);
            // 显示之前
            this.$event.emit('beforeShow', { type: 'beforeShow' });
            this.$nextTick(() => {
                setTimeout(() => {
                    this.isShow = true;
                    this.bindEvent();
                    this.useProgress();
                    if (this.history && !isObject(left)) {
                        this.history.push('popup');
                    }
                }, 0);
            });

            this.$event.once('animateShow', _ => {
                unLock(this.uniqueId);
                this.$event.emit('show', { type: 'show' });
                isFunction(callback) && callback();
                this.runMQ();
            });
        },
        // 关闭Popup
        popupHide(callback, state, data) {
            if (!this.getStatus()) {// 关闭状态
                if (isFunction(callback) && callback !== this.destroy) {
                    callback();
                }
                return this;
            }

            lock(this.uniqueId);

            this.$event.once('animateHide', _ => {
                unLock(this.uniqueId);
                this.initProgress();
                this.insertNode.removeChild(this.$el);
                this.overlay.show && OverlayManager.close(this.overlay);
                this.$event.emit('hide', { type: 'hide', state: state || 'close', data: data || {} });
                isFunction(callback) && callback();
                this.runMQ();
            });

            this.$event.emit('beforeHide', { type: 'hide', state: state || 'close', data: data || {} });
            this.isShow = false;
            this.unbindEvent();
            if (this.history && !isObject(callback)) {
                this.history.back(state === 'close-all');
            }

            return this;
        },

        /*** ----以下方法，支持外部调用---- ****/
        // 显示
        show(left, top, right, bottom, callback) {
            this.popupMQ.push({ type: 'show', args: [...arguments] });
            this.runMQ();
            return this;
        },
        hide(callback, state, data) {
            this.popupMQ.push({ type: 'hide', args: [...arguments] });
            this.runMQ();
            return this;
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
        // 设置移动动画
        setAniCenter(left, top) {
            this.$el.classList.add('gently-move');
            setTimeout(() => {
                this.$el.classList.remove('gently-move');
            }, 300);
            this.$nextTick(() => {
                this.setMiddle(left, top);
            });
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
        // 发送信息
        postMessage(option) {//通讯模块
            this.$event.emit('message', option);
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
        },
        // 显示状态
        getStatus() {
            return this.isShow;
        },
        destroy() {
            this.$event.emit('destroy', { type: 'destroy' });
        },
        // 装载vue组件
        loader(component, option) {
            let node = document.createElement('DIV');
            this.$el.appendChild(node);
            let app = createApp(component, option);
            if (this.$store) {
                app.use(this.$store);
            }

            if (this.$router) {
                app.use(this.$router);
            }
            app.config.globalProperties.$event = this.$event;
            return app.mount(node);
        }
    }
};
</script>
<style lang="scss" scoped>
.m-popup {
    position: fixed;
    left: 0;
    top: 0;

    &.gently-move {
        transition: all .3s;
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

/*
.left-enter,.left-leave-to {
  transform: translateX(-200%) !important;
}
.top-enter,.top-leave-to {
  transform: translateY(-200%) !important;
}
.right-enter,.right-leave-to {
  transform: translateX(200%) !important;
}
.bottom-enter,.bottom-leave-to {
  transform: translateY(200%) !important;
}
**/
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
