<template>
    <div
        class="nl-radio"
        v-hover="'hover'"
        :class="{ disabled, checked }"
        @click="clickHandler"
    >
        <i
            :class="`icon-${checked ? 'circle-check' : 'circle-nocheck'}`"
            class="iconfont"
        ></i>
    </div>
</template>

<script>
export default {
    name: "n-radio",
    props: {
        /// 是否禁用
        disabled: {
            type: Boolean,
            default: false,
        },
        /// 是否被选中
        checked: {
            type: Boolean,
            default: false,
        },
        /// 是否默认被选中
        defaultChecked: {
            type: Boolean,
            default: false,
        },
        /// 选择的value
        value: undefined,
        ///
        autoFocus: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {};
    },
    computed: {},
    methods: {
        clickHandler() {
            if (this.disabled) {
                return;
            }
            this.$emit("change", this.value);
        },
    },
};
</script>

<style lang="scss" scoped>
@import "common/style/static";

.nl-radio {
    display: flex;
    align-items: center;
    .disabled {
        background-color: rgba($black, 0.1);
        color: rgba($black, 0.2);
        border: 0 none;

        &.hover {
            background-color: rgba($black, 0.1);
            opacity: 1;
        }
    }

    &.checked {
        .iconfont {
            color: $purple;
        }
    }

    .iconfont {
        font-size: $fs36;
        color: #e5e5e5;
    }
}
</style>
