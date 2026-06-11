<template>
    <div class="form-model-item" :class="[{ 'has-error': showAni }, hintType]">
        <slot/>
        <transition v-if="showAni" name="slide" @after-leave="afterLeave">
            <div
                v-if="hintType === 'text'"
                class="form-explain"
                v-show="showMsg"
            >
                {{ message }}
            </div>
        </transition>
    </div>
</template>

<script>
import Schema from 'async-validator';
import filterData from 'lib/json/filterData';
import { isObject, isArray } from 'lib/util/dataType';

export default {
    name: 'form-model-item',
    props: {
        prop: String
    },
    inject: ['model', 'rules', 'formModel'],
    data() {
        return {
            value: null,
            showAni: false, // 显示动画
            showMsg: false, // 显示信息
            message: null // 错误信息
        };
    },
    watch: {
        prop() {
            this.initValid();
        }
    },
    mounted() {
        this.initModelWatch();
        this.initValid();
    },
    computed: {
        hintType() {
            return this.formModel.hintType;
        }
    },
    methods: {
        // 初始化model监听
        initModelWatch() {
            if (this.formModel.real) {
                this.$watch('model', {
                    deep: true,
                    handler: () => {
                        this.onFieldChange(true);
                    }
                });
            }
        },
        // 动画结束，初始化数据
        afterLeave() {
            this.showAni = false;
            this.message = null;
        },
        // 初始化数据
        initValid() {
            if (!this.prop) {
                this.value = null;
                this.validator = null;
                this.showMsg = false;
                return false;
            }

            const valid = {};
            this.value = filterData(this.model, this.prop);
            valid[this.prop] = filterData(this.rules, this.prop);

            if (valid[this.prop]) {
                this.validator = new Schema(valid);
            }
        },
        // 接受爸爸组件调用，显示成功或者失败
        onParentChange(errors) {
            const obj = errors.find((r) => r.field === this.prop);
            if (!obj) {
                this.showMsg = false;
                return false;
            }

            this.showAni = true;

            if (this.hintType === 'text') {
                this.$nextTick(() => {
                    this.message = obj.message;
                    this.showMsg = true;
                });
            } else {
                this.$layer.toast(obj.message);
                setTimeout(() => {
                    this.showAni = false;
                }, 300);
            }

            return true;
        },
        /***********
         * 显示错误信息
         * @param errorMsg 错误信息，默认为空
         */
        onShowErrorMsg(errorMsg) {
            this.showAni = true;
            this.$nextTick(() => {
                this.message = errorMsg;
                this.showMsg = true;
            });
        },
        /*********
         * 验证model
         * @param isChange 是否监听值有变化，默认false
         * @returns {boolean}
         */
        onFieldChange(isChange) {
            if (!this.prop || !this.validator) {
                this.showMsg = false;
                return false;
            }

            const nVal = filterData(this.model, this.prop);
            if (
                (isChange && this.value !== nVal) ||
                (isChange && (isObject(this.value) || isArray(this.value))) ||
                !isChange
            ) {
                const obj = {};
                obj[this.prop] = nVal;
                this.value = nVal;
                this.validator.validate(obj, (errors) => {
                    if (errors) {
                        this.showAni = true;
                        this.$nextTick(() => {
                            this.message = errors[0]?.message;
                            this.showMsg = true;
                        });
                        return false;
                    }
                    this.showMsg = false;
                });
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import "common/style/static";

.form-model-item {
    padding-bottom: 24px;

    @include keyframes(slide-move) {
        0%,
        50% {
            transform: translateX(-15px);
        }
        10%,
        35%,
        70%,
        100% {
            transform: translateX(0);
        }
        20%,
        85% {
            transform: translateX(15px);
        }
    }

    &.toast {
        &.has-error {
            animation: slide-move 0.3s ease-out 1 alternate forwards;
        }
    }

    &.has-error {
        padding-bottom: 2px;

        .form-explain {
            height: 48px;
            margin: 12px 0 24px 0;
            display: flex;
            align-items: center;
            padding: 0 48px;
            color: $red;
            font-weight: 600;
            font-size: $fs24;
            line-height: 24px;
            background: #fff3f3;
            border-radius: 24px;
        }
    }

    .form-explain {
        min-height: 44px;
        color: $gray-dark;
        font-size: $fs28;
        line-height: 1.5;
        transform: translateY(0);
        opacity: 1;
        transition: color 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    .slide-enter-active,
    .slide-leave-active {
        transition: all 0.2s linear;
    }

    .slide-enter-form,
    .slide-leave-to {
        transform: translateY(-20%) !important;
        opacity: 0 !important;
    }
}
</style>
