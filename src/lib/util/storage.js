/**
 * 穆辰 2020/06/01.
 * sessionStorage | localStorage 存储
 */

import cookie from 'js-cookie';
import clone from 'lib/json/clone';
import env from 'lib/comp/env';
import { getType, isArray, isObject } from 'lib/util/dataType';

/***********
 * 处理数据中的null
 * @param json
 * @param dispose => boolean true 还原， false 处理
 * @returns {{}|*}
 */
function _formatNull(json, dispose) {
    let obj = null;
    if (isArray(json)) {
        obj = [];
        json.forEach(item => {
            obj.push(_formatNull(item, dispose));
        });
    } else if (isObject(json)) {
        obj = {};
        Object.keys(json).forEach(key => {
            obj[key] = _formatNull(json[key], dispose);
        });
    } else {
        if (json === null && !dispose) {
            return '__null__';
        } else if (json === '__null__' && dispose) {
            return null;
        }
        return json;
    }
    return obj;
}

const _Storage = {
    __cache: {},
    set(key, val) {
        if (env.isClient()) {
            const storage = this === 'session' ? window.sessionStorage : window.localStorage;
            storage.setItem(key, JSON.stringify({ type: getType(val), value: _formatNull(val) }));
            _Storage.__cache[key] = clone(val);
        }
    },
    get(key) {
        if (env.isClient()) {
            if (_Storage.__cache[key] !== undefined) {
                return clone(_Storage.__cache[key]);
            }

            const storage = this === 'session' ? window.sessionStorage : window.localStorage;
            let res = storage.getItem(key);

            if (res) {
                res = JSON.parse(res);
                _Storage.__cache[key] = _formatNull(res.value, true);
                if (res.type === 'number') {
                    _Storage.__cache[key] = parseFloat(res.value);
                } else if (res.type === 'boolean') {
                    _Storage.__cache[key] = res.value === 'true';
                }
                return _Storage.__cache[key];
            }
        }
        return null;
    },
    clear(key) {
        if (env.isClient()) {
            const storage = this === 'session' ? window.sessionStorage : window.localStorage;
            if (typeof key === 'string') {
                delete _Storage.__cache[key];
                storage.removeItem(key);
            } else {
                _Storage.__cache = [];
                storage.clear();
            }
        }
    },
    session: {
        set(key, val) {
            _Storage.set.call('session', key, val);
        },
        get(key) {
            return _Storage.get.call('session', key);
        },
        clear(key) {
            _Storage.clear.call('session', key);
        }
    },
    cookie: {
        set(key, val, config) {
            cookie.set(key, val, config);
        },
        get(key) {
            return cookie.get(key);
        },
        clear(key) {
            if (typeof key === 'string') {
                cookie.remove(key);
            } else if (env.isClient()) {
                const dataArray = document.cookie.split('; ');
                for (let i = 0; i < dataArray.length; i++) {
                    const key = dataArray[i].split('=')[0];
                    cookie.remove(key);
                }
            }
        }
    }
};

export default _Storage;
