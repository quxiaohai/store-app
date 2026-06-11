<template>
    <div class="select-container">
        <div class="input-container" :class="{ active: showSelect, disabled }" @click.stop="inputFocus">
            <input
                class="u-input"
                v-model="searchValue"
                :placeholder="placeholder"
                :readonly="!isSearch"
                ref="select-input"
            />
            <div v-if="!isSearch" class="input-icon">
                <i
                    class="iconfont icon-font"
                    :class="{ 'icon-arrow-down': !showSelect, 'icon-arrow-top': showSelect }"
                ></i>
            </div>
        </div>
        <div
            class="select-content-wrapper"
            :class="{ 'nl-select-content-wrapper-active': showSelect, top: !selectBottom, bottom: selectBottom }"
        >
            <div class="select-content" v-if="list.length">
                <div
                    v-for="(item, index) in list"
                    class="select-line fz-28"
                    :class="{ selected: searchValue === item.label }"
                    @click="select(item)"
                    :key="'select_' + index"
                >
                    <label>{{ item.label }}</label>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { px2px } from 'lib/util/viewport';

export default {
    name: 'n-select',
    props: {
        modelValue: {
            type: [Number, String],
            required: true
        },
        list: {
            type: Array,
            default: () => []
        },
        placeholder: {
            type: String
        },
        isSearch: {
            type: Boolean,
            default: false
        },
        /// 是否禁用
        disabled: {
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            showSelect: false,
            searchValue: '',
            selectBottom: true
        };
    },
    watch: {
        searchValue: {
            immediate: true,
            handler: function (newVal) {
                this.$emit('searchChange', newVal);
            }
        },
        modelValue: {
            immediate: true,
            handler: function (newVal) {
                let item = this.list.find((it) => it.value === newVal);
                if (item) this.searchValue = item.label;
                else if (newVal === '') {
                    this.searchValue = '';
                }
            }
        },
        showSelect(v) {
            if (!v) {
                return;
            }
            const totalHeight = window.innerHeight;
            const bottom = this.$refs['select-input'].getBoundingClientRect().bottom;
            const toBottom = totalHeight - bottom;
            // this.selectBottom = toBottom > 430;
            this.selectBottom = toBottom > px2px(500);
        },
        list(v) {
            let item = v.find((it) => it.value === this.modelValue);
            if (item && this.modelValue !== '') this.searchValue = item.label;
        }
    },
    mounted() {
        document.addEventListener('click', this.handleHide);
    },
    beforeDestroy() {
        document.removeEventListener('click', this.handleHide);
    },
    methods: {
        inputFocus() {
            if (this.disabled) {
                return;
            }
            const res = document.getElementsByClassName('nl-select-content-wrapper-active');
            if (res?.length > 0) {
                return;
            }
            if (!this.list.length) {
                return;
            }
            this.showSelect = !this.showSelect;
        },
        select(item) {
            if (this.modelValue === item.value) {
                return;
            }
            this.searchValue = item.label;
            this.$emit('update:modelValue', item.value);
            this.$emit('input', item.value);
            this.showSelect = !this.showSelect;
        },
        handleHide() {
            if (this.showSelect) {
                this.showSelect = false;
                this.$refs['select-input']?.blur();
            }
        }
    }
};
</script>
<style lang="scss" scoped>
@import 'common/style/static';

.select-container {
    width: 100%;
    height: 84px;
    line-height: 84px;
    background-color: #ffffff;
    border-radius: 12px;
    position: relative;

    .input-container {
        flex: 1;
        box-sizing: border-box;
        height: 84px;
        line-height: 84px;
        padding: 0 60px 0 32px;
        border-radius: 12px;
        background-color: $white;
        display: flex;

        &:before {
            content: ' ';
            position: absolute;
            left: 0;
            width: 100%;
            height: 84px;
            border-radius: 12px;
            border: 2px solid rgba(0, 0, 0, 0.1);
        }

        &.active {
            &:before {
                content: ' ';
                position: absolute;
                left: 0;
                width: 100%;
                height: 84px;
                border-radius: 12px;
                border: 2px solid #683df5;
            }

            .icon-font {
                color: $purple !important;
            }
        }

        &.disabled {
            &:before {
                background-color: rgba($black, 0.1);
                color: rgba($black, 0.2);
                border: 0 none;
            }

            &.hover {
                background-color: rgba($black, 0.1);
                opacity: 1;
            }
        }

        .u-input {
            height: 100%;
            width: 100%;
            background: none;
            border: 0 none;
            font-size: $fs28;
            color: rgba(0, 0, 0, 0.7);
        }

        .input-icon {
            width: 40px;
            height: 40px;
            text-align: center;

            .iconfont {
                font-size: 24px;
                color: #999999;
            }
        }
    }

    .select-content-wrapper {
        position: absolute;
        z-index: 20;
        min-width: 350px;
        top: 84px;
        right: 0;
        background-color: #ffffff;
        border-radius: 24px;
        max-height: 430px;
        border: 2px solid #f2f2f2;
        display: none;

        .select-content {
            width: 100%;
            height: 100%;
            max-height: 430px;
            border-radius: 24px;
            overflow-x: hidden;
            overflow-y: auto;
        }

        &.nl-select-content-wrapper-active {
            display: block;
            animation: selectanim 0.25s;
            -webkit-animation: selectanim 0.25s;
        }

        &.top {
            transform: translate3d(0, -100%, 0);
            top: -20px;

            &:before {
                content: ' ';
                position: absolute;
                z-index: 1;
                right: 50%;
                left: 50%;
                transform: translateX(-50%);
                top: 100%;
                border: 20px solid;
                border-color: #f2f2f2 transparent transparent;
            }

            &:after {
                content: ' ';
                position: absolute;
                z-index: 1;
                right: 50%;
                left: 50%;
                transform: translateX(-50%);
                top: calc(100% - 2px);
                border: 18px solid;
                border-color: #ffffff transparent transparent;
            }
        }

        &.bottom {
            top: 104px;

            &:before {
                content: ' ';
                position: absolute;
                z-index: 1;
                right: 50%;
                left: 50%;
                transform: translateX(-50%);
                bottom: 100%;
                border: 20px solid;
                border-color: transparent transparent #f2f2f2;
            }

            &:after {
                content: ' ';
                position: absolute;
                z-index: 1;
                right: 50%;
                left: 50%;
                transform: translateX(-50%);
                bottom: calc(100% - 2px);
                border: 18px solid;
                border-color: transparent transparent #ffffff;
            }
        }

        .select-line {
            width: 100%;
            line-height: 76px;
            display: flex;
            align-items: center;
            justify-content: center;

            &:last-child {
                border-bottom: 0;
            }

            &.selected {
                background: rgba(104, 61, 245, 0.05);
            }
        }

        @keyframes selectanim {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        @-webkit-keyframes selectanim {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
    }
}
</style>