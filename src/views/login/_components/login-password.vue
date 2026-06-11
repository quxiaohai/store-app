<template>
    <div class="login-password flex-left">
        <input :value="modelValue" @input="inputHandler" :type="type" class="u-input" :placeholder="placeholder"/>
        <i class="iconfont" :class="icon" @click="viewPwd"/>
    </div>
</template>

<script>
export default {
    name: 'LoginPassword',
    props: {
        modelValue: [String, Number],
        placeholder: String
    },
    emits: ['update:modelValue'],
    data() {
        return {
            view: false
        };
    },
    computed: {
        icon() {
            return this.view ? 'icon-view' : 'icon-view-close';
        },
        type() {
            return this.view ? 'text' : 'password';
        }
    },
    methods: {
        inputHandler(e) {
            this.$emit('update:modelValue', e.target.value);
        },
        viewPwd() {
            this.view = !this.view;
        }
    }
};
</script>

<style lang="scss" scoped>
@import "common/style/static";

.login-password {
    width: 100%;
    flex: 1;

    .u-input {
        width: 100%;
        background: none;
        border: 0 none;
        font-size: $fs32;
        flex: 1;
    }

    .iconfont {
        font-size: $fs36;
    }
}
</style>
