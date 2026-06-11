import throttle from 'lib/util/throttle';
import isElementVisible from 'lib/dom/isElementVisible';
import { reportUMAEvent } from 'common/plugin/report/report-utils';

// 友盟埋点

/// 处理是否曝光-节流
const viewBuffer = throttle(80, handleViewExposure);

/// 曝光处理
export function reportViewHandler(delay = false, params) {
    try {
        if (!delay) {
            viewBuffer(params);
        } else {
            setTimeout(() => {
                viewBuffer(params);
            }, 500);
        }
    } catch (e) {
        //
    }
}

/// 曝光上报 判断是否在可视区域
function handleViewExposure(params) {
    const { el, reportParams, eventId } = params;
    isElementVisible(el, () => {
        reportUMAEvent(eventId, reportParams, true);
    });
}