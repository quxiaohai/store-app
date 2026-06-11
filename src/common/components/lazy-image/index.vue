<template>
    <loading
        :visible="!success && loading"
        class="m-lazy-image"
        :class="{suc: success}">
        <img
            class="_fit"
            v-if="success"
            :src="showSrc"
            :class="mode"
            :alt="alt"
            ref="image"/>
    </loading>
</template>
<script>
import env from 'lib/comp/env';
import pageScroll from 'common/util/page-scroll';
import getOffset from 'lib/dom/getOffset';
import loading from 'common/components/loading';
import { getWebpImg } from 'common/util';
import { EVENTS } from 'common/util/constant';

export default {
    name: 'lazy-image',
    props: {
        alt: String,
        src: { type: String, default: '' },
        errorSrc: { type: String, default: '' },
        initShow: { type: Boolean, default: true }, // 是否初化始先显示errorSrc
        mode: {
            type: String,//缩放模式，不保持纵横比缩放图片，使图片的宽高完全拉伸至填满 image 元素
            default: 'scaleToFill'//scaleToFill|fill,aspectFit|contain,aspectFill|cover
        },
        // 默认显示loading
        loading: {
            type: Boolean,
            default: true
        },
        lazy: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            showSrc: env.isServer() ? this.src : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABBJREFUeNpi/v//PwNAgAEACQsDAUdpTjcAAAAASUVORK5CYII=',
            img: null,
            success: true,
            loadStyle: {}
        };
    },
    components: {
        loading
    },
    created() {
        if (this.errorSrc !== '' && this.initShow) {
            this.showSrc = this.errorSrc;
            this.success = true;
        }
    },
    mounted() {
        this.success = false;
        this.initLazy();
    },
    watch: {
        src() {
            this.loadImage();
        }
    },
    methods: {
        initLazy() {
            if (this.lazy) {
                this.imgConfig = {
                    top: getOffset(this.$el).top - this.$store.state.screenHeight,
                    load: false
                };

                if (this.imgConfig.top > 100) {
                    pageScroll.on(this.handleScroll);
                } else {
                    this.loadImage();
                    this.imgConfig = null;
                }
            } else {
                this.loadImage();
            }
        },
        handleScroll(opt) {
            if (this.imgConfig.load) {
                return false;
            }
            if (opt.scrollTop - 100 >= this.imgConfig.top) {
                this.imgConfig.load = true;
                pageScroll.off(this.handleScroll);
                this.loadImage();
            }
        },
        image(src) {//对图片进行预加载
            return new Promise((resolve, reject) => {
                this.img = new Image();
                this.img.src = src;
                if (this.img.complete) {
                    resolve();
                } else {
                    this.img.onload = () => {
                        resolve();
                    };
                    this.img.onerror = () => {
                        reject();
                    };
                }
            });
        },
        loadImage() {//加载图片
            if (this.src === null || this.src === 'null' || this.src.length === 0) {
                this.err();
                return;
            }
            this.image(this.src)
                .then(r => {
                    this.suc();
                }).catch(r => {
                this.err();
            });
        },
        suc() {//成功
            this.success = true;
            this.showSrc = this.src;
            this.$emit('load', { src: this.src, width: this.img.width, height: this.img.height });
            this.$event.emit(EVENTS.IMAGE_DONE, {
                type: 'success',
                src: this.src,
                width: this.img.width,
                height: this.img.height
            });
        },
        err() {//失败
            this.$emit('error', { src: this.src });
            this.$event.emit(EVENTS.IMAGE_DONE, {
                type: 'error',
                src: this.src
            });
            const jpg = getWebpImg(this.src);
            if (jpg) {
                this.success = true;
                this.showSrc = jpg;
                return false;
            }

            if (this.errorSrc !== '') {
                this.showSrc = this.errorSrc;
                this.success = true;
            }
        }
    }
};
</script>
<style lang="scss" scoped>
@import "common/style/static";

.m-lazy-image {
    display: inline-block;
    overflow: hidden;
    position: relative;
    width: 100%;
    height: 100%;
    line-height: 0;
    background-color: #f0f0f0;

    :deep(.m-loading-box) {
        z-index: 1;
    }

    &.suc {
        background: none !important;
    }

    ._fit {
        width: 100%;
        height: 100%;

        &.contain, &.aspectFit {
            object-fit: contain;
        }

        &.cover, &.aspectFill {
            object-fit: cover;
        }

        &.fill, &.scaleToFill {
            object-fit: fill;
        }
    }
}
</style>
