<template>
    <div class="_pc-admin-page">
        <a-card :bordered="false">
            <a-form layout="inline" class="_pc-admin-toolbar" @submit.prevent>
                <a-form-item label="商品名称">
                    <a-input
                        v-model:value="filters.keyword"
                        allow-clear
                        placeholder="输入商品关键词"
                        style="width: 220px"
                        @press-enter="handleSearch"
                    />
                </a-form-item>
                <a-form-item label="状态">
                    <a-select v-model:value="filters.status" style="width: 160px">
                        <a-select-option value="all">全部</a-select-option>
                        <a-select-option value="online">已上架</a-select-option>
                        <a-select-option value="offline">已下架</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item>
                    <a-space>
                        <a-button type="primary" :loading="loading" @click="handleSearch">
                            <template #icon>
                                <component v-if="SearchIcon" :is="SearchIcon" />
                            </template>
                            查询
                        </a-button>
                        <a-button @click="resetFilters">重置</a-button>
                    </a-space>
                </a-form-item>
            </a-form>
        </a-card>

        <a-alert
            v-if="fetchError"
            type="error"
            show-icon
            class="_pc-admin-section"
            :message="fetchError"
        />

        <a-card title="商品列表" :bordered="false" class="_pc-admin-section">
            <template #extra>
                <a-button type="primary" @click="openCreate">
                    <template #icon>
                        <component v-if="PlusIcon" :is="PlusIcon" />
                    </template>
                    新增商品
                </a-button>
            </template>
            <a-table
                row-key="id"
                :columns="columns"
                :data-source="products"
                :loading="loading"
                :pagination="pagination"
                @change="handleTableChange"
            >
                <template #bodyCell="{column, record}">
                    <template v-if="column.dataIndex === 'price'">
                        ¥{{ Number(record.price || 0).toFixed(2) }}
                    </template>
                    <template v-if="column.dataIndex === 'status'">
                        <a-tag :color="record.status === 'online' ? 'success' : 'default'">
                            {{ statusText(record.status) }}
                        </a-tag>
                    </template>
                    <template v-if="column.dataIndex === 'action'">
                        <a-space>
                            <a-button type="link" @click="openEdit(record)">编辑</a-button>
                            <a-button type="link" @click="toggleStatus(record)">
                                {{ record.status === 'online' ? '下架' : '上架' }}
                            </a-button>
                            <a-button type="link" danger @click="deleteProduct(record)">删除</a-button>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-card>

        <a-modal
            v-model:open="modalOpen"
            :title="editingId ? '编辑商品' : '新增商品'"
            :confirm-loading="saving"
            @ok="submitProduct"
        >
            <a-form :model="formState" layout="vertical">
                <a-form-item label="商品名称" required>
                    <a-input v-model:value="formState.name" placeholder="请输入商品名称" />
                </a-form-item>
                <a-form-item label="商品类目">
                    <a-input v-model:value="formState.category" placeholder="请输入商品类目" />
                </a-form-item>
                <a-form-item label="价格" required>
                    <a-input-number
                        v-model:value="formState.price"
                        :min="0"
                        :precision="2"
                        style="width: 100%"
                    />
                </a-form-item>
                <a-form-item label="库存" required>
                    <a-input-number
                        v-model:value="formState.stock"
                        :min="0"
                        :precision="0"
                        style="width: 100%"
                    />
                </a-form-item>
                <a-form-item label="状态">
                    <a-select v-model:value="formState.status">
                        <a-select-option value="online">已上架</a-select-option>
                        <a-select-option value="offline">已下架</a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup>
import {markRaw, onMounted, reactive, ref, shallowRef} from 'vue';

const API_URL = '/api/admin/products';

const filters = reactive({
    keyword: '',
    status: 'all'
});
const products = ref([]);
const loading = ref(false);
const saving = ref(false);
const fetchError = ref('');
const modalOpen = ref(false);
const editingId = ref(null);
const PlusIcon = shallowRef(null);
const SearchIcon = shallowRef(null);

const pagination = reactive({
    current: 1,
    pageSize: 5,
    total: 0,
    showSizeChanger: true,
    showTotal: total => `共 ${total} 条`
});

const formState = reactive({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    status: 'offline'
});

const columns = [
    {title: '商品编号', dataIndex: 'id', width: 120},
    {title: '商品名称', dataIndex: 'name'},
    {title: '类目', dataIndex: 'category', width: 150},
    {title: '价格', dataIndex: 'price', width: 140},
    {title: '库存', dataIndex: 'stock', width: 120},
    {title: '状态', dataIndex: 'status', width: 120},
    {title: '操作', dataIndex: 'action', width: 220}
];

onMounted(async () => {
    const icons = await import('@ant-design/icons-vue');
    PlusIcon.value = markRaw(icons.PlusOutlined);
    SearchIcon.value = markRaw(icons.SearchOutlined);
    await loadProducts();
});

function statusText(status) {
    return status === 'online' ? '已上架' : '已下架';
}

async function requestJson(url, option = {}) {
    const response = await fetch(url, {
        ...option,
        headers: {
            'Content-Type': 'application/json',
            ...(option.headers || {})
        }
    });
    const result = await response.json();
    if (!response.ok || result.code !== 1) {
        throw new Error(result.message || '请求失败');
    }
    return result.data;
}

async function loadProducts() {
    loading.value = true;
    fetchError.value = '';
    try {
        const params = new URLSearchParams({
            page: String(pagination.current),
            pageSize: String(pagination.pageSize)
        });
        if (filters.keyword) {
            params.set('keyword', filters.keyword);
        }
        if (filters.status !== 'all') {
            params.set('status', filters.status);
        }

        const data = await requestJson(`${API_URL}?${params.toString()}`);
        products.value = data.list || [];
        pagination.total = data.total || 0;
    } catch (error) {
        products.value = [];
        pagination.total = 0;
        fetchError.value = `${error.message}。请确认 MySQL 已启动且 .env.local 配置正确。`;
    } finally {
        loading.value = false;
    }
}

function handleSearch() {
    pagination.current = 1;
    loadProducts();
}

function handleTableChange(nextPagination) {
    pagination.current = nextPagination.current;
    pagination.pageSize = nextPagination.pageSize;
    loadProducts();
}

function resetFilters() {
    filters.keyword = '';
    filters.status = 'all';
    handleSearch();
}

function resetForm(record = {}) {
    formState.name = record.name || '';
    formState.category = record.category || '';
    formState.price = Number(record.price || 0);
    formState.stock = Number(record.stock || 0);
    formState.status = record.status || 'offline';
}

function openCreate() {
    editingId.value = null;
    resetForm();
    modalOpen.value = true;
}

function openEdit(record) {
    editingId.value = record.id;
    resetForm(record);
    modalOpen.value = true;
}

async function submitProduct() {
    saving.value = true;
    fetchError.value = '';
    try {
        const body = JSON.stringify({...formState});
        if (editingId.value) {
            await requestJson(`${API_URL}/${editingId.value}`, {method: 'PUT', body});
        } else {
            await requestJson(API_URL, {method: 'POST', body});
        }
        modalOpen.value = false;
        await loadProducts();
    } catch (error) {
        fetchError.value = error.message;
    } finally {
        saving.value = false;
    }
}

async function toggleStatus(record) {
    fetchError.value = '';
    try {
        await requestJson(`${API_URL}/${record.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: record.status === 'online' ? 'offline' : 'online'
            })
        });
        await loadProducts();
    } catch (error) {
        fetchError.value = error.message;
    }
}

async function deleteProduct(record) {
    if (!window.confirm(`确认删除商品「${record.name}」吗？`)) {
        return;
    }

    fetchError.value = '';
    try {
        await requestJson(`${API_URL}/${record.id}`, {method: 'DELETE'});
        if (products.value.length === 1 && pagination.current > 1) {
            pagination.current -= 1;
        }
        await loadProducts();
    } catch (error) {
        fetchError.value = error.message;
    }
}
</script>

<style lang="scss" scoped>
._pc-admin-page {
    min-width: 960px;
}

._pc-admin-toolbar {
    row-gap: 16px;
}

._pc-admin-section {
    margin-top: 16px;
}
</style>
