import { isObject } from 'lib/util/dataType';
import storage from 'lib/util/storage';
import { DEVICE_TYPE, USER, TOKEN, UTM } from 'common/util/constant';
import { filterCouponList, filterShoppingList, filterReport } from 'common/util/filters';
import { createCss, createScript, getJSON } from 'common/util';

export default {
    /// 更新用户信息
    UPDATE_USERINFO(state, data) {
        if (!isObject(data)) return;
        const token = data.token;
        if (token) {
            state.token = token;
            storage.cookie.set(TOKEN, token, { secure: true });
        }

        const userInfo = state.userInfo || {};
        delete data.token;
        state.userInfo = { ...userInfo, ...data };
        storage.set(USER, { ...state.userInfo });
    },
    /// 初始化用户信息
    INIT_USER(state) {
        const userInfo = storage.get(USER);
        const token = storage.cookie.get(TOKEN);
        if (isObject(userInfo) && token) {
            state.userInfo = userInfo;
        } else {
            state.userInfo = null;
        }
    },
    /// 清除用户信息
    DELETE_USERINFO(state) {
        state.token = null;
        storage.cookie.clear(TOKEN);
        state.userInfo = null;
        storage.clear(USER);
    },
    /// 更新TOKEN
    UPDATE_TOKEN(state, token) {
        state.token = token;
        storage.cookie.set(TOKEN, token, { secure: true });
    },
    /// 用户信息临时赋值
    UPDATE_TEMP_USER(state) {
        if (!state.userInfo) {
            state.userInfo = {
                nickname: '一个云鲸用户'
            };
        }
    },
    /// 更新UTM
    UPDATE_UTM(state, utm) {
        state.utm = utm;
        storage.cookie.set(UTM, utm);
    },
    /// 更新设备
    UPDATE_DEVICE(state, type) {
        state.deviceType = type;
        storage.cookie.set(DEVICE_TYPE, type);
    },
    /// 初始化站点选项
    UPDATE_SITE_INFO(state, data) {
        state.siteInfo = getJSON(data, null);
        if (process.env.NODE_ENV !== 'development') {
            const extend = getJSON(state.siteInfo?.extend, null);
            const app = extend.filename?.js?.find(url => url.startsWith('app.'));
            const nApp = window.__GLOBAL_ASSETS__?.js?.find(url => url.startsWith('app.'));
            if (app && app !== nApp) {
                window.__GLOBAL_ASSETS__ = extend.filename;
                const { css, js } = extend.filename;
                css?.forEach(url => {
                    createCss(`${process.env.CDN_URL}${url}`);
                });
                js?.forEach(url => {
                    createScript(`${process.env.CDN_URL}${url}`);
                });
            }
        }
    },
    /*******
     * 缓存数据
     * @param state
     * @param path
     * @param data
     * @constructor
     */
    CACHE_DATA(state, { path, data }) {
        const ssrData = state.ssrData[path];
        state.ssrData[path] = Object.assign(ssrData || {}, data);
    },
    /*********
     * 添加购物车数据
     * @param state
     * @param data
     * @param reset
     */
    PUSH_SHOP_CART(state, { data, reset }) {
        // 是否重置数据
        if (reset) {
            state.shoppingCart.couponList = filterCouponList(data?.couponList || []);
            state.shoppingCart.discountList = data?.discountList || [];
            state.shoppingCart.shopList = filterShoppingList(data?.pageResult?.list, state.shoppingCart.discountList);
        } else {
            state.shoppingCart.couponList.push(...filterCouponList(data?.couponList || []));
            state.shoppingCart.discountList.push(...(data?.discountList || []));
            state.shoppingCart.couponList = filterReport(state.shoppingCart.couponList, 'serialNumber');
            state.shoppingCart.discountList = filterReport(state.shoppingCart.discountList, 'skuId');
            state.shoppingCart.shopList.push(...filterShoppingList(data?.pageResult?.list, state.shoppingCart.discountList));
        }

        state.shoppingCart.count = data?.count;
        state.shoppingCart.isChangeCart = false;
    },
    /*****************
     * 更新购物车数据
     * @param state
     * @param data
     * @constructor
     */
    CHANGE_SHOP_CART(state, data) {
        let list = state.shoppingCart.shopList;
        const obj = list.find((r) => r.skuId === data.result.skuId);
        const productDiscount = data.result.discount;
        if (productDiscount) {
            // 已存在该限时折扣（id,skuId相同）
            let discount = state.shoppingCart.discountList?.find(
                (item) => item.id === productDiscount.id && item.skuId === productDiscount.skuId
            );
            if (discount) {
                discount = productDiscount;
            } else {
                state.shoppingCart.discountList?.push(productDiscount);
            }
        }
        // 如何调整的规则已存在，则直接添加数量
        if (obj) {
            Object.assign(obj, data.result);
            list = list.filter((r) => r.skuId !== data.skuId);
        } else {
            list.forEach((item) => {
                if (item.skuId === data.skuId) {
                    Object.assign(item, { currentPrice: null, discountPrice: null, underlinePrice: null }, data.result);
                }
            });
        }

        state.shoppingCart.shopList = filterShoppingList(list, state.shoppingCart.discountList || []);
    },
    /*************
     * 购物车数据全选
     * @param state
     * @param bool
     * @constructor
     */
    SHOP_CART_CHECK_ALL(state, bool) {
        const isEdit = state.shoppingCart.isEdit;
        state.shoppingCart.shopList.forEach(item => {
            if (item.salesStatus === 1 || isEdit) {
                item.checked = bool;
            }
        });
    },
    /*************
     * 购物车数据选择
     * @param state
     * @constructor
     */
    SHOP_CART_CHECK(state) {
        const list = state.shoppingCart.checkSkuList;
        if (list.length > 0) {
            const map = {};
            list.forEach(item => {
                map[item] = true;
            });
            state.shoppingCart.shopList.forEach(item => {
                if (item.salesStatus === 1) {
                    item.checked = map[item.skuId] || item.checked;
                } else {
                    item.checked = false;
                }
            });
            state.shoppingCart.checkSkuList = [];
        }
    },
    /**********
     * 购物车商品数量
     * @param state
     * @param num
     */
    SHOP_CART_COUNT(state, num) {
        state.shoppingCart.count = num;
    },
    /*********
     * 删除购物车
     * @param state
     * @param list
     * @constructor
     */
    DEL_SHOP_CART(state, list) {
        const map = {};
        list.forEach(item => {
            map[item] = true;
        });

        state.shoppingCart.shopList = state.shoppingCart.shopList.filter(r => !map[r.id]);
    },
    /*********
     * 设置刷新购物车
     */
    REFRESH_SHOP_CART(state, bool) {
        state.shoppingCart.isChangeCart = bool;
    },
    /// 显示隐藏导航栏
    TOGGLE_TAB_BAR(state, bool) {
        state.tabBarShow = bool;
    },
    /**
     * 协议地址
     * @param {*} state
     * @param {*} data
     */
    SET_POLICY_LIST(state, data) {
        state.policyList = data;
    }
};