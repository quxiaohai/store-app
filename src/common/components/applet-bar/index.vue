<template>
    <div class="m-applet-bar flex-left" v-if="visible">
        <div class="close flex-center" @click="handleClose">
            <i class="iconfont icon-cancel"></i>
        </div>
        <div class="info flex-left">
            <img alt="" class="logo" src="~assets/images/common/narwal-logo.svg"/>
            <div class="text">打开云鲸商城小程序</div>
        </div>
        <div class="btn flex-center" @click="handleOpenApplet">立即打开</div>
    </div>
</template>

<script>
import { SHOW_OPEN_APPLET } from 'common/util/constant';
import storage from 'lib/util/storage';
import bridge from 'common/util/bridge';
import { realAppletUrl } from 'common/util';

export default {
    name: 'applet-bar',
    data() {
        return {
            visible: false
        };
    },
    mounted() {
        this.initShow();
    },
    watch: {
        visible(bool) {
            if (bool) {
                document.documentElement.dataset.applet = 'show';
            } else {
                document.documentElement.dataset.applet = 'hide';
            }
        }
    },
    methods: {
        handleOpenApplet() {
            let query = '';
            const path = realAppletUrl(this.$route.path);
            const str = location.search.substring(1);
            if (str) {
                query = `&query=${encodeURIComponent(str)}`;
            }
            location.href = `https://api-applet.narwaltech.com/mall/wxMiniP/wxUrl?path=${path}${query}&evn=release`;
        },
        initShow() {
            if (bridge.isApp() || bridge.isWeApp()) {
                return false;
            }

            const obj = storage.session.get(SHOW_OPEN_APPLET);
            if (!obj) {
                this.visible = true;
            }
        },
        handleClose() {
            this.visible = false;
            storage.session.set(SHOW_OPEN_APPLET, {
                type: 'close',
                show: false
            });
        }
    }
};
</script>
<style lang="scss" scoped>
@import "common/style/static";

.m-applet-bar {
    height: 90px;
    width: 100%;
    background-color: $gray-dark;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;

    .btn {
        width: 190px;
        height: 90px;
        background-color: $purple;
        color: $white;
        font-size: $fs28;
    }

    .close {
        width: 90px;
        height: 90px;

        .iconfont {
            font-size: $fs32;
            color: $white;
        }
    }

    .info {
        flex: 1;

        .logo {
            height: 60px;
            border-radius: 8px;
        }

        .text {
            font-size: $fs28;
            color: $white;
            padding-left: 40px;
        }
    }
}
</style>
