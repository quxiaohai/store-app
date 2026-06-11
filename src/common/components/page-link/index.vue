<template>
    <div v-if="disabled">
        <slot/>
    </div>
    <div v-else-if="option.pageType === 0">
        <slot/>
    </div>
    <a v-else-if="option.pageType === 2" :href="href" target="_blank">
        <slot/>
    </a>
    <div v-else-if="option.pageType === 7" @click="handleOpenApplet">
        <slot/>
    </div>
    <div @click="handleRouterLink" v-else>
        <slot/>
    </div>
</template>

<script>
import { APPLET_ID_MAP } from 'common/util/constant';
import bridge from 'common/util/bridge';
import { toPage } from 'common/util';
import { realUrl } from 'common/util';

export default {
    name: 'page-link',
    props: {
        option: {
            type: Object,
            required: true
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        href() {
            const obj = this.option;
            const type = obj.pageType;
            if (type === 1) {// 站内路径
                return realUrl(decodeURIComponent(obj.pageUrl));
            } else if (type === 2) {// 站外路径
                return decodeURIComponent(obj.pageUrl);
            } else if (type === 3) {// 商品详情
                return `/product/detail?serialNumber=${obj.productSerialNumber}&skuId=${obj.productSku}`;
            } else if (type === 4) {// 自定义页面
                // 活动专区
                if (obj.customPageType === 4) {
                    return `/spread/custom-iwd?pageId=${obj.customPageId}`;
                }
                return `/rich?pageId=${obj.customPageId}`;
            } else if (type === 5) {// 以旧换新
                return `/spread/renew/detail/${obj.activityId}`;
            } else if (type === 6) {// 商品类型
                return `/product/classify?productTypeId=${obj.productTypeId}`;
            }

            return '';
        }
    },
    methods: {
        // 跳转其它小程序
        handleOpenApplet() {
            if (!bridge.isWeApp()) {
                const url = decodeURIComponent(this.option?.pageUrl);
                if (url?.length > 4) {
                    location.href = url;
                    return true;
                }

                return this.$layer.toast('当前环境不支持跳转其它小程序');
            }

            toPage({
                path: '/navigate-applet',
                query: {
                    appId: APPLET_ID_MAP[this.option?.appletId] || this.option?.appletId,
                    appPath: this.option?.appletPath || ''
                }
            });
        },
        // 跳转页面
        handleRouterLink() {
            // 商详，商品分类如果在小程序内，跳小程序
            const type = this.option.pageType;
            if (type === 3 || type === 6) {
                return toPage(this.href);
            }
            /// 一键下单
            if (type === 9) {
                return this.$emit('other', this.option);
            }
            this.$router.push(this.href);
        }
    }
};
</script>
