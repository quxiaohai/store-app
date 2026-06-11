<template>
    <div>
        <slot/>
        <div v-if="visible" class="m-loading-box flex-center">
            <div class="loading-text" :style="loadStyle">
                <div class="narwal"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { px2px } from 'lib/util/viewport';

export default {
    name: 'loading',
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            loadStyle: {}
        };
    },
    mounted() {
        setTimeout(() => {
            this.loadSize();
        }, 0);
    },
    methods: {
        loadSize() {
            const width = this.$el.offsetWidth * 0.8;
            if (width < px2px(383)) {
                this.loadStyle = {
                    width: width + 'px',
                    height: 0.107 * width + 'px'
                };
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import "common/style/static";

.m-loading-box {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 99;
    background-color: #f0f0f0;

    .loading-text {
        width: 383px;
        height: 41px;
        background: linear-gradient(90deg, #DDDDDD 25%, #ffffff 37%, #DDDDDD 63%);
        background-size: 400% 100%;
        @include animation(skeleton-loading 1.6s ease infinite);

        .narwal {
            background: url("~assets/images/common/narwal-logo.svg") no-repeat;
            width: 100%;
            height: 100%;
            background-size: 102% 103%;
        }
    }

    @include keyframes(skeleton-loading) {
        0% {
            background-position: 100% 50%
        }

        to {
            background-position: 0 50%
        }
    }
}
</style>
