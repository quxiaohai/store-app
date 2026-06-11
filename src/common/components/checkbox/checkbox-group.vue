<template>
    <div class="nl-checkbox-group" :name="name" v-hover="'hover'">
        <template v-for="option in options">
            <div
                v-if="typeof option === 'string' || typeof option === 'number'"
                class="checkbox-item"
                :class="{ 'no-wrap': !wrap }"
                :key="option"
            >
                <div class="normal" @click="handleChange(option)">
                    <n-checkbox
                        :checked="checkedValue.some((item) => item === option)"
                        :disabled="disabled"
                        :value="option"
                    />
                    <span class="label">{{ option }}</span>
                </div>
                <div
                    class="other-box"
                    v-if="
                        type === 'addItemInput' &&
                        checkedValue.some((item) => item === option.value)
                    "
                >
                    <div class="l-add-input">
                        <input
                            v-model="checkedInput[option]"
                            class="u-add-input"
                            :placeholder="addInputPlaceHolder"
                            @input="handleAddItemInput"
                        />
                    </div>
                </div>
            </div>
            <div
                v-else
                class="checkbox-item"
                :class="{ 'no-wrap': !wrap }"
                :key="option.value"
            >
                <div class="normal" @click="handleChange(option)">
                    <n-checkbox
                        :checked="
                            checkedValue.some((item) => item === option.value)
                        "
                        :disabled="option.disabled || disabled"
                        :value="option.value"
                    />
                    <span class="label">{{ option.label }}</span>
                </div>
                <div
                    class="add-other-box"
                    v-if="
                        type === 'addItemInput' &&
                        checkedValue.some((item) => item === option.value)
                    "
                >
                    <div class="l-add-input">
                        <input
                            v-model="checkedInput[option.value]"
                            class="u-add-input"
                            :placeholder="addInputPlaceHolder"
                            @input="(e) => handleAddItemInput(e, option)"
                        />
                    </div>
                </div>
            </div>
        </template>
        <template v-if="type === 'addOtherInput'">
            <div class="other-box">
                <div class="l-input">
                    <input
                        v-model="inputValue"
                        class="u-input"
                        :placeholder="otherPlaceHolder"
                        @input="handleOtherInput"
                    />
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import nCheckbox from "./checkbox"
export default {
    name: "n-checkbox-group",
    components: {
        nCheckbox,
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
        /// 交互类型
        type: {
            type: String,
            default: "normal", // normal / addItemInput / addOtherInput
        },
        otherPlaceHolder: {
            type: String,
            default: "其他",
        },
        addInputPlaceHolder: {
            type: String,
            default: "请输入",
        },
    },
    data() {
        return {
            checkedValue: [],
            inputValue: "",
            checkedInput: this.getCheckedInput(),
        }
    },
    computed: {},
    mounted() {
        this.initCheckedValue()
        this.initInputValue()
        this.initAddInput()
    },
    watch: {
        value() {
            this.initCheckedValue()
        },
    },
    methods: {
        handleChange(option) {
            if (this.disabled) {
                return
            }
            if (typeof option === "string" || typeof option === "number") {
                if (!this.checkedValue.some((item) => item === option)) {
                    this.checkedValue = [...this.checkedValue, option]
                } else {
                    this.checkedValue = this.checkedValue.filter(
                        (item) => item !== option
                    )
                    if (this.type === "addItemInput") {
                        this.checkedInput[option] = ""
                    }
                }
            } else {
                if (!this.checkedValue.some((item) => item === option.value)) {
                    this.checkedValue = [...this.checkedValue, option.value]
                } else {
                    this.checkedValue = this.checkedValue.filter(
                        (item) => item !== option.value
                    )
                    if (this.type === "addItemInput") {
                        this.checkedInput[option.value] = ""
                    }
                }
            }
            if (this.type === "addItemInput") {
                const result = this.checkedValue.map((item) => ({
                    value: item,
                    input: this.checkedInput[item],
                }))
                this.$emit("update:value", result)
            } else {
                this.$emit("update:value", this.checkedValue)
            }
        },
        handleOtherInput(e) {
            this.inputValue = e.target?.value
            const checkedValue =
                this.checkedValue?.filter((item) =>
                    this.options.some((op) => op === item || op.value === item)
                ) || []
            this.$emit("update:value", [...checkedValue, e.target?.value])
        },
        getCheckedInput() {
            if (this.type !== "addItemInput") {
                return
            }
            const obj = {}
            this.options?.forEach((option) => {
                if (typeof option === "string" || typeof option === "number") {
                    obj[option] = undefined
                } else {
                    obj[option.value] = undefined
                }
            })
            return obj
        },
        handleAddItemInput(e, option) {
            if (typeof option === "string" || typeof option === "number") {
                this.checkedInput[option] = e.target?.value
                if (!this.checkedValue.some((item) => item === option)) {
                    this.checkedValue = [...this.checkedValue, option]
                }
            } else {
                this.checkedInput[option.value] = e.target?.value
                if (!this.checkedValue.some((item) => item === option.value)) {
                    this.checkedValue = [...this.checkedValue, option.value]
                }
            }
            const result = this.checkedValue.map((item) => ({
                value: item,
                input: this.checkedInput[item],
            }))
            this.$emit("update:value", result)
        },
        initCheckedValue() {
            if (this.value && this.value.length) {
                if (this.type === "addItemInput") {
                    this.checkedValue = this.value.map((item) => item.value)
                } else {
                    this.checkedValue = this.value
                }
            }
        },
        initInputValue() {
            if (this.type === "addOtherInput") {
                const input =
                    this.checkedValue?.filter(
                        (item) =>
                            !this.options?.some(
                                (op) => op === item || op.value === item
                            )
                    ) || []
                this.inputValue = input[0] || ""
            }
        },
        initAddInput() {
            if (
                this.value &&
                this.value.length &&
                this.type === "addItemInput"
            ) {
                this.value?.forEach((item) => {
                    this.checkedInput[item.value] = item.input
                })
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import "common/style/static";

.nl-checkbox-group {
    font-weight: 400;
    font-size: 28px;
    color: #000000;
    .checkbox-item {
        min-height: 96px;
        line-height: 40px;
        display: flex;
        align-items: center;
        .normal {
            display: flex;
            flex: 1;
            .label {
                margin-left: 8px;
            }
        }
        .add-other-box {
            width: 460px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            .l-add-input {
                flex: 1;
                box-sizing: border-box;
                height: 84px;
                line-height: 84px;
                padding: 0 60px 0 32px;
                border-radius: 140px;
                background-color: $input-disabled;

                .u-add-input {
                    height: 100%;
                    width: 100%;
                    background: none;
                    border: 0 none;
                    font-size: $fs28;
                }
            }
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
