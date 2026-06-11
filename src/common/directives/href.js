import { getUniqueId } from 'lib/util/digit';
import closest from 'lib/dom/closest';
import { clientRouter } from 'common/router';
import env from 'lib/comp/env';
import { $broadcast } from 'common/util/global-properties';
import { isUndefined, isObject, isNumber } from 'lib/util/dataType';
import query from 'lib/json/query';
import { toLogin, isLogin } from 'common/util';

const _vHrefList = {};

/*******
 * v-href指令
 * 支持router.push：v-href="'login'",或者v-href="{path: 'login', query: {}}"
 * 支持router.go：v-href="-1||1" === router.go(-1||1)
 * 支持router.replace：v-href.replace="'login'",或者v-href.replace="{path: 'login', query: {}}"
 * 支持v-href.verify模式，会验证是否登录，没登录会弹出登录
 * 支持v-href.login模式，登录成功后，回到原页面
 * 支持v-href.refresh模式，重复页面点击，会派发refresh事件
 * 支持v-href.report模式，点击上报，也可以v-href配合data-report使用，跳转的同时，也会上报
 * @param ev
 * @private
 */
if (env.isClient()) {
    document.body.addEventListener('click', bodyClickJump, false);

    clientRouter.afterEach(to => {
        Object.keys(_vHrefList).forEach(k => {
            const obj = _vHrefList[k];
            if (obj.stop) {
                if (to.matched[0].path === obj.page) {
                    obj.el.addEventListener('click', bodyClickJump);
                } else {
                    obj.el.removeEventListener('click', bodyClickJump);
                }
            }
        });
    });
}

/******
 * 设置参数
 * @param res
 * @param obj
 * @private
 */
function _changeHref(res, obj) {
    if (isObject(res)) {
        obj.path = res.path;
        obj.query = res.query;
    } else {
        obj.path = res || '';
        if (isNumber(res)) {
            obj.type = 'go';
        }
    }

    if (obj.type !== 'go' && obj.path.indexOf('http') === 0) {
        obj.type = 'http';
    }

    const isExclude = !['go', 'http', 'report'].includes(obj.type);

    if (isExclude && obj.path.substr(0, 1) !== '/') {
        obj.path = '/' + obj.path;
    }

    if (isExclude) {
        const qs = obj.path.split('?');
        obj.query = Object.assign(obj.query, query.parse(qs[1]) || {});
        obj.path = qs[0];
    }

    return obj;
}

/*******
 * 跳转
 * @param obj
 * @private
 */
function _assign(obj) {
    if (obj.type === 'post') {
        if (window.top !== window.self) {
            window.top?.postMessage({
                options: obj.post,
                type: 'push'
            }, '*');
            return false;
        }
        obj.type = 'push';
    }

    if ((obj.verify && !isLogin()) || obj.login) {
        if (!location.pathname.includes('/login')) {
            return toLogin();
        }
    } else if (obj.type === 'push') {
        if (obj.refresh && location.pathname === obj.path) {
            $broadcast.emit('refresh');
        } else {
            clientRouter.push({ path: obj.path, query: obj.query });
        }
    } else if (obj.type === 'replace') {
        clientRouter.replace({ path: obj.path, query: obj.query });
    } else if (obj.type === 'go') {
        clientRouter.go(obj.path);
    } else if (obj.type === 'http') {
        window.open(query.url(obj.path, obj.query));
    }
}

let _bindMap = {
    node: null,
    obj: null
};

/*********
 * 获取node
 * @param node
 * @returns {*}
 * @private
 */
function _getVNode(node) {

    if (_bindMap.node === node) {
        return _bindMap.obj;
    }

    let key = node.dataset.vkey;
    let report = node.dataset.report;
    let post = node.dataset.post;

    if (!key) {
        const rNode = closest(node, '[data-vkey]');
        if (rNode) {
            key = rNode.dataset.vkey;
            report = rNode.dataset.report;
            post = rNode.dataset.post;
        }
    }

    let obj = _vHrefList[key];

    if (obj) {
        obj = { ...obj, report, post };
        _bindMap.node = node;
        _bindMap.obj = obj;
        _bindMap.post = post;
        setTimeout(() => {
            _bindMap.node = null;
            _bindMap.obj = null;
            _bindMap.post = null;
        }, 300);
    }

    return obj;
}

/*******
 * 下一步
 * @param ev
 * @private
 */
function bodyClickJump(ev) {

    window.__event_position__ = ev.target.cloneNode(true).outerHTML;
    const obj = _getVNode(ev.target);

    if (!obj) {
        return;
    }

    ev.stopPropagation();

    if (obj.lazy) {
        setTimeout(() => {
            _assign(obj);
        }, 20);
    } else {
        _assign(obj);
    }
}

function _createHref(el, binding, res) {
    const key = getUniqueId();
    const obj = {
        lazy: binding.modifiers.lazy,
        verify: binding.modifiers.verify,
        login: binding.modifiers.login,
        refresh: binding.modifiers.refresh,
        query: {},
        type: 'push'
    };

    if (binding.modifiers.replace) {
        obj.type = 'replace';
    } else if (binding.modifiers.report) {
        obj.type = 'report';
    } else if (binding.modifiers.post) {// 是否发送postMessage
        obj.type = 'post';
    }

    _changeHref(res, obj);

    _vHrefList[key] = obj;
    el.dataset.vkey = key;
    if (binding.modifiers.stop) {
        console.log(clientRouter.currentRoute);
        _vHrefList[key].page = clientRouter.currentRoute._value.matched[0].path;
        _vHrefList[key].stop = true;
        _vHrefList[key].el = el;
        el.addEventListener('click', bodyClickJump);
    }
    return obj;
}


export default env.isServer() ? {} : {
    // 在绑定元素的 attribute 前
    // 或事件监听器应用前调用
    created(el, binding) {
        const res = binding.value;
        if ((res === '' || isUndefined(res)) && !binding.modifiers.login) return;
        _createHref(el, binding, res);
    },
    // 在元素被插入到 DOM 前调用
    beforeMount(el, binding, vnode, prevVnode) {
    },
    // 在绑定元素的父组件
    // 及他自己的所有子节点都挂载完成后调用
    mounted(el, binding, vnode, prevVnode) {
    },
    // 绑定元素的父组件更新前调用
    beforeUpdate(el, binding, vnode, prevVnode) {
    },
    // 在绑定元素的父组件
    // 及他自己的所有子节点都更新后调用
    updated(el, binding) {
        const res = binding.value;
        const key = el.dataset.vkey;
        if ((res === '' || isUndefined(res)) && !binding.modifiers.login) {
            delete _vHrefList[key];
            return;
        }
        const obj = _vHrefList[key];
        if (obj) {
            _changeHref(res, obj);
        } else {
            _createHref(el, binding, res);
        }
    },
    // 绑定元素的父组件卸载前调用
    beforeUnmount(el, binding, vnode, prevVnode) {

    },
    // 绑定元素的父组件卸载后调用
    unmounted(el, binding, vnode, prevVnode) {
    }
};