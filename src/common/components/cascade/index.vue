<template>
    <popup class="nl-cascade" v-model="visible" :option="option">
        <div class="select-content">
            <div class="handler-close" @click="close">
                <span class="place-color fz-28">取消</span>
            </div>
            <div class="handler-confirm" :class="isConfirm ? 'warning-color' : 'place-color'" @click="confirm">
                <span class="fz-28">确认</span>
            </div>
            <div class="header">
                <div class="title">
                    <span class="fz-36 fw-500">{{ title }}</span>
                </div>
                <div class="selected">
                    <span v-for="(item, index) in selectValue" :key="item[valueKey]" @click="setCurrent(index)">
                        <span v-if="index">&nbsp;/&nbsp;</span>
                        <span class="selected-text">{{ item[labelKey] }}</span>
                    </span>
                </div>
            </div>
            <scroll-view :scroll-y="true" class="selects">
                <template v-if="currentList.length">
                    <div
                        class="select-item"
                        v-for="item in currentList"
                        :key="item[valueKey]"
                        :class="{ active: currentSelect === item[valueKey] }"
                        @click="selectItem(item)"
                    >
                        <span>{{ item[labelKey] }}</span>
                    </div>
                </template>
                <template v-else>
                    <div class="place-color p-32 ta-c">
                        <span class="fz-24">Loading...</span>
                    </div>
                </template>
            </scroll-view>
        </div>
    </popup>
</template>
<script>
import scrollView from 'common/components/scroll-view';

export default {
    name: 'nCascade',
    props: {
        /// 标题
        title: {
            type: String,
            default: ''
        },
        /// 请求路径
        url: {
            type: Object
        },
        /// 初始请求参数
        initParam: {
            type: [Object, Number, Array, String]
        },
        /// 参数名称
        paramKey: {
            type: String,
            default: 'pid'
        },
        /// 值key
        valueKey: {
            type: String,
            default: 'id'
        },
        /// 显示key
        labelKey: {
            type: String,
            default: 'name'
        },
        /// 层数，最多5层
        level: {
            type: Number,
            default: 2
        },
        /// 处理请求的数据
        handler: { type: Function }
    },
    data() {
        return {
            visible: false,
            current: 1, // 当前层级
            cacheList: {},
            selectValue: [],
            option: {
                autoHide: true,
                animate: {
                    name: 'bottom'
                },
                left: 0,
                bottom: 0
            }
        };
    },
    components: {
        scrollView
    },
    computed: {
        currentList() {
            const key = this.current - 1;
            if (key <= 0) {
                return this.cacheList[this.initParam] || [];
            } else {
                const value = this.selectValue[key - 1]?.[this.valueKey];
                return this.cacheList[value] || [];
            }
        },
        currentSelect() {
            const key = this.current - 1;
            return this.selectValue[key]?.[this.valueKey];
        },
        isConfirm() {
            return this.selectValue.length === this.level;
        }
    },
    created() {
        this.initData(this.initParam);
    },
    methods: {
        /// 初始化数据
        initData(value) {
            if (this.cacheList[value] || !this.url) return;
            this.$http.get(this.url, { params: { [this.paramKey]: value } }).then((res) => {
                if (typeof this.handler === 'function') {
                    this.handler(this, res.data);
                } else {
                    this.cacheList[value] = res.data || [];
                }
            });
        },
        /// 选中某条
        selectItem(item) {
            const key = this.current - 1;
            this.selectValue[key] = item;
            if (this.current < this.level) {
                const value = item[this.valueKey];
                this.current = this.current + 1;
                this.initData(value);
            }
        },
        /// 设置当前值
        setCurrent(index) {
            if (index === this.current - 1) return;
            this.current = index + 1;
            this.selectValue.splice(index + 1);
        },
        /// 确认
        confirm() {
            if (!this.isConfirm) return;
            this.close();
            this.$emit('select', [...this.selectValue]);
        },
        /// 显示
        show(value) {
            this.current = value?.length ? value?.length : 1;
            this.selectValue = value?.length ? value : [];
            this.visible = true;
            if (value?.length) {
                value.forEach((item, index) => {
                    if (index) this.initData(item.pid);
                });
            }
        },
        /// 关闭
        close() {
            this.visible = false;
        }
    }
};
</script>
<style lang="scss" scoped>
@import 'common/style/static';

.nl-cascade {
    .select-content {
        display: flex;
        flex-direction: column;
        width: 100vw;
        border-radius: 30px 30px 0 0;
        background-color: $white;

        .handler-close {
            position: absolute;
            top: 0;
            left: 0;
            padding: 40px 36px 10px;
        }

        .handler-confirm {
            position: absolute;
            top: 0;
            right: 0;
            padding: 40px 36px 10px;
        }

        .title {
            padding: 36px;
            text-align: center;
        }

        .selected {
            font-size: $fs28;
            padding: 0 36px 36px;
            border-bottom: 1px solid $white-light;

            .selected-text {
                color: $orange;
            }
        }

        .selects {
            height: 70vh;
            padding-bottom: env(safe-area-inset-bottom);

            .select-item {
                padding: 22px 36px;
                font-size: $fs28;

                &.active {
                    color: $orange;
                }
            }
        }
    }
}
</style>
