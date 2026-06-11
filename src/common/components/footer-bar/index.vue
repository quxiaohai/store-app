<template>
    <div class="m-footer-bar flex-center">
        <span class="iconfont icon-newon"></span>
        <div class="desc">{{ text }}</div>
    </div>
</template>

<script>
export default {
    name: 'footer-bar',
    props: {
        text: {
            type: String,
            default: '已经到底了~'
        }
    }
};
</script>

<style lang="scss" scoped>
@import "common/style/static";

.m-footer-bar {
    text-align: center;
    font-size: $fs20;
    color: rgba($black, 0.3);
    padding: 16px 0 40px;

    .iconfont {
        font-size: $fs48;
        color: rgba($black, 0.2);
    }

    .desc {
        padding-left: 8px;
    }
}
</style>
