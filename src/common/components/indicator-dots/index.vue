<template>
    <div class="indicator-dots flex-right" :class="[theme, size]" v-if="dots > 1">
        <div v-if="size === 'medium'" class="min oswald-bold" :class="{ gray: selected > 0 }">01</div>
        <div class="dots flex-center">
            <div class="dot" v-for="n in dots" :class="{ selected: selected === n - 1 }" :key="n"></div>
        </div>
        <div v-if="size === 'medium'" class="max oswald-bold" :class="{ gray: selected < dots - 1 }">
            {{ dots > 9 ? '' : '0' }}{{ dots }}
        </div>
    </div>
</template>

<script>
export default {
    name: 'indicator-dots',
    props: {
        selected: {
            type: Number,
            default: 0
        },
        dots: {
            type: Number,
            default: 0
        },
        // 主题色
        theme: {
            type: String,
            default: 'black' // white
        },
        // 尺寸
        size: {
            type: String,
            default: 'large' // medium
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.indicator-dots {
    height: 22px;
    padding-right: 40px;
    width: 100vw;
    box-sizing: border-box;
    z-index: 3;

    &.white {
        .min,
        .max {
            color: $white;

            &.gray {
                opacity: 0.6;
            }
        }

        .dot {
            background-color: $white;
            opacity: 0.6;
        }
    }

    .min,
    .max {
        font-size: $fs20;
        font-weight: bold;
        color: $black;

        &.gray {
            opacity: 0.3;
        }
    }

    &.medium {
        .min,
        .max {
            color: $purple;
        }

        .dot {
            background-color: $purple;
        }
    }

    .min {
        padding-right: 4px;
    }

    .max {
        padding-left: 4px;
    }

    &.large {
        .dots {
            width: 180px;
        }
    }

    .dots {
        width: 120px;
    }

    .dot {
        flex: 1;
        background-color: $black;
        height: 2px;
        opacity: 0.3;

        &.selected {
            opacity: 1;
        }
    }
}
</style>
