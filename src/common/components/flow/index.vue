<template>
    <div class="nl-flow flex-row flex-ac flex-jsb">
        <template v-for="(item, index) in flow" :key="index">
            <span v-if="!!index" class="line flex-1" :class="[item.color]"/>
            <div class="flow-item">
                <i class="iconfont" :class="[item.icon, item.color]"/>
                <span class="fz-24 sub-text" :class="item.textColor || item.color">{{ item.text }}</span>
            </div>
        </template>
    </div>
</template>

<script>
export default {
    name: 'NlFlow',
    props: {
        /// 流程数组
        /*
         * [{text:'',icon:'',color:'',textColor:''}]
         */
        flow: Array
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.nl-flow {
    padding: 40px;

    .flow-item {
        position: relative;
        line-height: 1;
        z-index: 10;

        .iconfont {
            font-size: 48px;
            vertical-align: top;
        }

        .sub-text {
            position: absolute;
            top: 50px;
            left: 20px;
            width: 120px;
            text-align: center;
            transform: translateX(-50%);
        }
    }

    .line {
        position: relative;
        height: 4px;

        &:before {
            content: '';
            position: absolute;
            top: 0;
            left: -8px;
            right: -8px;
            height: 100%;
            z-index: 5;
        }

        &.primary:before {
            background-color: $purple;
        }

        &.grey:before {
            background-color: $white-dark;
        }
    }

    .primary {
        color: $purple;
    }

    .grey {
        color: $white-dark;
    }
}
</style>
