<template>
    <div class="_pc-admin-page">
        <a-row :gutter="[16, 16]">
            <a-col v-for="item in stats" :key="item.title" :xs="24" :md="12" :xl="6">
                <a-card :bordered="false">
                    <a-statistic
                        :title="item.title"
                        :value="item.value"
                        :precision="item.precision"
                        :prefix="item.prefix"
                        :suffix="item.suffix"
                    />
                    <div class="_pc-admin-stat-note">{{ item.note }}</div>
                </a-card>
            </a-col>
        </a-row>

        <a-row :gutter="[16, 16]" class="_pc-admin-section">
            <a-col :xs="24" :xl="16">
                <a-card title="经营概览" :bordered="false">
                    <a-table
                        row-key="name"
                        :columns="rankColumns"
                        :data-source="rankData"
                        :pagination="false"
                    />
                </a-card>
            </a-col>
            <a-col :xs="24" :xl="8">
                <a-card title="待办事项" :bordered="false">
                    <a-list :data-source="todoList">
                        <template #renderItem="{item}">
                            <a-list-item>
                                <a-list-item-meta :title="item.title" :description="item.desc" />
                                <a-tag :color="item.color">{{ item.status }}</a-tag>
                            </a-list-item>
                        </template>
                    </a-list>
                </a-card>
            </a-col>
        </a-row>
    </div>
</template>

<script setup>
const stats = [
    {title: '今日销售额', value: 284560, precision: 0, prefix: '¥', note: '较昨日 +12.4%'},
    {title: '支付订单', value: 1328, precision: 0, note: '待发货 86 单'},
    {title: '新增会员', value: 426, precision: 0, note: '复购率 38.2%'},
    {title: '库存预警', value: 17, precision: 0, suffix: '款', note: '建议今日处理'}
];

const rankColumns = [
    {title: '商品', dataIndex: 'name'},
    {title: '类目', dataIndex: 'category'},
    {title: '销量', dataIndex: 'sales'},
    {title: '销售额', dataIndex: 'amount'}
];

const rankData = [
    {name: 'Hunter Pro', category: '电动自行车', sales: 328, amount: '¥982,400'},
    {name: 'Patrol 52', category: '电摩', sales: 286, amount: '¥743,600'},
    {name: '配件护理套装', category: '耗材', sales: 812, amount: '¥96,628'}
];

const todoList = [
    {title: '审核促销活动', desc: '618 会场第二批商品待确认', status: '待审核', color: 'warning'},
    {title: '处理退款申请', desc: '超过 24 小时未处理 3 单', status: '紧急', color: 'error'},
    {title: '更新首页素材', desc: '新品主视觉已上传', status: '今日', color: 'processing'}
];
</script>

<style lang="scss" scoped>
._pc-admin-page {
    min-width: 960px;
}

._pc-admin-section {
    margin-top: 16px;
}

._pc-admin-stat-note {
    margin-top: 12px;
    color: #667085;
    font-size: 13px;
}
</style>
