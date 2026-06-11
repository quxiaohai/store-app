<template>
    <div class="m-error-page">
        <div class="network-wrap">
            <img alt="" :src="base64" class="image" />
            <p class="desc">请稍后再试~</p>
            <div class="btn-group flex-center">
                <n-button round class="btn" @tap="handleToHome">返回首页</n-button>
            </div>
        </div>
    </div>
</template>

<script>
import { toHome, imageLoad, getImageBase64 } from 'common/util';

export default {
    name: 'error-page',
    data() {
        return {
            base64: null
        };
    },
    mounted() {
        this.initImage();
    },
    methods: {
        initImage() {
            imageLoad('/assets/images/common/500.jpg').then((img) => {
                this.base64 = getImageBase64(img, 0.8);
            });
        },
        handleToHome() {
            toHome();
        }
    }
};
</script>
<style lang="scss" scoped>
@import 'common/style/static';

.m-error-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999999999;
    background-color: $white;

    .network-wrap {
        text-align: center;
        width: 100%;
        position: absolute;
        left: 50%;
        top: 40%;
        transform: translate(-50%, -50%);

        .image {
            width: 60%;
            background: none;
        }

        .desc {
            margin: 44px auto 0;
            max-width: 90vw;
            word-break: break-word;
            line-height: 40px;
            font-size: $fs32;
            color: $gray;
        }

        .btn-group {
            padding-top: 60px;
        }

        .btn {
            width: 200px;
            margin: 0 20px;
        }
    }
}
</style>
