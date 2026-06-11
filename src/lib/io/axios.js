/**
 * 重写axios功能，更方便使用。
 *
 * 例子：
 *
 * import axios from "lib/io/axios";
 * axios({})||axios.post(url,data)||axios.get(url,data);
 *
 *
 */

import query from '../json/query';
import merge from '../json/merge';
import axios_http from 'axios';
import { bus } from 'lib/comp/bus';
import storage from 'lib/util/storage';
import md5 from 'lib/str/md5';

import { isObject, isFunction, isString, isNumber, isPromise, isArray } from '../util/dataType';

let _options = {
    url: '',
    timeout: 30 * 1000,
    data: null,
    rely: false,
    serialize: false,
    before: function() {
    },
    success: function() {
    },
    fail: function() {
    },
    complete: function() {
    },
    method: 'get',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
    }
};

let instance = axios_http.create(_options);

let _defaults = {};
let _asyncLock = {
    locks: {},
    add(opts) {
        this.locks[_getKeyId(opts)] = true;
    },
    remove(opts) {
        delete this.locks[_getKeyId(opts)];
    },
    has(opts) {
        return this.locks[_getKeyId(opts)];
    }
};

const _getKeyId = opts => {
    const obj = Object.assign({}, opts.data || {}, opts.params || {});
    return md5(query.url(opts.url, obj));
};

const _cacheLRU = {
    key: '__cache_lru__',
    max: 50,
    get(opts) {
        this.clear();
        const obj = storage.get(this.key) || {};
        const res = obj[_getKeyId(opts)];
        if (res) {
            return res.data;
        }
        return null;
    },
    set(opts, res, time) {
        const obj = storage.get(this.key) || {};
        if (Object.keys(obj).length <= this.max) {
            obj[_getKeyId(opts)] = {
                data: res,
                date: Date.now() + (time || 24 * 7) * 60 * 60 * 1000
            };
            storage.set(this.key, obj);
        }
    },
    clear() {
        const obj = storage.get(this.key) || {};
        const now = Date.now();
        Object.keys(obj).forEach(k => {
            const res = obj[k];
            if (res.date < now) {
                delete obj[k];
            }
        });
        storage.set(this.key, obj);
    }
};

const _requestMQ = {
    map: {},
    mq: [],
    running: [],
    INIT_MAX_REQUEST: 10000,
    MAX_REQUEST: 10000,
    timer: null,
    push: function push(param) {
        param.t = +new Date();
        while (this.mq.indexOf(param.t) > -1 || this.running.indexOf(param.t) > -1) {
            param.t += (Math.random() * 10) >> 0;
        }
        this.mq.push(param.t);
        this.map[param.t] = param;
    },
    next: function next() {
        var me = this;
        if (this.mq.length === 0) return;
        if (this.running.length < this.MAX_REQUEST - 1) {
            var newone = this.mq.shift();
            var obj = this.map[newone];
            if (!!obj.rely) {
                this.MAX_REQUEST = 1;
            }
            var oldComplete = obj.complete;
            obj.complete = function() {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                me.running.splice(me.running.indexOf(obj.t), 1);
                delete me.map[obj.t];
                oldComplete && oldComplete.apply(obj, args);
                obj.loading && obj.loading(false);
                me.MAX_REQUEST = me.INIT_MAX_REQUEST;
                me.next();

                clearTimeout(me.timer);
                me.timer = setTimeout(() => {
                    if (me.running.length === 0) {//当前数据集合请求结束
                        bus.$emit('LOADED');
                    }
                }, 100);
            };
            this.running.push(obj.t);
            obj.loading && obj.loading(true);
            return _http(obj);
        }
    },
    request: function request(obj) {
        obj = obj || {};
        obj = isString(obj) ? { url: obj } : obj;

        this.push(obj);

        return this.next();
    }
};

function _response(opts, res) {
    _asyncLock.remove(opts);

    if (res.status === 200) {
        _intercept(opts, res, 'success');
    } else {
        const response = res.response ? res.response : res;
        let status = response.status;
        console.log(status === 0 ? '已经中断！' : '请求[' + opts.url + ']失败，状态码为' + (status || res.status || 500));

        if (!res.data) {
            res.data = { code: (status || res.status || 500) };
        }

        _intercept(opts, res, 'fail');
    }
}

function _intercept(opts, data, type) {
    data.key = opts.key;
    data.timestamp = opts.timestamp;
    if (type === 'fail') {
        let err = isFunction(_defaults.fail) ? _defaults.fail(data) : data;
        opts.fail(err);
        opts.complete(err);
        opts.__reject(err);
        if (isFunction(_defaults.complete)) {
            _defaults.complete(Object.assign(data, err));
        }
        return;
    } else if (type === 'success') {
        let suc = isFunction(_defaults.success) ? _defaults.success(data, opts) : data;
        if (isPromise(suc)) {
            suc.catch(r => {
                opts.fail(r);
                opts.complete(r);
                opts.__reject(r);
            });
        } else if (suc === false) {
            opts.complete(data);
        } else {
            opts.success(suc);
            opts.complete(suc);
            opts.__resolve(suc);
            if (opts.cacheURL?.cache?.cache) {
                _cacheLRU.set(opts, suc, opts.cacheURL.cache.time);
            }
        }
    }

    if (isFunction(_defaults.complete)) {
        _defaults.complete(data);
    }
}

function _http(opts) {
    instance(opts)
        .then((res) => {
            _response(opts, res);
        })
        .catch((res) => {
            _response(opts, res);
        });

    !!opts.config.lock && _asyncLock.add(opts);

    if (isNumber(opts.config.lock) && opts.config.lock > 0) {
        setTimeout(() => {
            _asyncLock.remove(opts);
        }, opts.config.lock * 1000);
    }
}

function axios(opts) {
    return new Promise((resolve, reject) => {
        if (isString(opts)) {
            opts = { url: opts };
        }

        opts = merge(true, {}, _defaults.options, opts);

        opts.key = Math.round(Math.random() * 100 + Date.now());
        opts.timestamp = Date.now();

        if (isString(opts.method)) {
            opts.method = opts.method.toLocaleString();
        }

        if (opts.args) {
            opts.url = opts.args[0];
            if (opts.method === 'delete' || opts.method === 'get') {
                Object.assign(opts, opts.args[1] || {});
            } else {
                Object.assign(opts, { data: opts.args[1] || {} }, opts.args[2] || {});
            }
            delete opts.args;
        }

        opts.config = {
            loading: isFunction(opts.loading) ? opts.loading : undefined, // 配合按钮使用
            wait: opts.wait, // 是否wait,默认为false
            alert: opts.alert, // 是否有默认错误提示，默认为true
            lock: opts.lock // 是否请求锁定,默认为false
        };

        if (isString(this)) {
            opts.config[this] = true;
        }

        if (isObject(opts.url)) {
            const obj = Object.assign({}, opts.url);
            opts.cacheURL = { ...obj };
            opts.url = (obj.proxy || '') + obj.url;
            delete obj.url;
        }

        opts.url = (opts.url || '').replace(/\{\s*(\w*)\s*\}/g, res => {
            const key = res.replace(/\{|\}/g, '').trim();
            const val = opts.params[key];
            delete opts.params[key];
            return val;
        });

        if (opts.data && opts.serialize) {
            opts.data = query.stringify(opts.data);
        }

        if (isFunction(_defaults.config)) {
            opts = _defaults.config(opts) || opts;
        }

        if (isFunction(opts.before)) {
            opts = opts.before(opts) || opts;
        }

        if (opts.cacheURL?.cache?.cache) {
            const obj = _cacheLRU.get(opts);
            if (obj) {
                opts.success(obj);
                if (isFunction(_defaults.complete)) {
                    _defaults.complete({
                        key: opts.key,
                        timestamp: opts.timestamp,
                        data: obj
                    }, opts);
                }
                resolve(obj);
                return;
            }
        }

        opts.__resolve = resolve;
        opts.__reject = reject;

        if (!!opts.config.lock && _asyncLock.has(opts)) {
            _intercept(opts, { status: 9999, data: { code: 9999, msg: '请勿重复请求！' } }, 'fail');
            return;
        }

        _requestMQ.request(opts);
    });
}

axios.create = (opts) => {
    instance = axios_http.create(opts);
    _defaults.options = merge(true, {}, _options, opts);

    return axios;
};

axios.intercept = (o) => {
    _defaults.config = o.config;
    _defaults.success = o.success;
    _defaults.fail = o.fail;
    _defaults.complete = o.complete;
};

axios.request = function(option) {
    return axios.call(option, { method: 'request', args: [option] });
};

axios.reset = function(option) {
    if (isArray(option)) {
        option.forEach(item => _requestMQ.request(isFunction(_defaults.config) ? _defaults.config(item) || item : item));
    } else {
        _requestMQ.request(isFunction(_defaults.config) ? _defaults.config(option) || option : option);
    }
};

axios.awaitTo = function(promise) {
    if (isPromise(promise)) {
        return promise.then(res => [res, null]).catch(err => [null, err]);
    }
    return Promise.resolve([null, null]);
};

['get', 'delete', 'post', 'patch', 'put'].forEach((method) => {
    axios[method] = function(...args) {
        return axios.call(this === axios ? (method === 'get' || method === 'delete' ? args[1] : args[2]) : this, {
            args: args,
            method
        });
    };
});

['wait', 'lock'].forEach((r) => {
    axios[r] = {
        get: axios.get.bind(r),
        delete: axios.delete.bind(r),
        post: axios.post.bind(r),
        patch: axios.patch.bind(r),
        put: axios.put.bind(r)
    };
});

export default axios;
