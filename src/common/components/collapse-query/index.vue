<template>
    <div class="nl-collapse-query">
        <collapse :visible="collapseShow">
            <slot v-if="query && query.length" :query="query"/>
            <div v-else class="place-color fw-300 fz-24 ta-c p-32">暂无数据</div>
        </collapse>
    </div>
</template>
<script>
import collapse from 'common/components/collapse';

export default {
    name: 'collapse-query',
    components: { collapse },
    props: {
        /// 是否展开
        visible: {
            type: Boolean,
            default: false
        },
        /// 请求地址，例如{ url: 'XXX', module: XXX }
        url: {
            type: Object
        },
        /// 接口请求参数
        extra: {
            type: Object
        }
    },
    data() {
        return {
            collapseShow: false,
            /// 请求到的数据
            query: null,
            /// 定时器
            timer: null
        };
    },
    watch: {
        /// 当显示状态变更时，尝试初始化数据
        visible(v) {
            if (v) {
                this.initData();
            } else {
                this.closeCollapse();
            }
        }
    },
    beforeDestroy() {
        clearTimeout(this.timer);
    },
    methods: {
        /// 初始化数据
        initData() {
            if (this.query) return this.showCollapse();
            this.$http.wait.get(this.url, {
                params: {
                    ...this.extra
                }
            })
                .then(res => {
                    this.query = res.data || [];
                    this.showCollapse();
                });
        },
        /// 显示折叠面板
        showCollapse() {
            this.$nextTick(() => {
                this.collapseShow = true;
            });
        },
        /// 关闭折叠面板
        closeCollapse() {
            this.collapseShow = false;
        }
    }
};
</script>
<style lang="scss" scoped>
.nl-collapse-query {
    transition: all 0.6s;
    overflow: hidden;
}
</style>
