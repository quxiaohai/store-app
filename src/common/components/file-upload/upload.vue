<template>
    <div class="upload-item flex-between" v-if="state !== 3">
        <span v-if="state === 2" class="delete flex-center" @click="handleDelete">
            <i class="iconfont icon-close-full"></i>
        </span>
        <img @click="handlePreview" class="image" alt="" :src="mediaUrl" />
        <div class="progress-bar" v-if="state === 1">
            <div class="progress" :style="{ height: 100 - percent + '%' }"></div>
            <div class="progress-text oswald-bold">{{ percent }}%</div>
        </div>
    </div>
</template>

<script>
import { compressPictures, convertImgToJpg, getMediaType, getThumbnailImg, getNormalImageType } from 'common/util';
import { heicToJpg } from 'common/util/upload';
import { DEFAULT_IMAGE, DEFAULT_VIDEO_COVER } from 'common/util/constant';
import base64 from 'lib/str/base64';
import { UPLOAD_FILE } from 'common/api/fetch';

export default {
    name: 'upload',
    props: {
        /*******
         * file: Object,
         * path: String,
         * uploadUrl: String
         * extraData: Object
         * key: String
         * state: Number
         */
        option: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    emits: ['finish', 'del'],
    data() {
        return {
            base64: null,
            percent: 0,
            stateMap: { 0: '等待上传', 1: '上传中...', 2: '上传成功', 3: '上传失败' },
            state: this.option.state || 0, // 0等待上传， 1上传中，2成功，3失败
            path: this.option.path
        };
    },
    computed: {
        mediaType() {
            return getMediaType(this.option?.file?.name || this.option?.path);
        },
        mediaUrl() {
            if (this.mediaType === 'image') {
                return this.base64 || this.option?.path || this.path || DEFAULT_IMAGE;
            }

            return getThumbnailImg(this.option?.path || this.path, true);
        }
    },
    mounted() {
        this.startUpload();
    },
    methods: {
        // 预览
        handlePreview() {
            if (this.state !== 2) {
                return false;
            }

            this.$preview.media({
                sources: [{ url: this.option?.path || this.path, poster: this.mediaUrl, type: this.mediaType }],
                current: 0
            });
        },
        // 删除
        handleDelete() {
            this.$emit('del');
        },
        // 开始上传
        async startUpload() {
            if (!this.option.file) {
                return false;
            }

            let file = this.option.file;
            let size = null;

            this.startProgress();
            if (file.type?.toLowerCase() === 'image/heic') {
                const result = await heicToJpg(file);
                this.base64 = result.base64;
                file = result.file;
            }
            if (this.mediaType === 'image' && file && !getNormalImageType(file.name)) {
                const result = await convertImgToJpg(file);
                file = result?.file;
            }
            if (this.mediaType === 'image' && !this.option.isPrivate) {
                const result = await compressPictures(file, 1080);
                this.base64 = result.base64;
                file = result.file;
                size = `size=${result.width}-${result.height}`;
            }

            const { type, data } = await UPLOAD_FILE({
                file,
                url: this.option.uploadUrl,
                extraData: this.option.extraData
            });

            if (type === 'err') {
                this.state = 3;
                clearInterval(this._timer);
                this.$emit('finish', {
                    type: 'err',
                    data
                });

                return this.$layer.toast(data?.msg || `文件'${file.name}'上传失败`);
            }

            this.finish();

            let key = this.option.isPrivate ? data?.objectKey : data?.url;
            let thumb =
                this.mediaType === 'video'
                    ? `${size ? size + '&' : ''}thumbnailUrl=${base64.encode(DEFAULT_VIDEO_COVER)}`
                    : size;

            if (thumb) {
                key = key + (key.includes('?') ? '&' : '?') + thumb;
            }

            this.path = thumb ? data?.url + (data?.url?.includes('?') ? '&' : '?') + thumb : data?.url;

            this.$emit('finish', {
                type: 'suc',
                data: { url: this.path, key }
            });
        },
        startProgress() {
            this.percent = 0;
            this.state = 1;
            this._cut = 2;
            this._timer = setInterval(() => {
                this.increase(this._cut * Math.random());
                if (this.percent > 50) {
                    this._cut = 1;
                } else if (this.percent > 70) {
                    this._cut = 0.5;
                } else if (this.percent > 85) {
                    this._cut = 0.1;
                }
            }, 100);
        },
        increase(num) {
            this.percent = Math.round(Math.min(95, this.percent + num));
        },
        finish() {
            setTimeout(() => {
                this.percent++;
                if (this.percent < 100) {
                    return this.finish();
                }

                this.state = 2;
                this.percent = Math.min(100, this.percent);
            }, 5);

            if (this._timer !== null) {
                clearInterval(this._timer);
                this._timer = null;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static.scss';

$box-size: 208px;

.progress-bar {
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    left: 0;

    .progress {
        height: 100%;
        width: 100%;
        background-color: rgba($black, 0.2);
    }

    .progress-text {
        @include center;
        font-size: $fs28;
        font-weight: bold;
        color: $white;
        z-index: 1;
    }
}

.upload-item {
    position: relative;
    width: $box-size;
    height: $box-size;
    box-sizing: border-box;
    background-color: $input-disabled;
    padding: 4px;
    border-radius: 12px;
    overflow: hidden;
    margin: 0 22px 22px 0;

    .image {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .delete {
        position: absolute;
        top: 0;
        right: 0;
        width: 56px;
        height: 56px;
        z-index: 2;

        .iconfont {
            font-size: $fs56;
            color: rgba($black, 0.4);
        }
    }
}
</style>
