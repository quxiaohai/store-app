import { createStore } from 'vuex';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import env from 'lib/comp/env';

// 服务端vuex
let _serverStore = null;

export function _createStore() {
    _serverStore = createStore({
        state: {
            token: null,
            userInfo: null,
            siteInfo: null,
            // 数据链路追踪
            utm: null,
            // 设备类型 2-H5 , 3-App, 4-小程序
            deviceType: 2,
            // 是否是服务端渲染
            isServerRender: false,
            // 客户端是否有缓存数据
            isClientCache: false,
            ssrData: {},
            // 是否显示底部tab-bar
            tabBarShow: true,
            // 购物车
            shoppingCart: {
                shopList: [],
                couponList: [],
                discountList: [],
                count: 0,
                isEdit: false,
                // 要选中的sku
                checkSkuList: [],
                // 是否更新购物车
                isChangeCart: false
            },
            policyList: []
        },
        mutations,
        actions,
        getters
    });

    return _serverStore;
}

export const clientStore = _createStore();
export const useStore = () => {
    return env.isServer() ? _serverStore : clientStore;
};