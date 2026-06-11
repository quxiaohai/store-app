<template>
    <div class="nl-radio-group" :name="name" v-hover="'hover'">
        <div
            v-for="option in options"
            :key="option.value"
            class="radio-item-wrapper"
            :class="{ 'no-wrap': !wrap }"
            @click="handleChange(option)"
        >
            <div class="radio-item">
                <n-radio
                    :value="option.value"
                    :checked="checkedValue?.value === option.value"
                    :disabled="option.disabled || disabled"
                ></n-radio>
                <span class="label">{{ option.label }}</span>
            </div>
            <div class="l-input" v-if="option.wrapSlot" v-show="checkedValue?.value === option.value">
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
import nRadio from './radio';
export default {
    name: 'n-radio-text-group',
    components: {
        nRadio
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
        /// 是否禁用
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
            checkedValue: undefined
        };
    },
    computed: {},
    mounted() {
        this.initCheckValue();
    },
    watch: {
        value(nl) {
            this.initCheckValue();
        }
    },
    methods: {
        handleChange(option) {
            if (this.disabled) {
                return;
            }
            this.checkedValue = option;
            this.$emit('update:value', this.checkedValue);
        },
        inputHandler(e, option) {
            const inputValue = e.target?.value;
            this.checkedValue = { ...option, text: inputValue };
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

.nl-radio-group {
    font-weight: 400;
    font-size: 28px;
    color: #000000;
    .radio-item-wrapper {
        display: flex;
        flex-direction: column;
        .radio-item {
            min-height: 96px;
            line-height: 40px;
            display: flex;
            align-items: center;
            .label {
                margin-left: 8px;
            }
        }
        .l-input {
            box-sizing: border-box;
            height: 104px;
            padding: 0 80px 0 48px;
            border-radius: 80px;
            background-color: $input-disabled;

            .u-input {
                height: 100%;
                width: 100%;
                background: none;
                border: 0 none;
                font-size: $fs28;
                flex: 1;
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
