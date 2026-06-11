<template>
    <loading
        :visible="!loadSuc && loadingShow"
        class="media-show flex-center"
        :class="{auto: mediaAuto}"
        :style="videoStyle">
        <template v-if="lazyDone">
            <template v-if="mediaType === 'video' && !onlyImage">
                <video
                    ref="video"
                    x5-video-player-type="h5-page"
                    x5-video-player-fullscreen="true"
                    x-webkit-airplay="allow"
                    playsinline
                    x5-playsinline
                    webkit-playsinline
                    t7-video-player-type
                    @play="handleCallPlay"
                    @pause="handlePause"
                    @ended="handlePlayEnd"
                    @fullscreenchange="handleChangeScreen"
                    @canplay="handleLoadMedia"
                    class="u-video"
                    :class="isFullScreen ? 'contain' : 'cover'"
                    :controls="controls || isFullScreen"
                    :loop="loop"
                    :autoplay="autoplay"
                    :muted="muted"
                    :style="videoStyle"
                    :poster="poster"
                    :src="url"/>
                <div
                    v-if="!autoplay"
                    class="play-controls flex-center"
                    @click="handlePlayOrPauseVideo"
                    :class="[size, {play: isPlay || !isPlayOver}]">
                    <text
                        v-if="!isPlay"
                        class="media-play icon-circle-play iconfont"></text>
                </div>
                <div class="video-poster" v-show="!isPlay && isPlayOver" v-if="poster && !autoplay">
                    <img alt="" class="poster-img" :src="poster"/>
                </div>
            </template>
            <template v-else>
                <div v-if="errSlot && (!!errorUrl || mediaType === 'other')" class="u-image">
                    <slot/>
                </div>
                <div v-else class="image-box">
                    <img
                        v-if="gifPoster && showPosterUrl"
                        alt=""
                        class="u-image u-image-poster"
                        :class="getMode"
                        :src="gifPoster"
                        @error="handlePosterError"
                    />
                    <img
                        alt=""
                        ref="image"
                        class="u-image"
                        :class="getMode"
                        :src="getUrl"
                        @error="handleError"
                        @load="handleLoadMedia"
                        @click="handlePreviewMedia"/>
                </div>
            </template>
        </template>
    </loading>
</template>

<script>
import { getThumbnailImg, getWebpImg, getMediaType, getFileType, isWeiXinFun } from 'common/util';
import { isObject, isString } from 'lib/util/dataType';
import loading from 'common/components/loading';
import { DEFAULT_IMAGE, CACHE_MEDIA_RECT } from 'common/util/constant';
import storage from 'lib/util/storage';
import { isIOS, isAndroid } from 'common/util/browser';

let _video_ = null;

export default {
    name: 'media-show',
    props: {
        mode: [String, Object],// cover|contain|auto | {video: 'cover', image: 'cover'}
        url: {
            type: String
        },
        /// gif 封面截图
        gifPosterUrl: {
            type: String
        },
        preview: {
            type: Boolean,
            default: false
        },
        list: {
            type: Array,
            default() {
                return [];
            }
        },
        muted: {
            type: Boolean,
            default: true
        },
        loop: {
            type: Boolean,
            default: false
        },
        autoplay: {
            type: Boolean,
            default: false
        },
        controls: {
            type: Boolean,
            default: false
        },
        // 仅图片显示
        onlyImage: {
            type: Boolean,
            default: false
        },
        // 是否活跃的
        active: {
            type: Boolean,
            default: true
        },
        size: {// large, medium, small
            type: String,
            default: 'small'// medium, large
        },
        // 全屏播放
        screenFull: {
            type: Boolean,
            default: false
        },
        // 延迟加载时间
        lazyLoad: {
            type: Number,
            default: 0
        },
        // error显示自定义
        errSlot: {
            type: Boolean,
            default: false
        },
        // 未加载完成时是否要显示loading
        loadingShow: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            defaultUrl: DEFAULT_IMAGE,
            errorUrl: null,
            gifPoster: this.gifPosterUrl,
            isPlay: false,
            isPlayOver: true,
            isFullScreen: false,
            videoStyle: {},
            loadSuc: this.$store.state.isServerRender || this.$store.state.isClientCache,// 加载是否成功
            lazyDone: this.lazyLoad === 0,
            showPosterUrl: true
        };
    },
    watch: {
        active(v) {
            // 激活，需要播放
            if (v && this.autoplay && this.loop && !this.controls) {
                if (isWeiXinFun()) {
                    return this.initWxVideoPlay();
                }
                return this.onPlay();
            }

            // 激活，需要播放-非循环播放
            if (v && this.autoplay && !this.controls) {
                if (isWeiXinFun()) {
                    return this.initWxVideoPlay();
                }
                return this.onPlay();
            }

            if (v || !this.isPlay) {
                return false;
            }
            // 非活动的，暂停视频
            this.onPause();
        },
        // 监听mediaType变化
        mediaType() {
            this.initLazy();
        },
        gifPosterUrl(v) {
            this.gifPoster = v;
        }
    },
    components: {
        loading
    },
    computed: {
        mediaType() {
            return getMediaType(this.url);
        },
        poster() {
            if (this.mediaType === 'video') {
                return getThumbnailImg(this.url, true);
            }

            return '';
        },
        getUrl() {
            if (this.mediaType === 'image') {
                return this.errorUrl || this.url;
            } else if (this.mediaType === 'other') {
                return this.defaultUrl;
            } else if (this.mediaType === 'video') {
                return this.poster;
            }

            return this.url;
        },
        getMode() {
            if (isObject(this.mode)) {
                if (this.mode.video && this.mediaType === 'video' && !this.onlyImage) {
                    return this.mode.video;
                } else if (this.mode.image) {
                    return this.mode.image;
                }
            } else if (isString(this.mode)) {
                return this.mode;
            }

            if (this.getUrl?.includes('default.png')) {
                return 'contain';
            }
            return 'cover';
        },
        mediaAuto() {
            if (this.getMode === 'auto') {
                return !this.loadSuc;
            }
            return false;
        }
    },
    mounted() {
        this.initLazy();
        if (isWeiXinFun() && this.autoplay) {
            this.initWxVideoPlay();
        }
        this.readMediaRect();
    },
    methods: {
        initWxVideoPlay() {
            if (this.mediaType !== 'video') {
                return;
            }
            if (isIOS()) {
                this.$nextTick(() => {
                    // 必须在微信Weixin JSAPI的WeixinJSBridgeReady才能生效
                    document.addEventListener(
                        'WeixinJSBridgeReady',
                        () => {
                            this.onPlay();
                        },
                        false
                    );
                });
            } else if (isAndroid()) {
                this.$el?.addEventListener('touchstart', () => {
                    this.onPlay();
                });
            }
        },
        initLazy() {
            new Promise(resolve => {
                if (this.lazyLoad > 0 && !this.lazyDone) {
                    clearTimeout(this._timer);
                    this._timer = setTimeout(() => {
                        this.lazyDone = true;
                        this.$nextTick(() => {
                            resolve();
                        });
                    }, this.lazyLoad);
                } else {
                    resolve();
                }
            }).then(() => {
                if (this.mediaType === 'other' && this.errSlot) {
                    this.loadSuc = true;
                } else if (this.mediaType === 'video') {
                    // 解决部分浏览器不执行canplay的问题
                    this.handleLoadMedia({ type: 'canplay' });
                } else if (this.mediaType === 'image') {
                    if (getFileType(this.url) === 'gif' && this.gifPoster) {
                        this.loadSuc = true;
                    } else {
                        // 如果500毫秒图片加载还未完成，直接成功
                        this._timer = setTimeout(() => {
                            this.handleLoadMedia();
                        }, 500);
                    }
                }
            });
        },
        // 存储图片或者视频高度
        storageMediaRect(height) {
            const map = storage.session.get(CACHE_MEDIA_RECT) || {};
            map[this.getUrl] = height;
            storage.session.set(CACHE_MEDIA_RECT, map);
        },
        // 读取媒体信息
        readMediaRect() {
            const map = storage.session.get(CACHE_MEDIA_RECT) || {};
            const height = map[this.getUrl];
            if (height) {
                this.videoStyle = { height: height + 'px' };
            }
        },
        handleLoadMedia() {
            clearTimeout(this._timer);
            setTimeout(() => {
                this.loadSuc = true;
                this.showPosterUrl = false;
                this.$emit('loaded', { type: this.mediaType });

                this.$nextTick(() => {
                    if (this.getMode === 'auto') {
                        const width = window.innerWidth;
                        if (this.mediaType === 'video') {
                            const videoWidth = this.$refs.video?.videoWidth || width;
                            const videoHeight = this.$refs.video?.videoHeight || 300;
                            const rote = width / videoWidth;
                            const height = videoHeight * rote + 'px';
                            this.videoStyle = { height: height };
                            this.storageMediaRect(height);
                            this.$emit('loadedmetadata', { el: this.$el, height });
                        } else if (this.mediaType === 'image') {
                            const imgWidth = this.$refs.image?.width;
                            const imgHeight = this.$refs.image?.height;
                            const rote = width / imgWidth;
                            const height = imgHeight * rote + 'px';
                            this.storageMediaRect(height);
                        }
                    }
                });
            }, 50);
        },
        // 加载失败
        handleError() {
            const jpg = getWebpImg(this.getUrl);
            if (jpg) {
                this.errorUrl = jpg;
            } else {
                this.errorUrl = this.defaultUrl;
            }

            this.loadSuc = true;
            this.$emit('loaded', { type: this.mediaType });
        },
        // 加载失败
        handlePosterError() {
            const jpg = getWebpImg(this.gifPoster);
            if (jpg) {
                this.gifPoster = jpg;
            } else {
                this.gifPoster = this.defaultUrl;
            }
        },
        // 暂停其它所有视频
        onPause() {
            // 非活动的，暂停视频
            if (_video_ !== null) {
                _video_.pause();
                _video_ = null;
            }
        },
        // 播放当前视频
        onPlay() {
            if (!this.isPlay) {
                this.$refs.video?.play();
            }
        },
        // 销毁视频
        onDestroy() {
            try {
                const video = this.$refs.video;
                if (video) {
                    video.parentNode.removeChild(video);
                }
            } catch (e) {
                console.log('video-destroy', e);
            }
        },
        // 播放
        handleCallPlay() {
            this.$emit('play');
            if (_video_ !== this.$refs.video) {
                this.onPause();
                _video_ = this.$refs.video;
            }
            this.isPlay = true;
            this.isPlayOver = false;
        },
        //暂停
        handlePause() {
            this.isPlay = false;
        },
        // 播放结束了
        handlePlayEnd() {
            this.isPlayOver = true;
        },
        // 全屏和非全屏
        handleChangeScreen() {
            this.isFullScreen = !!window.document.fullscreenElement;
        },
        // 播放或暂停视频
        handlePlayOrPauseVideo() {
            if (this.autoplay) {
                return false;
            }

            if (this.screenFull) {
                return this.handlePreviewMedia();
            }

            const video = this.$refs.video;

            // 如果是播放状态，直接全屏
            // if (this.isPlay) {
            //     this.isFullScreen = true;
            //     return video?.requestFullscreen({});
            // }

            if (!this.isPlay) {
                video?.play();
            } else {
                video?.pause();
            }
        },
        handlePreviewMedia() {
            if (this.preview) {
                const sources = [];
                if (this.list.length > 0) {
                    this.list.forEach(url => {
                        const type = getMediaType(url);
                        if (type === 'video') {
                            sources.push({
                                url,
                                type,
                                poster: getThumbnailImg(url, true)
                            });
                        } else {
                            sources.push({ url, type });
                        }
                    });

                    this.$preview.media({
                        sources,
                        current: sources.findIndex(r => r.url === this.url)
                    });
                } else {
                    const type = getMediaType(this.url);
                    if (type === 'video') {
                        sources.push({
                            url: this.url,
                            type,
                            poster: getThumbnailImg(this.url, true)
                        });
                    } else {
                        sources.push({ url: this.url, type });
                    }

                    this.$preview.media({
                        sources,
                        current: 0
                    });
                }
            } else {
                this.$emit('preview', this.url);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.media-show {
    position: relative;
    overflow: hidden;

    :deep(.m-loading-box) {
        z-index: 1;
    }

    &.auto {
        height: 300px;
    }

    .video-poster {
        width: 100%;
        height: 100%;
        @include center;
        z-index: 1;

        .poster-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .play-controls {
        width: 100%;
        height: 100%;
        @include gradient-vertical(rgba($black, 0.15), rgba($black, 0));
        z-index: 2;
        @include center;

        &.play {
            width: 70%;
            background-image: none;
        }

        .media-play {
            font-size: $fs36;
            color: $white;
        }


        &.large {
            .media-play {
                font-size: 100px;
            }
        }

        &.medium {
            .media-play {
                font-size: 60px;
            }
        }
    }

    .u-video {
        width: 100%;
        height: 100%;
        display: block;

        &.contain {
            object-fit: contain;
        }

        &.cover {
            object-fit: cover;
        }
    }

    .image-box {
        position: relative;
        width: 100%;
        height: 100%;
        .u-image {
            width: 100%;
            height: 100%;
            display: block;
    
            &.contain {
                object-fit: contain;
            }
    
            &.cover {
                object-fit: cover;
            }
        }
        .u-image-poster {
            position: absolute;
            z-index: 2;
        }
    }
}
</style>
