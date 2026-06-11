<template>
    <popup :option="popupOption" v-model="visible" class="custom-dialog">
        <div class="m-mobile-dialog">
            <div class="dialog-title flex-center" v-if="$slots.title">
                <slot name="title" />
            </div>
            <div v-else-if="option.title" class="dialog-title flex-center">{{ option.title }}</div>
            <div @click="handleClose" v-if="option.close === true" class="dialog-close flex-center">
                <i class="iconfont icon-close"></i>
            </div>
            <div :class="[option.type, { 'content-no-padding': option.contentNoPadding }]" class="dialog-content">
                <span v-if="option.content && !$slots.default">{{ option.content }}</span>
                <slot v-else></slot>
            </div>
            <div
                :class="[option.type, { disabled: disabled }]"
                class="dialog-items flex-between"
                v-if="option.confirmType !== 'bottom'"
            >
                <div
                    v-if="option.type === 'confirm'"
                    @click="handleClick('cancel')"
                    class="btn-cancel flex-center _hover"
                >
                    <slot v-if="$slots.cancel" name="cancel" />
                    <template v-else>{{ option.cancelText || '取消' }}</template>
                </div>
                <div @click="handleClick('ok')" class="btn-ok flex-center _hover" :id="option.okReportId" :report-id="option.okReportId">
                    <slot v-if="$slots.ok" name="ok" />
                    <template v-else>{{ option.okText || '确定' }}</template>
                </div>
            </div>
        </div>
        <div v-if="option.confirmType === 'bottom'" class="bottom-confirm">
            <n-button
                :type="option.okType"
                theme="light"
                round
                @tap="handleClick('ok')"
                class="btn"
                :disabled="disabled"
                :id="option.okReportId"
                :report-id="option.okReportId"
            >
                {{ option.okText || '确定' }}
            </n-button>
        </div>
    </popup>
</template>
<script>
export default {
    name: 'CustomDialog',
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        option: {
            type: Object,
            default() {
                return {
                    /*******
                     * type: alert|confirm 默认alert
                     * close: true,// 默认显示
                     * title: '',
                     * content: '',
                     * okText: '',
                     * cancelText: '',
                     * ok: () => {},
                     * cancel: () => {}，
                     * okReportId: ''
                     */
                };
            }
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue', 'ok', 'cancel', 'close'],
    watch: {
        modelValue(v) {
            this.visible = v;
        },
        visible(v) {
            this.$emit('update:modelValue', v);
        }
    },
    data() {
        return {
            popupOption: {
                showCenter: true
            },
            visible: this.show
        };
    },
    methods: {
        handleClick(id) {
            if (this.disabled) {
                return false;
            }

            if (id === 'ok') {
                this.$emit('ok');
                this.option.ok && this.option.ok();
            } else if (id === 'cancel') {
                this.$emit('cancel');
                this.option.cancel && this.option.cancel();
                this.handleClose();
            }
        },
        handleClose() {
            this.visible = false;
            this.$emit('close');
        }
    }
};
</script>
<style lang="scss" scoped>
@import 'common/style/static';
.custom-dialog {
    display: flex;
    flex-direction: column;
    .m-mobile-dialog {
        //自定义弹出框
        width: 592px;
        background: rgba($white, 0.85);
        border-radius: 32px;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        position: relative;
        padding-top: 48px;

        .dialog-title {
            font-size: $fs28;
            height: 48px;
            font-weight: 600;
            color: $black;
            max-width: 416px;
            @extend %ellipsis-basic;
            margin: 0 auto;
        }

        .dialog-close {
            right: 0;
            top: 0;
            padding: 48px 40px 0 0;
            box-sizing: border-box;
            z-index: 6;
            position: absolute;
            width: 88px;
            height: 96px;

            .iconfont {
                font-size: $fs48;
                color: $gray-light;
            }
        }

        .dialog-content {
            width: 100%;
            box-sizing: border-box;
            word-break: break-word;
            margin: 0 auto;
            font-size: $fs28;
            line-height: 36px;
            padding: 24px 0 48px;
            color: rgba($black, 0.9);

            :deep(.dialog-text) {
                font-weight: 300;
                text-align: center;
                line-height: 40px;
                padding: 0 40px;
                word-break: break-word;
            }

            &.content-no-padding {
                padding: 0;
            }
        }

        .dialog-items {
            height: 112px;
            width: 100%;
            border-radius: 0 0 32px 32px;
            overflow: hidden;
            border-top: 1px solid rgba($black, 0.1);

            &.disabled {
                .btn-ok,
                .btn-cancel {
                    color: rgba($black, 0.4);
                }
            }

            .btn-ok,
            .btn-cancel {
                flex: 1;
                height: 112px;
                color: $black;
                font-size: $fs28;
                font-weight: 500;
            }

            .btn-cancel {
                border-right: 1px solid rgba($black, 0.1);
                box-sizing: border-box;
            }

            .btn-ok {
                color: $purple;
            }
        }
    }

    .bottom-confirm {
        margin-top: 60px;
        .btn {
            width: 328px;
        }
    }
}
</style>
