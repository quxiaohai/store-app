import { isArray, isBoolean, isObject, isUndefined } from 'lib/util/dataType';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { EVENTS } from 'common/util/constant';
import { $http, $api, $event } from 'common/util/global-properties';
import { ref, onMounted, onUnmounted } from 'vue';
import { ssrCallback } from 'common/util';
import env from 'lib/comp/env';

/******
 * 获取所有组件内asyncData方法
 * @param comp
 * @param init
 * @returns {Array}
 */
function async(comp, init) {
    let arr = [];
    if (isArray(comp)) {
        comp.forEach(item => {
            const { asyncData, ready, asyncRely } = item;
            asyncData && arr.push({ asyncData, ready, asyncRely: !!init && asyncRely });
            if (item.components) {
                arr = arr.concat(async(item.components));
            }
        });
    } else if (isObject(comp)) {
        Object.keys(comp).forEach(key => {
            const { asyncData, ready } = comp[key];
            asyncData && arr.push({ asyncData, ready, asyncRely: false });
            if (comp[key].components) {
                arr = arr.concat(async(comp[key].components));
            }
        });
    }

    return arr;
}

/*********
 * 运行依赖,优先执行主依赖接口
 * @param ctx
 * @param list
 * @returns {Promise<unknown>|Promise<T | Array>}
 */
function runRely(ctx, list) {
    const child = [];
    const apps = list.filter(r => {
        if (!r.asyncRely) child.push(r);
        return r.asyncRely;
    }).map(res => {
        const { asyncData, ready } = res;
        return {
            asyncData,
            ready
        };
    });

    if (apps.length > 0) {
        const arr = [];
        return apps[0].asyncData(ctx)
            .then(res => {
                arr.push({
                    asyncData() {
                        return Promise.resolve(res.data);
                    },
                    ready: apps[0].ready
                });
                // 主接口需要返回一个数据，名称为rely
                child.forEach(obj => {
                    obj.data = res.rely;
                });
                return arr.concat(child);
            })
            .catch(res => {
                if (isObject(res) && res.url) {
                    return Promise.reject(res);
                }
                return [];
            });
    } else {
        return Promise.resolve(list);
    }
}

/*************
 * 获取所有asyncData
 * @param comp
 * @param ctx
 * @returns {Promise<unknown>|Promise<T|Array>|Promise<T | Array>}
 */
export function getAsyncData(comp, ctx) {
    // 如果服务端数据已经请求，客户端不在请求
    // if (!ctx.reset && env.isClient() && !storeReset(ctx)) {
    //     return Promise.resolve([]);
    // }
    return runRely(ctx, async(comp, true));
}

/************
 * 获取所有ready方法
 * @param comp
 */
export function getReady(comp) {
    return async(comp);
}

/***********
 * 将数组转成对象
 * @param list
 */
export function arrayToObject(list) {
    let map = {};
    list?.forEach(item => {
        map = Object.assign(map, item);
    });

    return map;
}

/***********
 * 格式替换数据
 * @param replaceFields
 * @private
 */
function _formatReplaceFields(replaceFields) {
    const result = [], fields = {};
    if (isArray(replaceFields)) {
        replaceFields.forEach(key => {
            result.push({ key, value: null });
            fields[key] = key;
        });
    } else if (isObject(replaceFields)) {
        Object.keys(replaceFields).forEach(key => {
            const obj = replaceFields[key];
            if (isObject(obj)) {
                result.push({
                    key,
                    value: isUndefined(obj.value) ? null : obj.value
                });

                fields[key] = obj?.replace || key;
            } else {
                result.push({
                    key,
                    value: obj
                });
                fields[key] = key;
            }
        });
    }

    return { result, fields };
}

/****************
 * 渲染SSR数据，只能在created|setup调用
 * @param replaceFields 需要替换的字段，如果需要替换的和返回的一致，可不用变
 * 可设置默认值：支持格式['narwal', 'list']|{narwal: 'default-value'}|{narwal: {value: 'default-value', replace: 'name'}, text: '123'}
 * @param onFetch 默认是函数，也可以是一个布尔值，如果为true则给replaceFields进行监听
 * @param extraData 额外的请求参数
 * replaceFields值可以是一个数组，如果是一个数组，则为只渲染数组内的字段
 * 如果为空，则全部渲染
 * 调用方式： created => renderSSRData.call(this)|setup => return renderSSRData 如果是created调用一定需要把this传进来
 */
export function renderSSRData(replaceFields, onFetch, extraData) {
    const store = this?.$store || useStore();
    const route = this?.$route || useRoute();
    const fullPath = route.query.cacheKey || route.fullPath;
    let ssrData = store.state.ssrData[fullPath];

    if (env.isServer()) {
        return ssrData;
    }

    const { result, fields } = _formatReplaceFields(replaceFields);
    const isSsrData = !!ssrData && Object.keys(ssrData).length > 0;

    // 是否需要重新请求
    let reset = !isSsrData;
    if (result.length > 0 && ssrData) {
        Object.keys(fields).forEach(key => {

            if (reset) {
                return false;
            }

            const cur = ssrData[fields[key]];

            if (isUndefined(cur)
                || cur === null
                || (isArray(cur) && cur.length === 0)
                || (isObject(cur) && Object.keys(cur).length === 0)) {// 当前数据异常，重新加载
                reset = true;
            }
        });
    }

    const ssr = {};

    // (reset || !store.state.isServerRender) &&
    if (onFetch) {
        result.forEach(item => {
            const value = ssrData?.[fields[item.key]];
            // 判断是否有缓存数据
            if (!isUndefined(value)) {
                store.state.isClientCache = true;
            }
            ssr[item.key] = ref(isUndefined(value) ? item.value : value);
        });

        if (!isSsrData && isBoolean(onFetch)) {
            return ssr;
        }

        if (onFetch?.name) {
            const requestFetch = () => {
                onFetch({
                    $http,
                    $api,
                    $route: route,
                    $store: store,
                    extraData
                }).then(res => {
                    store.state.ssrData[fullPath] = Object.assign(ssrData || {}, res);
                    result.forEach(item => {
                        if (!isUndefined(res?.[fields[item.key]])) {
                            ssr[item.key].value = res[fields[item.key]];
                        }
                    });
                    ssrCallback(ssr, fullPath);
                });
            };

            // 添加事件
            onMounted(() => {
                $event.on(EVENTS.REFRESH_RENDER_DATA, requestFetch);
                $event.on(onFetch.name, requestFetch);
            });
            // 解除事件
            onUnmounted(() => {
                $event.off(EVENTS.REFRESH_RENDER_DATA, requestFetch);
                $event.off(onFetch.name, requestFetch);
            });

            requestFetch();
            return ssr;
        }
    }

    if (result.length > 0 && isSsrData) {
        result.forEach(item => {
            const value = ssrData[fields[item.key]];
            ssr[item.key] = ref(isUndefined(value) ? item.value : value);
            if (this?.$store) {
                this[item.key] = ssr[item.key];
            }
        });
        ssrCallback(ssr, fullPath);
        return ssr;
    }
    ssrCallback(ssrData, fullPath);
    return ssrData || {};
}


/******************
 * 获取主模块scrolled函数
 * @param route
 */
export function componentScroll(route) {
    const { scrolled } = route?.matched?.[0]?.components?.default || {};
    if (scrolled) {
        return { fn: scrolled, trigger: true, vm: route.matched[0].instances.default };
    }
    return [];
}