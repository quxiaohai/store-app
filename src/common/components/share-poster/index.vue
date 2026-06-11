<template>
    <div v-if="!isHarmonyOs" @click="handleShare">
        <popup v-model="visible" :option="posterOption">
            <div class="poster-box flex-center" :class="`mode-${isApp ? 'image' : 'h5'}`">
                <img alt="" :src="imageUrl" class="image" v-if="imageUrl" />
                <template v-if="!isApp">
                    <div class="btn-save flex-center" @click="handleTap('save')">点击保存至相册</div>
                    <div class="close flex-center" @click="onClose">
                        <i class="iconfont icon-close-full"></i>
                    </div>
                </template>
            </div>
        </popup>
        <popup v-if="isApp" v-model="visible" :option="shareOption">
            <div class="share-box">
                <div class="sheet-items flex-center">
                    <div
                        class="item flex-center"
                        @click="handleTap('share')"
                        :id="`report-${reportId}***${JSON.stringify({ share: '01', item_id: 0 })}`"
                        :report-id="`report-${reportId}***${JSON.stringify({ share: '01', item_id: 0 })}`"
                    >
                        <div class="icon flex-center">
                            <i class="iconfont icon-wechat"></i>
                        </div>
                        <div class="text">微信好友</div>
                    </div>
                    <div
                        class="item flex-center"
                        @click="handleTap('friends')"
                        :id="`report-${reportId}***${JSON.stringify({ share: '03', item_id: 3 })}`"
                        :report-id="`report-${reportId}***${JSON.stringify({ share: '03', item_id: 3 })}`"
                    >
                        <div class="icon friends flex-center">
                            <img
                                alt=""
                                class="img"
                                src="https://image-www.narwal.com/applet/images/common/friends.svg"
                            />
                        </div>
                        <div class="text">朋友圈</div>
                    </div>
                    <div
                        class="item flex-center"
                        @click="handleTap('save')"
                        :id="`report-${reportId}***${JSON.stringify({ share: '02', item_id: 1 })}`"
                        :report-id="`report-${reportId}***${JSON.stringify({ share: '02', item_id: 1 })}`"
                    >
                        <div class="icon save flex-center">
                            <i class="iconfont icon-simple-down"></i>
                        </div>
                        <div class="text">保存海报</div>
                    </div>
                </div>
                <div
                    @click="onClose"
                    class="cancel-btn flex-center"
                    :id="`report-${reportId}***${JSON.stringify({ share: '04', item_id: 2 })}`"
                    :report-id="`report-${reportId}***${JSON.stringify({ share: '04', item_id: 2 })}`"
                >
                    取消
                </div>
            </div>
        </popup>
        <slot />
    </div>
</template>

<script>
import { imageLoad, downloadBase64File, photoAlbum, moments, wxChat, toPage, getWebpImg } from 'common/util';
import bridge from 'common/util/bridge';
import { isLock, lock, unLock } from 'lib/util/lock';
import { ACTIVITY_MAP } from 'common/util/constant';
import reQrCode from './re-qr-code';
import { isWeApp } from 'common/util/browser';
import { CREATE_APPLET_CODE, UPLOAD_BASE64 } from 'common/api/fetch';

export default {
    name: 'share-poster',
    props: {
        /************
         * {
         *  shareImage: 分享图片,
         *  shareText: 分享文案,
         *  shareMomentsText: 分享朋友圈文案(非必传),
         *  posterImage: 生成海报图片,
         *  shareMomentsImage: 分享朋友圈图片(可不传),
         *  texts: 生成海报文案(最多支持2行，用#分隔),
         *  applets: 生成海报二维码文案(最多支持2行，用#分隔),
         *  actName: 活动名称,
         *  theme: 生成海报样式（default | fill),
         *  link: 链接类型(applet 为完整小程序链接 act 为活动平台链接),
         *  actUrl: 分享链接
         *  shareCardUrl: 卡片完整图片
         * }
         */
        option: {
            type: Object,
            required: true
        },
        // 是否禁用初始化分享
        disabled: {
            type: Boolean,
            default: true
        },
        // 是否默认加载资源
        initLoad: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            isApp: false,
            imageUrl: null,
            visible: false,
            posterOption: {
                showCenter: true,
                zIndex: 11,
                overlay: {
                    opacity: 0.3
                },
                stop: true,
                history: true
            },
            shareOption: {
                animate: {
                    name: 'bottom'
                },
                left: 0,
                bottom: 0,
                zIndex: 12,
                overlay: {
                    show: false
                }
            },
            shareCardUrl: this.option.shareCardUrl || null,
            shareCardBase64: null,
            shareCallback: null,
            isHarmonyOs: false
        };
    },
    computed: {
        reportId() {
            switch (this.option.actName) {
                case ACTIVITY_MAP.TRIAL:
                    return '3011071006';
                case ACTIVITY_MAP.REFERRAL:
                    return 'TJ2021781006';
                case ACTIVITY_MAP.TRADE:
                    return 'NZHX2022351006';
                default:
                    return this.option.clickReportId;
            }
        }
    },
    emits: ['select'],
    mounted() {
        this.isApp = bridge.isApp();
        this.isHarmonyOs = bridge.isHarmonyOs();
        if (!this.disabled && this.initLoad && !this.isHarmonyOs) {
            this.initShareCard();
        }
    },
    watch: {
        disabled(v) {
            if (!v) {
                this.initLoad && this.initShareCard();
            }
        }
    },
    methods: {
        /********
         *
         * @param option
         * {
         *     list: []图片列表，2张,一张主图，一张小程序码
         *     texts: []文案，最多2行
         *     theme: 'default' 默认 fill 占满全卡片
         * }
         * @param callback 直接获取base64,不显示
         */
        onShow(option, callback) {
            if (this.imageUrl) {
                this.visible = true;
                return false;
            }

            if (option.base64) {
                this.imageUrl = option.base64;
                this.visible = true;
                return false;
            }

            if (option?.list?.length < 2) {
                return this.$layer.toast('当前无主图！');
            }

            this.loadImageBase64(option, callback);
        },
        onClose() {
            this.visible = false;
        },
        // 分享
        handleShare() {
            if (this.disabled) {
                return false;
            }
            if (bridge.isWeApp()) {
                if (!this.shareCardUrl) {
                    if (!this.initLoad) {
                        this.initShareCard();
                    }

                    this.shareCallback = () => {
                        toPage({
                            path: '/share',
                            query: {
                                ...this.option,
                                shareCardUrl: this.shareCardUrl
                            }
                        });
                    };
                    return this.$layer.wait('生成中');
                }

                return toPage({
                    path: '/share',
                    query: {
                        ...this.option,
                        shareCardUrl: this.shareCardUrl
                    }
                });
            }

            if (this.shareCardBase64) {
                return this.onShow({ base64: this.shareCardBase64 });
            } else if (this.shareCardUrl) {
                return this.onShow({ base64: this.shareCardUrl });
            } else {
                if (!this.initLoad) {
                    this.initShareCard();
                }
                this.shareCallback = () => {
                    this.onShow({ base64: this.shareCardBase64 });
                };
                return this.$layer.wait('生成中');
            }
        },
        // 创建小程序码
        async createAppletCode(wait) {
            this._wxBase64 = await CREATE_APPLET_CODE({
                wait,
                url: this.option.actUrl,
                full: this.option.link === 'applet'
            });
        },
        async initShareCard() {
            if (isLock('card')) {
                return false;
            }
            lock('card');
            await this.createAppletCode();
            this.onShow(
                {
                    list: [this.option.posterImage, this._wxBase64],
                    theme: this.option.theme,
                    texts: this.option.texts?.split('#') || [],
                    applets: this.option.applets?.split('#') || []
                },
                async (base64) => {
                    unLock('card');
                    this.shareCardBase64 = base64;
                    if (isWeApp()) {
                        const data = await UPLOAD_BASE64({ base64 });
                        this.shareCardUrl = data?.url || null;
                    }

                    if (this.shareCallback) {
                        this.shareCallback();
                        this.shareCallback = null;
                    }
                }
            );
        },
        // 获取网络图片base64
        async getNetworkImageBase64(urls, wait) {
            const [res, err] = await this.$http.awaitTo(
                this.$http.get(this.$api.getBase64, {
                    params: {
                        urlList: urls
                    },
                    wait
                })
            );

            if (err) {
                return {
                    msg: err.msg,
                    data: null
                };
            }

            return {
                data: res.data
            };
        },
        // 加载图片base64
        async loadImageBase64({ list, texts, applets, theme }, callback) {
            let urls = list.join(',');
            let base64 = null;
            // 如果配置的是webp，把webp改成jpg
            if (/.webp/.test(list[0])) {
                const jpg = getWebpImg(list[0]);
                if (jpg) {
                    list[0] = jpg;
                }
            }
            if (list[1]?.includes('data:image/png;base64')) {
                urls = list[0];
                base64 = list[1];
            } else if (!list[1]?.includes('http')) {
                urls = list[0];
                base64 = list[1];
            }

            const res = await this.getNetworkImageBase64(urls, !!callback ? false : '生成中...');

            if (!res.data) {
                return this.$layer.toast(res.msg);
            }

            !callback && this.$layer.wait('生成中...');
            const base64s = base64 ? res.data.concat(base64) : res.data;
            this.createPoster(base64s, texts, applets, theme, callback);
        },
        createPoster(list, texts, applets, theme, callback) {
            const canvas = document.createElement('canvas');
            canvas.width = 1120;
            canvas.height = 1784;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // 是否全卡片图
            const isFill = theme === 'fill';

            if (!isFill) {
                if (texts?.length > 0) {
                    ctx.fillStyle = '#000000';
                    ctx.font = `48px sans-serif`;
                    const offsetY = 1620;
                    texts.slice(0, 2).forEach((text, i) => {
                        ctx.fillText(text, 96, offsetY + 72 * i);
                    });
                }

                // 长按识别小程序
                if (applets?.length > 0) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.font = `32px sans-serif`;
                    const topY = 1632;
                    applets.slice(0, 2).forEach((text, i) => {
                        ctx.fillText(text, 676, topY + 48 * i);
                    });
                }
            }

            const logoUrl = '/assets/images/common/logo-text.png';
            Promise.all([imageLoad(list[0]), imageLoad(list[1]), imageLoad(logoUrl)])
                .then(async (res) => {
                    try {
                        // 主图
                        const img1 = res[0];
                        const imgW = img1.width;
                        if (isFill) {
                            const imgH = imgW * 1.5928;
                            ctx.drawImage(
                                img1,
                                0,
                                0,
                                imgW,
                                Math.min(imgH, img1.height),
                                28,
                                28,
                                canvas.width - 56,
                                canvas.height - 56
                            );
                        } else {
                            const imgH = imgW * 1.39;
                            ctx.drawImage(
                                img1,
                                0,
                                0,
                                imgW,
                                Math.min(imgH, img1.height),
                                28,
                                28,
                                canvas.width - 56,
                                1480
                            );
                        }
                    } catch (e) {
                        console.log('err0=>', e);
                    }

                    try {
                        // narwal LOGO
                        const img3 = res[2];
                        if (isFill) {
                            //ctx.drawImage(img3, 0, 0, img3.width, img3.height, 0, 1672, canvas.width, 88);
                        } else {
                            ctx.drawImage(img3, 0, 0, img3.width, img3.height, 0, 1700, canvas.width, 88);
                        }
                    } catch (e) {
                        console.log('err2=>', e);
                    }

                    try {
                        // 小程序码
                        if (isFill) {
                            const img2 = await reQrCode(res[1]);
                            ctx.drawImage(img2, 0, 0, img2.width, img2.height, 788, 1468, 240, 240);
                        } else {
                            const img2 = res[1];
                            ctx.drawImage(img2, 0, 0, img2.width, img2.height, 828, 1548, 200, 200);
                        }
                    } catch (e) {
                        console.log('err1=>', e);
                    }

                    if (callback) {
                        callback(canvas.toDataURL('image/jpeg', 0.8));
                    } else {
                        this.imageUrl = canvas.toDataURL('image/jpeg', 1);
                        this.$layer.closeWait();
                        this.visible = true;
                    }
                })
                .catch((res) => {
                    console.log('err', res);
                });
        },
        // 获取卡片base64
        getPosterBase64() {
            return this.imageUrl;
        },
        // 保存文件
        handleSave() {
            downloadBase64File(this.imageUrl, 'narwal.jpg');
        },
        // APP 操作
        async handleTap(type) {
            // 如果图片是网络图片
            if (!this.shareCardBase64 && /^(https?:\/\/)/.test(this.imageUrl)) {
                const wait = type === 'save' ? '保存' : '分享';
                const result = await this.getNetworkImageBase64(this.imageUrl, `${wait}中`);
                if (!result.data) {
                    return this.$layer.fail(`${wait}失败`);
                }

                this.imageUrl = result.data[0];
                this.shareCardBase64 = this.imageUrl;
            }

            if (!this.isApp) {
                return this.handleSave();
            }

            this.$emit('select', type);

            if (isLock('share')) {
                if (this._shareNow && Date.now() - this._shareNow < 1000) {
                    this._shareNow = Date.now();
                    return this.$layer.toast('请勿重复点击~');
                }
                unLock('share');
                this._shareNow = Date.now();
            }

            lock('share');

            if (type === 'save') {
                photoAlbum({
                    activityName: this.option.actName,
                    base64: this.imageUrl,
                    toast: (msg) => {
                        this.$layer.toast(msg);
                    },
                    onClose: () => {
                        this.onClose();
                    },
                    complete: () => {
                        unLock('share');
                    }
                });
            } else if (type === 'friends') {
                // 分享朋友圈
                moments({
                    base64: this.imageUrl,
                    url: this.option.shareCardUrl,
                    title: this.option.shareMomentsText || this.option.shareText,
                    activityName: this.option.actName,
                    toast: (msg) => {
                        this.$layer.toast(msg);
                    },
                    onClose: () => {
                        this.onClose();
                    },
                    complete: () => {
                        unLock('share');
                    }
                });
            } else if (type === 'share') {
                wxChat({
                    title: this.option.shareText,
                    url:
                        this.option.link === 'applet'
                            ? this.option.actUrl
                            : `views/act/index?path=${encodeURIComponent(`${this.option.actUrl}`)}`,
                    image: this.option.shareImage,
                    activityName: this.option.actName,
                    toast: (msg) => {
                        this.$layer.toast(msg);
                    },
                    onClose: () => {
                        this.onClose();
                    },
                    complete: () => {
                        unLock('share');
                    }
                });
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.poster-box {
    flex-direction: column;
    position: relative;

    .close {
        @include left_center;
        bottom: -90px;
        width: 80px;

        .iconfont {
            color: $white;
            font-size: 68px;
        }
    }

    &.mode-image {
        transform: translateY(-140px);

        .image {
            border-radius: 16px;
        }
    }

    &.mode-h5 {
        transform: translateY(-50px);
    }

    .image {
        width: 560px;
        height: 892px;
        border-radius: 16px 16px 0 0;
    }

    .btn-save {
        width: 560px;
        height: 82px;
        font-size: $fs24;
        font-weight: 400;
        color: $black;
        background-color: $input-disabled;
        border-radius: 0 0 18px 18px;
        margin-top: -1px;
    }

    .canvas {
        width: 1120px;
        height: 1784px;
        position: fixed;
        top: -10000px;
        opacity: 0;
    }
}

.share-box {
    width: 100vw;
    padding-bottom: $safe-height;
    background-color: $white;
    box-shadow: 0px -4px 8px rgba($black, 0.02);
    backdrop-filter: blur(10px);
    border-radius: 40px 40px 0 0;
    overflow: hidden;

    .sheet-items {
        width: 100%;
        height: 196px;
        background-color: $input-disabled;

        .item {
            flex-direction: column;
            margin: 0 60px;
            border: 0 none;

            .icon {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background-color: $green-dark;

                &.friends {
                    background-color: $white;

                    .img {
                        width: 52px;
                        height: 52px;
                    }
                }

                &.save {
                    background-color: $purple;
                }

                .iconfont {
                    color: $white;
                    font-size: $fs52;
                }
            }

            .text {
                font-size: $fs20;
                font-weight: 400;
                color: $black;
                padding-top: 14px;
            }
        }
    }

    .cancel-btn {
        height: 96px;
        font-size: $fs32;
        font-weight: bold;
        color: $black;
    }
}
</style>
