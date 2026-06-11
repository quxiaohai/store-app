<template>
    <div class="swiper-container">
        <slot name="parallax-bg"></slot>
        <div :class="defaultSwiperClasses.wrapperClass">
            <slot></slot>
        </div>
        <slot name="pagination"></slot>
        <slot name="button-prev"></slot>
        <slot name="button-next"></slot>
        <slot name="scrollbar"></slot>
    </div>
</template>

<script>
import Swiper from './js/swiper';

export default {
    name: 'swiper',
    props: {
        options: {
            type: Object,
            default() {
                return {
                    autoplay: 3500
                };
            }
        }
    },
    data() {
        return {
            defaultSwiperClasses: {
                wrapperClass: 'swiper-wrapper'
            }
        };
    },
    mounted() {
        var self = this;
        var mount = () => {
            if (!this.swiper) {
                var setClassName = false;
                for (let className in this.defaultSwiperClasses) {
                    if (this.defaultSwiperClasses.hasOwnProperty(className)) {
                        if (this.options[className]) {
                            setClassName = true;
                            this.defaultSwiperClasses[className] = this.options[className];
                        }
                    }
                }
                var mountInstance = () => {
                    if (!this.options.loop) {
                        this.swiper = new Swiper(this.$el, this.options);
                    } else {
                        setTimeout(() => {
                            this.swiper = new Swiper(this.$el, this.options);
                            if (this.swiper.slides.length <= 3) {
                                this.swiper.lockSwipes();
                            }
                        }, 520);
                    }
                };
                setClassName ? this.$nextTick(mountInstance) : mountInstance();
            }
        };
        this.options.notNextTick ? mount() : this.$nextTick(mount);

    },
    updated() {
        if (this.swiper) {
            this.swiper.update();
        }
    },
    unmounted() {
        if (this.swiper) {
            this.swiper.destroy();
            delete this.swiper;
        }
    }
};
</script>
<style lang="sass" scoped>
@import "./css/swiper.css"
</style>
