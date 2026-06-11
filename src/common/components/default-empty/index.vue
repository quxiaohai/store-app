<template>
    <div class="m-empty-wrap" :class="{center}">
        <div class="default-empty" :style="getStyle">
            <div class="icon flex-center" v-if="icon">
                <i class="iconfont" :class="`icon-${icon}`"></i>
            </div>
            <div class="svg flex-center" v-else-if="svg">
                <img alt="" :src="`/assets/images/common/${svg}.svg`" class="image"/>
            </div>
            <div class="png flex-center" v-else-if="png">
                <img alt="" :src="`/assets/images/common/${png}.png`" class="image"/>
            </div>
            <div class="text" v-if="text?.length > 0">{{ text }}</div>
            <div class="desc" v-if="desc?.length > 0">{{ desc }}</div>
            <div class="btn-group flex-center" v-if="$slots.default">
                <slot/>
            </div>
        </div>
    </div>
</template>
<script>
import { px2px } from 'lib/util/viewport';

export default {
    name: 'default-empty',
    props: {
        height: {
            type: Number,
            default: 600
        },
        text: {
            type: String,
            default: '空空如也~'
        },
        desc: {
            type: String,
            default: '暂时还没有数据哦'
        },
        icon: {
            type: String,
            default: ''
        },
        svg: {
            type: String,
            default: ''
        },
        png: {
            type: String,
            default: ''
        },
        center: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        getStyle() {
            if (this.center) {
                return {
                    height: 'auto'
                };
            }
            return {
                height: px2px(this.height) + 'px'
            };
        }
    }
};
</script>
<style lang="scss" scoped>
@import 'common/style/static';

.m-empty-wrap {
    &.center {
        @extend %flex-center;
        position: fixed;
        height: 95%;
        width: 100%;
        left: 0;
        top: -30px;
    }
}

.default-empty {
    height: 600px;
    @include display-flex;
    @include flex-direction;
    @include align-items;
    @include justify-content(flex-end);
    width: 100%;

    .icon {
        width: 196px;
        height: 196px;

        .iconfont {
            font-size: 180px;
            color: $black;
        }
    }

    .svg, .png {
        width: 360px;
        margin-bottom: 24px;

        .image {
            width: 100%;
        }
    }

    .png {
        width: 100px;
        margin-bottom: 50px;
    }

    .text {
        font-size: $fs28;
        font-weight: bold;
        color: $black;
    }

    .desc {
        font-size: $fs24;
        font-weight: 300;
        line-height: 64px;
        color: rgba($black, 0.5);
    }

    .btn-group {
        padding-top: 60px;
    }
}
</style>