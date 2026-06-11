import { TOKEN, CACHE_PATH_INFO, CACHE_WECHAT_OPENID } from 'common/util/constant';
import bridge from 'common/util/bridge';
import { getJSON } from 'common/util';
import { getCurrentRoute } from 'common/router';
import base64 from 'lib/str/base64';
import { getRandom } from 'lib/util/digit';
import storage from 'lib/util/storage';
import { useStore } from 'common/store';
import axios_http from 'axios';
import { getPageExposureEventId } from './getReportId';
import { reportInitAppKey } from './reportAppKey';
import { $api } from 'common/util/global-properties';
import env from 'lib/comp/env';
import { isAndroid } from 'common/util/browser';

// 获取页面数据
function getURL() {
    const defaultPath = {
        lastUrl: { path: '', time: Date.now() },
        curUrl: { path: '', time: Date.now() }
    };
    const path = storage.session.get(CACHE_PATH_INFO);
    return {
        lastUrl: path?.lastUrl || defaultPath.lastUrl,
        curUrl: path?.curUrl || defaultPath.curUrl
    };
}

// 修改页面数据
function setURL(lastUrl, curUrl) {
    const oldUrl = getURL();
    storage.session.set(CACHE_PATH_INFO, {
        lastUrl: lastUrl || oldUrl.lastUrl,
        curUrl: curUrl || oldUrl.lastUrl
    });
}

// 缓存去重事件
let cacheRepeat = {};

export function getRepeatCacheRepeat() {
    return cacheRepeat;
}

export function reportInit() {
    try {
        reportInitUMA();
        reportInitUMAPathListener();
    } catch (e) {
        ///
    }
}

/// 设置用户
export function reportSetUser(uuid) {
    try {
        // 友盟设置userId
        window.aplus_queue?.push({
            action: 'aplus.setMetaInfo',
            arguments: ['_user_id', uuid]
        });
    } catch (e) {
        ///
    }
}

/****************************************友盟埋点*****************************************/

/// 初始化小程序友盟埋点
export function reportInitUMA() {
    try {
        reportInitAppKey();
        //sdk提供手动pv发送机制，启用手动pv(即关闭自动pv)，需设置aplus-waiting=MAN;
        window.aplus_queue?.push({
            action: 'aplus.setMetaInfo',
            arguments: ['aplus-waiting', 'MAN']
        });
        //是否开启调试模式
        window.aplus_queue?.push({
            action: 'aplus.setMetaInfo',
            arguments: ['DEBUG', true]
        });
    } catch (e) {
        ///
    }
}

/// 友盟监听点击事件
export function reportUMAListener() {
    try {
        window.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.getAttribute) {
                const event = getH5DataReport(target);
                if (event) {
                    console.log(event, '----------------tap');
                    reportUMAEvent(event.eventId, event.extra);
                }
            }
        });
    } catch (e) {
        ///
    }
}

/// 事件上报
export function reportUMAEvent(eventId, extra, noRepeat = false) {
    try {
        if (noRepeat === true) {
            /// 去重处理
            const extraString = JSON.stringify(extra || {});
            if (!cacheRepeat[eventId + '-' + extraString]) {
                cacheRepeat[eventId + '-' + extraString] = true;
            } else {
                return;
            }
        }
        const def = getBaseData(eventId);
        let _extra = {};
        Object.keys(extra || {}).forEach((name) => {
            _extra[`extra_${name}`] = String(extra[name]);
        });
        const params = Object.assign(def, _extra);
        window.aplus_queue?.push({
            action: 'aplus.record',
            arguments: [String(eventId), 'CLK', params]
        });
        reportToDataCenter(params);
    } catch (e) {
        ///
    }
}

/// 初始化页面浏览上报
function reportInitUMAPathListener() {
    checkChange('lanuch');
    setTimeout(() => {
        const listen = bridge.isWeApp() ? wx.onAppRoute : this?.$router.history.listen;
        if (!!listen) {
            listen(checkChange);
        } else {
            setInterval(checkChange, 500);
        }
    }, 100);

    function checkChange(init) {
        const { curUrl } = getURL();
        try {
            setTimeout(() => {
                if (curUrl.path !== getPath() || init === 'lanuch') {
                    const _curUrl = { path: getPath(), time: Date.now() };
                    setURL(curUrl, _curUrl);
                    /// 触发页面浏览上报
                    hashChange();
                }
            }, 1);
        } catch (e) {
            ///
        }
    }

    function hashChange() {
        const eventid = getPageExposureEventId(getCurrentRoute());
        if (!eventid) {
            return;
        }
        const { lastUrl, curUrl } = getURL();
        let _extra = {};
        const extra = getCurrentRoute()?.params;
        Object.keys(extra || {}).forEach((name) => {
            _extra[`extra_${name}`] = String(extra[name]);
        });
        if (eventid === '3012141005') {
            _extra['extra_code_num'] = decodeURIComponent(getCurrentRoute()?.query?.path || '');
        } else if (eventid === 'TJ2021791005' || eventid === 'TJ2021801005') {
            _extra['openid'] = storage.get(CACHE_WECHAT_OPENID);
        }
        const params = {
            intime: String(lastUrl.time),
            leavetime: String(curUrl.time),
            staytime: String(!lastUrl.path ? 0 : curUrl.time - lastUrl.time),
            ..._extra,
            ...getBaseData(eventid)
        };
        /// 重置缓存-去重
        cacheRepeat = {};
        window.aplus_queue?.push({
            action: 'aplus.sendPV',
            arguments: [{ is_auto: false }]
        });
        window.aplus_queue?.push({
            action: 'aplus.record',
            arguments: [eventid, 'CLK', params]
        });
        reportToDataCenter(params);
    }
}

/****************************************友盟上报工具方法*****************************************/

/// 获取基础的上报数据
function getBaseData(eventId) {
    const { lastUrl, curUrl } = getURL();
    const store = useStore();
    return {
        eventid: eventId,
        eventtime: String(Date.now()),
        page: curUrl.path,
        sourcePage: lastUrl.path,
        platform: bridge.isWeApp() ? '02' : '03',
        system_version: isAndroid() ? '0' : '1',
        uuid: store.state.userinfo?.uuid
    };
}

/// 获取当前页面地址
function getPath() {
    const { curUrl } = getURL();
    let path = getCurrentRoute()?.path || '';
    if (path === '') {
        return curUrl.path;
    } else {
        let key = path.indexOf('?');
        if (key > -1) path = path.slice(0, key);
        return path;
    }
}

/// 获取H5的data-report
function getH5DataReport(target) {
    if (target && target.getAttribute) {
        const id = target.getAttribute('report-id') || target.getAttribute('id') || '';
        if (id.indexOf('report') === 0) {
            const key1 = id.indexOf('-');
            const key2 = id.indexOf('***');
            const eventId = key2 > -1 ? id.slice(key1 + 1, key2) : id.slice(key1 + 1);
            let extra = key2 > -1 ? id.slice(key2 + 3) : '';
            extra = extra ? getJSON(extra, {}) : {};
            return { eventId: eventId, extra: extra };
        } else {
            if (target !== document.body) {
                return getH5DataReport(target.parentElement);
            }
        }
    }
}

/****************************************上报到数据中心*****************************************/
const sid = Date.now() + getRandom(3);

function reportToDataCenter(params, rNum = 1) {
    if (rNum > 2) return;
    const eventid = getPageExposureEventId(getCurrentRoute());
    const preToken = base64.encode(Date.now() + '|Narwal');
    const base = getDataCenterBase(rNum);
    let extra = {
        page: params.page,
        sourcePage: params.sourcePage
    };
    Object.keys(params).forEach((name) => {
        if (name.indexOf('extra_') === 0) {
            extra[name.replace('extra_', '')] = params[name];
        }
        if (String(params.eventid) === eventid) {
            extra['intime'] = params['intime'];
            extra['leavetime'] = params['leavetime'];
            extra['staytime'] = params['staytime'];
        }
    });
    const events = [
        {
            ...base,
            eventId: String(params.eventid),
            eventTime: String(params.eventtime),
            extraMsg: extra
        }
    ];
    const data = base64.encode(JSON.stringify(events));
    const token = storage.cookie.get(TOKEN);

    const options = {
        headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
            'Auth-Token': token ?? preToken
        }
    };

    axios_http
        .post($api.ymReport, data, options)
        .then(function (response) {})
        .catch(function (error) {});
}

let appVersion = null;
(function (isClient) {
    if (isClient) {
        bridge?.getUserInfo((json) => {
            appVersion = json.version;
        });
    }
})(env.isClient());

function getDataCenterBase(rNum) {
    const store = useStore();
    const system = window.navigator;
    return {
        uuid: store.state.userInfo?.uuid,
        brand: system.brand,
        model: system.model,
        osv: system.oscpu,
        platform: bridge.isWeApp() ? '小程序' : 'H5',
        language: system.language,
        appVer: appVersion || system.appVersion,
        appLan: system.language,
        apiVer: 'V1.3',
        rTime: String(Date.now()),
        rNum: String(rNum),
        network: '1',
        sid: sid
    };
}
