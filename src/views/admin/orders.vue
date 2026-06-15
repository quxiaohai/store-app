<template>
    <div class="_pc-admin-page">
        <a-card :bordered="false">
            <a-tabs v-model:activeKey="activeStatus">
                <a-tab-pane key="all" tab="全部订单" />
                <a-tab-pane key="paid" tab="待发货" />
                <a-tab-pane key="shipped" tab="已发货" />
                <a-tab-pane key="refund" tab="售后中" />
            </a-tabs>

            <a-table
                row-key="id"
                :columns="columns"
                :data-source="filteredOrders"
                :pagination="{pageSize: 6}"
            >
                <template #bodyCell="{column, record}">
                    <template v-if="column.dataIndex === 'status'">
                        <a-tag :color="statusMap[record.status].color">
                            {{ statusMap[record.status].label }}
                        </a-tag>
                    </template>
                    <template v-if="column.dataIndex === 'action'">
                        <a-button type="link">查看详情</a-button>
                    </template>
                </template>
            </a-table>
        </a-card>
    </div>
</template>

<script setup>
import {computed, ref} from 'vue';

const activeStatus = ref('all');

const statusMap = {
    paid: {label: '待发货', color: 'processing'},
    shipped: {label: '已发货', color: 'success'},
    refund: {label: '售后中', color: 'warning'}
};

const columns = [
    {title: '订单号', dataIndex: 'id', width: 180},
    {title: '客户', dataIndex: 'customer', width: 140},
    {title: '商品', dataIndex: 'product'},
    {title: '金额', dataIndex: 'amount', width: 120},
    {title: '状态', dataIndex: 'status', width: 120},
    {title: '下单时间', dataIndex: 'createdAt', width: 180},
    {title: '操作', dataIndex: 'action', width: 120}
];

const orders = [
    {id: 'SO20260611001', customer: '陈女士', product: 'Freo Z Ultra', amount: '¥2,999', status: 'paid', createdAt: '2026-06-11 09:18'},
    {id: 'SO20260611002', customer: '林先生', product: 'S20 Pro 扫拖机器人', amount: '¥3,499', status: 'shipped', createdAt: '2026-06-11 10:42'},
    {id: 'SO20260610018', customer: '周女士', product: '智能清洁液套装', amount: '¥129', status: 'refund', createdAt: '2026-06-10 20:16'},
    {id: 'SO20260610011', customer: '王先生', product: '家庭深度护理组合', amount: '¥4,299', status: 'paid', createdAt: '2026-06-10 15:33'}
];

const filteredOrders = computed(() => {
    if (activeStatus.value === 'all') {
        return orders;
    }
    return orders.filter(item => item.status === activeStatus.value);
});
</script>

<style lang="scss" scoped>
._pc-admin-page {
    min-width: 960px;
}
</style>
