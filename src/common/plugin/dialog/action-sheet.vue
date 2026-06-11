<template>
    <div class="m-action-sheets">
        <scroll-view
            :scroll-y="true"
            class="items-container"
            :class="{ bottom: cancel === false, 'margin-btn-bottom': cancelType === 'btn' }"
        >
            <li
                class="item flex-center"
                v-for="(item, index) in itemList"
                :class="{ 'bd-b': index < itemList.length - 1 }"
                :key="index"
                :style="item.color ? 'color: ' + item.color : ''"
                @click="handleSheet(index)"
            >
                {{ item.text }}
            </li>
        </scroll-view>
        <div
            class="cancel-box flex-center"
            :class="{ 'cancel-btn-box': cancelType === 'btn' }"
            v-if="cancelType === 'btn'"
        >
            <li class="cancel flex-center cancel-text" @click="handleCancel">
                {{ cancelBtn.text }}
            </li>
        </div>
        <div class="cancel-box flex-center" v-else-if="cancel !== false">
            <li class="item flex-center" :style="{ color: cancelBtn.color }" @click="handleCancel">
                {{ cancelBtn.text }}
            </li>
        </div>
    </div>
</template>

<script>
import scrollView from 'common/components/scroll-view';

export default {
    name: 'actionSheet',
    components: { scrollView },
    props: {
        itemList: {
            type: Array,
            default() {
                return [];
            }
        },
        cancel: [Object, Boolean],
        cancelType: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            cancelBtn: Object.assign({ text: '取消', color: null }, this.cancel || {})
        };
    },
    methods: {
        handleSheet(index) {
            this.$event.emit('message', parseInt(index));
        },
        handleCancel() {
            this.$event.emit('cancel');
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.m-action-sheets {
    width: 100vw;
    border-radius: 16px 16px 0 0;
    background-color: $white-light;
    box-shadow: 0 4px 10px -2px rgba($gray-dark, 0.2);
    overflow: hidden;

    &.bottom {
        padding-bottom: 28px;
    }

    .items-container {
        max-height: 75vh;
        margin-bottom: 132px;
    }

    .margin-btn-bottom {
        margin-bottom: 160px;
    }

    .item {
        height: 112px;
        width: 100%;
        color: $gray-dark;
        font-size: $fs32;
        font-weight: bold;
        background-color: $white;

        &:active {
            background-color: $white-light;
        }
    }

    .cancel {
        color: $white;
        background-color: #c7c7c7;
        border-radius: 100px;
        background: #c7c7c7;
        height: 96px;
        width: 656px;
        box-sizing: border-box;
        padding: 0 32px;
    }

    .cancel-box {
        padding: 24px 0 0;
        position: absolute;
        width: 100%;
        bottom: 0;
        z-index: 2;
        background-color: $white;
    }

    .cancel-btn-box {
        padding: 24px 0 !important;
        .cancel {
            color: $white;
            background-color: #c7c7c7;
            border-radius: 100px;
            background: #c7c7c7;
            height: 96px;
            width: 656px;
            box-sizing: border-box;
            padding: 0 32px;
            font-size: 32px;
            font-weight: 700;
            color: $white;
        }
    }
}
</style>
