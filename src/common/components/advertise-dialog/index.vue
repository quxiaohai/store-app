<template>
    <popup :option="combineOption" v-model="visible">
        <div class="m-mobile-dialog-wrapper">
            <div class="m-mobile-dialog" @click="handleClick">
                <slot></slot>
            </div>
            <div class="dialog-close flex-center" @click="handleClose" v-if="option.close === true">
                <img alt="" src="~assets/images/common/close-line.svg" class="image" />
            </div>
        </div>
    </popup>
</template>
<script>
export default {
    // 类似广告弹窗
    name: 'AdvertiseDialog',
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        option: {
            type: Object,
            default() {
                return {};
            }
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue', 'ok', 'close'],
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
    computed: {
        combineOption() {
            return { ...(this.popupOption || {}), ...(this.option || {}) };
        }
    },
    methods: {
        handleClick() {
            if (this.disabled) {
                return false;
            }
            this.$emit('ok');
            this.option.ok && this.option.ok();
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

.m-mobile-dialog-wrapper {
    position: relative;

    .m-mobile-dialog {
        //自定义弹出框
        width: 100%;
        position: relative;
    }

    .dialog-close {
        width: 100%;
        box-sizing: border-box;
        z-index: 6;
        position: relative;
        margin-top: 48px;

        .iconfont {
            font-size: 80px;
            color: $white;
        }

        .image {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }
    }
}
</style>
