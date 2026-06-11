<template>
    <div class="nl-checkbox-group" :name="name" v-hover="'hover'">
        <div
            v-for="option in options"
            class="checkbox-item"
            :class="{ 'no-wrap': !wrap }"
            :key="option.value"
            @click.stop="(e) => handleChange(e, option)"
        >
            <div class="normal">
                <div class="text-box">
                    <n-checkbox
                        :checked="checkedValue?.some((item) => item.value === option.value)"
                        :disabled="option.disabled || disabled"
                        :value="option.value"
                    />
                    <span class="label">{{ option.label }}</span>
                </div>
                <div
                    class="l-input"
                    v-if="option.nowrapSlot"
                    v-show="checkedValue?.some((item) => item.value === option.value)"
                >
                    <input
                        :ref="`inputRef${option.id}`"
                        v-model="option.text"
                        class="u-input"
                        placeholder="请输入"
                        @input="(e) => inputHandler(e, option)"
                    />
                </div>
            </div>
            <div
                class="l-input"
                v-if="option.wrapSlot"
                v-show="checkedValue?.some((item) => item.value === option.value)"
            >
                <input
                    v-model="option.text"
                    class="u-input"
                    placeholder="请输入"
                    @input="(e) => inputHandler(e, option)"
                />
            </div>
        </div>
    </div>
</template>

<script>
import nCheckbox from './checkbox';
export default {
    name: 'n-checkbox-text-group',
    components: {
        nCheckbox
    },
    props: {
        /// name
        name: {
            type: String,
            default: ''
        },
        /// 是否禁用
        disabled: {
            type: Boolean,
            default: false
        },
        /// 选择的value
        value: undefined,
        /// 默认选中
        defaultValue: undefined,
        options: {
            type: Array,
            default: []
        },
        /// 是否需要换行
        wrap: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            checkedValue: []
        };
    },
    mounted() {
        this.initCheckValue();
    },
    watch: {
        value() {
            this.initCheckValue();
        }
    },
    methods: {
        handleChange(e, option) {
            if (this.disabled) {
                return;
            }
            let checkedValue = this.checkedValue || [];
            if (!checkedValue?.some((item) => item.value === option.value)) {
                checkedValue = [...checkedValue, option];
            } else {
                if (e.target === this.$refs[`inputRef${option.id}`]?.[0]) {
                    // 如果点击的是输入框，不反选
                    return;
                }
                checkedValue = checkedValue.filter((item) => item.value !== option.value);
            }
            this.checkedValue = checkedValue;
            this.$emit('update:value', this.checkedValue);
        },
        inputHandler(e, option) {
            const inputValue = e.target?.value;
            if (!this.checkedValue?.some((item) => item.value === option.value)) {
                const value = { ...option, text: inputValue };
                this.checkedValue = [...this.checkedValue, value];
            } else {
                this.checkedValue.find((item) => item.value === option.value).text = inputValue;
            }
            this.$emit('update:value', this.checkedValue);
        },
        initCheckValue() {
            this.checkedValue = this.value;
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.nl-checkbox-group {
    font-weight: 400;
    font-size: 28px;
    color: #000000;
    .checkbox-item {
        min-height: 96px;
        line-height: 96px;
        display: flex;
        align-items: center;
        .normal {
            display: flex;
            flex: 1;
            .text-box {
                display: flex;
                .label {
                    margin-left: 8px;
                }
            }
            .l-input {
                margin-left: 62px;
                flex: 1;
                box-sizing: border-box;
                line-height: 42px;
                padding: 0 60px 0 32px;
                border-radius: 140px;
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

        .l-input {
            flex: 1;
            box-sizing: border-box;
            height: 84px;
            line-height: 84px;
            padding: 0 60px 0 32px;
            border-radius: 140px;
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
