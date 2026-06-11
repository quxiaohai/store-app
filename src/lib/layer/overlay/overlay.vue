<template>
    <transition :name="animate" @afterLeave="afterLeave">
        <div
            @touchmove.stop.prevent
            class="m-overlay"
            v-show="overlayShow"
            @click="handlerClick"
            :style="style"></div>
    </transition>
</template>
<script>
import { getZIndex } from 'lib/util/digit';

export default {
    name: 'overlay',
    data() {
        return {
            opacity: 0.5,
            color: '#000',
            animate: 'fade',
            overlayShow: false,
            zIndex: getZIndex()
        };
    },
    computed: {
        style() {
            return {
                'opacity': this.opacity,
                'background-color': this.color,
                'z-index': this.zIndex
            };
        }
    },
    methods: {
        show() {
            document.body.appendChild(this.$el);
            this.overlayShow = true;
        },
        hide(app) {
            this.overlayShow = false;
            this._app = app;
        },
        afterLeave() {
            document.body.removeChild(this.$el);
            this._app?.unmount();
        },
        setStyle(option) {
            this.color = option.color;
            this.opacity = option.opacity;
            this.zIndex = option.zIndex;
            this.animate = option.animate || 'fade';
        },
        bindClick(fn) {
            this._fn = fn;
        },
        handlerClick() {
            this._fn && this._fn({ type: 'overlay' });
            this.$emit('overlayClick', { type: 'overlay' });
        }
    }
};
</script>
<style lang="scss" scoped>
.m-overlay {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: #000;
    opacity: .5;
    z-index: 1000;
    backdrop-filter: blur(6px);
}

.fade-enter-active, .fade-leave-active {
    transition: all 0.2s linear;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0 !important;
}
</style>
