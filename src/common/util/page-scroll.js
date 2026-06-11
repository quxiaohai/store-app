/**********
 * 禁止body底层滚动
 * @param e
 * @private
 */

import { isFunction, isNode, isObject } from 'lib/util/dataType';
import { lock, isLock, unLock } from 'lib/util/lock';

/*************
 * 禁止body触摸滑动
 * @param e
 * @private
 */
function _stopScroll(e) {
    e.preventDefault();
}

let _events = [],
    _timer = null,
    _clear = null;

/********
 * 获取滚动值
 * @param node
 * @returns {{top: *, left: *}}
 * @private
 */
function _getScrollOffset(node) {
    if (node !== document) {
        return {
            left: node.scrollLeft,
            top: node.scrollTop
        };
    }

    if (window.scrollY !== undefined) {
        return {
            left: window.scrollX,
            top: window.scrollY
        };
    }

    return {
        left: document.documentElement.scrollLeft,
        top: document.documentElement.scrollTop
    };
}

/**********
 * 获取当前node
 * @param node
 * @returns {*|Document}
 * @private
 */
function _getCurrentNode(node) {
    if (node === window || node === document.body) {
        return document;
    }

    return node;
}

const pageScroll = {
    /*********
     * 停止页面滚动
     */
    stop() {
        if (isLock('page-scroll')) {
            return pageScroll;
        }
        lock('page-scroll');
        // 禁用底层滚动
        document.body.addEventListener('touchmove', _stopScroll, { passive: false });
        return pageScroll;
    },
    /******
     * 启用页面滚动
     */
    start() {
        if (!isLock('page-scroll')) {
            return this;
        }
        unLock('page-scroll');
        // 解除底层滚动
        document.body.removeEventListener('touchmove', _stopScroll, { passive: false });
        return pageScroll;
    },
    toggle(bool) {
        if (bool) {
            return pageScroll.stop();
        } else {
            return pageScroll.start();
        }
    },
    /**************
     * 解除滚动监听
     * @param node
     * @param fns
     * @returns {any}
     */
    off(node, fns) {
        const methods = [].concat(node).concat(fns).filter(item => isFunction(item?.fn || item)).map(item => item.fn || item);

        if (methods.length === 0) {
            return pageScroll;
        }

        const dom = isNode(node) ? _getCurrentNode(node) : document;
        const index = _events.findIndex(item => item.node === dom);
        if (index === -1) {
            return pageScroll;
        }

        const obj = _events[index];
        obj.events = obj.events.filter(item => !methods.includes(item?.fn || item));

        if (obj.events.length === 0) {
            dom.removeEventListener('scroll', obj.scroll, { passive: true });
            _events.splice(index, 1);
        }

        return pageScroll;
    },
    /**************
     * 绑定滚动 默认绑定在根节点
     *  支持传一个对象
     *  {
     *      fn: 要绑定的函数,
     *      trigger: false, 是否绑定完触发一次，默认false
     *      vm: 要给fn绑定的上下文对象，非必传
     *  }
     * @param node
     * @param fns
     * @returns {any}
     */
    on(node, fns) {
        const methods = [].concat(node).concat(fns).filter(item => isFunction(item?.fn || item));

        if (methods.length === 0) {
            return pageScroll;
        }

        const dom = isNode(node) ? _getCurrentNode(node) : document;
        const obj = _events.find(item => item.node === dom);

        if (obj) {
            obj.events.push(...methods);
        } else {
            const data = {
                node: dom,
                events: methods,
                scroll: ev => {
                    const offset = _getScrollOffset(ev.target);
                    const obj = {
                        scrollLeft: offset.left,
                        scrollTop: offset.top
                    };
                    data.events.forEach(item => {
                        if (isFunction(item)) {
                            item(obj);
                        } else if (isFunction(item.fn)) {
                            item.fn.call(item.vm, obj);
                        }
                    });
                }
            };
            _events.push(data);
            dom.addEventListener('scroll', data.scroll, { passive: true });
        }

        methods.forEach(item => {
            // 是否自动触发
            if (isObject(item) && item.trigger) {
                const offset = _getScrollOffset(dom);
                const obj = {
                    scrollLeft: offset.left,
                    scrollTop: offset.top
                };
                item.fn.call(item.vm, obj);
            }
        });

        return pageScroll;
    },
    /******
     * 滚动到指定位置
     * @默认node为根节点，如果需要调整，请pageScroll.scrollTo.call(node, ...args)这样调用;
     * @param sx
     * @param sy
     * @param time
     * @param callback
     */
    scrollTo(sx, sy, time = 0, callback) {

        // 如果当前在执行，直接先清除
        if (time > 0 && _timer !== null) {
            clearInterval(_timer);
            clearTimeout(_clear);
            _timer = null;
            _clear = null;
        }

        // 默认为根节点
        let isRoot = true;
        let node = document;
        if (isNode(this)) {
            isRoot = _getScrollOffset(this) === document;
            node = isRoot ? document : this;
        }

        if (time === 0) {// 立即执行
            isFunction(callback) && setTimeout(() => {
                callback({ x: sx, y: sy });
            }, 50);

            if (isRoot) {
                window.scrollTo(sx, sy);
            } else {
                node.scrollTop = sy;
                node.scrollLeft = sx;
            }
        } else {
            const offset = _getScrollOffset(node);
            const x = sx - offset.left, y = sy - offset.top;
            const max = Math.max(Math.abs(x), Math.abs(y));
            const roll = Math.max(1, Math.round(max / (time / 5)));
            let min = 0;

            _timer = setInterval(() => {
                if (min >= max) {
                    clearInterval(_timer);
                    clearTimeout(_clear);
                    _timer = null;
                    min = max;
                    isFunction(callback) && setTimeout(() => {
                        const offset = _getScrollOffset(node);
                        callback({ x: offset.left, y: offset.top });
                    }, 50);
                }

                const sTop = offset.top + Math.min(min, Math.abs(y)) * (y > 0 ? 1 : -1);
                const sLeft = offset.left + Math.min(min, Math.abs(x)) * (x > 0 ? 1 : -1);

                if (isRoot) {
                    window.scrollTo(sLeft, sTop);
                } else {
                    node.scrollTop = sTop;
                    node.scrollLeft = sLeft;
                }

                min += roll;
            }, 5);

            _clear = setTimeout(() => {
                clearInterval(_timer);
                _timer = null;
                isFunction(callback) && setTimeout(() => {
                    if (isRoot) {
                        window.scrollTo(sx, sy);
                    } else {
                        node.scrollTop = sy;
                        node.scrollLeft = sx;
                    }
                    const offset = _getScrollOffset(node);
                    callback({ x: offset.left, y: offset.top });
                }, 50);
            }, time * 6);
        }

        return pageScroll;
    },
    /************
     * 获取页面滚动数据
     * @param node
     * @returns {{top: *, left: *}}
     */
    getScroll(node) {
        return _getScrollOffset(_getCurrentNode(node || window));
    }
};

export default pageScroll;