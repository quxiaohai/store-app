<template>
    <div
        class="nl-checkbox"
        v-hover="'hover'"
        :class="{ disabled, checked }"
        @click="clickHandler"
    >
        <i
            :class="`icon-${checked ? 'rect-check' : 'rect-nocheck'}`"
            class="iconfont"
        ></i>
    </div>
</template>

<script>
export default {
    name: "n-checkbox",
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
        ///
        autoFocus: {
            type: Boolean,
            default: false,
        },
        value: undefined
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
        },
    },
};
</script>

<style lang="scss" scoped>
@import "common/style/static";

.nl-checkbox {
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
