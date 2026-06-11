import { $http, $api, $layer } from 'common/util/global-properties';
import { HTTP_NOT_REPORT_MAP, POLICY_MAP } from 'common/util/constant';
import routerMap from 'common/util/router-map';
import { transformTokenUrl } from 'common/util';

export default {
    /***********
     * UTM数据点击上报
     * @param store
     * @returns {Promise<*|boolean|void>}
     * @constructor
     */
    async UTM_HIT_REPORT(store) {
        const [res, err] = await $http.awaitTo(
            $http.post(
                $api.utmReportHits,
                {
                    deviceType: String(store.state.deviceType),
                    utmId: String(store.state.utm || ''),
                    wechatOpenId: ''
                },
                {
                    alert: false
                }
            )
        );

        return !err;
    },
    /**
     * @description: 初始化站点信息
     */
    INIT_SITE_INFO({ commit }) {
        return $http.get($api.getRealSiteConf, { alert: false }).then((res) => {
            commit('UPDATE_SITE_INFO', res.data);
        });
    },
    /***************
     * 获取个人信息列表
     * @param store
     * @returns {Promise<void>}
     * @constructor
     */
    async USER_INFO_LIST(store) {
        // 未登录
        if (!store.state.token) {
            return false;
        }

        const [res, err] = await $http.awaitTo(
            $http.get($api.userInfoNoJump, {
                alert: false
            })
        );

        if (err) {
            return false;
        }

        store.commit('UPDATE_USERINFO', res.data);

        return true;
    },
    /***********
     * 更新用户信息
     * @param store
     * @param data
     * @param msg
     * @returns {Promise<*|boolean>}
     * @constructor
     */
    async UPDATE_USER_INFO(store, { data, msg }) {
        const [res, err] = await $http.awaitTo($http.post($api.updateUserInfo, data));

        if (err) {
            return false;
        }

        store.commit('UPDATE_USERINFO', res.data);

        if (msg) {
            $layer.success(msg);
        }

        return res.data;
    },
    /*************
     * 加入购物车
     * @param store
     * @param option
     * {
     *     num: 数量
     *     productSerialNumber: 商品序号
     *     skuId: 规格ID
     *     type: 1-增加该数量,2-置为该数量
     * }
     * @returns {Promise<boolean>}
     * @constructor
     */
    async PUSH_SHOP_CART(store, option) {
        const loading = option.loading;
        const wait = option.wait;

        delete option.loading;
        delete option.wait;

        const [res, err] = await $http.awaitTo(
            $http.lock.post($api.pushShopCart, option, {
                loading,
                wait,
                alert: false
            })
        );

        if (err) {
            $layer.alert(err.msg, ' ', '我知道了');
            return false;
        }

        if (option.type === 1) {
            store.commit('REFRESH_SHOP_CART', true);
            $layer.success('已加入购物车');
        }

        return res.data;
    },
    /***************
     * 数据异常上报
     * @param store
     * @param option = {
     *      errorInfo: 错误信息 ,
     *      errorType (integer, optional): 错误类型 1请求超时 2地址错误 3其他 ,
     *      pageUrl (string, optional): 错误页面url ,
     *      source (integer, optional): 错误平台来源 1.小程序 2.APP 3.H5, 4.PC ,
     *      url (string, optional): 错误资源地址
     *      apiUrl (string, optional): 错误资源地址-对应/api/index.js内的url内容
     *      code (string, optional): 错误回包code
     *      clickPosition (string, optional): 点击位置
     *      prePage (string, optional): 上一个页面
     *      userId (integer, optional): 用户ID
     * }
     ****/
    async CATCH_REPORT(store, option) {
        const { apiUrl, code, pageUrl } = option || {};
        // 判断是否不用上报
        if (HTTP_NOT_REPORT_MAP[apiUrl] && HTTP_NOT_REPORT_MAP[apiUrl]?.some((item) => item === code)) {
            return;
        }

        // 上传时去掉多余字段
        delete option.apiUrl;
        delete option.code;

        const sourceMap = { 2: '3', 3: '2', 4: '1' };
        let prePage = '';
        const len = routerMap.routers.length;
        if (len > 1) {
            prePage = routerMap.routers[len - 2]?.fullPath;
        } else {
            prePage = store.state.deviceType === 3 ? 'APP首页|资源位|PUSH' : store.state.deviceType === 4 ? '小程序资源位' : '浏览器刚打开';
        }

        $http.post($api.resourceError, Object.assign(option, {
            source: sourceMap[store.state.deviceType],
            clickPosition: window.__event_position__,
            userId: store.state.userInfo?.user_mark || '未登录',
            prePage: transformTokenUrl(prePage),
            pageUrl: transformTokenUrl(pageUrl)
        }), {
            alert: false
        });
    },
    /***************
     * 获取购物车数据列表
     * @param store
     * @param params
     * {
     *     pageNo: 1,
     *     pageSize: 10
     * }
     * @returns {Promise<void>}
     * @constructor
     */
    async SHOP_CART_LIST(store, params) {
        // 未登录
        if (!store.state.token) {
            return false;
        }

        const [res, err] = await $http.awaitTo(
            $http.get($api.shopCartList, {
                params
            })
        );

        if (err) {
            return false;
        }

        const isReset = params.pageNo === 1;

        store.commit('PUSH_SHOP_CART', {
            reset: isReset,
            data: res.data
        });

        return true;
    },
    /***********
     * 删除购物车数据
     * @param store
     * @param list id列表
     * @returns {Promise<boolean>}
     * @constructor
     */
    async DEL_SHOP_CART(store, list) {
        const [res, err] = await $http.awaitTo(
            $http.lock.post(
                $api.delShopCart,
                {
                    ids: list
                },
                {
                    wait: '删除中...'
                }
            )
        );

        if (err) {
            return false;
        }

        $layer.success('删除成功');
        store.commit('DEL_SHOP_CART', list);

        return true;
    },
    /*****************
     * @desc 获取aiot协议数据
     * @param store
     * @param data
     * @returns {Promise<void>}
     */
    async GET_POLICY_DATA(store, data) {
        const [res, err] = await $http.awaitTo(
            $http.post(
                $api.getPolicyList,
                {
                    country: 'cn',
                    language: 'zh-CN',
                    policy_type: [POLICY_MAP.service, POLICY_MAP.privacy]
                },
                { alert: false }
            )
        );
        if (err) {
            return false;
        }

        store.commit('SET_POLICY_LIST', res.data || []);
        return true;
    }
};
