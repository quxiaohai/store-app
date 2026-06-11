/**
 * @description 为组件绑定浏览器历史记录，解决移动端安卓物理返回键直接跳过关闭组件切换页面的问题；优化用户体验；
 * 使用示例详见 plugin/audio/index.vue， common/router/index.js；另外需要为组件在 路由 的 beforeEach， 添加状态为前进的隐藏方法
 *
 */


import queryUtil from 'lib/json/query';
import { getUniqueId } from 'lib/util/digit';

/**
 * 定义事件存储数组
 */
const _event_state = [];

export default class ComponentHistory {

    constructor(option) {// 初始化，支持show和hide两个方法
        this.opts = Object.assign({
                show: () => {
                },
                hide: () => {
                }
            }, option || {}
            , {
                arg: '',
                monitorDelay: false,// 是否监听浏览器前进延迟
                monitorBack: true,// 是否监听浏览器后退
                bindFn: ({ state }) => {
                    if (state && state._arg_history === this.opts.arg) {
                        if (this.opts.monitorDelay) {// 延迟显示，避免因关闭异步调用导致显示先执行
                            setTimeout(() => {
                                this.opts.show({ state: 'forward' });// 当前进键键触发时调用此回调函数
                            }, 50);
                        } else {
                            this.opts.show({ state: 'forward' });// 当前进键键触发时调用此回调函数
                        }
                    } else {
                        if (this.opts.monitorBack) {
                            this.opts.hide({ state: 'back' });// 当原生返回键触发时调用此回调函数，注：一般是关闭组件的操作
                        }
                        // 恢复监听
                        this.opts.monitorBack = true;
                    }
                }
            });

        if (_event_state.length === 0) {
            window.addEventListener('popstate', ComponentHistory.popstate, false);
        }

        _event_state.push(this.opts.bindFn);
    }

    /**
     * 创建新记录
     */
    push(_arg_history) {
        this.opts.arg = getUniqueId();
        const query = queryUtil.parse(location.href.split('?')[1] || '');
        window.history[`${!!query._arg_history && query._arg_history === _arg_history ? 'replaceState' : 'pushState'}`](
            { _arg_history: this.opts.arg },
            _arg_history,
            queryUtil.url(location.href, { _arg_history })
        );
        return new Promise(reject => {
            reject(this.opts.show);
        });
    }

    /*****
     * 回退
     */
    back(forward) {
        if (!forward) {
            this.opts.monitorBack = false;
            window.history.back();
        }

        this.opts.monitorDelay = true;

        return new Promise(reject => {
            reject(this.opts.hide);
        });
    }

    /****
     * 监听前进事件
     */
    static popstate(opts) {
        _event_state.forEach(fn => fn(opts));
    }

    /*****
     * 清除首页次进来，浏览器携带的_arg_history参数
     */
    static clearHistory() {
        const urls = location.href.split('?');
        const query = queryUtil.parse(urls[1] || '');
        if (!!query._arg_history) {
            delete query._arg_history;
            setTimeout(() => {
                window.history.replaceState(
                    {},
                    '',
                    urls[0] + `${Object.keys(query).length > 0 ? '?' + queryUtil.stringify(query) : ''}`
                );
            }, 50);
        }
    }

    /***
     * 销毁
     */
    destroy() {
        const index = _event_state.indexOf(this.opts.bindFn);
        if (index > -1) {
            _event_state.splice(index, 1);
        }

        if (_event_state.length === 0) {
            window.removeEventListener('popstate', ComponentHistory.popstate, false);
        }

        this.opts = null;
        this.isAndroid = null;
    }
}
