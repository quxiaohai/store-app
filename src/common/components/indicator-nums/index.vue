<template>
    <view class="indicator-nums flex-right" v-if="dots > 1">
        <view class="indicator-box flex-center">
            <view class="num oswald-medium">{{ selected + 1 }}</view>
            <view class="dots">/</view>
            <view class="num oswald-medium">{{ dots }}</view>
        </view>
    </view>
</template>

<script>
export default {
    name: 'indicator-nums',
    props: {
        selected: {
            type: Number,
            default: 0
        },
        dots: {
            type: Number,
            default: 0
        }
    }
};
</script>

<style lang="scss">
@import 'common/style/static';

.indicator-nums {
    height: 36px;
    padding-right: 40px;
    width: 100vw;
    box-sizing: border-box;
    z-index: 5;

    .indicator-box {
        height: 36px;
        padding: 0 16px;
        color: $white;
        font-size: $fs24;
        background-color: rgba($black, 0.2);
        border-radius: 36px;

        .dots {
            font-size: $fs20;
            padding: 0 8px;
        }
    }
}
</style>
