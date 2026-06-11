<template>
    <div class="nl-collapse" :style="style">
        <div ref="content" class="content">
            <slot/>
        </div>
    </div>
</template>
<script>
export default {
    name: 'n-collapse',
    props: {
        /// 是否展开
        visible: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            style: this.visible ? {} : { height: 0 + 'px' }
        };
    },
    watch: {
        visible(v) {
            if (v) {
                this.onShow();
            } else {
                this.onHide();
            }
        }
    },
    methods: {
        onShow() {
            const height = this.$refs.content.scrollHeight;
            this.style = { height: `${height}px` };
        },
        onHide() {
            this.style = { height: 0 + 'px' };
        }
    }
};
</script>
<style lang="scss" scoped>
.nl-collapse {
    overflow: hidden;
    transition: height 0.5s;
}
</style>
