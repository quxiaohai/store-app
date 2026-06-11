/**********
 * 页面事件监听
 * @param e
 * @private
 */

import { isArray } from 'lib/util/dataType';

let _event_map = {};

/******
 * 滚动事件
 * @param ev
 * @private
 */
function _event(ev) {
    const events = _event_map[ev.type];
    if (isArray(events)) {
        events.forEach(fn => fn(ev));
    }
}


export default {
    /********
     * 解除事件
     * @param node
     * @param eventName
     * @param fn
     * @returns {default}
     */
    off(node, eventName, fn) {
        const events = _event_map[eventName];
        if (isArray(events)) {
            _event_map[eventName] = events.filter(f => f !== fn);

            if (_event_map[eventName].length === 0) {
                delete _event_map[eventName];
                node.removeEventListener(eventName, _event);
            }
        }

        return this;
    },
    /********
     * 绑定事件
     * @param node
     * @param eventName
     * @param fn
     */
    on(node, eventName, fn) {
        const events = _event_map[eventName];
        if (isArray(events)) {
            events.push(fn);
        } else {
            _event_map[eventName] = [fn];
            node.addEventListener(eventName, _event);
        }

        return this;
    }
};
