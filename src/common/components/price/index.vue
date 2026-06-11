<template>
    <div class="price-info oswald-bold" :class="[type, size]">
        <span class="small oswald-regular">￥</span>
        <slot/>
    </div>
</template>

<script>
export default {
    name: 'Price',
    props: {
        // 位置
        type: {
            type: String,
            default: 'sub'// sub|sup
        },
        // 尺寸
        size: {
            type: String,
            default: 'small'//large, medium, small
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.price-info {

    .small {
        font-family: Oswald-Medium, sans-serif;
        font-size: $fs24;
        line-height: 20px;
        font-weight: 400;
        padding-bottom: 2px;
    }

    &.sub {
        @extend %flex-bottom;
    }

    &.sup {
        @extend %flex-top;

        .small {
            padding-top: 4px;
        }
    }

    font-weight: bold;
    font-size: $fs32;
    line-height: 32px;

    &.medium, &.large, &.big {
        .small {
            font-family: Oswald-Medium, sans-serif;
            font-size: $fs28;
            font-weight: 500;
            line-height: 28px;
            padding-bottom: 4px;
        }
    }

    &.medium {
        line-height: 40px;
        font-size: $fs40;

        .small {
            padding-bottom: 2px;
            font-family: Oswald-Regular, sans-serif;
        }
    }

    &.large {
        line-height: 48px;
        font-size: $fs48;

        .small {
            font-family: Oswald-Regular, sans-serif;
        }
    }

    &.big {
        line-height: 60px;
        font-size: $fs60;
    }
}
</style>
