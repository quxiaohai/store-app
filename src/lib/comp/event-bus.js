import { isLock, lock, unLock } from 'lib/util/lock';
import { isNumber } from 'lib/util/dataType';

export default function() {
    const _events = {};

    const bus = {
        on: (evtType, handler, isOnce) => {
            if (typeof (handler) !== 'function') {
                return;
            }
            if (!_events[evtType]) {
                _events[evtType] = [];
            }

            var flat = true;
            const len = _events[evtType].length;
            for (let i = 0; i < len; i++) {
                if (_events[evtType][i].fn === handler) {
                    flat = false;
                    break;
                }
            }
            flat && _events[evtType].push({ once: !!isOnce, fn: handler });
        },
        off: (evtType, handler) => {
            if (!_events[evtType]) {
                return;
            }

            const len = _events[evtType].length;
            for (let i = 0; i < len; i++) {
                if (_events[evtType][i].fn === handler) {
                    _events[evtType].splice(i, 1);
                    break;
                }
            }

            if (_events[evtType].length === 0) {
                delete _events[evtType];
            }
        },
        emit: (evtType, data, timer) => {

            if (!_events[evtType]) {
                return;
            }

            if (isNumber(timer) && timer > 0) {
                if (isLock(evtType)) {
                    return;
                }
                lock(evtType);
                setTimeout(() => {
                    unLock(evtType);
                }, timer);
            }

            const arr = [];
            _events[evtType].forEach(item => {
                if (!item.once) {
                    arr.push(item);
                }
                item.fn(data);
            });
            _events[evtType] = arr;
        },
        once: (evtType, handler) => {
            bus.on(evtType, handler, true);
        },
        clear: evtType => {
            delete _events[evtType];
        }
    };

    return bus;
}