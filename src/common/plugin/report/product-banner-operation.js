import throttle from 'lib/util/throttle';
import isElementVisible from 'lib/dom/isElementVisible';
import { reportUMAEvent, getRepeatCacheRepeat } from 'common/plugin/report/report-utils';

// 友盟埋点

/// 处理是否曝光-节流
const viewProductBannerBuffer = throttle(60, viewProductBanner);

/// 曝光处理
export function reportProductBannerHandler(delay = false, params) {
    try {
        if (!delay) {
            viewProductBannerBuffer(params);
        } else {
            setTimeout(() => {
                viewProductBannerBuffer(params);
            }, 500);
        }
    } catch (e) {
        console.warn(e)
    }
}

/// 曝光上报 判断是否在可视区域
function viewProductBanner(params) {
    try {
        const { el, reportParams, eventId } = params;
        const cacheRepeat = getRepeatCacheRepeat();
        const extraString = JSON.stringify(reportParams || {});
        if (cacheRepeat[eventId + '-' + extraString]) {
            return;
        }
        isElementVisible(el, () => {
            reportUMAEvent(eventId, reportParams, true);
        });
    } catch (error) {
        console.warn(error);
    }
}
