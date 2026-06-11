<template>
    <div class="m-mobile-dialog"
         :class="{'mobile-wait': option.wait, 'comp': !!appComp}">
        <div class="dialog-wait flex-center" v-if="option.wait">
            <div class="loading"><i v-for="n in 8" :key="n"></i></div>
            <div class="wait-text">{{ option.wait === true ? '加载中' : option.wait }}</div>
        </div>
        <template v-else>
            <div v-if="option.title" class="dialog-title flex-center">{{ option.title }}</div>
            <div @click="handleClose" v-if="option.close !== false" class="dialog-close flex-center">
                <i class="iconfont icon-close"></i>
            </div>
            <div :class="option.type" class="dialog-content">
                <component :option="option" v-if="!!appComp" :is="appComp"/>
                <p
                    class="dialog-text"
                    v-else-if="option.content"
                    v-html="option.content"
                ></p>
            </div>
            <div
                v-if="option.type"
                :class="[option.type, { disabled }]"
                class="dialog-items flex-between">
                <div
                    @click="handleClick('cancel')"
                    v-if="option.type === 'confirm'"
                    :style="{color: option.cancelColor}"
                    class="btn-cancel flex-center"
                >
                    {{ option.cancelText || '取消' }}
                </div>
                <div
                    @click="handleClick('ok')"
                    :style="{color: option.okColor}"
                    class="btn-ok flex-center">
                    {{ option.okText || '确定' }}
                </div>
            </div>
        </template>
    </div>
</template>
<script>
export default {
    name: 'custom-dialog',
    props: {
        option: {
            type: Object,
            default() {
                return {
                    /*******
                     * wait: false | ''
                     * type: alert | confirm
                     * close: true,// 默认显示
                     * title: '',
                     * content: '',
                     * okText: '',
                     * cancelText: '',
                     * ok: () => {},
                     * cancel: () => {}
                     */
                };
            }
        },
        appComp: Object,
        disabled: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        handleClick(id) {
            this.$event.emit(id);
        },
        handleClose() {
            this.$event.emit('close');
        }
    }
};
</script>
<style lang="scss" scoped>
@import "common/style/static";

.m-mobile-dialog { //自定义弹出框
    width: 592px;
    background: $white;
    border-radius: 32px;
    backdrop-filter: blur(20px);
    position: relative;
    padding-top: 48px;
    overflow: hidden;

    &.mobile-wait {
        background: none;
        box-shadow: none;
        padding-top: 0;
        width: auto;
    }

    .dialog-wait {
        height: 200px;
        min-width: 200px;
        max-width: 600px;
        border-radius: 10px;
        background-color: rgba($black, 0.8);

        .loading {
            position: absolute;
            top: 70px;

            i {
                display: block;
                height: 20px;
                width: 4px;
                border-radius: 4px;
                position: absolute;
                background-color: $white;
            }

            i:nth-child(1) {
                top: 24px;
                left: 0;
                @include animation(waitLoading 1s ease 0s infinite);
            }

            i:nth-child(2) {
                top: 16px;
                left: 16px;
                @include rotate(-45deg);
                @include animation(waitLoading 1s ease -0.12s infinite);
            }

            i:nth-child(3) {
                top: 0;
                left: 24px;
                @include rotate(-90deg);
                @include animation(waitLoading 1s ease -0.24s infinite);
            }

            i:nth-child(4) {
                top: -16px;
                left: 16px;
                @include rotate(45deg);
                @include animation(waitLoading 1s ease -0.36s infinite);
            }

            i:nth-child(5) {
                top: -24px;
                left: 0;
                @include animation(waitLoading 1s ease -0.48s infinite);
            }

            i:nth-child(6) {
                top: -16px;
                left: -16px;
                @include rotate(-45deg);
                @include animation(waitLoading 1s ease -0.6s infinite);
            }

            i:nth-child(7) {
                top: 0;
                left: -24px;
                @include rotate(-90deg);
                @include animation(waitLoading 1s ease -0.72s infinite);
            }

            i:nth-child(8) {
                top: 16px;
                left: -16px;
                @include rotate(45deg);
                @include animation(waitLoading 1s ease -0.84s infinite);
            }
        }

        .wait-text {
            padding: 100px 20px 0;
            font-size: $fs28;
            @extend %ellipsis-basic;
            color: $white;
        }
    }

    .dialog-title {
        font-size: $fs28;
        height: 48px;
        font-weight: 600;
        color: $black;
        max-width: 416px;
        @extend %ellipsis-basic;
        margin: 0 auto;
    }

    &.comp {
        padding-top: 0;

        .dialog-title {
            line-height: 88px;
            height: 88px;
        }

        .dialog-close {
            padding: 0;
            height: 88px;
        }
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
        color: rgba($black, 0.9);

        .dialog-text {
            font-weight: 300;
            text-align: center;
            line-height: 40px;
            padding: 24px 40px 48px;
            word-break: break-word;
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

@include keyframes(waitLoading) {
    50% {
        opacity: 0.1;
    }
    100% {
        opacity: 1;
    }
}
</style>