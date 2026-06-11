<template>
    <div class="m-share-text-entry" v-if="type === 'topright-text'">
        <div v-if="!!shareOption" @click="handleShare" class="share-icon flex-center" :id="`report-${clickReportId}`" :report-id="`report-${clickReportId}`">
            <div class="text">{{ shareText }}</div>
            <span class="iconfont icon-circle-share"></span>
        </div>
    </div>
    <share-poster :option="shareOption" ref="poster" />
</template>

<script>
import bridge from 'common/util/bridge';
import { CREATE_APPLET_CODE } from 'common/api/fetch';
import sharePoster from 'common/components/share-poster';
import { toPage } from 'common/util';
import query from 'lib/json/query';

export default {
    name: 'share-entry',
    components: {
        sharePoster
    },
    props: {
        /**
         * 分享入口UI展示样式
         * 默认：右上角文本分享样式
         */
        type: {
            type: String,
            default: 'topright-text'
        },
        /**
         * 分享入口显示文案
         */
        shareText: {
            type: String,
            default: '分享'
        },
        /**
         * 活动名称 ACTIVITY_MAP
         */
        actName: String,
        /**
         * 分享路径，微信分享时要用
         */
        actUrl: String,
        /**
         * 分享按钮点击埋点ID
         */
        clickReportId: String
    },
    setup() {},
    data() {
        return {
            shareSetting: {}
        };
    },
    computed: {
        // 分享
        shareOption() {
            return {
                shareImage: this.shareSetting?.chatUrl,
                shareText: this.shareSetting?.chatText,
                actName: this.actName,
                actUrl: this.actUrl,
                shareMomentsImage: this.shareSetting?.momentsUrl,
                shareMomentsText: this.shareSetting?.momentsText,
                clickReportId: this.clickReportId // 分享按钮埋点参数
            };
        }
    },
    mounted() {
        this.getShareInfo();
    },
    methods: {
        // 分享
        async handleShare() {
            if (bridge.isWeApp()) {
                return toPage(
                    `/share?${query.stringify({
                        ...this.shareOption,
                        posterImage: this.shareSetting?.settingUrl,
                        texts: this.shareSetting?.settingLeftText,
                        applets: this.shareSetting?.settingRightText
                    })}`
                );
            }

            if (!this._wxBase64) {
                await this.createAppletCode('生成中');
            }

            this.$refs.poster.onShow({
                list: [this.shareSetting?.settingUrl, this._wxBase64],
                texts: this.shareSetting?.settingLeftText?.split('#'),
                applets: this.shareSetting?.settingRightText?.split('#')
            });
        },
        // 创建小程序码
        async createAppletCode(wait) {
            // 如果在小程序内，不需要请求
            if (bridge.isWeApp()) {
                return false;
            }

            this._wxBase64 = await CREATE_APPLET_CODE({
                wait,
                url: this.shareOption?.actUrl
            });
        },
        async getShareInfo() {
            const [res, err] = await this.$http.awaitTo(this.$http.get(this.$api.getShareInfo));
            if (err) {
                return false;
            }
            this.shareSetting = res?.data || {};
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.m-share-text-entry {
    .share-icon {
        width: 60px;
        padding: 12px 0;
        background-color: $purple;
        border-radius: 16px 0 0 16px;
        position: fixed;
        z-index: 5;
        top: 242px;
        right: 0;
        flex-direction: column;
        box-sizing: border-box;

        .text {
            font-size: $fs24;
            line-height: 32px;
            color: $white;
            box-sizing: border-box;
            width: 28px;
            word-break: break-word;
            text-align: center;
        }

        .iconfont {
            font-size: $fs32;
            color: $white;
            margin-top: 2px;
        }
    }
}
</style>
