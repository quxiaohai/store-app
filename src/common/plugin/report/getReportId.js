import { useStore } from 'common/store';

// 统一的页面曝光埋点事件ID
const defaultViewPageEventId = '2029991001';

// 页面曝光埋点对应路径及eventId
const exposureIdEnum = {
    '/product/trial': '3010991005', // 活动专区页
    '/rich?pageKeyword=trialDesc': '3011001005', // 试用说明详情页
    '/product/my-trial': '3011011005', // 我的试用列表
    '/product/trial/list/:id?': '3011041005', // 试用报告列表页
    '/product/trial/detail/:id': '3011051005', // 试用详情页
    '/question/paper/:activityId?': '3011101005', // 问卷填写页
    '/product/report/:id': '3011081005', // 上传试用报告页
    '/service/center': '3011731005', // 帮助中心页
    '/invite': '3011521005', // 新人礼活动专区页
    '/invite/purchase/upload': '3011561005', // 购机礼信息填写页
    '/rich?pageKeyword=postingReason': 'purchaseReason', // 购机礼失败原因查看页
    '/open-app': '3012141005', // 中转页
    '/referral/:id': 'TJ2021751005' // 推荐有礼页面 推荐人：TJ2021751005 被推荐人：TJ2021791005
};

/**
 * 获取页面曝光埋点eventId
 * @param {*} route
 */
export const getPageExposureEventId = (route) => {
    const path = route?.matched[0]?.path || '';
    if (path === '/referral/:id') {
        // 推荐人进入自己分享的链接，自动跳转到推荐人活动页
        const store = useStore();
        const uuid = store?.state?.userinfo?.uuid;
        const old_uuid = route?.query?.old_uuid;
        const commType = !old_uuid ? 'old' : old_uuid === uuid ? 'old' : 'new';
        const qytgType = old_uuid?.includes('qytg-');
        const oldUserEventId = 'TJ2021751005';
        const newUserEventId = qytgType ? 'TJ2021801005' : 'TJ2021791005';
        return commType === 'old' ? oldUserEventId : newUserEventId;
    }
    return exposureIdEnum[path] || defaultViewPageEventId;
};
