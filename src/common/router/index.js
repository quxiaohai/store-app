/**
 *  路由配置
 * **/
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router';
import routes from './modules';
import env from 'lib/comp/env';
import { $broadcast, $layer, $bar, $event } from 'common/util/global-properties';
import { clientStore } from 'common/store';
import { isLogin, isWeAppUrl, realUrl, toLogin, createCss, createScript } from 'common/util';
import routerMap from 'common/util/router-map';
import bridge from 'common/util/bridge';
import { componentScroll } from 'views/app/async-data';
import pageScroll from 'common/util/page-scroll';
import { EVENTS, LOADING_CHUNK } from 'common/util/constant';
import { FILES_PACKAGE } from 'common/api/fetch';
import routerPosition from 'common/util/router-position';
import storage from 'lib/util/storage';
import { isUndefined } from 'lib/util/dataType';
import queryUtil from 'lib/json/query';

let _serverRouter = null;
// 底部4个按钮
routerPosition.add(['/index', '/product', '/shopping-cart', '/member']);

export function _createRouter() {
    const router = createRouter({
        history: env.isServer() ? createMemoryHistory() : createWebHistory(),
        routes,
        scrollBehavior(to, from, savedPosition) {
            // 如果是前进，直接滚动到顶
            if (routerMap.isNext()) {
                return routerPosition.position(to, from, { top: 0 });
            }
            return routerPosition.position(to, from, savedPosition);
        }
    });

    // 路由类型
    let routeType = 'push';

    const _push = router.push;
    router.push = function push(location) {
        routeType = 'push';
        if (arguments.length > 1) {
            return _push.apply(this, arguments);
        }
        return _push.call(this, location);
    };

    const _replace = router.replace;
    router.replace = function replace(location) {
        routeType = 'replace';
        if (arguments.length > 1) {
            return _replace.apply(this, arguments);
        }
        return _replace.call(this, location);
    };

    // 记录缓存key
    let _cacheKey = {};
    const getCacheKey = (path, create) => {
        if (create || !_cacheKey[path]) {
            _cacheKey[path] = Date.now();
        }

        return _cacheKey[path];
    };

    /********************** loading chunk 出错处理 **********************/
        // 最多刷新三次
    let reloadTimer = null;
    router.onError(async error => {
        const pattern = /Loading chunk (.)+ failed/g;
        const isChunkLoadFailed = error.message.match(pattern);
        if (isChunkLoadFailed && reloadTimer === null) {
            // $layer.toast('Resource loading...');
            const obj = storage.session.get(LOADING_CHUNK) || { now: Date.now(), num: 1 };
            // 在60秒内，并且数量小于3
            if (Date.now() - obj.now < 60000 && obj.num <= 3) {
                reloadTimer = setTimeout(() => {
                    obj.now = Date.now();
                    obj.num += 1;
                    storage.session.set(LOADING_CHUNK, obj);
                    window.location.reload();
                }, 1000);
            } else if (obj.num === 4) {// 超过3次，直接从服务器拉取最新配置文件
                const data = await FILES_PACKAGE();
                if (data) {
                    const { css, js } = data.filename;
                    css?.forEach(url => {
                        createCss(`/${url}`);
                    });
                    js?.forEach(url => {
                        createScript(`/${url}`);
                    });
                }

                obj.num += 1;
                storage.session.set(LOADING_CHUNK, obj);
            }
        }
    });


    router.isReady()
        .then(() => {
            $event.on(EVENTS.CLEAR_CACHE, () => {
                _cacheKey = {};
            });
        });

    // 设置title, 路由跳转之前
    // router.beforeEach(async (to, from, next) => {
    //
    //     console.log('---to---', to.path);
    //
    //     const illegalPath = to.path?.includes('undefined') || to.href?.includes('undefined');
    //     if (illegalPath) {
    //         clientStore.dispatch('CATCH_REPORT', {
    //             errorInfo: '页面路由异常，包含undefined',
    //             errorType: 3,
    //             pageUrl: getCurrentRoute().url,
    //             url: '',
    //             code: '路由异常告警',
    //             apiUrl: ''
    //         });
    //         // 路由非法时跳转到异常页面
    //         return next({ path: '/error-page' });
    //     }
    //
    //     // 存储滚动位置
    //     routerPosition.savedPosition(to, from);
    //
    //     // 判断是不是小程序路径，如果是，转成H5路径
    //     if (isWeAppUrl(to.path)) {
    //         return next(realUrl(to.fullPath));
    //     }
    //
    //     $event.emit('beforeEach', { to, from });
    //     routerMap.push(to, from, routeType);
    //
    //     // 重置路由类型
    //     routeType = 'push';
    //
    //     if (to.meta.cache && (routerMap.isNext() || routerMap.isInit())) {
    //         to.meta.key = getCacheKey(to.path, true);
    //     } else if (to.meta.cache && routerMap.isPrev()) {
    //         to.meta.key = getCacheKey(to.path, false);
    //     }
    //
    //     // 跳其它页面
    //     if (to.path !== from.path && from.path !== '/') {
    //         // 跳转之前，关闭全部layer
    //         $layer.closeAllDialog();
    //     }
    //
    //     if (env.isClient()) {
    //         // 解除当前页面scrolled事件
    //         pageScroll.off(componentScroll(from));
    //         if (from?.name !== undefined) {
    //             clientStore.state.isServerRender = false;
    //             clientStore.state.isClientCache = false;
    //
    //             // 判断是否有utm
    //             if (to.query?._utm) {
    //                 clientStore.commit('UPDATE_UTM', to.query?._utm);
    //                 clientStore.dispatch('UTM_HIT_REPORT');
    //             }
    //         }
    //
    //         if (!isUndefined(to?.query?.token)) {
    //             if (to?.query?.token) {
    //                 clientStore.commit('UPDATE_TOKEN', to?.query?.token);
    //             } else {
    //                 clientStore.commit('DELETE_USERINFO');
    //             }
    //         }
    //
    //         $broadcast.init(to, from);
    //
    //         // 判断去的页面是否需要登录
    //         if (to.meta.login && !isLogin()) {
    //
    //             if (from.path.includes('/login')) {
    //                 return next(false);
    //             }
    //
    //             // 判断是否APP
    //             let isLogin = false;
    //             if (bridge.isApp()) {
    //                 // 获取APP token
    //                 const data = await bridge.getUserInfo();
    //                 if (data) {
    //                     clientStore.commit('UPDATE_USERINFO', data);
    //                     isLogin = true;
    //                 }
    //             }
    //
    //             if (!isLogin) {
    //                 if (bridge.isApp() || bridge.isWeApp()) {
    //                     const toPath = queryUtil.url(to.fullPath, { from_name: from?.name || '' }) || to.fullPath;
    //                     toLogin(false, toPath);
    //                     return next(false);
    //                 }
    //                 return next({ path: '/login', query: { url: to.fullPath } });
    //             }
    //         }
    //     }
    //
    //     $bar.start();
    //
    //     next(true);
    // });

    router.afterEach(to => {

        $event.emit('afterEach', { to });

        if (env.isClient()) {
            // 绑定页面scrolled事件
            setTimeout(() => {
                pageScroll.on(componentScroll(to));
            }, 20);
            if (to.query?.title || to.name) {
                // 设置title
                document.title = (to.query?.title || to.name).replace(/\{\s*([\w\W]*)\}/g, function() {
                    const name = RegExp.$1.trim();
                    return to.query?.[name] || '';
                });
            }
        }
        $bar.finish();
    });

    _serverRouter = router;

    return router;
}

export const clientRouter = _createRouter();
export const useRouter = () => {
    return env.isServer() ? _serverRouter : clientRouter;
};

/// 获取当前页面的路由实例
export const getCurrentRoute = () => {
    const route = useRouter().currentRoute.value;
    return {
        url: env.isServer() ? route.fullPath : location.href,
        ...route
    };
};