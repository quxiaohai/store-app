<template>
    <footer
        class="custom-tab-bar"
        :class="[styleItem, { 'tab-bar-hidden': !tabBarShow }]">
        <div
            v-for="(item, index) in list"
            :key="index"
            class="custom-tab-bar-item"
            :class="{ active: item.pagePath === $route.path }"
            @click.stop.prevent="onSwitchTab(item.pagePath)"
        >
            <div class="flex-center icon-box">
                <i
                    class="tab-bar-icon"
                    :class="`${item.iconPath}${item.pagePath === $route.path ? '-checked' : ''}`"/>
            </div>
            <span class="tab-bar-text">{{ item.text }}</span>
        </div>
    </footer>
</template>
<script>
import { CUSTOM_TAB_BAR_LIST } from 'common/util/constant';

export default {
    name: 'CustomTabBar',
    data() {
        return {
            list: CUSTOM_TAB_BAR_LIST
        };
    },
    computed: {
        selected() {
            const path = this.$route.path;
            if (path === '/index')

                return this.$store.state.tabbarSelect;
        },
        styleItem() {
            const shopList = this.$store.state.shoppingCart?.shopList || [];
            // 2目前表示购物车
            if (this.$route.path === CUSTOM_TAB_BAR_LIST[2].pagePath && !!shopList.length) {
                return '';
            } else {
                return this.$route.path === CUSTOM_TAB_BAR_LIST[0].pagePath ? 'home normal' : 'normal';
            }
        },
        tabBarShow() {
            return this.$store.state.tabBarShow;
        }
    },
    methods: {
        onSwitchTab(url) {
            this.$router.push(url);
        }
    }
};``
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.custom-tab-bar {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: $tab-bar-default;
    background: $white;
    padding-bottom: $safe-height;
    z-index: 100;
    @include transition(transform 0.3s linear);

    &.tab-bar-hidden {
        @include translateY(100%);
    }

    &.normal {
        border-radius: $tab-bar-radius;
        box-shadow: $box-shadow-top;
    }

    .custom-tab-bar-item {
        flex: 1;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .icon-box {
        width: 48px;
        height: 48px;
        margin-bottom: 8px;
    }

    .tab-bar-icon {
        font-size: $fs48;
        color: $black;
    }

    .tab-bar-text {
        font-size: $fs20;
        font-weight: 400;
        line-height: 24px;
    }

    .custom-tab-bar-item.active {
        .tab-bar-icon {
            color: $purple;
        }

        .tab-bar-text {
            font-size: $fs24;
            color: $purple;
            font-weight: 600;
        }
    }
}
</style>
