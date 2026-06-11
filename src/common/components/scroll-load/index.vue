<template>
    <div class="scroll-load-view">
        <slot :list="list"/>
        <div class="m-scroll-loading flex-center" v-if="show || this.visible">
            <span class="line bd-b"></span>
            <span class="text">{{ finish ? '没有更多了~' : text }}</span>
            <span class="line bd-b"></span>
        </div>
        <div
            v-if="showWait && !init"
            class="load-wait flex-center">
            <i class="iconfont icon-loading"></i>正在加载..
        </div>
        <div
            class="empty-text flex-center"
            v-if="emptyText && init && list.length === 0">{{ emptyText }}
        </div>
    </div>
</template>
<script>

import debounce from 'lib/util/debounce';
import env from 'lib/comp/env';
import { isNode, isFunction } from 'lib/util/dataType';
import diskCache from 'common/util/disk-cache';

export default {
    name: 'scroll-load',
    props: {
        lower: {// 距离底部多远开始加载
            type: Number,
            default: 50
        },
        // 如果node = self ，可监听本身滚动
        node: env.isClient() ? [Node, String] : [Object, String],
        url: Object,
        //
        onFilter: Function,
        // 过滤额外参数，只在调用onFilter有效
        filterExtra: Object,
        text: {
            type: String,
            default: '正在加载...'
        },
        // 当前列表是否活动的
        active: {
            type: Boolean,
            default: true
        },
        params: Object,
        visible: {
            type: Boolean,
            default: false
        },
        emptyText: String,
        // 显示等待
        showWait: {
            type: Boolean,
            default: false
        },
        // 是否缓存
        cache: {
            type: Boolean,
            default: false
        }
    },
    data() {
        let map = {};
        if (this.cache) {
            map = diskCache.get(this.$route.fullPath, 'scroll');
        }
        return {
            lastScrollTop: 0,
            isScroll: true,
            pageSize: 20,
            pageNo: map?.pageNo || 1,
            list: map?.list || [],
            show: !!map?.show,
            count: map?.count || 0,
            // 是否允许加载
            loading: false,
            // 是否全部加载完
            finish: !!map?.finish,
            // 是否已初始化
            init: false
        };
    },
    computed: {
        loadState() {
            return this.loading && (this.show || this.visible) && !this.finish;
        }
    },
    mounted() {
        this.debounce = debounce(this.onScroll, 20);
        this.bind();
        if (this.active && this.list?.length === 0) {
            this.onLoadData();
        }
    },
    created() {
        if (this.list?.length > 0) {
            this.$emit('loaded', {
                list: this.list,
                count: this.count
            });
            this.loading = true;
        }
    },
    unmounted() {
        this.unbind();
    },
    watch: {
        node(n, o) {
            if (this.loadState) {
                this.unbind(o);
                this.bind();
            }
        },
        loading(bool) {
            if (bool) {
                this.bind();
            } else {
                this.unbind();
            }
        },
        active(bool) {
            if (bool && this.list.length === 0) {
                this.onLoadData();
            }
        }
    },
    methods: {
        // 获取node相关信息
        nodeRect() {
            const node = this.getCurrentNode(document.body);
            const clientHeight = !this.node ? window.innerHeight : node.clientHeight;
            const scrollTop = !this.node ? (window.scrollY || document.documentElement.scrollTop) : node.scrollTop;
            const top = node.scrollHeight - clientHeight;
            return { height: clientHeight, scrollTop: scrollTop, top: top };
        },
        getCurrentNode(defaultNode) {
            if (isNode(this.node)) {
                return this.node;
            } else if (this.node === 'self') {// 本身
                return this.$el;
            }
            return defaultNode || document;
        },
        bind() {
            const node = this.getCurrentNode();
            node.addEventListener('scroll', this.debounce);
        },
        unbind(o) {
            const node = o || this.getCurrentNode();
            node.removeEventListener('scroll', this.debounce);
        },
        // 刷新数据
        refreshData() {
            this.pageNo = 1;
            this.onLoadData();
        },
        // 加载数据
        async onLoadData() {
            if (!this.url) {
                this.init = true;
                this.loading = true;
                return false;
            }

            const [res, err] = await this.$http.awaitTo(
                this.$http.get(this.url, {
                    params: Object.assign({
                        pageNo: this.pageNo,
                        pageSize: this.pageSize
                    }, this.params || {})
                })
            );

            this.loading = true;
            this.init = true;

            if (err) {
                return false;
            }

            const filter = this.onFilter || (list => list);

            if (this.pageNo === 1) {
                this.list = filter(res.data?.list || [], {
                    key: this.$route.fullPath,
                    extra: this.filterExtra,
                    clear: true
                });
            } else {
                this.list.push(...filter(res.data?.list || [], {
                    key: this.$route.fullPath,
                    extra: this.filterExtra,
                    clear: false
                }));
            }

            const len = this.list.length;
            this.show = len >= 3;
            this.finish = (len / this.pageNo) % this.pageSize > 0;
            this.count = res.data?.count || 0;
            this.$emit('loaded', res.data);
            if (this.cache) {
                diskCache.set(this.$route.fullPath, 'scroll', {
                    list: this.list,
                    pageNo: this.pageNo,
                    show: this.show,
                    finish: this.finish,
                    count: res.data?.count || 0
                });
            }
        },
        // 更新数据
        onUpdate(callback) {
            if (isFunction(callback)) {
                callback(this.list);
            }
        },
        onScroll() {
            if (!this.loadState) {
                this.$emit('scrolled', this.nodeRect());
                return false;
            }
            const rect = this.nodeRect();
            this.$emit('scrolled', rect);
            if (this.isScroll && rect.scrollTop > this.lastScrollTop && (rect.top - rect.scrollTop) <= this.lower) {
                this.isScroll = false;
                this.loading = false;
                this.pageNo++;
                if (this.url) {
                    this.onLoadData();
                }

                this.$emit('load', {
                    top: rect.scrollTop,
                    loading: () => {
                        this.loading = true;
                    },
                    done: () => {
                        this.finish = true;
                    }
                });

                setTimeout(() => {
                    this.isScroll = true;
                }, 50);
            }
            this.lastScrollTop = rect.scrollTop;
        }
    }
};
</script>
<style lang="scss" scoped>
@import "common/style/static";

.m-scroll-loading {
    height: 96px;
    width: 100%;

    .text {
        color: $gray-light;
        font-size: $fs24;
        padding: 0 4.266%;
    }

    .line {
        width: 14.5%;
        height: 0;
        background-color: rgba($black, 0.08);
    }
}

.scroll-load-view {
    .empty-text {
        font-size: $fs24;
        color: $gray-light;
        height: 80vh;
    }

    .load-wait {
        padding-top: 20px;
        padding-bottom: 60px;
        line-height: 30px;
        @keyframes loading-rotate {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }

        font-size: $fs24;
        color: $gray;

        .iconfont {
            font-size: $fs24;
            color: $gray;
            animation: loading-rotate 2s linear infinite;
            margin-right: 4px;
        }
    }
}
</style>