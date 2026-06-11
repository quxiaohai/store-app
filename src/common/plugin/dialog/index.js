/**********
 * 穆辰
 * 2020-07-02
 */

import dialog from 'lib/layer/dialog';
import popup from 'lib/layer/popup';
import { isFunction, isObject, isString, isNumber } from 'lib/util/dataType';
import toast from './toast.vue';
import actionSheet from './action-sheet';
import { px2px } from 'lib/util/viewport';
import { isLock, unLock, lock } from 'lib/util/lock';
import { clientRouter } from 'common/router';
import { clientStore } from 'common/store';

import env from 'lib/comp/env';

const _common = function(msg, config = {}, type) {
    return new Promise((resolve, reject) => {
        let opts = Object.assign(
            {
                okText: '确定',
                cancelText: '取消',
                title: '提示',
                wait: false,
                top: null,
                left: null,
                close: false,
                animate: 'scale',
                ok: function() {
                },
                cancel: function() {
                }
            },
            config
        );

        const m_dialog = dialog(
            type === 'open' ? msg : null,
            type === 'open'
                ? Object.assign({
                    animate: 'scale',
                    stop: true,
                    store: clientStore,
                    router: clientRouter
                }, config)
                : {
                    stop: true,
                    title: opts.title,
                    wait: opts.wait,
                    close: opts.close,
                    content: msg,
                    animate: opts.animate,
                    opacity: opts.opacity,
                    initIndex: opts.initIndex,
                    type: opts.type,
                    color: opts.color,
                    okText: opts.okText,
                    cancelText: opts.cancelText,
                    okColor: opts.okColor,
                    cancelColor: opts.cancelColor,
                    ok: opts.ok,
                    cancel: opts.cancel,
                    store: clientStore,
                    router: clientRouter
                }
        );
        m_dialog.show(opts.left, opts.top);
        _dialogList.push(m_dialog);

        if (type === 'wait') {
            _closeWait = m_dialog;
            return false;
        }

        // 非单次关闭
        if (type === 'open' && !opts.once && opts.type) {
            // 绑定单个确认按钮
            m_dialog.$event.on('ok', (res) => {
                // 给子模块发送消息，进行交互
                m_dialog.postMessage({ type: 'ok', data: res, app: m_dialog });
            });

            m_dialog.$event.on('message', res => {
                opts.ok(res);
            });
        }

        if (type !== 'open' || (opts.type && opts.once)) {
            m_dialog.$event.once('ok', (res) => {
                m_dialog.hide(m_dialog.destroy, 'ok');
                opts.ok(res);
                resolve(res);
            });
        }

        if (opts.type === 'confirm') {
            m_dialog.$event.once('cancel', function(result) {
                m_dialog.hide(m_dialog.destroy, 'cancel');
                opts.cancel(result);
                reject(result);
            });
        }
    });
};

let _closeWait = null;
let _dialogList = [];

export default {
    /*******
     *
     * @param msg
     * msg支持动态变量time,关闭时间,毫秒,获取方式'还有{time/1000}秒关闭'使用单大括号，支持简单运算
     * @param config
     * @returns {Promise<unknown>}
     */
    toast(msg, config) {
        if (isLock('toast') || env.isServer()) {
            return false;
        }
        this.closeWait();
        let opts = Object.assign(
            {
                overlay: true,
                barShow: false,
                barColor: '#fff',
                showTime: 2000,
                top: 94,
                lock: false,// 信息锁，是否锁定，锁定后，其它toast将失效，直到解除
                callback: function() {
                }
            },
            isObject(config) ? config : {}
        );

        if (opts.lock) {
            lock('toast');
        }

        return new Promise((resolve) => {
            const m_dialog = popup({
                showCenter: true,
                autoHide: false,
                overlay: {
                    show: false
                    // show: opts.overlay,
                    // type: 'create',
                    // opacity: 0
                },
                animate: {
                    name: 'slide'
                },
                progressBar: {
                    show: opts.barShow,
                    showTime: opts.showTime,
                    color: opts.barColor
                }
            }, {
                store: clientStore,
                router: clientRouter
            });

            m_dialog.loader(toast, { msg, type: opts.type });
            m_dialog.show(opts.left, opts.top);
            m_dialog.$event.once('hide', (result) => {
                unLock('toast');
                resolve(result);
                isFunction(config) && (opts.callback = config);
                opts?.callback(result);
                m_dialog.destroy();
            });
        });
    },
    /*********
     * 成功的提示
     * @param msg
     * @param config
     * @returns {*|Promise<unknown>}
     */
    success(msg, config) {
        return this.toast(msg, Object.assign(config || {}, { type: 'circle-success' }));
    },
    /********
     * 失败提示
     * @param msg
     * @param config
     * @returns {*|Promise<unknown>}
     */
    fail(msg, config) {
        return this.toast(msg, Object.assign(config || {}, { type: 'failed' }));
    },
    /***********
     * 等待加载
     * @param msg
     * @param opt
     * @returns {*|Promise<unknown>|boolean|Promise<void>}
     */
    wait(msg, opt) {
        if (_closeWait || isLock('wait') || env.isServer()) {
            return true;
        }

        if (isNumber(opt?.lock)) {// 支持锁定时间
            lock('wait');
            setTimeout(() => {
                unLock('wait');
                this.closeWait();
            }, opt.lock);
        }

        const config = {
            wait: isString(msg) ? msg : true,
            opacity: 0,
            type: 'create',
            animate: 'fade'
        };
        return _common(null, Object.assign(config, opt || {}), 'wait');
    },
    /**********
     * 关闭等待加载
     */
    closeWait() {
        if (_closeWait && !isLock('wait')) {
            _closeWait.hide(_closeWait.destroy, 'wait');
            _closeWait = null;
        }
    },
    /********
     * 是否显示了等待加载
     */
    isWait() {
        return !!_closeWait;
    },
    /**********
     * 打开一个框
     * @param vue
     * @param opts
     * @returns {*|Promise<unknown>|Promise<void>}
     */
    open(vue, opts) {
        if (env.isServer()) {
            return false;
        }

        this.closeWait();
        return _common(vue, opts, 'open');
    },
    /************
     * 打开alert
     * @param msg
     * @param config
     * @returns {*|Promise<unknown>|Promise<void>}
     */
    alert(msg, config) {
        if (env.isServer()) {
            return false;
        }

        this.closeWait();
        let option = {};
        if (isObject(config)) {
            option = config;
        } else if (isFunction(config)) {
            option.ok = config;
        }

        option.type = 'alert';

        return _common(msg, option, 'alert');
    },
    /************
     * 确定框
     * @param msg
     * @param fn1
     * @param fn2
     * @returns {*|Promise<unknown>}
     */
    confirm(msg, fn1, fn2) {
        if (env.isServer()) {
            return false;
        }

        this.closeWait();
        let option = {};
        if (isObject(fn1)) {
            option = fn1;
        } else if (isFunction(fn1)) {
            option.ok = fn1;
            if (isFunction(fn2)) {
                option.cancel = fn2;
            }
        }

        option.type = 'confirm';

        return _common(msg, option, 'confirm');
    },
    /************
     * 弹框
     * @param opts
     */
    popup(opts) {
        if (env.isServer()) {
            return false;
        }
        ['width', 'height', 'top', 'left', 'right', 'bottom']
            .forEach(pro => {
                if (isNumber(opts[pro])) {
                    opts.pro = px2px(opts.pro);
                }
            });
        const t = popup(opts, {
            router: clientRouter,
            store: clientStore
        });
        _dialogList.push(t);
        return t;
    },
    /*********
     * 关闭所有弹框
     */
    closeAllDialog() {
        if (env.isServer()) {
            return false;
        }

        _dialogList.forEach(item => {
            item.hide && item.hide(item.destroy, 'close-all');
        });
        _dialogList = [];
    },
    /***********
     * 显示sheet菜单
     * @param option
     * @returns {Promise<unknown>|Promise<void>}
     */
    showActionSheet(option) {
        if (env.isServer()) {
            return false;
        }

        return new Promise((resolve, reject) => {
            let opts = Object.assign({
                itemList: [],
                cancel: true,
                stop: true,
                success() {
                }
            }, option || {});
            const m_dialog = popup({
                left: 0,
                bottom: 0,
                autoHide: true,
                stop: opts.stop,
                overlay: {
                    show: true,
                    opacity: 0.5
                },
                animate: {
                    name: 'bottom'
                }
            });

            m_dialog.loader(actionSheet, {
                itemList: opts.itemList,
                cancel: opts.cancel,
                cancelType: opts.cancelType
            });

            m_dialog.$event.once('message', res => {
                resolve({ index: res });
                opts.success({ index: res });
                m_dialog.hide(m_dialog.destroy);
            });

            m_dialog.$event.once('cancel', () => {
                m_dialog.hide(m_dialog.destroy);
                reject();
            });
            m_dialog.show();

            _dialogList.push(m_dialog);
        });
    },
    // 弹框居中
    setMiddle() {
        if (env.isServer()) {
            return false;
        }

        _dialogList.forEach(item => {
            if (item && item.getStatus()) {
                item.setAniCenter();
            }
        });
    }
};
