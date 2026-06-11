/*********
 * 当前作用域内，数据传输
 */

import md5 from 'lib/str/md5';
import { bus } from './bus';
import { isObject, isNumber } from 'lib/util/dataType';

function _getUID(key, push) {
    const uid = md5(_scope + key);
    push && !_uid.includes(uid) && _uid.push(uid);
    return uid;
}

let _uid = [], _scope = 'scope';

export default {
    init(to, from) {
        _scope = to.fullPath;
        if (from.fullPath !== _scope) {
            this.clear();
        }
    },
    emit(evtType, data, timer) {
        const emit = (evtType, data) => {
            if (isObject(data) && data.type) {
                bus.$emit(_getUID(`${evtType}:${data.type}`), data);
            }
            bus.$emit(_getUID(evtType), data);
        };

        if (timer && isNumber(timer)) {
            setTimeout(() => emit(evtType, data), timer);
        } else {
            emit(evtType, data);
        }
    },
    on(evtType, handler) {
        bus.$on(_getUID(evtType, true), handler);
    },
    off(evtType, handler) {
        bus.$off(_getUID(evtType), handler);
    },
    once(evtType, handler) {
        bus.$once(_getUID(evtType, true), handler);
    },
    clear(evtType, scope = true) {
        if (typeof evtType === 'string') {
            bus.$clear(scope ? _getUID(evtType) : evtType);
        } else {
            _uid.forEach(item => {
                this.clear(item, false);
            });
            _uid = [];
        }
    }
};