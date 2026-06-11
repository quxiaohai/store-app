/// 页面地址
export const mallHomePage = '/index';
export const mallCarPage = '/shopping-cart';
export const mallProductPage = '/product';
export const mallCenterPage = '/member';
export const mallOrderPage = '/member/order';
export const mallCouponPage = '/member/coupon';
export const mallPayPage = '/order/pay';

export const imageIconMaps = {
    home: 'https://narwal-mall-prod-public.obs.cn-south-1.myhuaweicloud.com:443/2acf3efb6591ddc90880cbdbefc31e0238.png?size=48-48',
    product:
        'https://mallcdn.narwaltech.com/2c08620bfbe21788476e8672f976fd3097.png?size=48-48',
    noticy: 'https://narwal-mall-prod-public.obs.cn-south-1.myhuaweicloud.com:443/5c48758f9bd9724fe63009d1949d9f0436.png?size=48-48',
    order: 'https://narwal-mall-prod-public.obs.cn-south-1.myhuaweicloud.com:443/adfbf6a404b5d1d6d3c8061a28cf8c1e39.png?size=48-48',
    coupon: 'https://narwal-mall-prod-public.obs.cn-south-1.myhuaweicloud.com:443/268ac52589102b90f668eca28edb851032.png?size=48-48',
    center: 'https://narwal-mall-prod-public.obs.cn-south-1.myhuaweicloud.com:443/d4fea1594aad6c185248bfcdf76419f037.png?size=48-48',
    car: 'https://narwal-mall-prod-public.obs.cn-south-1.myhuaweicloud.com:443/dd04a90446fd548d66a2861769f3523a39.png?size=48-48',
    func: 'https://narwal-mall-prod-public.obs.cn-south-1.myhuaweicloud.com:443/f55a6c0ed9e360c0caf85516d93ca3c238.png?size=48-48'
};

/// 备注：type : http://file.narwal.com/pages/viewpage.action?pageId=233576290
const jumpType = {
    none: '1',
    openApp: '2',
    jumpAppPage: '3',
    jumpH5Page: '4',
    jumpApplet: '5'
};

const appNavsBack = {
    desc: '返回',
    iconUrl: 'images/png/mall/back.png',
    package: 'nr_pita_base',
    path: '',
    func: 'app_back',
    type: jumpType.none,
    index: 0,
    position: 'left',
    items: []
};

const appNavsCar = {
    desc: '购物车',
    iconUrl: imageIconMaps.car,
    package: 'nr_pita_base',
    path: getFullPath(mallCarPage),
    func: 'app_shopping_car',
    type: jumpType.jumpH5Page,
    index: 2,
    position: 'right',
    items: []
};

const appNavsSearch = {
    desc: '商品分类',
    iconUrl: imageIconMaps.product,
    package: 'nr_pita_base',
    path: getFullPath(mallProductPage),
    func: 'app_product',
    type: jumpType.jumpH5Page,
    index: 1,
    position: 'right',
    items: []
};

const appNavsLogo = {
    desc: '品牌',
    iconUrl: 'images/png/mall/icon_slogan.png',
    package: 'nr_pita_base',
    path: '',
    func: 'app_slogan',
    type: jumpType.none,
    index: 0,
    position: 'left',
    items: []
};

const appNavsCloseLogo = {
    desc: '关闭页面',
    iconUrl: 'images/png/close_webview.png',
    package: 'nr_pita_base',
    path: '',
    func: 'app_close_page',
    type: jumpType.none,
    index: 3,
    position: 'right',
    items: []
};

const appNavsHome = {
    desc: '首页',
    iconUrl: 'images/png/icon_home.png',
    package: 'nr_pita_base',
    path: getFullPath(mallHomePage),
    func: 'app_mall_home',
    type: jumpType.jumpH5Page,
    index: 1,
    position: 'right',
    items: []
};

function appNavsFunc(type) {
    const homeItem =
        type !== mallHomePage
            ? [
                {
                    title: '商城首页',
                    i18nLocalizedKey: '',
                    iconUrl: imageIconMaps.home,
                    package: 'nr_pita_base',
                    func: 'app_mall_home',
                    path: '',
                    type: jumpType.jumpH5Page
                }
            ]
            : [];
    const homeOrder =
        type !== mallOrderPage
            ? [
                {
                    title: '我的订单',
                    i18nLocalizedKey: '',
                    iconUrl: imageIconMaps.order,
                    package: 'nr_pita_base',
                    func: 'app_mall_order',
                    path: getFullPath(mallOrderPage),
                    type: jumpType.jumpH5Page
                }
            ]
            : [];
    const homeCoupon =
        type !== mallCouponPage
            ? [
                {
                    title: '我的卡包',
                    i18nLocalizedKey: '',
                    iconUrl: imageIconMaps.coupon,
                    package: 'nr_pita_base',
                    func: 'app_mall_coupon',
                    path: getFullPath(mallCouponPage),
                    type: jumpType.jumpH5Page
                }
            ]
            : [];
    return {
        desc: '功能',
        iconUrl: imageIconMaps.func,
        package: 'nr_pita_base',
        path: '',
        func: 'app_more',
        type: jumpType.none,
        index: 3,
        position: 'right',
        items: [
            ...homeItem,
            {
                title: '通知中心',
                i18nLocalizedKey: '',
                iconUrl: imageIconMaps.noticy,
                package: 'nr_pita_base',
                func: 'app_notification_center',
                path: '',
                type: jumpType.none
            },
            ...homeOrder,
            ...homeCoupon
        ]
    };
}

function getFullPath(path) {
    return `${process.env.ACT_URL}${path}?v=${Date.now()}`;
}

export function getAppNavsData() {
    if (Boolean(window.getAppVersion)) {
        return {
            version: 'v1.0.4',
            result: {
                default: [appNavsBack],
                mall_with_home: [appNavsLogo, appNavsSearch, appNavsCar, appNavsFunc(mallHomePage)],
                mall_with_product_page: [appNavsBack, appNavsCar, appNavsFunc()],
                mall_with_car_page: [appNavsBack, appNavsSearch, appNavsFunc(mallCarPage)],
                mall_with_order_page: [appNavsBack, appNavsSearch, appNavsCar, appNavsFunc(mallOrderPage)],
                mall_with_coupon_page: [appNavsBack, appNavsSearch, appNavsCar, appNavsFunc(mallCouponPage)],
                mall_with_center_page: [appNavsBack, appNavsSearch, appNavsCar, appNavsFunc(mallCenterPage)],
                mall_with_default: [appNavsBack, appNavsSearch, appNavsCar, appNavsFunc()]
            }
        };
    } else {
        return {
            version: 'v0.1.4',
            result: {
                default: [appNavsBack],
                mall_with_default: [appNavsBack, appNavsHome, appNavsCloseLogo],
                mall_with_car_slogan: [appNavsLogo, appNavsSearch, appNavsCar, appNavsFunc(mallHomePage)],
                mall_with_car_can_back: [appNavsBack, appNavsCar, appNavsFunc()],
                mall_with_product_detail: [appNavsBack, appNavsSearch, appNavsFunc(mallCarPage)],
                mall_with_home: [appNavsBack, appNavsSearch, appNavsCar, appNavsFunc()]
            }
        };
    }
}

export function getAppNavsMap() {
    if (Boolean(window.getAppVersion)) {
        return {
            [mallHomePage]: {
                value: 'mall_with_home'
            },
            [mallProductPage]: {
                value: 'mall_with_product_page'
            },
            [mallCarPage]: {
                value: 'mall_with_car_page'
            },
            [mallOrderPage]: {
                value: 'mall_with_order_page'
            },
            [mallCouponPage]: {
                value: 'mall_with_coupon_page'
            },
            [mallCenterPage]: {
                value: 'mall_with_center_page'
            },
            [mallPayPage]: {
                value: 'default'
            },
            default: {
                value: 'default'
            },
            other: {
                value: 'mall_with_default'
            }
        };
    } else {
        return {
            [mallHomePage]: {
                value: 'mall_with_car_slogan'
            },
            [mallProductPage]: {
                value: 'mall_with_car_can_back'
            },
            [mallCarPage]: {
                value: 'mall_with_product_detail'
            },
            [mallPayPage]: {
                value: 'default'
            },
            default: {
                value: 'default'
            },
            other: {
                value: 'mall_with_home'
            }
        };
    }
}

// 要排除的页面不显示
export const excludePage = [
    '/question/paper',
    '/service/center',
    '/rich',
    '/media',
    '/survey-star'
];
