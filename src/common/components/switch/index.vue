<template>
    <div
        @click="handleSwitch"
        class="m-switch-warp flex-left"
        :class="{on: modelValue === 1}">
        <div class="switch-bar"></div>
    </div>
</template>

<script>
export default {
    name: 'n-switch',
    props: {
        modelValue: {
            type: Number,
            default: 0
        }
    },
    emits: ['update:modelValue'],
    methods: {
        handleSwitch() {
            this.$emit('update:modelValue', this.modelValue === 0 ? 1 : 0);
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.m-switch-warp {
    width: 74px;
    height: 44px;
    background: $white;
    border-radius: 44px;
    box-sizing: border-box;
    border: 1px solid #dfdfdf;

    &.on {
        background: $green-dark;
        border: 1px solid $green-dark;

        .switch-bar {
            transform: translateX(30px);
        }
    }

    .switch-bar {
        box-sizing: border-box;
        width: 40px;
        height: 40px;
        border-radius: 40px;
        background-color: $white;
        box-shadow: 0 1px 3px rgba($black, .4);
        border: 1px solid #dfdfdf;
        transition: transform .35s cubic-bezier(.4, .4, .25, 1.35);
    }
}
</style>