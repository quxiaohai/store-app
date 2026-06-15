<template>
    <div class="_pc-admin-page">
        <a-row :gutter="[16, 16]">
            <a-col :xs="24" :xl="14">
                <a-card title="基础配置" :bordered="false">
                    <a-form :model="formState" :label-col="{span: 5}" :wrapper-col="{span: 16}">
                        <a-form-item label="商城名称">
                            <a-input v-model:value="formState.storeName" />
                        </a-form-item>
                        <a-form-item label="客服邮箱">
                            <a-input v-model:value="formState.email" />
                        </a-form-item>
                        <a-form-item label="订单自动关闭">
                            <a-input-number v-model:value="formState.closeMinutes" :min="5" :max="1440" />
                            <span class="_pc-admin-form-unit">分钟</span>
                        </a-form-item>
                        <a-form-item label="启用库存预警">
                            <a-switch v-model:checked="formState.stockWarning" />
                        </a-form-item>
                        <a-form-item :wrapper-col="{offset: 5, span: 16}">
                            <a-space>
                                <a-button type="primary">保存配置</a-button>
                                <a-button>取消</a-button>
                            </a-space>
                        </a-form-item>
                    </a-form>
                </a-card>
            </a-col>
            <a-col :xs="24" :xl="10">
                <a-card title="缓存说明" :bordered="false">
                    <a-alert
                        type="info"
                        show-icon
                        message="后台模块使用 keep-alive 缓存"
                        description="在商品、订单、设置等模块之间切换时，当前模块的筛选条件、表单输入和 tab 状态会保留。点击顶部刷新按钮可重建当前缓存。"
                    />
                </a-card>
            </a-col>
        </a-row>
    </div>
</template>

<script setup>
import {reactive} from 'vue';

const formState = reactive({
    storeName: 'Narwal Store',
    email: 'support@example.com',
    closeMinutes: 30,
    stockWarning: true
});
</script>

<style lang="scss" scoped>
._pc-admin-page {
    min-width: 960px;
}

._pc-admin-form-unit {
    margin-left: 8px;
    color: #667085;
}
</style>
