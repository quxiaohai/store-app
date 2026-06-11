<template>
    <div class="nl-radio-group" :name="name" v-hover="'hover'">
        <template v-for="option in options">
            <div
                v-if="typeof option === 'string' || typeof option === 'number'"
                class="radio-item"
                :class="{ 'no-wrap': !wrap }"
                :key="option"
                @click="handleChange(option)"
            >
                <n-radio
                    :value="option"
                    :checked="checkedValue === option"
                    :disabled="disabled"
                ></n-radio>
                <span class="label">{{ option }}</span>
            </div>
            <div
                v-else
                class="radio-item"
                :class="{ 'no-wrap': !wrap }"
                :key="option.value"
                @click="handleChange(option)"
            >
                <n-radio
                    :value="option.value"
                    :checked="checkedValue === option.value"
                    :disabled="option.disabled || disabled"
                ></n-radio>
                <span class="label">{{ option.label }}</span>
            </div>
        </template>
        <template v-if="type === 'addOtherInput'">
            <div class="other-box">
                <div class="l-input">
                    <input
                        v-model="inputValue"
                        class="u-input"
                        :placeholder="otherPlaceHolder"
                        @input="inputHandler"
                    />
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import nRadio from "./radio"
export default {
    name: "n-radio-group",
    components: {
        nRadio,
    },
    props: {
        /// name
        name: {
            type: String,
            default: "",
        },
        /// 是否禁用
        disabled: {
            type: Boolean,
            default: false,
        },
        /// 选择的value
        value: undefined,
        /// 默认选中
        defaultValue: undefined,
        /// 是否禁用
        options: {
            type: Array,
            default: [],
        },
        /// 是否需要换行
        wrap: {
            type: Boolean,
            default: true,
        },
        type: {
            type: String,
            default: "normal", // normal / addOtherInput
        },
        otherPlaceHolder: {
            type: String,
            default: "其他",
        },
    },
    data() {
        return {
            checkedValue: undefined,
            inputValue: undefined,
        }
    },
    computed: {},
    mounted() {
        this.initCheckValue()
    },
    watch: {
        value(nl) {
            this.initCheckValue()
        },
    },
    methods: {
        handleChange(option) {
            if (this.disabled) {
                return
            }
            if (typeof option === "string" || typeof option === "number") {
                this.checkedValue = option
            } else {
                this.checkedValue = option.value
            }
            this.inputValue = ""
            this.$emit("update:value", this.checkedValue)
        },
        inputHandler(e) {
            this.checkedValue = ""
            this.inputValue = e.target?.value
            this.$emit("update:value", e.target?.value)
        },
        initCheckValue() {
            if (
                this.type === "addOtherInput" &&
                !this.options.some(
                    (item) => item === this.value || item.value === this.value
                )
            ) {
                this.inputValue = this.value
            }
            this.checkedValue = this.value || ""
        },
    },
}
</script>

<style lang="scss" scoped>
@import "common/style/static";

.nl-radio-group {
    font-weight: 400;
    font-size: 28px;
    color: #000000;
    .radio-item {
        min-height: 96px;
        line-height: 40px;
        display: flex;
        align-items: center;
        .label {
            margin-left: 8px;
        }
    }
    .other-box {
        display: flex;
        align-items: center;
        .label {
            margin-left: 8px;
        }
        .l-input {
            flex: 1;
            box-sizing: border-box;
            height: 104px;
            padding: 0 80px 0 32px;
            border-radius: 80px;
            background-color: $input-disabled;

            .u-input {
                height: 100%;
                width: 100%;
                background: none;
                border: 0 none;
                font-size: $fs28;
            }
        }
    }
}
</style>
