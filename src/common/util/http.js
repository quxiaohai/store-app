import request from 'lib/io/axios';
import { useStore } from 'common/store';
import { getCurrentRoute } from 'common/router';
import { isNumber } from 'lib/util/dataType';
import errorCode from './error-code';
import { toLogin } from 'common/util';
import { getUploadPrivate } from 'common/util/upload-private';
import serverUrl from 'common/util/server-url';
import { $event, $layer } from 'common/util/global-properties';
import { EVENTS } from 'common/util/constant';

let instance = request.create({
    timeout: 20000,
    withCredentials: false,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        // 'Content-Type': 'application/x-www-form-urlencoded'
        'Content-Type': 'application/json'
    }
});

const option = {
    waits: [],
    alerts: [],
    requests: [],
    compTimer: null
};

/********
 * 获取code
 * @param v
 * @param d
 * @private
 */
function _getCode(v, d) {
    v = parseInt(v);
    if (isNumber(v)) {
        return v;
    }
    return d;
}

/**
 * 根据不同模块，获取结果状态
 */
function _getResult(info, module) {
    switch (module) {
        case process.env.API:
            return { code: info.result, data: info.data, msg: info.msg };
        case process.env.BASE:
            return { code: info.result, data: info.data, msg: info.msg };
        case process.env.USER:
            return {
                code: info.err_code === 10000 ? 1 : info.err_code,
                data: info.result,
                msg: info.msg,
                body: info
            };
    }
    return info;
}

/************
 * 退出处理
 * @param text
 * @param cache
 * @private
 */
function _codeLogout(text, cache) {
    useStore().commit('DELETE_USERINFO');
    if (cache?.jump !== false) {
        toLogin(true);
    }
}

instance.intercept({
    // 发出请求时的回调函数
    config(p) {
        // 对所有request请求中的OBJECT参数对象统一附加时间戳属性
        p.timestamp = +Date.now();

        const store = useStore();

        const headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1',
            'Accept-Language': 'zh-cn', // 全局添加语言信息
            'SITE': 'zh-cn',
            'UTM': String(store.state.utm || ''),
            'DEVICE-TYPE': String(store.state.deviceType),
            'Aiot-Application-Id': 'GWeirQm8q1'
        };

        if (p.headers) {
            delete p.headers['AUTH-TOKEN'];
        }

        const token = store.state.token;
        if (token && p.token !== false) {
            headers['AUTH-TOKEN'] = token;
        }

        if (!!p.cacheURL?.timestamp) {
            if (!p.params) p.params = {};
            p.params._ = Date.now() + Math.round(Math.random() * 10000);
        }

        p.headers = Object.assign(p.headers || {}, headers, getUploadPrivate(p.cacheURL?.url || ''));

        p.url = serverUrl(p.url);

        if (p.config.wait) {
            option.waits.push(p.key);
            $layer.wait(p.config.wait === true ? '加载中...' : p.config.wait);
        }

        console.log('请求地址--url:' + p.url);
        // console.log('请求密钥--token:' + p.headers.Authorization);
        console.log('请求参数--data:', p.data, '--params:', p.params);

        if (p.config.alert === false) {
            option.alerts.push(p.key);
        }

        return p;
    },

    success(p, req) {
        if (isNumber(p.data.err_code)) {
            p.data.code = p.data.err_code;
        } else if (isNumber(p.data.result)) {
            p.data.code = p.data.result;
        }

        // 添加一个请求时间差
        p.data.timeDiff = Date.now() - p.timestamp;

        try {
            return ((p, req) => {
                const info = _getResult(p.data, req?.cacheURL?.proxy);
                const code = parseInt(info.code);

                console.log('request result:', info);

                if (code === 1) {
                    return info;
                }
                // 是否需要登录
                let login = false;
                if (code === 130105 || code === 110106 || code === 140105) {
                    // token错误，全部清除, 或者未登录
                    login = true;
                    _codeLogout(errorCode[code], req?.cacheURL);
                }

                if (p.config) {
                    console.log('请求地址--url:' + p.config.url);
                    console.log('请求时长--time:' + (Date.now() - p.config.timestamp) + 'ms');
                    console.log('响应结果--res:', p.data);
                }

                return Promise.reject(
                    Object.assign({}, p.data, {
                        login,
                        code: _getCode(code, 500),
                        msg: errorCode[code] || p.data.msg || errorCode.catch
                    })
                );
            })(p, req);
        } catch (e) {
            console.log(e);
            return Promise.reject({ code: 502, msg: errorCode.timeout });
        }
    },
    //请求失败后的回调函数
    fail(p) {
        // 必须返回响应数据对象，否则后续无法对响应数据进行处理
        const code = _getCode(p.data.code, 500);
        if (code === 401) {
            return { type: -2, code: code, statusText: errorCode['401'], data: p.data };
        } else if (code === 403) {
            return { type: -2, code: code, statusText: errorCode['403'], data: p.data };
        } else if (code === 500) {
            return { type: -2, code: code, statusText: errorCode[code], data: p.data };
        }
        return { type: -2, code: code, statusText: p.data.msg || errorCode.err, data: p.data };
    },
    // 请求完成时的回调函数(请求成功或失败都会被执行)
    complete(res, req) {
        try {
            // 请求结束
            $event.emit(EVENTS.REQUEST_DONE, { res, req });

            (p => {
                const key = p.key;
                const index = option.waits.indexOf(key);
                if (index > -1) {
                    option.waits.splice(index, 1);
                }
                if (option.waits.length === 0) {
                    $layer.closeWait();
                }

                clearTimeout(option.compTimer);
                option.compTimer = setTimeout(() => {
                    $layer.closeWait();
                    option.waits = [];
                    option.alerts = [];
                }, 5000);

                const err = _getCode(p.data.code, p.status);

                if (p.config) {
                    console.log(p.config.url, ' --请求时长：' + (Date.now() - p.config.timestamp) + 'ms');
                }

                const exclude = [1, 9999, 10000, 130105, 110106, 406];

                if (!exclude.includes(err)) {
                    const msg = errorCode[err] || p.data.msg || p.statusText || errorCode.catch;
                    // 异常上报
                    if (!p.config?.url?.includes('reportLog/resourceError')) {
                        useStore().dispatch('CATCH_REPORT', {
                            errorInfo: msg,
                            errorType: 3,
                            pageUrl: getCurrentRoute().url,
                            url: p.config?.url,
                            code: err,
                            apiUrl: p.config?.cacheURL?.url
                        });
                    }

                    const a_i = option.alerts.indexOf(key);
                    if (a_i > -1) {
                        option.alerts.splice(a_i, 1);
                        return;
                    }

                    if (msg !== 'OK') {
                        // OK的时候，是请求无返回
                        console.error('error', msg);
                        $layer.toast(msg);
                    }
                }
            })(res);
        } catch (err) {
            if (option.waits.length > 0) {
                $layer.closeWait();
            }

            // 异常上报
            if (!res.config?.url?.includes('reportLog/resourceError')) {
                useStore().dispatch('CATCH_REPORT', {
                    errorInfo: JSON.stringify(err),
                    errorType: 2,
                    pageUrl: getCurrentRoute().url,
                    url: res.config?.url
                });
            }

            option.waits = [];
            option.alerts = [];
            $layer.toast(errorCode.timeout);
            console.error('请求异常', err);
        }
    }
});

export default instance;