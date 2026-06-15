<template>
    <a-config-provider :theme="theme">
        <a-layout class="_pc-admin-shell">
            <a-layout-sider v-model:collapsed="collapsed" collapsible class="_pc-admin-sider">
                <div class="_pc-admin-brand">
                    <div class="_pc-admin-logo">H</div>
                    <span v-if="!collapsed">星途创新</span>
                </div>
                <a-menu
                    theme="dark"
                    mode="inline"
                    :selected-keys="selectedKeys"
                    :items="menuItems"
                    @click="handleMenuClick"
                />
            </a-layout-sider>

            <a-layout>
                <a-layout-header class="_pc-admin-header">
                    <div>
                        <a-typography-title :level="4" class="_pc-admin-title">
                            {{ currentTitle }}
                        </a-typography-title>
                        <a-breadcrumb :items="breadcrumbItems" />
                    </div>
                    <a-space>
                        <a-tag color="processing">同模块缓存已启用</a-tag>
                        <a-button type="primary" @click="refreshCurrent">
                            <template #icon>
                                <component v-if="ReloadIcon" :is="ReloadIcon" />
                            </template>
                            刷新
                        </a-button>
                    </a-space>
                </a-layout-header>

                <a-layout-content class="_pc-admin-content">
                    <router-view v-slot="{Component, route}">
                        <keep-alive :max="8">
                            <component
                                v-if="route.meta.adminCache"
                                :is="Component"
                                :key="getModuleCacheKey(route)"
                            />
                        </keep-alive>
                        <component
                            v-if="!route.meta.adminCache"
                            :is="Component"
                            :key="route.fullPath"
                        />
                    </router-view>
                </a-layout-content>
            </a-layout>
        </a-layout>
    </a-config-provider>
</template>

<script setup>
import {computed, h, markRaw, onMounted, ref, shallowRef} from 'vue';
import {useRoute, useRouter} from 'vue-router';

const route = useRoute();
const router = useRouter();
const collapsed = ref(false);
const refreshSeed = ref(0);
const menuIcons = shallowRef({});
const ReloadIcon = shallowRef(null);

const theme = {
    token: {
        colorPrimary: '#1677ff',
        borderRadius: 6,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }
};

const menuItems = computed(() => [
    {
        key: '/admin/dashboard',
        icon: renderMenuIcon('DashboardOutlined'),
        label: '管理首页'
    },
    {
        key: '/admin/products',
        icon: renderMenuIcon('TagsOutlined'),
        label: '商品管理'
    },
    {
        key: '/admin/orders',
        icon: renderMenuIcon('ShoppingCartOutlined'),
        label: '订单中心'
    },
    {
        key: '/admin/settings',
        icon: renderMenuIcon('SettingOutlined'),
        label: '系统设置'
    }
]);

const selectedKeys = computed(() => {
    const matched = menuItems.value.find(item => route.path.startsWith(item.key));
    return [matched?.key || '/admin/dashboard'];
});

const currentTitle = computed(() => route.meta.title || route.name || '后台管理');
const breadcrumbItems = computed(() => [
    {title: '后台管理'},
    {title: currentTitle.value}
]);

onMounted(async () => {
    const icons = await import('@ant-design/icons-vue');
    menuIcons.value = {
        DashboardOutlined: markRaw(icons.DashboardOutlined),
        TagsOutlined: markRaw(icons.TagsOutlined),
        ShoppingCartOutlined: markRaw(icons.ShoppingCartOutlined),
        SettingOutlined: markRaw(icons.SettingOutlined)
    };
    ReloadIcon.value = markRaw(icons.ReloadOutlined);
});

function renderMenuIcon(name) {
    return () => {
        const Icon = menuIcons.value[name];
        return Icon ? h(Icon) : h('span', {class: '_pc-admin-menu-dot'});
    };
}

function getModuleCacheKey(targetRoute) {
    return `${targetRoute.meta.module || targetRoute.name || targetRoute.path}:${refreshSeed.value}`;
}

function handleMenuClick({key}) {
    router.push(key);
}

function refreshCurrent() {
    refreshSeed.value += 1;
}
</script>

<style lang="scss" scoped>
._pc-admin-shell {
    min-height: 100vh;
    background: #eef2f7;
}

._pc-admin-sider {
    min-height: 100vh;
}

._pc-admin-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 64px;
    padding: 0 18px;
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
}

._pc-admin-logo {
    display: grid;
    flex: 0 0 32px;
    width: 32px;
    height: 32px;
    place-items: center;
    border-radius: 8px;
    background: #1677ff;
}

._pc-admin-menu-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
}

._pc-admin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;
    padding: 0 24px;
    background: #ffffff;
    border-bottom: 1px solid #e6eaf0;
}

._pc-admin-title {
    margin: 0 0 4px !important;
}

._pc-admin-content {
    min-height: calc(100vh - 72px);
    padding: 24px;
    overflow: auto;
}
</style>
