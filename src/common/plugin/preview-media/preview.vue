<template>
    <div class="m-preview-media" @click="handleClose">
        <swiper
            ref="swipe"
            :options="options"
            class="preview-media-swiper">
            <swiper-slide class="flex-center" v-for="(item, index) in sources" :key="index">
                <video
                    @click.stop
                    v-if="item.type === 'video'"
                    class="media-item"
                    :src="item.url"
                    :poster="item.poster"
                    :initial-time="0"
                    :controls="true"
                    :autoplay="false"
                    :loop="false"
                    :muted="false"
                />
                <movable-view
                    class="image-wrap"
                    @touch="handleTouch"
                    :ref="`movable${index}`"
                    v-else>
                    <img
                        alt=""
                        class="media-item"
                        @load="handleLoad(index)"
                        @error="handleError(item.url, $event)"
                        :src="item.url"/>
                </movable-view>
            </swiper-slide>
        </swiper>
        <div
            class="progress oswald-light"
            v-if="sources.length > 1">{{ selected }}&nbsp;&nbsp;/&nbsp;&nbsp;{{ sources.length }}
        </div>
        <div class="close flex-center" @click="handleClose">
            <i class="iconfont icon-close-full"></i>
        </div>
    </div>
</template>

<script>
import { swiper, swiperSlide } from 'common/components/swiper';
import { getWebpImg } from 'common/util';
import movableView from 'common/components/movable-view';

export default {
    name: 'preview',
    components: {
        swiper,
        swiperSlide,
        movableView
    },
    props: {
        sources: {
            type: Array,
            default() {
                return [];
            }
        },
        current: Number
    },
    data() {
        return {
            selected: this.current + 1,
            prev: null,
            options: {
                initialSlide: this.current,
                onSlideChangeStart: ({ realIndex }) => {
                    this.prev = this.selected - 1;
                    this.selected = realIndex + 1;
                },
                onSlideChangeEnd: () => {
                    if (this.prev !== null) {
                        this.$refs[`movable${this.prev}`]?.[0]?.onResetTouch();
                    }
                }
            }
        };
    },
    methods: {
        handleClose() {
            this.$event.emit('close');
        },
        handleError(url, ev) {
            const webp = getWebpImg(url);
            if (webp) {
                ev.target.src = webp;
            }
        },
        handleLoad(index) {
            this.$nextTick(() => {
                this.$refs[`movable${index}`]?.[0]?.initAreaSize();
            });
        },
        handleTouch(ev) {
            const swipe = this.$refs.swipe.$el;
            const touch = ev.touches[0];
            var clickEvent = new TouchEvent(
                'touchstart',
                {
                    touches: [touch],
                    changedTouches: [touch],
                    targetTouches: [touch],
                    target: swipe
                }
            );
            swipe.dispatchEvent(clickEvent);
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.m-preview-media {
    width: 100vw;
    height: 100vh;
    position: relative;

    .close {
        position: absolute;
        right: 20px;
        top: 20px;
        z-index: 9;

        .iconfont {
            font-size: $fs60;
            color: $white;
        }
    }

    .progress {
        color: $white;
        font-size: $fs28;
        line-height: 48px;
        height: 48px;
        border-radius: 36px;
        @include left_center;
        top: 20px;
        z-index: 2;
    }

    .preview-media-swiper {
        width: 100%;
        height: 100vh;

        .media-item {
            width: 100%;
        }

        .image-wrap {
            width: 100%;
            max-height: 100vh;
        }
    }
}
</style>
