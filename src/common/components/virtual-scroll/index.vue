<template>
    <div class="virtual-scroll-load" :style="boxStyle">
        <div class="view-area-box" :style="scrollStyle">
            <div :style="areaStyle"></div>
            <div class="view-area" ref="viewArea">
                <slot :list="showList"/>
            </div>
        </div>
    </div>
</template>

<script>
import { isNode } from 'lib/util/dataType';
import env from 'lib/comp/env';
import pageScroll from 'common/util/page-scroll';
import getOffset from 'lib/dom/getOffset';
import debounce from 'lib/util/debounce';

export default {
    name: 'virtual-scroll',
    props: {
        lower: {// 距离底部多远开始加载
            type: Number,
            default: 50
        },
        // 如果node = self ，可监听本身滚动
        node: env.isClient() ? [Node, String] : [Object, String]
    },
    data() {
        return {
            // 滚动区域高度
            boxHeight: 1000,
            areaHeight: 0,
            realList: [],
            showList: [],
            orderList: [],
            scrollTop: 0,
            firstIndex: -1,
            pageNo: 1,
            pageSize: 10,
            lastScrollTop: 0,
            isScroll: true,
            orderNo: 0,
            areaStyle: {}
        };
    },
    computed: {
        boxStyle() {
            return {
                minHeight: `${this.boxHeight}px`
            };
        },
        scrollStyle() {
            return {
                transform: `translate3d(0, 0, 0)`
            };
        }
        // showListMap() {
        //     const list = [];
        //     // 先判断当前位置
        //     const len = this.realList.length;
        //     let top = 0;
        //     for (let i = 0; i < len; i++) {
        //         const prev = this.realList[i - 1];
        //         const current = this.realList[i];
        //         const next = this.realList[i + 1];
        //         if (next) {
        //             if (this.scrollTop >= current.top && this.scrollTop < next.top) {
        //                 if (prev) {
        //                     top = i - 1;
        //                     list.push(...prev.list);
        //                 } else {
        //                     top = i;
        //                 }
        //                 list.push(...current.list, ...next.list);
        //                 break;
        //             }
        //         } else {// 最后一条
        //             if (this.scrollTop >= current.top) {
        //                 if (prev) {
        //                     top = i - 1;
        //                     list.push(...prev.list);
        //                 } else {
        //                     top = i;
        //                 }
        //                 list.push(...current.list);
        //                 break;
        //             }
        //         }
        //     }
        //
        //     return { list, top };
        // },
        // areaStyle() {
        //     const len = this.firstIndex;
        //     let height = 0;
        //     if (len > 0) {
        //
        //         for (let i = 0; i < len; i++) {
        //             height += (this.realList[i]?.height || 0);
        //         }
        //     }
        //
        //     return { height: height + 'px' };
        // }
    },
    mounted() {
        this.initVirtualData();
        this.onBind();
    },
    unmounted() {
        this.onUnbind();
    },
    methods: {
        initVirtualData() {
            const list = [];
            for (let i = 0; i < 10; i++) {
                list.push({
                    value: this.orderNo++,
                    label: '当前值',
                    height: 200 + Math.round(Math.random() * 200)
                });
            }

            this.realList[0] = {
                top: 0,
                height: 0,
                children: [],
                list
            };

            this.scrollChangeData();

            this.$nextTick(() => {
                this.changePageHeight();
                this.boxHeight = this.realList[this.pageNo - 1].height;
            });

            this.scrollLower = debounce(this.onScrollLower, 20);
        },
        // 获取子节点
        getScrollNodes() {
            let result = [];
            const nodes = [...this.$refs.viewArea.childNodes].filter(item => item.nodeType === 1);
            if (nodes.length === 1) {
                const child = [...nodes[0].childNodes].filter(item => item.nodeType === 1);
                if (child.length === this.showList.length) {
                    result = child;
                }
            } else if (nodes.length === this.showList.length) {
                result = nodes;
            }
            return result;
        },
        // 更新区域高度
        changeAreaHeight(orderList) {
            if (orderList[0] === 0) {
                this.areaStyle = {};
                return false;
            }

            const nodes = this.getScrollNodes();
            if (orderList[0] > this.orderList[0]) {
                const node = nodes[nodes.length - this.pageSize];
                const offset = getOffset(node);
                console.log(node, offset);

                this.areaStyle = {
                    height: `${offset.top - (this.realList[orderList[0]]?.height || 0)}px`
                };
            }

        },
        // 滚动变更数据
        scrollChangeData() {
            const list = [], orderList = [];
            // 先判断当前位置
            const len = this.realList.length;
            let top = 0;


            for (let i = 0; i < len; i++) {
                const prev = this.realList[i - 1];
                const current = this.realList[i];
                const next = this.realList[i + 1];
                if (next) {
                    if (this.scrollTop >= current.top && this.scrollTop < next.top) {
                        if (prev) {
                            top = i - 1;
                            list.push(...prev.list);
                            orderList.push(i - 1);
                        } else {
                            top = i;
                        }

                        orderList.push(i, i + 1);
                        list.push(...current.list, ...next.list);

                        if (orderList.join('') === this.orderList.join('')) {
                            break;
                        }

                        this.changeAreaHeight(orderList);
                        this.showList = list;
                        this.orderList = orderList;
                        this.firstIndex = top;
                        break;
                    }
                } else {// 最后一条
                    if (this.scrollTop >= current.top) {
                        if (prev) {
                            top = i - 1;
                            orderList.push(i - 1);
                            list.push(...prev.list);
                        } else {
                            top = i;
                        }

                        orderList.push(i);
                        list.push(...current.list);

                        if (orderList.join('') === this.orderList.join('')) {
                            break;
                        }

                        this.changeAreaHeight(orderList);
                        this.showList = list;
                        this.orderList = orderList;
                        this.firstIndex = top;
                        break;
                    }
                }
            }
        },
        // 更新数据模块高度
        changeDataHeight(nodes) {
            const prev = this.realList[this.pageNo - 2];
            const current = this.realList[this.pageNo - 1];
            const next = this.realList[this.pageNo];
            const list = [];
            if (prev) {
                list.push(...prev.list);
            }
            if (current) {
                list.push(...current.list);
            }
            if (next) {
                list.push(...next.list);
            }
            (nodes || this.getScrollNodes()).forEach((node, i) => {
                if (list[i]) {
                    list[i].__height__ = node.offsetHeight;
                }
            });

            if (prev) {
                prev.__height__ = list[0];
            }
            if (current) {
                list.push(...current.list);
            }
            if (next) {
                list.push(...next.list);
            }
        },
        // 更新模块位置数据
        changeDataOffset(nodes) {
            (nodes || this.getScrollNodes()).forEach((node, i) => {
                const value = i % this.pageSize;
                const offset = getOffset(node);
                if (value === 0) {
                    console.log(offset, node);
                }
                if (this.pageNo === 1 && value === 0) {
                    this.realList[0].top = offset.top;
                } else if (value === 0) {
                    const index = Math.floor(i / this.pageSize);
                    if (this.realList[this.pageNo + (index - 2)]) {
                        this.realList[this.pageNo + (index - 2)].top = offset.top;
                    }
                }
            });

            console.log(this.realList);
        },
        // 更新每页总高度
        changePageHeight(nodes) {
            nodes = (nodes || this.getScrollNodes());
            let height = 0;
            const max = Math.ceil(nodes.length / this.pageSize);
            const obj = this.realList[this.pageNo - 1];
            nodes.forEach((node, i) => {
                const index = Math.floor(i / this.pageSize);
                switch (max) {
                    case 1:
                        const oh = node.offsetHeight;
                        obj.children[i] = oh;
                        height += oh;
                        break;
                    case 2:
                        if (index === 1) {
                            const oh = node.offsetHeight;
                            obj.children[i] = oh;
                            height += oh;
                        }
                        break;
                    case 3:
                        if (index === 2) {
                            const oh = node.offsetHeight;
                            obj.children[i] = oh;
                            height += oh;
                        }
                        break;
                }
            });

            obj.height = height;
        },
        // 获取node相关信息
        nodeRect() {
            const node = this.getCurrentNode(document.body);
            const clientHeight = !this.node ? window.innerHeight : node.clientHeight;
            const top = node.scrollHeight - clientHeight;
            return { height: clientHeight, top: top };
        },
        getCurrentNode(defaultNode) {
            if (isNode(this.node)) {
                return this.node;
            } else if (this.node === 'self') {// 本身
                return this.$el;
            }
            return defaultNode || document;
        },
        onBind() {
            const node = this.getCurrentNode();
            pageScroll.on(node, this.onScroll);
        },
        onUnbind() {
            const node = this.getCurrentNode();
            pageScroll.off(node, this.onScroll);
        },
        onScroll({ scrollTop }) {
            this.scrollTop = scrollTop;
            this.scrollChangeData();
            this.scrollLower(scrollTop);
        },
        onScrollLower(scrollTop) {
            const rect = this.nodeRect();
            console.log(rect, 'rect', scrollTop);
            if (this.isScroll && scrollTop > this.lastScrollTop && (rect.top - scrollTop) <= this.lower) {
                this.isScroll = false;
                this.pageNo += 1;
                const list = [];
                for (let i = 0; i < 10; i++) {
                    list.push({
                        value: this.orderNo++,
                        label: '当前值',
                        height: 200 + Math.round(Math.random() * 200)
                    });
                }

                const currentHeight = this.boxHeight;
                this.boxHeight += 5000;

                this.realList[this.pageNo - 1] = {
                    top: (this.pageNo - 1) * 5000,
                    height: 0,
                    children: [],
                    list
                };

                this.scrollChangeData();

                this.$nextTick(() => {
                    this.changePageHeight();
                    this.realList[this.pageNo - 1].top = currentHeight;
                    this.boxHeight = this.realList[this.pageNo - 1].height + currentHeight;
                    console.log(this.realList, this.pageNo);
                });

                setTimeout(() => {
                    this.isScroll = true;
                }, 50);
            }
            this.lastScrollTop = scrollTop;
        }
    }
};
</script>

<style lang="scss" scoped>
@import "common/style/static";

.virtual-scroll-load {
    position: relative;
    width: 100%;

    .view-area-box {
        width: 100%;
    }

    .view-area-box {
        position: absolute;
        top: 0;
        left: 0;
    }
}
</style>