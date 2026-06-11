const keys = [
    'activityList',
    'commentInfo',
    'couponTake',
    'couponTakeAll',
    'customPage',
    'customPageByKey',
    'delShopCart',
    'echatInfo',
    'fileUpload',
    'getActivityGroupPage',
    'getBase64',
    'getBuyRobotActivity',
    'getConf',
    'getConfV2',
    'getConsumableProduct',
    'getDetailByActivityId',
    'getIndexPage',
    'getNarwowAndUserInfo',
    'getPolicyList',
    'getProtectionDetailById',
    'getProtectionTemplateList',
    'getRealSiteConf',
    'getRegionsList',
    'getServiceReserveTime',
    'getShareInfo',
    'getToken',
    'getV2SmsCode',
    'getWxBase64',
    'myTrialList',
    'phoneCodeLogin',
    'phonePwdLogin',
    'postingDetailInfo',
    'postingGiftsList',
    'postingInfoNoLogin',
    'productInfo',
    'purchaseMyPrize',
    'pushShopCart',
    'queryActTag',
    'resourceError',
    'shopCartList',
    'tagInfo',
    'tagList',
    'totalProductNum',
    'trialInfo',
    'trialList',
    'trialReportInfo',
    'trialReportList',
    'updateUserInfo',
    'uploadFileToPrivate',
    'uploadImage',
    'userCouponList',
    'userInfoNoJump',
    'utmReportHits',
    'ymReport'
];

const api = keys.reduce((res, key) => {
    res[key] = `/mall/${key}`;
    return res;
}, {});

export default new Proxy(api, {
    get(target, key) {
        if (typeof key !== 'string') {
            return target[key];
        }
        return target[key] || `/mall/${key}`;
    }
});
