<template>
    <div class="m-form-model">
        <slot />
    </div>
</template>

<script>
import Schema from 'async-validator';
import getLevelData from 'lib/json/getLevelData';
import { getCurrentInstance } from 'vue';
import { isObject, isArray } from 'lib/util/dataType';
import clone from 'lib/json/clone';

export default {
    name: 'form-model',
    props: {
        model: {
            type: Object,
            required: true
        },
        rules: {
            type: Object,
            required: true
        },
        // 错误信息提示类型
        hintType: {
            type: String,
            default: 'toast' // text
        },
        // 是否实实监听
        real: {
            type: Boolean,
            default: false
        }
    },
    provide() {
        return {
            formModel: this,
            model: this.model,
            rules: this.rules
        };
    },
    mounted() {
        this.currentInstance = getCurrentInstance();
    },
    updated() {
        this.currentInstance = getCurrentInstance();
    },
    methods: {
        // 往子模块派发事件
        fireChildChange(nodes, errors) {
            let isOver = false;
            let isScrollToTop = false;
            nodes.forEach((vNode) => {
                // 判断是否组合子模块
                if (!isOver && isObject(vNode.type) && vNode.type?.name === 'form-model-item') {
                    isOver = vNode.component?.proxy.onParentChange(errors);
                }
                // 定位到第一个未校验通过的位置
                if (!isScrollToTop) {
                    if (vNode?.props?.prop === errors[0]?.field) {
                        window.scrollTo(0, vNode?.el?.offsetTop);
                        isScrollToTop = true;
                    }
                }
            });
        },
        // 获取所有子组件的prop
        getChildProp(nodes) {
            const props = [];
            nodes.forEach((vNode) => {
                // 判断是否组合子模块
                if (isObject(vNode.type) && vNode.type?.name === 'form-model-item') {
                    const prop = vNode.props.prop;
                    if (prop) {
                        props.push(prop);
                    }
                }
            });

            return props;
        },
        // 格式数据，返回一级数据

        // 数据验证
        validate(callback, isNeedLevelData = true) {
            const valid = {};
            const rules = getLevelData(this.rules);
            const slotList = this.findSlotList(this.currentInstance?.subTree?.dynamicChildren[0]?.children, []);
            this.getChildProp(slotList).forEach((key) => {
                if (rules[key]) {
                    valid[key] = rules[key];
                }
            });

            const model = isNeedLevelData ? getLevelData(this.model) : this.model;
            const validator = new Schema(valid);

            return new Promise((resolve) => {
                validator.validate(model, (errors) => {
                    if (errors) {
                        callback && callback(false);
                        resolve(false);
                        return this.fireChildChange(slotList, errors);
                    }

                    const result = clone(this.model);
                    resolve(result);
                    callback && callback(result);
                });
            });
        },
        // 返回slotList
        findSlotList(children = [], result) {
            if (!children || !isArray(children)) {
                return result || [];
            }
            children.forEach((item) => {
                if (isObject(item.type) && item.type?.name === 'form-model-item') {
                    result.push(item);
                } else {
                    this.findSlotList(item.children, result);
                }
            });
            return result;
        }
    }
};
</script>
