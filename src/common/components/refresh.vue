<template>
    <span class="refresh flex-left" :class="{ani: loading}" @click="tapRefresh"><span class="flex-center icon"><i class="iconfont icon-refresh"></i></span>换一换</span>
</template>

<script>
    export default {
        name: "refresh",
        props: {
            loading: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            tapRefresh() {
                this.$emit('click');
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "common/style/static";
    .refresh{
        color: $blue;
        font-size: 14px;
        .iconfont{
            font-size: 16px;
            line-height: 16px;
        }
        .icon{
            margin-right: 8px;
        }
        &.ani{
            color: $gray-light;
            .icon{
                @include animation(spin-ani 1.2s linear infinite);
            }
        }
    }


    @include keyframes(spin-ani) {
        0% {
            @include rotate(0);
        }
        100% {
            @include rotate(360deg);
        }
    }
</style>
