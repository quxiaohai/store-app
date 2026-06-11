const defaultKey = process.env.YM_APPKEY;
const YM_SERVER_CENTRT_APPKEY = process.env.YM_SERVER_CENTRT_APPKEY;
const YM_INVITE_APPKEY = process.env.YM_INVITE_APPKEY;
const YM_REFERRAL_APPKEY = process.env.YM_REFERRAL_APPKEY;
const YM_RENEW_APPKEY = process.env.YM_RENEW_APPKEY;

let storageYMkey = '';

/**
 * 以旧换新页面
 */
const RENEW_PAGE = [
    '/pages/newtradein',
    '/spread/renew',
    '/spread/input-sn',
    '/spread/robot-list',
    '/spread/trade-qualify',
    '/spread/express',
    '/member/order/detail'
]

/**
 * 获取页面曝光埋点eventId
 * @param {*} route
 */
export const getYMAppKey = (toPath = '') => {
    try {
        let ymkey = defaultKey;
        const url = toPath || window.location.href;
        if (url.indexOf('/service/center') >= 0) {
            ymkey = YM_SERVER_CENTRT_APPKEY;
        } else if (url.indexOf('/invite') >= 0) {
            ymkey = YM_INVITE_APPKEY;
        } else if (url.indexOf('/referral') >= 0) {
            ymkey = YM_REFERRAL_APPKEY;
        } else if (RENEW_PAGE.some(item => url.indexOf(item) >= 0)) {
            ymkey = YM_RENEW_APPKEY;
        }
        return ymkey;
    } catch (error) {
        return defaultKey;
    }
};

/**
 * 初始化appKey
 */
export function reportInitAppKey(toPath) {
    const ymkey = getYMAppKey(toPath);
    if (storageYMkey !== ymkey) {
        storageYMkey = ymkey;
        // 集成应用的appKey
        window.aplus_queue?.push({
            action: 'aplus.setMetaInfo',
            arguments: ['appKey', ymkey]
        });
    }
}
