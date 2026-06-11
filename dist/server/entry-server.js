import { renderToString, ssrGetDirectiveProps, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderSlot, ssrRenderStyle, ssrRenderVNode } from "vue/server-renderer";
import { Fragment, KeepAlive, createApp, createBlock, createCommentVNode, createSSRApp, createVNode, mergeProps, openBlock, ref, renderList, resolveComponent, resolveDirective, resolveDynamicComponent, toDisplayString, useSSRContext, withCtx, withModifiers } from "vue";
import axios_http from "axios";
import cookie from "js-cookie";
import { createStore } from "vuex";
import { createMemoryHistory, createRouter, createWebHistory } from "vue-router";
//#region src/views/app/App.vue
var _sfc_main$14 = {
	__name: "App",
	__ssrInlineRender: true,
	setup(__props) {
		const isRouterShow = ref(true);
		return (_ctx, _push, _parent, _attrs) => {
			const _component_router_view = resolveComponent("router-view");
			if (isRouterShow.value) _push(ssrRenderComponent(_component_router_view, _attrs, {
				default: withCtx(({ Component, route }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(``);
						if (route.meta.cache) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(Component), { key: route.meta.key }, null), _parent, _scopeId);
						else _push(`<!---->`);
						if (!route.meta.cache) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(Component), null, null), _parent, _scopeId);
						else _push(`<!---->`);
					} else return [(openBlock(), createBlock(KeepAlive, { max: 2 }, [route.meta.cache ? (openBlock(), createBlock(resolveDynamicComponent(Component), { key: route.meta.key })) : createCommentVNode("", true)], 1024)), !route.meta.cache ? (openBlock(), createBlock(resolveDynamicComponent(Component), { key: 0 })) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			else _push(`<!---->`);
		};
	}
};
var _sfc_setup$14 = _sfc_main$14.setup;
_sfc_main$14.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/views/app/App.vue");
	return _sfc_setup$14 ? _sfc_setup$14(props, ctx) : void 0;
};
//#endregion
//#region src/lib/json/query.js
/**
* 对对象和字符串处理
* parse a=1&b=2 => {a:1, b: 2}
* stringify {a:1, b: 2} => a=1&b=2
*/
var query_default = {
	parse(qs, sep, eq, options) {
		sep = sep || "&";
		eq = eq || "=";
		let obj = {};
		if (typeof qs !== "string" || qs.length === 0) return obj;
		let regexp = /\+/g;
		qs = qs.split(sep);
		let maxKeys = 1e3;
		if (options && typeof options.maxKeys === "number") maxKeys = options.maxKeys;
		let len = qs.length;
		if (maxKeys > 0 && len > maxKeys) len = maxKeys;
		for (let i = 0; i < len; ++i) {
			let x = qs[i].replace(regexp, "%20"), idx = x.indexOf(eq), kstr, vstr, k, v;
			if (idx >= 0) {
				kstr = x.substr(0, idx);
				vstr = x.substr(idx + 1);
			} else {
				kstr = x;
				vstr = "";
			}
			k = decodeURIComponent(kstr);
			v = decodeURIComponent(vstr);
			if (!Object.prototype.hasOwnProperty.call(obj, k)) obj[k] = v;
			else if (Array.isArray(obj[k])) obj[k].push(v);
			else obj[k] = [obj[k], v];
		}
		return obj;
	},
	stringify(obj, sep, eq, name) {
		sep = sep || "&";
		eq = eq || "=";
		if (obj === null) obj = void 0;
		const _stringifyPrimitive = function(v) {
			switch (typeof v) {
				case "string": return v;
				case "boolean": return v ? "true" : "false";
				case "number": return isFinite(v) ? v : "";
				default: return "";
			}
		};
		if (typeof obj === "object") return Object.keys(obj).map(function(k) {
			let ks = encodeURIComponent(_stringifyPrimitive(k)) + eq;
			if (Array.isArray(obj[k])) return obj[k].map(function(v) {
				return ks + encodeURIComponent(_stringifyPrimitive(v));
			}).join(sep);
			else return ks + encodeURIComponent(_stringifyPrimitive(obj[k]));
		}).join(sep);
		if (!name) return "";
		return encodeURIComponent(_stringifyPrimitive(name)) + eq + encodeURIComponent(_stringifyPrimitive(obj));
	},
	url(url = "", obj) {
		const arr = url.split("?");
		const path = arr[0];
		const params = this.parse(arr[1] || "");
		obj = typeof obj === "string" ? this.parse(obj) : obj;
		return path + "?" + this.stringify(Object.assign(params, obj));
	}
};
//#endregion
//#region src/lib/util/dataType.js
/***********
* 数据类型
* @type {obj}
*/
var getType = (obj) => Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
var isNumber = (obj) => getType(obj) === "number";
var isString = (obj) => getType(obj) === "string";
var isArray = (obj) => getType(obj) === "array";
var isObject = (obj) => getType(obj) === "object";
var isFunction = (obj) => getType(obj) === "function";
var isNull = (obj) => getType(obj) === "null";
var isUndefined = (obj) => getType(obj) === "undefined";
var isPromise = (obj) => getType(obj) === "promise";
var isNode = (node) => !isNull(node) && !isUndefined(node) && Boolean(node.nodeName) && Boolean(node.nodeType);
//#endregion
//#region src/lib/json/merge.js
/**
* 合并多个对象，将后面的对象和前面的对象一层一层的合并
* 支持第一个参数传boolean类型，当传true时，支持深层合并
* 例子：
*
* import merge from "../json/merge";
* var opts = { url: "http://www.baidu.com" };
* var defaultOpts = { url: "", method: "get" };
* opts = merge(defaultOpts, opts);
* opts的值为：
* opts = {
*     url: "http://www.baidu.com",
*     method: "get"
* }
*
*/
function merge_default(...args) {
	let isDeep = false;
	let result = {};
	function merge(r, obj) {
		for (let k in obj) {
			let v1 = r[k], v2 = obj[k];
			if (isDeep && (isObject(v1) && isObject(v2) || isArray(v1) && isArray(v2))) merge(v1, v2);
			else r[k] = v2;
		}
	}
	args.forEach((item, index) => {
		if (index === 0 && item === true) isDeep = true;
		else if (isObject(item)) merge(result, item);
	});
	return result;
}
//#endregion
//#region src/lib/util/digit.js
/******
*生成随机数
*
******/
var _uniqueID = 20200611;
var getZIndex = () => _uniqueID++;
var getUniqueId = () => "COMP_UNIQUE_" + _uniqueID++;
var getRandom = (len) => {
	let result = "";
	let range = len || 16;
	let arrData = [
		"0",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"a",
		"b",
		"c",
		"d",
		"e",
		"f",
		"g",
		"h",
		"i",
		"j",
		"k",
		"l",
		"m",
		"n",
		"o",
		"p",
		"q",
		"r",
		"s",
		"t",
		"u",
		"v",
		"w",
		"x",
		"y",
		"z",
		"A",
		"B",
		"C",
		"D",
		"E",
		"F",
		"G",
		"H",
		"I",
		"J",
		"K",
		"L",
		"M",
		"N",
		"O",
		"P",
		"Q",
		"R",
		"S",
		"T",
		"U",
		"V",
		"W",
		"X",
		"Y",
		"Z"
	];
	for (let i = 0; i < range; i++) {
		let pos = Math.round(Math.random() * (arrData.length - 1));
		result += arrData[pos];
	}
	return result;
};
//#endregion
//#region src/lib/util/lock.js
/***********
* 全局锁
*/
var _isLockMap = { _isLock: false };
var isLock = (uniqueId = "_isLock") => {
	return _isLockMap[uniqueId];
};
var unLock = (uniqueId = "_isLock") => {
	_isLockMap[uniqueId] = false;
};
var lock = (uniqueId = "_isLock") => {
	_isLockMap[uniqueId] = true;
};
//#endregion
//#region src/lib/comp/bus.js
var _events$1 = {};
var bus = {
	$on: (evtType, handler, isOnce) => {
		if (typeof handler !== "function") return;
		if (!_events$1[evtType]) _events$1[evtType] = [];
		var flat = true;
		const len = _events$1[evtType].length;
		for (let i = 0; i < len; i++) if (_events$1[evtType][i].fn === handler) {
			flat = false;
			break;
		}
		flat && _events$1[evtType].push({
			once: !!isOnce,
			fn: handler
		});
	},
	$off: (evtType, handler) => {
		if (!_events$1[evtType]) return;
		const len = _events$1[evtType].length;
		for (let i = 0; i < len; i++) if (_events$1[evtType][i].fn === handler) {
			_events$1[evtType].splice(i, 1);
			break;
		}
		if (_events$1[evtType].length === 0) delete _events$1[evtType];
	},
	$emit: (evtType, data, timer) => {
		if (!_events$1[evtType]) return;
		if (isNumber(timer) && timer > 0) {
			if (isLock(evtType)) return;
			lock(evtType);
			setTimeout(() => {
				unLock(evtType);
			}, timer);
		}
		const arr = [];
		_events$1[evtType].forEach((item) => {
			if (!item.once) arr.push(item);
			item.fn(data);
		});
		_events$1[evtType] = arr;
	},
	$once: (evtType, handler) => {
		bus.$on(evtType, handler, true);
	},
	$clear: (evtType) => {
		delete _events$1[evtType];
	},
	getEvents() {
		return _events$1;
	}
};
//#endregion
//#region src/lib/json/clone.js
/**
* 复制json对象，保证修改后不影响原来的对象
* 例子：
*
* var clone = require("../json/clone");
* var obj = { id: 1 };
* var objNew = clone(obj); // 修改objNew不会涉及到obj
*
*/
function clone(json) {
	let obj = null;
	if (isArray(json)) {
		obj = [];
		json.forEach((item) => {
			obj.push(clone(item));
		});
	} else if (isObject(json)) {
		obj = {};
		for (let key in json) obj[key] = clone(json[key]);
	} else return json;
	return obj;
}
//#endregion
//#region src/lib/comp/env.js
var env_default = {
	isClient() {
		return typeof window === "object";
	},
	isServer() {
		return typeof window === "undefined";
	},
	value() {
		return "server";
	},
	isProd() {
		return true;
	}
};
//#endregion
//#region src/lib/util/storage.js
/**
* 穆辰 2020/06/01.
* sessionStorage | localStorage 存储
*/
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
		json.forEach((item) => {
			obj.push(_formatNull(item, dispose));
		});
	} else if (isObject(json)) {
		obj = {};
		Object.keys(json).forEach((key) => {
			obj[key] = _formatNull(json[key], dispose);
		});
	} else {
		if (json === null && !dispose) return "__null__";
		else if (json === "__null__" && dispose) return null;
		return json;
	}
	return obj;
}
var _Storage = {
	__cache: {},
	set(key, val) {
		if (env_default.isClient()) {
			(this === "session" ? window.sessionStorage : window.localStorage).setItem(key, JSON.stringify({
				type: getType(val),
				value: _formatNull(val)
			}));
			_Storage.__cache[key] = clone(val);
		}
	},
	get(key) {
		if (env_default.isClient()) {
			if (_Storage.__cache[key] !== void 0) return clone(_Storage.__cache[key]);
			let res = (this === "session" ? window.sessionStorage : window.localStorage).getItem(key);
			if (res) {
				res = JSON.parse(res);
				_Storage.__cache[key] = _formatNull(res.value, true);
				if (res.type === "number") _Storage.__cache[key] = parseFloat(res.value);
				else if (res.type === "boolean") _Storage.__cache[key] = res.value === "true";
				return _Storage.__cache[key];
			}
		}
		return null;
	},
	clear(key) {
		if (env_default.isClient()) {
			const storage = this === "session" ? window.sessionStorage : window.localStorage;
			if (typeof key === "string") {
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
			_Storage.set.call("session", key, val);
		},
		get(key) {
			return _Storage.get.call("session", key);
		},
		clear(key) {
			_Storage.clear.call("session", key);
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
			if (typeof key === "string") cookie.remove(key);
			else if (env_default.isClient()) {
				const dataArray = document.cookie.split("; ");
				for (let i = 0; i < dataArray.length; i++) {
					const key = dataArray[i].split("=")[0];
					cookie.remove(key);
				}
			}
		}
	}
};
//#endregion
//#region src/lib/str/md5.js
/**
* Add integers, wrapping at 2^32.
* This uses 16-bit operations internally to work around bugs in interpreters.
*
* @param {number} x First integer
* @param {number} y Second integer
* @returns {number} Sum
*/
function safeAdd(x, y) {
	var lsw = (x & 65535) + (y & 65535);
	return (x >> 16) + (y >> 16) + (lsw >> 16) << 16 | lsw & 65535;
}
/**
* Bitwise rotate a 32-bit number to the left.
*
* @param {number} num 32-bit number
* @param {number} cnt Rotation count
* @returns {number} Rotated number
*/
function bitRotateLeft(num, cnt) {
	return num << cnt | num >>> 32 - cnt;
}
/**
* Basic operation the algorithm uses.
*
* @param {number} q q
* @param {number} a a
* @param {number} b b
* @param {number} x x
* @param {number} s s
* @param {number} t t
* @returns {number} Result
*/
function md5cmn(q, a, b, x, s, t) {
	return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
/**
* Basic operation the algorithm uses.
*
* @param {number} a a
* @param {number} b b
* @param {number} c c
* @param {number} d d
* @param {number} x x
* @param {number} s s
* @param {number} t t
* @returns {number} Result
*/
function md5ff(a, b, c, d, x, s, t) {
	return md5cmn(b & c | ~b & d, a, b, x, s, t);
}
/**
* Basic operation the algorithm uses.
*
* @param {number} a a
* @param {number} b b
* @param {number} c c
* @param {number} d d
* @param {number} x x
* @param {number} s s
* @param {number} t t
* @returns {number} Result
*/
function md5gg(a, b, c, d, x, s, t) {
	return md5cmn(b & d | c & ~d, a, b, x, s, t);
}
/**
* Basic operation the algorithm uses.
*
* @param {number} a a
* @param {number} b b
* @param {number} c c
* @param {number} d d
* @param {number} x x
* @param {number} s s
* @param {number} t t
* @returns {number} Result
*/
function md5hh(a, b, c, d, x, s, t) {
	return md5cmn(b ^ c ^ d, a, b, x, s, t);
}
/**
* Basic operation the algorithm uses.
*
* @param {number} a a
* @param {number} b b
* @param {number} c c
* @param {number} d d
* @param {number} x x
* @param {number} s s
* @param {number} t t
* @returns {number} Result
*/
function md5ii(a, b, c, d, x, s, t) {
	return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}
/**
* Calculate the MD5 of an array of little-endian words, and a bit length.
*
* @param {Array} x Array of little-endian words
* @param {number} len Bit length
* @returns {Array<number>} MD5 Array
*/
function binlMD5(x, len) {
	x[len >> 5] |= 128 << len % 32;
	x[(len + 64 >>> 9 << 4) + 14] = len;
	var i;
	var olda;
	var oldb;
	var oldc;
	var oldd;
	var a = 1732584193;
	var b = -271733879;
	var c = -1732584194;
	var d = 271733878;
	for (i = 0; i < x.length; i += 16) {
		olda = a;
		oldb = b;
		oldc = c;
		oldd = d;
		a = md5ff(a, b, c, d, x[i], 7, -680876936);
		d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
		c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
		b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
		a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
		d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
		c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
		b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
		a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
		d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
		c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
		b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
		a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
		d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
		c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
		b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
		a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
		d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
		c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
		b = md5gg(b, c, d, a, x[i], 20, -373897302);
		a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
		d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
		c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
		b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
		a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
		d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
		c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
		b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
		a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
		d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
		c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
		b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
		a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
		d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
		c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
		b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
		a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
		d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
		c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
		b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
		a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
		d = md5hh(d, a, b, c, x[i], 11, -358537222);
		c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
		b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
		a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
		d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
		c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
		b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
		a = md5ii(a, b, c, d, x[i], 6, -198630844);
		d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
		c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
		b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
		a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
		d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
		c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
		b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
		a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
		d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
		c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
		b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
		a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
		d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
		c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
		b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
		a = safeAdd(a, olda);
		b = safeAdd(b, oldb);
		c = safeAdd(c, oldc);
		d = safeAdd(d, oldd);
	}
	return [
		a,
		b,
		c,
		d
	];
}
/**
* Convert an array of little-endian words to a string
*
* @param {Array<number>} input MD5 Array
* @returns {string} MD5 string
*/
function binl2rstr(input) {
	var i;
	var output = "";
	var length32 = input.length * 32;
	for (i = 0; i < length32; i += 8) output += String.fromCharCode(input[i >> 5] >>> i % 32 & 255);
	return output;
}
/**
* Convert a raw string to an array of little-endian words
* Characters >255 have their high-byte silently ignored.
*
* @param {string} input Raw input string
* @returns {Array<number>} Array of little-endian words
*/
function rstr2binl(input) {
	var i;
	var output = [];
	output[(input.length >> 2) - 1] = void 0;
	for (i = 0; i < output.length; i += 1) output[i] = 0;
	var length8 = input.length * 8;
	for (i = 0; i < length8; i += 8) output[i >> 5] |= (input.charCodeAt(i / 8) & 255) << i % 32;
	return output;
}
/**
* Calculate the MD5 of a raw string
*
* @param {string} s Input string
* @returns {string} Raw MD5 string
*/
function rstrMD5(s) {
	return binl2rstr(binlMD5(rstr2binl(s), s.length * 8));
}
/**
* Calculates the HMAC-MD5 of a key and some data (raw strings)
*
* @param {string} key HMAC key
* @param {string} data Raw input string
* @returns {string} Raw MD5 string
*/
function rstrHMACMD5(key, data) {
	var i;
	var bkey = rstr2binl(key);
	var ipad = [];
	var opad = [];
	var hash;
	ipad[15] = opad[15] = void 0;
	if (bkey.length > 16) bkey = binlMD5(bkey, key.length * 8);
	for (i = 0; i < 16; i += 1) {
		ipad[i] = bkey[i] ^ 909522486;
		opad[i] = bkey[i] ^ 1549556828;
	}
	hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
	return binl2rstr(binlMD5(opad.concat(hash), 640));
}
/**
* Convert a raw string to a hex string
*
* @param {string} input Raw input string
* @returns {string} Hex encoded string
*/
function rstr2hex(input) {
	var hexTab = "0123456789abcdef";
	var output = "";
	var x;
	var i;
	for (i = 0; i < input.length; i += 1) {
		x = input.charCodeAt(i);
		output += hexTab.charAt(x >>> 4 & 15) + hexTab.charAt(x & 15);
	}
	return output;
}
/**
* Encode a string as UTF-8
*
* @param {string} input Input string
* @returns {string} UTF8 string
*/
function str2rstrUTF8(input) {
	return unescape(encodeURIComponent(input));
}
/**
* Encodes input string as raw MD5 string
*
* @param {string} s Input string
* @returns {string} Raw MD5 string
*/
function rawMD5(s) {
	return rstrMD5(str2rstrUTF8(s));
}
/**
* Encodes input string as Hex encoded string
*
* @param {string} s Input string
* @returns {string} Hex encoded string
*/
function hexMD5(s) {
	return rstr2hex(rawMD5(s));
}
/**
* Calculates the raw HMAC-MD5 for the given key and data
*
* @param {string} k HMAC key
* @param {string} d Input string
* @returns {string} Raw MD5 string
*/
function rawHMACMD5(k, d) {
	return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d));
}
/**
* Calculates the Hex encoded HMAC-MD5 for the given key and data
*
* @param {string} k HMAC key
* @param {string} d Input string
* @returns {string} Raw MD5 string
*/
function hexHMACMD5(k, d) {
	return rstr2hex(rawHMACMD5(k, d));
}
/**
* Calculates MD5 value for a given string.
* If a key is provided, calculates the HMAC-MD5 value.
* Returns a Hex encoded string unless the raw argument is given.
*
* @param {string} string Input string
* @param {string} [key] HMAC key
* @param {boolean} [raw] Raw output switch
* @returns {string} MD5 output
*/
function md5_default(string, key, raw) {
	if (!key) {
		if (!raw) return hexMD5(string);
		return rawMD5(string);
	}
	if (!raw) return hexHMACMD5(key, string);
	return rawHMACMD5(key, string);
}
//#endregion
//#region src/lib/io/axios.js
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
var _options = {
	url: "",
	timeout: 30 * 1e3,
	data: null,
	rely: false,
	serialize: false,
	before: function() {},
	success: function() {},
	fail: function() {},
	complete: function() {},
	method: "get",
	headers: {
		"X-Requested-With": "XMLHttpRequest",
		"Content-Type": "application/json"
	}
};
var instance$1 = axios_http.create(_options);
var _defaults = {};
var _asyncLock = {
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
var _getKeyId = (opts) => {
	const obj = Object.assign({}, opts.data || {}, opts.params || {});
	return md5_default(query_default.url(opts.url, obj));
};
var _cacheLRU = {
	key: "__cache_lru__",
	max: 50,
	get(opts) {
		this.clear();
		const res = (_Storage.get(this.key) || {})[_getKeyId(opts)];
		if (res) return res.data;
		return null;
	},
	set(opts, res, time) {
		const obj = _Storage.get(this.key) || {};
		if (Object.keys(obj).length <= this.max) {
			obj[_getKeyId(opts)] = {
				data: res,
				date: Date.now() + (time || 168) * 60 * 60 * 1e3
			};
			_Storage.set(this.key, obj);
		}
	},
	clear() {
		const obj = _Storage.get(this.key) || {};
		const now = Date.now();
		Object.keys(obj).forEach((k) => {
			if (obj[k].date < now) delete obj[k];
		});
		_Storage.set(this.key, obj);
	}
};
var _requestMQ = {
	map: {},
	mq: [],
	running: [],
	INIT_MAX_REQUEST: 1e4,
	MAX_REQUEST: 1e4,
	timer: null,
	push: function push(param) {
		param.t = +/* @__PURE__ */ new Date();
		while (this.mq.indexOf(param.t) > -1 || this.running.indexOf(param.t) > -1) param.t += Math.random() * 10 >> 0;
		this.mq.push(param.t);
		this.map[param.t] = param;
	},
	next: function next() {
		var me = this;
		if (this.mq.length === 0) return;
		if (this.running.length < this.MAX_REQUEST - 1) {
			var newone = this.mq.shift();
			var obj = this.map[newone];
			if (!!obj.rely) this.MAX_REQUEST = 1;
			var oldComplete = obj.complete;
			obj.complete = function() {
				for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
				me.running.splice(me.running.indexOf(obj.t), 1);
				delete me.map[obj.t];
				oldComplete && oldComplete.apply(obj, args);
				obj.loading && obj.loading(false);
				me.MAX_REQUEST = me.INIT_MAX_REQUEST;
				me.next();
				clearTimeout(me.timer);
				me.timer = setTimeout(() => {
					if (me.running.length === 0) bus.$emit("LOADED");
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
	if (res.status === 200) _intercept(opts, res, "success");
	else {
		let status = (res.response ? res.response : res).status;
		console.log(status === 0 ? "已经中断！" : "请求[" + opts.url + "]失败，状态码为" + (status || res.status || 500));
		if (!res.data) res.data = { code: status || res.status || 500 };
		_intercept(opts, res, "fail");
	}
}
function _intercept(opts, data, type) {
	data.key = opts.key;
	data.timestamp = opts.timestamp;
	if (type === "fail") {
		let err = isFunction(_defaults.fail) ? _defaults.fail(data) : data;
		opts.fail(err);
		opts.complete(err);
		opts.__reject(err);
		if (isFunction(_defaults.complete)) _defaults.complete(Object.assign(data, err));
		return;
	} else if (type === "success") {
		let suc = isFunction(_defaults.success) ? _defaults.success(data, opts) : data;
		if (isPromise(suc)) suc.catch((r) => {
			opts.fail(r);
			opts.complete(r);
			opts.__reject(r);
		});
		else if (suc === false) opts.complete(data);
		else {
			opts.success(suc);
			opts.complete(suc);
			opts.__resolve(suc);
			if (opts.cacheURL?.cache?.cache) _cacheLRU.set(opts, suc, opts.cacheURL.cache.time);
		}
	}
	if (isFunction(_defaults.complete)) _defaults.complete(data);
}
function _http(opts) {
	instance$1(opts).then((res) => {
		_response(opts, res);
	}).catch((res) => {
		_response(opts, res);
	});
	opts.config.lock && _asyncLock.add(opts);
	if (isNumber(opts.config.lock) && opts.config.lock > 0) setTimeout(() => {
		_asyncLock.remove(opts);
	}, opts.config.lock * 1e3);
}
function axios(opts) {
	return new Promise((resolve, reject) => {
		if (isString(opts)) opts = { url: opts };
		opts = merge_default(true, {}, _defaults.options, opts);
		opts.key = Math.round(Math.random() * 100 + Date.now());
		opts.timestamp = Date.now();
		if (isString(opts.method)) opts.method = opts.method.toLocaleString();
		if (opts.args) {
			opts.url = opts.args[0];
			if (opts.method === "delete" || opts.method === "get") Object.assign(opts, opts.args[1] || {});
			else Object.assign(opts, { data: opts.args[1] || {} }, opts.args[2] || {});
			delete opts.args;
		}
		opts.config = {
			loading: isFunction(opts.loading) ? opts.loading : void 0,
			wait: opts.wait,
			alert: opts.alert,
			lock: opts.lock
		};
		if (isString(this)) opts.config[this] = true;
		if (isObject(opts.url)) {
			const obj = Object.assign({}, opts.url);
			opts.cacheURL = { ...obj };
			opts.url = (obj.proxy || "") + obj.url;
			delete obj.url;
		}
		opts.url = (opts.url || "").replace(/\{\s*(\w*)\s*\}/g, (res) => {
			const key = res.replace(/\{|\}/g, "").trim();
			const val = opts.params[key];
			delete opts.params[key];
			return val;
		});
		if (opts.data && opts.serialize) opts.data = query_default.stringify(opts.data);
		if (isFunction(_defaults.config)) opts = _defaults.config(opts) || opts;
		if (isFunction(opts.before)) opts = opts.before(opts) || opts;
		if (opts.cacheURL?.cache?.cache) {
			const obj = _cacheLRU.get(opts);
			if (obj) {
				opts.success(obj);
				if (isFunction(_defaults.complete)) _defaults.complete({
					key: opts.key,
					timestamp: opts.timestamp,
					data: obj
				}, opts);
				resolve(obj);
				return;
			}
		}
		opts.__resolve = resolve;
		opts.__reject = reject;
		if (!!opts.config.lock && _asyncLock.has(opts)) {
			_intercept(opts, {
				status: 9999,
				data: {
					code: 9999,
					msg: "请勿重复请求！"
				}
			}, "fail");
			return;
		}
		_requestMQ.request(opts);
	});
}
axios.create = (opts) => {
	instance$1 = axios_http.create(opts);
	_defaults.options = merge_default(true, {}, _options, opts);
	return axios;
};
axios.intercept = (o) => {
	_defaults.config = o.config;
	_defaults.success = o.success;
	_defaults.fail = o.fail;
	_defaults.complete = o.complete;
};
axios.request = function(option) {
	return axios.call(option, {
		method: "request",
		args: [option]
	});
};
axios.reset = function(option) {
	if (isArray(option)) option.forEach((item) => _requestMQ.request(isFunction(_defaults.config) ? _defaults.config(item) || item : item));
	else _requestMQ.request(isFunction(_defaults.config) ? _defaults.config(option) || option : option);
};
axios.awaitTo = function(promise) {
	if (isPromise(promise)) return promise.then((res) => [res, null]).catch((err) => [null, err]);
	return Promise.resolve([null, null]);
};
[
	"get",
	"delete",
	"post",
	"patch",
	"put"
].forEach((method) => {
	axios[method] = function(...args) {
		return axios.call(this === axios ? method === "get" || method === "delete" ? args[1] : args[2] : this, {
			args,
			method
		});
	};
});
["wait", "lock"].forEach((r) => {
	axios[r] = {
		get: axios.get.bind(r),
		delete: axios.delete.bind(r),
		post: axios.post.bind(r),
		patch: axios.patch.bind(r),
		put: axios.put.bind(r)
	};
});
//#endregion
//#region src/common/util/constant.js
var TOKEN = "10001";
var USER = "10002";
var UTM = "10013";
var SCROLL_POS = "10014";
var DEVICE_TYPE = "10022";
var LOADING_CHUNK = "10041";
var ROUTER_TRACK = "10050";
var SMS_CODE_TYPE = {
	register: 0,
	login: 1,
	forgotPwd: 2,
	bindPhone: 3,
	resetPwd: 4,
	changCheck: 5,
	change: 6
};
/***************************** Event事件名称中心 *****************************/
var EVENTS = {
	MEMBER_ORDER_UPDATE: "member.order.update",
	PRODUCT_COUPON_TAKE: "product.coupon.take",
	REFRESH_RENDER_DATA: "refresh.render.data",
	REQUEST_DONE: "request.done",
	IMAGE_DONE: "image.done",
	VIDEO_MUTED: "video.muted",
	REFRESH_PAGE: "refresh.page",
	CLEAR_CACHE: "clear.cache",
	MESSAGE: "event.message"
};
var SYSTEM_USER_PLATFORM_VERSION = "1.0.0";
var ORDER_STATUS_MAP = {
	cancel: 0,
	nopaid: 1,
	noshipping: 2,
	shippinged: 3,
	complete: 4,
	canceling: 10,
	shippingedpart: 11,
	checked: 9,
	noconfirmpaid: 12,
	commented: 13,
	presalepay: 14,
	pretimeout: 15
};
ORDER_STATUS_MAP.cancel, ORDER_STATUS_MAP.nopaid, ORDER_STATUS_MAP.noshipping, ORDER_STATUS_MAP.shippinged, ORDER_STATUS_MAP.complete, ORDER_STATUS_MAP.checked, ORDER_STATUS_MAP.canceling, ORDER_STATUS_MAP.shippingedpart, ORDER_STATUS_MAP.noconfirmpaid, ORDER_STATUS_MAP.commented, ORDER_STATUS_MAP.presalepay, ORDER_STATUS_MAP.pretimeout;
/***************************** 售后相关 *****************************/
var ORDER_REFUND_TYPE = {
	refund1: 1,
	refund2: 2,
	refund3: 3,
	refund4: 4
};
var ORDER_REFUND_STATUS = {
	del: -1,
	checkNo: 0,
	checkReject: 1,
	waitUserSend: 2,
	waitReceipt: 3,
	waitConfirm: 4,
	watiUsSend: 5,
	complete: 6,
	close: 7,
	refundReject: 8,
	echangeReject: 9,
	updateExpress: -99
};
ORDER_REFUND_TYPE.refund1, ORDER_REFUND_TYPE.refund2, ORDER_REFUND_TYPE.refund3, ORDER_REFUND_TYPE.refund4;
ORDER_REFUND_STATUS.checkNo, ORDER_REFUND_STATUS.checkReject, ORDER_REFUND_STATUS.waitUserSend, ORDER_REFUND_STATUS.waitReceipt, ORDER_REFUND_STATUS.waitConfirm, ORDER_REFUND_STATUS.watiUsSend, ORDER_REFUND_STATUS.complete, ORDER_REFUND_STATUS.close, ORDER_REFUND_STATUS.refundReject, ORDER_REFUND_STATUS.echangeReject, ORDER_REFUND_STATUS.updateExpress;
ORDER_REFUND_TYPE.refund1, ORDER_REFUND_STATUS.checkNo, ORDER_REFUND_STATUS.checkReject, ORDER_REFUND_STATUS.complete, ORDER_REFUND_STATUS.close, ORDER_REFUND_STATUS.refundReject, ORDER_REFUND_TYPE.refund2, ORDER_REFUND_STATUS.checkNo, ORDER_REFUND_STATUS.waitReceipt, ORDER_REFUND_STATUS.checkReject, ORDER_REFUND_STATUS.complete, ORDER_REFUND_STATUS.close, ORDER_REFUND_STATUS.refundReject, ORDER_REFUND_TYPE.refund3, ORDER_REFUND_STATUS.checkNo, ORDER_REFUND_STATUS.checkReject, ORDER_REFUND_STATUS.waitUserSend, ORDER_REFUND_STATUS.waitReceipt, ORDER_REFUND_STATUS.waitConfirm, ORDER_REFUND_STATUS.refundReject, ORDER_REFUND_STATUS.complete, ORDER_REFUND_STATUS.close, ORDER_REFUND_TYPE.refund4, ORDER_REFUND_STATUS.checkNo, ORDER_REFUND_STATUS.checkReject, ORDER_REFUND_STATUS.waitUserSend, ORDER_REFUND_STATUS.waitReceipt, ORDER_REFUND_STATUS.waitConfirm, ORDER_REFUND_STATUS.watiUsSend, ORDER_REFUND_STATUS.echangeReject, ORDER_REFUND_STATUS.complete, ORDER_REFUND_STATUS.close;
/**
* 不上报的接口及接口对应code
* 注意：key必须和/api/index.js内的url值保持一致
*/
var HTTP_NOT_REPORT_MAP = {
	"/cactivity/narwow/web/getNarwowAndUserInfo": [9002, 9016],
	"/cactivity/narwow/web/take": [9001, 9013],
	"/cactivity/narwow/web/addOrUpdate": [9001, 9013]
};
/**
* 协议类型 1:用户协议，2:隐私协议
*/
var POLICY_MAP = {
	service: 1,
	privacy: 2
};
/**
* 发票类型 -1-不展示 0-开票中 1-开票成功 2-开票失败 3-冲红成功 4-冲红中 5-冲红失败
*/
var INVOICE_STATUS = {
	invoicing: 0,
	success: 1,
	failed: 2,
	redSuccess: 3,
	redOpen: 4,
	redFailed: 5
};
INVOICE_STATUS.invoicing, INVOICE_STATUS.success, INVOICE_STATUS.failed, INVOICE_STATUS.redSuccess, INVOICE_STATUS.redOpen, INVOICE_STATUS.redFailed;
//#endregion
//#region src/common/util/router-map.js
/************
* 路由轨迹记录
*/
var router_map_default = {
	routers: _Storage.session.get("10050") || [],
	routerState: 0,
	to: null,
	from: null,
	push(to, from, type) {
		this.to = to;
		this.from = from;
		const lastIndex = this.routers.length - 1;
		const lastPrevIndex = Math.max(0, lastIndex - 1);
		if (to.fullPath === this.routers[lastIndex]?.fullPath) {
			this.routerState = 0;
			return false;
		}
		if (type === "replace" && this.routers.length > 0) {
			this.routerState = 1;
			this.routers.splice(lastIndex, 1);
			this.routers.push({ fullPath: to.fullPath });
		} else if (this.routers.length > 0 && from.fullPath === this.routers[lastIndex].fullPath && to.fullPath === this.routers[lastPrevIndex].fullPath) {
			this.routerState = -1;
			this.routers.splice(lastIndex, 1);
		} else {
			this.routers.push({ fullPath: to.fullPath });
			this.routerState = 1;
		}
		_Storage.session.set(ROUTER_TRACK, this.routers);
	},
	isPrev() {
		return this.routerState === -1;
	},
	isNext() {
		return this.routerState === 1;
	},
	isInit() {
		return this.routerState === 0;
	}
};
//#endregion
//#region src/common/util/bridge.js
/*********
* APP对接
* window.getTitle.postMessage(string)
* window.toAppPage.postMessage(string) // 前往app页面
* window.toContactService.postMessage(string)
* window.toAppDownloadApk.postMessage(string)
* window.toShareWxSession.postMessage(string)
* window.getUseLoginMessage.postMessage(string) // 获取登陆信息
* window.EchatJsBridge.postMessage(string)
*/
var _back_events = [];
var _appRequestMQ = {
	map: {},
	mq: [],
	running: [],
	push: function push(fn) {
		fn.t = +/* @__PURE__ */ new Date();
		while (this.mq.indexOf(fn.t) > -1 || this.running.indexOf(fn.t) > -1) fn.t += Math.random() * 10 >> 0;
		this.mq.push(fn.t);
		this.map[fn.t] = fn;
		return this.next();
	},
	next: function next() {
		var me = this;
		if (this.mq.length === 0) return;
		if (this.running.length === 0) {
			var newone = this.mq.shift();
			var fn = this.map[newone];
			fn(function() {
				me.running.splice(me.running.indexOf(fn.t), 1);
				delete me.map[fn.t];
				me.next();
			});
			this.running.push(fn.t);
		}
	}
};
var getCallbackName = (() => {
	let num = 1;
	return function() {
		return `callback_${num++}`;
	};
})();
var bridge = {
	initMethods(route) {
		window.showWebToast = function(obj) {
			const opt = getJSON(obj.content);
			if (opt?.type === "alert") $layer.alert(opt.content, {
				title: opt.title,
				okText: opt.confirmText
			}).then((res) => {
				bridge.webDialogConfirm("alert");
			});
			else if (opt?.type === "confirm") $layer.confirm(opt.content, {
				title: opt.title,
				okText: opt.confirmText,
				cancelText: opt.cancelText
			}).then((res) => {
				bridge.webDialogConfirm("confirm");
			}).catch((res) => {
				bridge.webDialogCancel("confirm");
			});
			else $layer.toast(opt.content, { showTime: opt.duration ? opt.duration * 1e3 : 2e3 });
		};
		console.log("函数初始化了：goBackHomePage");
		window.goBackHomePage = function() {
			window.location.href = `https://activity.narwaltech.com/`;
		};
		window.beforeBack = function() {
			_back_events.forEach((fn) => {
				fn();
			});
			_back_events = null;
		};
		bridge.setAppTitle();
	},
	addListenerBack(fn) {
		if (typeof fn === "function") _back_events.push(fn);
	},
	setAppTitle(title) {
		window.getTitle?.postMessage(title || "  ");
	},
	webDialogConfirm(type) {
		window.webDialogConfirm?.postMessage(type);
	},
	webDialogCancel(type) {
		window.webDialogCancel?.postMessage(type);
	},
	isApp() {
		return !!window.getUseLoginMessage;
	},
	isWeApp() {
		return /miniprogram/.test(navigator.userAgent.toLocaleLowerCase());
	},
	toAppHomePage(tabType) {
		window.toAppHomePage?.postMessage(tabType);
	},
	toBindDevice() {
		window.toBindDevice?.postMessage("");
	},
	toLogin() {
		window.toLogin?.postMessage("");
	},
	toExit() {
		window.toExitWebview?.postMessage("");
	},
	getUserInfo(call) {
		return new Promise((resolve) => {
			_appRequestMQ.push((callback) => {
				let fail = false;
				const timer = setTimeout(() => {
					resolve(null);
					fail = true;
					callback && callback();
				}, 2e3);
				window.setUseLoginMessage = (json) => {
					clearTimeout(timer);
					window.setUseLoginMessage = null;
					call && call(json);
					resolve(json);
					console.log(json);
					!fail && callback && callback();
				};
				window.getUseLoginMessage?.postMessage("");
			});
		});
	},
	minVersion(ver) {
		return new Promise((resolve) => {
			const timer = setTimeout(() => {
				resolve(false);
			}, 2e3);
			bridge.getUserInfo((json) => {
				clearTimeout(timer);
				const lows = ver?.split(".")?.map((r) => Number(r)) || [
					2,
					2,
					35
				];
				const version = json.version?.split(".");
				const one = Number(version[0]);
				const two = Number(version[1]);
				let three = Number(version[2]);
				three = three < 10 ? three * 10 : three;
				if (one > lows[0]) resolve(true);
				else if (one === lows[0] && two > lows[1]) resolve(true);
				else if (one === lows[0] && two === lows[1] && three >= lows[2]) resolve(true);
				else resolve(false);
			});
		});
	},
	shareItemAction(option) {
		return new Promise((resolve, reject) => {
			window.appCommonResponse = (json) => {
				if (json?.result?.errCode === 0) resolve(json.result);
				else reject(json.result);
				console.log(json);
				window.appCommonResponse = null;
			};
			window.shareItemAction?.postMessage(JSON.stringify(option));
		});
	},
	showWebShareDialog(actName) {
		window.showWebShareDialog?.postMessage(actName);
	},
	webShareDialogCloseAction(actName) {
		window.webShareDialogCloseAction?.postMessage(actName);
	},
	chooseImage() {
		return new Promise((resolve, reject) => {
			window.appCommonResponse = (json) => {
				if (json?.result?.errCode === 0) resolve(json.result);
				else reject(json.result);
				console.log(json);
				window.appCommonResponse = null;
			};
			window.chooseImage?.postMessage("");
		});
	},
	toLaunchAppPayment(option) {
		return new Promise((resolve, reject) => {
			window.appCommonResponse = (json) => {
				if (json?.result?.errCode === 0) resolve(json.result);
				else reject(json.result);
				console.log(json);
				window.appCommonResponse = null;
			};
			window.toLaunchAppPayment?.postMessage(JSON.stringify(option));
		});
	},
	canCustomSetAppBar() {
		return !!window.syncCustomAppBarElements;
	},
	syncCustomAppBarElements(type) {
		window.syncCustomAppBarElements?.postMessage(type);
	},
	toAppArPage(deviceName) {
		window.toAppArPage?.postMessage(JSON.stringify({ resourceId: deviceName || "" }));
	},
	gotoHelperCenter() {
		window.gotoHelperCenter?.postMessage("");
	},
	gotoEchat() {
		window.gotoEchat?.postMessage("");
	},
	isShowUpLog() {
		return new Promise((resolve) => {
			window.appCommonResponse = (json) => {
				if (json?.result) resolve(true);
				else resolve(false);
				console.log(json);
				window.appCommonResponse = null;
			};
			window.isShowUpLog?.postMessage("");
		});
	},
	isShowFeedback() {
		return new Promise((resolve) => {
			window.appCommonResponse = (json) => {
				if (json?.result) resolve(true);
				else resolve(false);
				console.log(json);
				window.appCommonResponse = null;
			};
			window.isShowFeedback?.postMessage("");
		});
	},
	toUploadLog() {
		window.toUploadLog?.postMessage("");
	},
	toFeedback() {
		window.toFeedback?.postMessage("");
	},
	getAppPhoto(option) {
		return new Promise((resolve, reject) => {
			window.appCommonResponse = (json) => {
				if (json?.result === 1) resolve(json.data);
				else reject(json);
				console.log(json);
				window.appCommonResponse = null;
			};
			window.getAppPhoto?.postMessage(JSON.stringify(option || {
				private: 2,
				type: 1
			}));
		});
	},
	/**
	* @description: jsBridge通用方法
	* @param name 参数
	* @param {*} args 参数
	* @param {*} timeout 超时时间 默认300毫秒
	* @return {*}
	*/
	jsBridgeCall(name, args = [], timeout = 300) {
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				window[callbackName] = null;
				reject(/* @__PURE__ */ new Error("jsBridge超时"));
			}, timeout);
			const callbackName = getCallbackName();
			const params = {
				"id": callbackName,
				"action": "call",
				"name": name,
				"param_t": 0,
				args,
				receiver: callbackName
			};
			window[callbackName] = (res) => {
				resolve(res);
				window[callbackName] = null;
				clearTimeout(timer);
			};
			window.NrCommonMsgPort?.postMessage(JSON.stringify(params));
		});
	},
	appThemeMode() {
		return bridge.jsBridgeCall("appThemeMode").then((res = { value: [] }) => {
			return res.value[0];
		});
	},
	/**
	* @description: 接收App消息
	* @return {*}
	*/
	createNotify() {
		const observers = /* @__PURE__ */ new Set();
		function addObserver(observer) {
			observers.add(observer);
		}
		function removeObserver(observer) {
			observers.delete(observer);
		}
		window.handleMessageFromNrApp = (message) => {
			observers.forEach((observer) => {
				observer(message);
			});
		};
		return {
			addObserver,
			removeObserver
		};
	},
	isHarmonyOs() {
		const nrAppInformation = getJSON(window.nrAppInformation, null);
		return nrAppInformation && !!nrAppInformation.OS.toLocaleLowerCase().match(/ohos/i);
	}
};
//#endregion
//#region src/common/util/jweixin-1.6.0.js
var jweixin_1_6_0_default = env_default.isServer() ? {} : (function(o, e) {
	if (!o.jWeixin) {
		var n, c = {
			config: "preVerifyJSAPI",
			onMenuShareTimeline: "menu:share:timeline",
			onMenuShareAppMessage: "menu:share:appmessage",
			onMenuShareQQ: "menu:share:qq",
			onMenuShareWeibo: "menu:share:weiboApp",
			onMenuShareQZone: "menu:share:QZone",
			previewImage: "imagePreview",
			getLocation: "geoLocation",
			openProductSpecificView: "openProductViewWithPid",
			addCard: "batchAddCard",
			openCard: "batchViewCard",
			chooseWXPay: "getBrandWCPayRequest",
			openEnterpriseRedPacket: "getRecevieBizHongBaoRequest",
			startSearchBeacons: "startMonitoringBeacons",
			stopSearchBeacons: "stopMonitoringBeacons",
			onSearchBeacons: "onBeaconsInRange",
			consumeAndShareCard: "consumedShareCard",
			openAddress: "editAddress"
		}, a = function() {
			var e = {};
			for (var n in c) e[c[n]] = n;
			return e;
		}(), i = o.document, t = i.title, r = navigator.userAgent.toLowerCase(), s = navigator.platform.toLowerCase(), d = !(!s.match("mac") && !s.match("win")), u = -1 != r.indexOf("wxdebugger"), l = -1 != r.indexOf("micromessenger"), p = -1 != r.indexOf("android"), f = -1 != r.indexOf("iphone") || -1 != r.indexOf("ipad"), m = (n = r.match(/micromessenger\/(\d+\.\d+\.\d+)/) || r.match(/micromessenger\/(\d+\.\d+)/)) ? n[1] : "", g = {
			initStartTime: L(),
			initEndTime: 0,
			preVerifyStartTime: 0,
			preVerifyEndTime: 0
		}, h = {
			version: 1,
			appId: "",
			initTime: 0,
			preVerifyTime: 0,
			networkType: "",
			isPreVerifyOk: 1,
			systemType: f ? 1 : p ? 2 : -1,
			clientVersion: m,
			url: encodeURIComponent(location.href)
		}, v = {}, S = { _completes: [] }, y = {
			state: 0,
			data: {}
		};
		O(function() {
			g.initEndTime = L();
		});
		var I = !1, _ = [], w = {
			config: function(e) {
				B("config", v = e);
				var t = !1 !== v.check;
				O(function() {
					if (t) M(c.config, {
						verifyJsApiList: C(v.jsApiList),
						verifyOpenTagList: C(v.openTagList)
					}, function() {
						S._complete = function(e) {
							g.preVerifyEndTime = L(), y.state = 1, y.data = e;
						}, S.success = function(e) {
							h.isPreVerifyOk = 0;
						}, S.fail = function(e) {
							S._fail ? S._fail(e) : y.state = -1;
						};
						var t = S._completes;
						return t.push(function() {
							(function() {
								if (!(d || u || v.debug || m < "6.0.2" || h.systemType < 0)) {
									var i = new Image();
									h.appId = v.appId, h.initTime = g.initEndTime - g.initStartTime, h.preVerifyTime = g.preVerifyEndTime - g.preVerifyStartTime, w.getNetworkType({
										isInnerInvoke: !0,
										success: function(e) {
											h.networkType = e.networkType;
											i.src = "https://open.weixin.qq.com/sdk/report?v=" + h.version + "&o=" + h.isPreVerifyOk + "&s=" + h.systemType + "&c=" + h.clientVersion + "&a=" + h.appId + "&n=" + h.networkType + "&i=" + h.initTime + "&p=" + h.preVerifyTime + "&u=" + h.url;
										}
									});
								}
							})();
						}), S.complete = function(e) {
							for (var n = 0, i = t.length; n < i; ++n) t[n]();
							S._completes = [];
						}, S;
					}()), g.preVerifyStartTime = L();
					else {
						y.state = 1;
						for (var e = S._completes, n = 0, i = e.length; n < i; ++n) e[n]();
						S._completes = [];
					}
				}), w.invoke || (w.invoke = function(e, n, i) {
					o.WeixinJSBridge && WeixinJSBridge.invoke(e, x(n), i);
				}, w.on = function(e, n) {
					o.WeixinJSBridge && WeixinJSBridge.on(e, n);
				});
			},
			ready: function(e) {
				0 != y.state ? e() : (S._completes.push(e), !l && v.debug && e());
			},
			error: function(e) {
				m < "6.0.2" || (-1 == y.state ? e(y.data) : S._fail = e);
			},
			checkJsApi: function(e) {
				M("checkJsApi", { jsApiList: C(e.jsApiList) }, (e._complete = function(e) {
					if (p) {
						var n = e.checkResult;
						n && (e.checkResult = JSON.parse(n));
					}
					e = function(e) {
						var n = e.checkResult;
						for (var i in n) {
							var t = a[i];
							t && (n[t] = n[i], delete n[i]);
						}
						return e;
					}(e);
				}, e));
			},
			onMenuShareTimeline: function(e) {
				P(c.onMenuShareTimeline, { complete: function() {
					M("shareTimeline", {
						title: e.title || t,
						desc: e.title || t,
						img_url: e.imgUrl || "",
						link: e.link || location.href,
						type: e.type || "link",
						data_url: e.dataUrl || ""
					}, e);
				} }, e);
			},
			onMenuShareAppMessage: function(n) {
				P(c.onMenuShareAppMessage, { complete: function(e) {
					"favorite" === e.scene ? M("sendAppMessage", {
						title: n.title || t,
						desc: n.desc || "",
						link: n.link || location.href,
						img_url: n.imgUrl || "",
						type: n.type || "link",
						data_url: n.dataUrl || ""
					}) : M("sendAppMessage", {
						title: n.title || t,
						desc: n.desc || "",
						link: n.link || location.href,
						img_url: n.imgUrl || "",
						type: n.type || "link",
						data_url: n.dataUrl || ""
					}, n);
				} }, n);
			},
			onMenuShareQQ: function(e) {
				P(c.onMenuShareQQ, { complete: function() {
					M("shareQQ", {
						title: e.title || t,
						desc: e.desc || "",
						img_url: e.imgUrl || "",
						link: e.link || location.href
					}, e);
				} }, e);
			},
			onMenuShareWeibo: function(e) {
				P(c.onMenuShareWeibo, { complete: function() {
					M("shareWeiboApp", {
						title: e.title || t,
						desc: e.desc || "",
						img_url: e.imgUrl || "",
						link: e.link || location.href
					}, e);
				} }, e);
			},
			onMenuShareQZone: function(e) {
				P(c.onMenuShareQZone, { complete: function() {
					M("shareQZone", {
						title: e.title || t,
						desc: e.desc || "",
						img_url: e.imgUrl || "",
						link: e.link || location.href
					}, e);
				} }, e);
			},
			updateTimelineShareData: function(e) {
				M("updateTimelineShareData", {
					title: e.title,
					link: e.link,
					imgUrl: e.imgUrl
				}, e);
			},
			updateAppMessageShareData: function(e) {
				M("updateAppMessageShareData", {
					title: e.title,
					desc: e.desc,
					link: e.link,
					imgUrl: e.imgUrl
				}, e);
			},
			startRecord: function(e) {
				M("startRecord", {}, e);
			},
			stopRecord: function(e) {
				M("stopRecord", {}, e);
			},
			onVoiceRecordEnd: function(e) {
				P("onVoiceRecordEnd", e);
			},
			playVoice: function(e) {
				M("playVoice", { localId: e.localId }, e);
			},
			pauseVoice: function(e) {
				M("pauseVoice", { localId: e.localId }, e);
			},
			stopVoice: function(e) {
				M("stopVoice", { localId: e.localId }, e);
			},
			onVoicePlayEnd: function(e) {
				P("onVoicePlayEnd", e);
			},
			uploadVoice: function(e) {
				M("uploadVoice", {
					localId: e.localId,
					isShowProgressTips: 0 == e.isShowProgressTips ? 0 : 1
				}, e);
			},
			downloadVoice: function(e) {
				M("downloadVoice", {
					serverId: e.serverId,
					isShowProgressTips: 0 == e.isShowProgressTips ? 0 : 1
				}, e);
			},
			translateVoice: function(e) {
				M("translateVoice", {
					localId: e.localId,
					isShowProgressTips: 0 == e.isShowProgressTips ? 0 : 1
				}, e);
			},
			chooseImage: function(e) {
				M("chooseImage", {
					scene: "1|2",
					count: e.count || 9,
					sizeType: e.sizeType || ["original", "compressed"],
					sourceType: e.sourceType || ["album", "camera"]
				}, (e._complete = function(e) {
					if (p) {
						var n = e.localIds;
						try {
							n && (e.localIds = JSON.parse(n));
						} catch (e) {}
					}
				}, e));
			},
			previewImage: function(e) {
				M(c.previewImage, {
					current: e.current,
					urls: e.urls
				}, e);
			},
			uploadImage: function(e) {
				M("uploadImage", {
					localId: e.localId,
					isShowProgressTips: 0 == e.isShowProgressTips ? 0 : 1
				}, e);
			},
			downloadImage: function(e) {
				M("downloadImage", {
					serverId: e.serverId,
					isShowProgressTips: 0 == e.isShowProgressTips ? 0 : 1
				}, e);
			},
			getLocalImgData: function(e) {
				!1 === I ? (I = !0, M("getLocalImgData", { localId: e.localId }, (e._complete = function(e) {
					if (I = !1, 0 < _.length) {
						var n = _.shift();
						wx.getLocalImgData(n);
					}
				}, e))) : _.push(e);
			},
			getNetworkType: function(e) {
				M("getNetworkType", {}, (e._complete = function(e) {
					e = function(e) {
						var n = e.errMsg;
						e.errMsg = "getNetworkType:ok";
						var i = e.subtype;
						if (delete e.subtype, i) e.networkType = i;
						else {
							var t = n.indexOf(":"), o = n.substring(t + 1);
							switch (o) {
								case "wifi":
								case "edge":
								case "wwan":
									e.networkType = o;
									break;
								default: e.errMsg = "getNetworkType:fail";
							}
						}
						return e;
					}(e);
				}, e));
			},
			openLocation: function(e) {
				M("openLocation", {
					latitude: e.latitude,
					longitude: e.longitude,
					name: e.name || "",
					address: e.address || "",
					scale: e.scale || 28,
					infoUrl: e.infoUrl || ""
				}, e);
			},
			getLocation: function(e) {
				M(c.getLocation, { type: (e = e || {}).type || "wgs84" }, (e._complete = function(e) {
					delete e.type;
				}, e));
			},
			hideOptionMenu: function(e) {
				M("hideOptionMenu", {}, e);
			},
			showOptionMenu: function(e) {
				M("showOptionMenu", {}, e);
			},
			closeWindow: function(e) {
				M("closeWindow", {}, e = e || {});
			},
			hideMenuItems: function(e) {
				M("hideMenuItems", { menuList: e.menuList }, e);
			},
			showMenuItems: function(e) {
				M("showMenuItems", { menuList: e.menuList }, e);
			},
			hideAllNonBaseMenuItem: function(e) {
				M("hideAllNonBaseMenuItem", {}, e);
			},
			showAllNonBaseMenuItem: function(e) {
				M("showAllNonBaseMenuItem", {}, e);
			},
			scanQRCode: function(e) {
				M("scanQRCode", {
					needResult: (e = e || {}).needResult || 0,
					scanType: e.scanType || ["qrCode", "barCode"]
				}, (e._complete = function(e) {
					if (f) {
						var n = e.resultStr;
						if (n) {
							var i = JSON.parse(n);
							e.resultStr = i && i.scan_code && i.scan_code.scan_result;
						}
					}
				}, e));
			},
			openAddress: function(e) {
				M(c.openAddress, {}, (e._complete = function(e) {
					e = function(e) {
						return e.postalCode = e.addressPostalCode, delete e.addressPostalCode, e.provinceName = e.proviceFirstStageName, delete e.proviceFirstStageName, e.cityName = e.addressCitySecondStageName, delete e.addressCitySecondStageName, e.countryName = e.addressCountiesThirdStageName, delete e.addressCountiesThirdStageName, e.detailInfo = e.addressDetailInfo, delete e.addressDetailInfo, e;
					}(e);
				}, e));
			},
			openProductSpecificView: function(e) {
				M(c.openProductSpecificView, {
					pid: e.productId,
					view_type: e.viewType || 0,
					ext_info: e.extInfo
				}, e);
			},
			addCard: function(e) {
				for (var n = e.cardList, i = [], t = 0, o = n.length; t < o; ++t) {
					var r = n[t], a = {
						card_id: r.cardId,
						card_ext: r.cardExt
					};
					i.push(a);
				}
				M(c.addCard, { card_list: i }, (e._complete = function(e) {
					var n = e.card_list;
					if (n) {
						for (var i = 0, t = (n = JSON.parse(n)).length; i < t; ++i) {
							var o = n[i];
							o.cardId = o.card_id, o.cardExt = o.card_ext, o.isSuccess = !!o.is_succ, delete o.card_id, delete o.card_ext, delete o.is_succ;
						}
						e.cardList = n, delete e.card_list;
					}
				}, e));
			},
			chooseCard: function(e) {
				M("chooseCard", {
					app_id: v.appId,
					location_id: e.shopId || "",
					sign_type: e.signType || "SHA1",
					card_id: e.cardId || "",
					card_type: e.cardType || "",
					card_sign: e.cardSign,
					time_stamp: e.timestamp + "",
					nonce_str: e.nonceStr
				}, (e._complete = function(e) {
					e.cardList = e.choose_card_info, delete e.choose_card_info;
				}, e));
			},
			openCard: function(e) {
				for (var n = e.cardList, i = [], t = 0, o = n.length; t < o; ++t) {
					var r = n[t], a = {
						card_id: r.cardId,
						code: r.code
					};
					i.push(a);
				}
				M(c.openCard, { card_list: i }, e);
			},
			consumeAndShareCard: function(e) {
				M(c.consumeAndShareCard, {
					consumedCardId: e.cardId,
					consumedCode: e.code
				}, e);
			},
			chooseWXPay: function(e) {
				M(c.chooseWXPay, V(e), e);
			},
			openEnterpriseRedPacket: function(e) {
				M(c.openEnterpriseRedPacket, V(e), e);
			},
			startSearchBeacons: function(e) {
				M(c.startSearchBeacons, { ticket: e.ticket }, e);
			},
			stopSearchBeacons: function(e) {
				M(c.stopSearchBeacons, {}, e);
			},
			onSearchBeacons: function(e) {
				P(c.onSearchBeacons, e);
			},
			openEnterpriseChat: function(e) {
				M("openEnterpriseChat", {
					useridlist: e.userIds,
					chatname: e.groupName
				}, e);
			},
			launchMiniProgram: function(e) {
				M("launchMiniProgram", {
					targetAppId: e.targetAppId,
					path: function(e) {
						if ("string" == typeof e && 0 < e.length) {
							var n = e.split("?")[0], i = e.split("?")[1];
							return n += ".html", void 0 !== i ? n + "?" + i : n;
						}
					}(e.path),
					envVersion: e.envVersion
				}, e);
			},
			openBusinessView: function(e) {
				M("openBusinessView", {
					businessType: e.businessType,
					queryString: e.queryString || "",
					envVersion: e.envVersion
				}, (e._complete = function(n) {
					if (p) {
						var e = n.extraData;
						if (e) try {
							n.extraData = JSON.parse(e);
						} catch (e) {
							n.extraData = {};
						}
					}
				}, e));
			},
			miniProgram: {
				navigateBack: function(e) {
					e = e || {}, O(function() {
						M("invokeMiniProgramAPI", {
							name: "navigateBack",
							arg: { delta: e.delta || 1 }
						}, e);
					});
				},
				navigateTo: function(e) {
					O(function() {
						M("invokeMiniProgramAPI", {
							name: "navigateTo",
							arg: { url: e.url }
						}, e);
					});
				},
				redirectTo: function(e) {
					O(function() {
						M("invokeMiniProgramAPI", {
							name: "redirectTo",
							arg: { url: e.url }
						}, e);
					});
				},
				switchTab: function(e) {
					O(function() {
						M("invokeMiniProgramAPI", {
							name: "switchTab",
							arg: { url: e.url }
						}, e);
					});
				},
				reLaunch: function(e) {
					O(function() {
						M("invokeMiniProgramAPI", {
							name: "reLaunch",
							arg: { url: e.url }
						}, e);
					});
				},
				postMessage: function(e) {
					O(function() {
						M("invokeMiniProgramAPI", {
							name: "postMessage",
							arg: e.data || {}
						}, e);
					});
				},
				getEnv: function(e) {
					O(function() {
						e({ miniprogram: "miniprogram" === o.__wxjs_environment });
					});
				}
			}
		}, T = 1, k = {};
		return i.addEventListener("error", function(e) {
			if (!p) {
				var n = e.target, i = n.tagName, t = n.src;
				if ("IMG" == i || "VIDEO" == i || "AUDIO" == i || "SOURCE" == i) {
					if (-1 != t.indexOf("wxlocalresource://")) {
						e.preventDefault(), e.stopPropagation();
						var o = n["wx-id"];
						if (o || (o = T++, n["wx-id"] = o), k[o]) return;
						k[o] = !0, wx.ready(function() {
							wx.getLocalImgData({
								localId: t,
								success: function(e) {
									n.src = e.localData;
								}
							});
						});
					}
				}
			}
		}, !0), i.addEventListener("load", function(e) {
			if (!p) {
				var n = e.target, i = n.tagName;
				n.src;
				if ("IMG" == i || "VIDEO" == i || "AUDIO" == i || "SOURCE" == i) {
					var t = n["wx-id"];
					t && (k[t] = !1);
				}
			}
		}, !0), e && (o.wx = o.jWeixin = w), w;
	}
	function M(n, e, i) {
		o.WeixinJSBridge ? WeixinJSBridge.invoke(n, x(e), function(e) {
			A(n, e, i);
		}) : B(n, i);
	}
	function P(n, i, t) {
		o.WeixinJSBridge ? WeixinJSBridge.on(n, function(e) {
			t && t.trigger && t.trigger(e), A(n, e, i);
		}) : B(n, t || i);
	}
	function x(e) {
		return (e = e || {}).appId = v.appId, e.verifyAppId = v.appId, e.verifySignType = "sha1", e.verifyTimestamp = v.timestamp + "", e.verifyNonceStr = v.nonceStr, e.verifySignature = v.signature, e;
	}
	function V(e) {
		return {
			timeStamp: e.timestamp + "",
			nonceStr: e.nonceStr,
			package: e.package,
			paySign: e.paySign,
			signType: e.signType || "SHA1"
		};
	}
	function A(e, n, i) {
		"openEnterpriseChat" != e && "openBusinessView" !== e || (n.errCode = n.err_code), delete n.err_code, delete n.err_desc, delete n.err_detail;
		var t = n.errMsg;
		t || (t = n.err_msg, delete n.err_msg, t = function(e, n) {
			var i = e, t = a[i];
			t && (i = t);
			var o = "ok";
			if (n) {
				var r = n.indexOf(":");
				"confirm" == (o = n.substring(r + 1)) && (o = "ok"), "failed" == o && (o = "fail"), -1 != o.indexOf("failed_") && (o = o.substring(7)), -1 != o.indexOf("fail_") && (o = o.substring(5)), "access denied" != (o = (o = o.replace(/_/g, " ")).toLowerCase()) && "no permission to execute" != o || (o = "permission denied"), "config" == i && "function not exist" == o && (o = "ok"), "" == o && (o = "fail");
			}
			return n = i + ":" + o;
		}(e, t), n.errMsg = t), (i = i || {})._complete && (i._complete(n), delete i._complete), t = n.errMsg || "", v.debug && !i.isInnerInvoke && alert(JSON.stringify(n));
		var o = t.indexOf(":");
		switch (t.substring(o + 1)) {
			case "ok":
				i.success && i.success(n);
				break;
			case "cancel":
				i.cancel && i.cancel(n);
				break;
			default: i.fail && i.fail(n);
		}
		i.complete && i.complete(n);
	}
	function C(e) {
		if (e) {
			for (var n = 0, i = e.length; n < i; ++n) {
				var o = c[e[n]];
				o && (e[n] = o);
			}
			return e;
		}
	}
	function B(e, n) {
		if (!(!v.debug || n && n.isInnerInvoke)) {
			var i = a[e];
			i && (e = i), n && n._complete && delete n._complete, console.log("\"" + e + "\",", n || "");
		}
	}
	function L() {
		return (/* @__PURE__ */ new Date()).getTime();
	}
	function O(e) {
		l && (o.WeixinJSBridge ? e() : i.addEventListener && i.addEventListener("WeixinJSBridgeReady", e, !1));
	}
	return o.wx;
})(window, true);
//#endregion
//#region src/lib/util/formatDate.js
/**
* 对日期时行格式
* date可以是一个long类型，也可以是2015-12-15 12:12:12
* format默认yyyy-MM-dd
*/
function formatDate_default(date, format = "yyyy-MM-dd HH:mm:ss") {
	function _format() {
		let reg = /^(\d{4}(\-|\/|\.)?\d{1,2}(\-|\/|\.)?\d{1,2})(\s\d{1,2}:\d{1,2}(:\d{1,2})?)?/g;
		let newDate = date;
		if (/^(-?\d+)\.?\d*$/.test(date)) {
			if (parseInt(date).toString().length === 10) date *= 1e3;
			newDate = new Date(date);
		} else if (isString(date)) newDate = new Date(date.match(reg)[0].replace(/\-|\./g, "/"));
		if (/Invalid|NaN/.test(newDate.toString())) return date;
		let hour = newDate.getHours();
		let minute = newDate.getMinutes();
		let o = {
			"M+": newDate.getMonth() + 1,
			"d+": newDate.getDate(),
			"H+": hour,
			"h+": hour > 12 ? hour - 12 : hour,
			"m+": minute < 10 ? "0" + minute : minute,
			"s+": newDate.getSeconds(),
			"q+": Math.floor((newDate.getMonth() + 3) / 3),
			"S": newDate.getMilliseconds()
		};
		if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (newDate.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (let k in o) if (new RegExp("(" + k + ")").test(format)) format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(o[k].toString().length));
		return format;
	}
	try {
		return _format();
	} catch (e) {
		return date;
	}
}
//#endregion
//#region src/lib/util/calendar.js
/**
* 日期操作工具
* by 璩
*/
var calendar_default = {
	getDate() {
		return /* @__PURE__ */ new Date();
	},
	/**********
	* 将字符串转成日期
	* @param date
	*/
	parse(date) {
		if (date instanceof Date) return date;
		return new Date(this.format(date).replace(/\-/g, "/"));
	},
	/******************
	* 将日期转成字符串
	* @param date
	* @param format
	* @returns {*}
	*/
	format(date, format) {
		return formatDate_default(date, format);
	},
	/******************
	* 返回时间戳, 北京时间
	* @type {that.now}
	*/
	now(date) {
		date = !!date ? this.parse(date) : this.getDate();
		return date.getTime();
	},
	/**********
	* 返回当前星期
	* @param date
	*/
	getWeek(date) {
		return [
			"日",
			"一",
			"二",
			"三",
			"四",
			"五",
			"六"
		][this.parse(date).getDay()];
	},
	/**************
	*返回当月天数
	* @param year
	* @param month
	* @returns {number}
	*/
	getMonthDay(year, month) {
		if (year instanceof Date) {
			month = year.getMonth();
			year = year.getFullYear();
		}
		const months = [
			31,
			28,
			31,
			30,
			31,
			30,
			31,
			31,
			30,
			31,
			30,
			31
		];
		if (0 === year % 4 && (0 !== year % 100 || 0 === year % 400) && month === 1) return 29;
		else return months[month];
	},
	/********************
	* 返回一个日期向前或向后多少天的新日期
	* @param date
	* @param value
	*/
	getOffsetDate(date, value) {
		let time = value * 24 * 3600 * 1e3;
		let newTime = this.now(date) + time;
		return this.parse(newTime);
	},
	/********************
	* 返回一个日期向前或向后多少小时的新日期
	* @param date
	* @param value
	*/
	getOffsetHour(date, value) {
		let time = value * 3600 * 1e3;
		let newTime = this.now(date) + time;
		return this.parse(newTime);
	},
	/*******
	* 返回当前日期的第一天
	* @param date
	*/
	getCurDateFirst(date) {
		date = this.parse(date);
		let day = date.getDate();
		return this.getOffsetDate(date, -day + 1);
	},
	/**********
	* 返回当前日期的上一月的第一天
	* @param date
	*/
	getPrevDateFirst(date) {
		let prevDate = this.getPrevDateLast(date);
		let day = this.getMonthDay(prevDate);
		return this.getOffsetDate(prevDate, -day + 1);
	},
	/**********
	* 返回当前日期的上一月的最后一天
	* @param date
	*/
	getPrevDateLast(date) {
		date = this.parse(date);
		let day = date.getDate();
		return this.getOffsetDate(date, -day);
	},
	/**********
	* 返回当前日期的下一月的第一天
	* @param date
	*/
	getNextDateFirst(date) {
		date = this.parse(date);
		let day = this.getMonthDay(date) - date.getDate();
		return this.getOffsetDate(date, day + 1);
	},
	/**********
	* 返回当前日期的下一月的最后一天
	* @param date
	*/
	getNextDateLast(date) {
		let nextDate = this.getNextDateFirst(date);
		let day = this.getMonthDay(nextDate);
		return this.getOffsetDate(nextDate, day - 1);
	},
	/*****************
	* 比较两个日期相差多少天
	* @param date1
	* @param date2
	* @returns {number}
	*/
	getCompareDateDay(date1, date2) {
		var time1 = this.now(date1);
		return (this.now(date2) - time1) / (1e3 * 3600 * 24);
	},
	/*****************
	* 比较两个日期相差值
	* @param date1
	* @param date2
	* @returns {number}
	*/
	getCompareDateTimestamp(date1, date2) {
		var time1 = this.now(date1);
		return this.now(date2) - time1;
	},
	/****************
	* 比较两个时间相差多少天
	* @param time1
	* @param time2
	* @returns {number}
	*/
	getCompareTimeDay(time1, time2) {
		let date = this.format(this.getDate(), "yyyy-MM-dd");
		return this.getCompareDateDay(date + " " + time1, date + " " + time2);
	},
	/***********
	* 返回一个日期向前或向后多少天的新日期字符串
	* @param date
	* @param value
	* @param format
	* @returns {*}
	*/
	getOffsetDateStr(date, value, format) {
		return this.format(this.getOffsetDate(date, value), format || "yyyy-MM-dd");
	},
	/*************
	* 判断是不是今天
	* @param date
	*/
	isToday(date) {
		return this.format(date, "yyyyMMdd") === this.format(this.getDate(), "yyyyMMdd");
	},
	/*************
	* 判断是不是明天
	* @param date
	*/
	isTomorrow(date) {
		return this.format(date, "yyyyMMdd") === this.getOffsetDateStr(this.getDate(), 1, "yyyyMMdd");
	},
	/*************
	* 判断是不是后天
	* @param date
	*/
	isAfterTomorrow(date) {
		return this.format(date, "yyyyMMdd") === this.getOffsetDateStr(this.getDate(), 2, "yyyyMMdd");
	},
	/*************
	* 判断是不是昨天
	* @param date
	*/
	isYesterday(date) {
		return this.format(date, "yyyyMMdd") === this.getOffsetDateStr(this.getDate(), -1, "yyyyMMdd");
	},
	/**
	* @param {*} date 被比较的时间 yyyy-MM-dd
	* @param {*} startTime 开始时间 yyyy-MM-dd
	* @param {*} endTime 结束时间 yyyy-MM-dd
	* @param {*} disabledDateList 不可用时间列表 ['yyyy-MM-dd', 'yyyy-MM-dd']
	* @returns
	*/
	isDateDisable(date, startTime, endTime, disabledDateList = []) {
		const start = this.getCompareDateTimestamp(date, startTime);
		const end = this.getCompareDateTimestamp(date, endTime);
		return start > 0 || end < 0 || disabledDateList.some((item) => item === date);
	}
};
//#endregion
//#region src/common/util/coupon.js
var discountInfo = function(discountList) {
	let discountMap = {};
	let discountSale = {};
	let sales = {};
	discountList?.forEach((obj) => {
		let startTimestamp = 0;
		let status = 1;
		if (obj.needAdvance > 0) {
			const start = calendar_default.now(obj.startTime);
			if (obj.needAdvance === 1) {
				startTimestamp = start - obj.nowTimestamp;
				status = startTimestamp > 0 ? 2 : 1;
			} else if (obj.needAdvance === 2) {
				const hour = obj.advanceNoticeTime * 60 * 60 * 1e3;
				if (obj.nowTimestamp + hour >= start) {
					startTimestamp = start - obj.nowTimestamp;
					status = startTimestamp > 0 ? 2 : 1;
				} else status = 0;
			}
		}
		const list = obj.flashSale?.split("\n").map((r) => r.trim())?.filter((r) => !!r) || [];
		const dates = [];
		let total = 0, current = 0;
		list.forEach((str) => {
			const arr = str.split("#");
			const date = calendar_default.now(arr[0]);
			const text = arr[1];
			dates.push({
				date,
				text
			});
		});
		let len = dates.length;
		for (let i = len - 1; i >= 0; i--) if (obj.nowTimestamp >= dates[i].date) {
			current = dates[i].text;
			break;
		}
		total = parseInt(dates[len - 1]?.text || 0);
		sales = {
			total,
			progress: total > 0 ? parseInt(current) * 100 / total : 0,
			current
		};
		if (status === 1) discountMap[obj.skuId] = {
			...obj,
			status,
			sales
		};
		else if (status === 2) discountSale[obj.skuId] = {
			title: obj.title,
			id: obj.id,
			sales,
			startTimestamp,
			status
		};
		if (!discountMap[obj.skuId]) discountMap[obj.skuId] = null;
		if (!discountSale[obj.skuId]) discountSale[obj.skuId] = null;
	});
	return {
		discountMap,
		discountSale
	};
};
//#endregion
//#region src/common/util/spec.js
/***********
* 返回规格
*/
var specListToText = function(list, id) {
	const obj = list.find((r) => r.id === id);
	return obj?.size || obj?.skuSpecList?.map((c) => `${c.specValue}`).join("; ") || "";
};
var specToText = function(obj) {
	return obj?.size || obj.skuSpecList?.map((c) => `${c.specValue}`).join("; ") || "";
};
//#endregion
//#region src/lib/util/viewport.js
/**
* 允许强制将设置倍数为 1
* 移动适配解决方案
*/
var ua = env_default.isServer() ? "iphone" : navigator.userAgent.toLocaleLowerCase();
ua.match(/android/gi), ua.match(/iphone/gi), ua.match(/micromessenger/gi);
var rem = function() {
	return env_default.isServer() ? 50 : parseFloat(window.getComputedStyle(document.documentElement, null).fontSize, 10);
};
var px2px = function(px, dpr = 1) {
	return rem2px(px2rem(px)) * dpr;
};
function px2rem(px) {
	return px / 100;
}
var rem2px = function(px) {
	return px * rem();
};
//#endregion
//#region src/common/util/filters.js
var _toFixed = (v) => {
	if (isNumber(v) && !isNaN(v)) return parseFloat(v.toFixed(2));
};
/****************
* 过滤优惠券数据
* @param list
* @param notFilter
* @returns {*}
*/
function filterCouponList(list, notFilter) {
	return list?.filter((item) => {
		if (item.takeType === 1 && !isNumber(item.useStatus) || item.status === 0 || item.type === 3) return false;
		else if (!notFilter && item.validityTimeType === 1) {
			const now = item.currentTimeStamp || Date.now();
			return calendar_default.getCompareDateTimestamp(item.startTime, now) >= 0;
		}
		return true;
	})?.map((item) => {
		return {
			id: item.id,
			name: item.name,
			type: item.type,
			remark: item.remark,
			thresholdPrice: item.thresholdPrice,
			discountNum: item.discountNum,
			startTime: item.startTime,
			endTime: item.endTime,
			takeTime: item.takeTime,
			validityTimeType: item.validityTimeType,
			validityDays: item.validityDays,
			superposition: item.superposition,
			instruction: item.instruction,
			serialNumber: item.serialNumber,
			isApplicableAll: item.isApplicableAll,
			applicableProductSerialNumberSet: item.applicableProductSerialNumberSet,
			applicableProductSkuIdSet: item.applicableProductSkuIdSet,
			useStatus: item.useStatus,
			shareFlag: item.shareFlag,
			takeType: item.takeType,
			status: item.status
		};
	});
}
/******************
* 去除重复数据
*/
var filterReport = function(list, key) {
	const set = {};
	const result = [];
	list?.forEach((item) => {
		if (!set[item[key]]) {
			result.push(item);
			set[item[key]] = true;
		}
	});
	return result;
};
/***********
* 购物车数据
*/
var filterShoppingList = function(list, discountList) {
	const arr1 = [], arr2 = [];
	const map = discountInfo(discountList).discountMap;
	list?.forEach((item) => {
		const skuList = item.skuList.filter((c) => c.status === 1);
		let obj = skuList.find((c) => c.id === item.skuId);
		if (!obj) {
			obj = skuList[0] || {};
			item.skuId = obj.id;
		}
		const res = {
			currentPrice: item.currentPrice,
			price: item.currentPrice,
			discountPrice: _toFixed(map[item.skuId]?.discountedPrice || item.currentPrice),
			underlinePrice: _toFixed(map[item.skuId] ? item.underlinePrice || item.currentPrice : item.underlinePrice),
			checked: !!item.checked,
			size: specListToText(skuList, item.skuId),
			max: Math.min(item.salesLimitNum || 99, Math.min(item.stock, 99)),
			imageUrl: obj?.imageUri || item.imageUrl,
			productSerialNumber: item.productSerialNumber,
			isActivityProduct: item.isActivityProduct,
			productId: obj?.productId,
			id: item.id,
			skuId: item.skuId,
			salesLimitNum: item.salesLimitNum,
			stock: item.stock,
			num: item.num,
			title: item.title,
			type: item.productType,
			salesStatus: item.isActivityProduct === 1 ? -4 : item.salesStatus,
			skuList: skuList.map((c) => {
				return {
					id: c.id,
					price: c.price,
					discountPrice: _toFixed(map[c.id]?.discountedPrice || c.price),
					underlinePrice: _toFixed(map[c.id] ? c.price : c.underlinePrice),
					imageUri: c.imageUri,
					productId: c.productId,
					stockNum: c.stockNum,
					size: specToText(c),
					status: c.status
				};
			})
		};
		if (item.salesStatus === 1) arr1.push(res);
		else arr2.push(res);
	});
	return arr1.concat(arr2);
};
(function() {
	var adelta = [
		0,
		11,
		15,
		19,
		23,
		27,
		31,
		16,
		18,
		20,
		22,
		24,
		26,
		28,
		20,
		22,
		24,
		24,
		26,
		28,
		28,
		22,
		24,
		24,
		26,
		26,
		28,
		28,
		24,
		24,
		26,
		26,
		26,
		28,
		28,
		24,
		26,
		26,
		26,
		28,
		28
	];
	var vpat = [
		3220,
		1468,
		2713,
		1235,
		3062,
		1890,
		2119,
		1549,
		2344,
		2936,
		1117,
		2583,
		1330,
		2470,
		1667,
		2249,
		2028,
		3780,
		481,
		4011,
		142,
		3098,
		831,
		3445,
		592,
		2517,
		1776,
		2234,
		1951,
		2827,
		1070,
		2660,
		1345,
		3177
	];
	var fmtword = [
		30660,
		29427,
		32170,
		30877,
		26159,
		25368,
		27713,
		26998,
		21522,
		20773,
		24188,
		23371,
		17913,
		16590,
		20375,
		19104,
		13663,
		12392,
		16177,
		14854,
		9396,
		8579,
		11994,
		11245,
		5769,
		5054,
		7399,
		6608,
		1890,
		597,
		3340,
		2107
	];
	var eccblocks = [
		1,
		0,
		19,
		7,
		1,
		0,
		16,
		10,
		1,
		0,
		13,
		13,
		1,
		0,
		9,
		17,
		1,
		0,
		34,
		10,
		1,
		0,
		28,
		16,
		1,
		0,
		22,
		22,
		1,
		0,
		16,
		28,
		1,
		0,
		55,
		15,
		1,
		0,
		44,
		26,
		2,
		0,
		17,
		18,
		2,
		0,
		13,
		22,
		1,
		0,
		80,
		20,
		2,
		0,
		32,
		18,
		2,
		0,
		24,
		26,
		4,
		0,
		9,
		16,
		1,
		0,
		108,
		26,
		2,
		0,
		43,
		24,
		2,
		2,
		15,
		18,
		2,
		2,
		11,
		22,
		2,
		0,
		68,
		18,
		4,
		0,
		27,
		16,
		4,
		0,
		19,
		24,
		4,
		0,
		15,
		28,
		2,
		0,
		78,
		20,
		4,
		0,
		31,
		18,
		2,
		4,
		14,
		18,
		4,
		1,
		13,
		26,
		2,
		0,
		97,
		24,
		2,
		2,
		38,
		22,
		4,
		2,
		18,
		22,
		4,
		2,
		14,
		26,
		2,
		0,
		116,
		30,
		3,
		2,
		36,
		22,
		4,
		4,
		16,
		20,
		4,
		4,
		12,
		24,
		2,
		2,
		68,
		18,
		4,
		1,
		43,
		26,
		6,
		2,
		19,
		24,
		6,
		2,
		15,
		28,
		4,
		0,
		81,
		20,
		1,
		4,
		50,
		30,
		4,
		4,
		22,
		28,
		3,
		8,
		12,
		24,
		2,
		2,
		92,
		24,
		6,
		2,
		36,
		22,
		4,
		6,
		20,
		26,
		7,
		4,
		14,
		28,
		4,
		0,
		107,
		26,
		8,
		1,
		37,
		22,
		8,
		4,
		20,
		24,
		12,
		4,
		11,
		22,
		3,
		1,
		115,
		30,
		4,
		5,
		40,
		24,
		11,
		5,
		16,
		20,
		11,
		5,
		12,
		24,
		5,
		1,
		87,
		22,
		5,
		5,
		41,
		24,
		5,
		7,
		24,
		30,
		11,
		7,
		12,
		24,
		5,
		1,
		98,
		24,
		7,
		3,
		45,
		28,
		15,
		2,
		19,
		24,
		3,
		13,
		15,
		30,
		1,
		5,
		107,
		28,
		10,
		1,
		46,
		28,
		1,
		15,
		22,
		28,
		2,
		17,
		14,
		28,
		5,
		1,
		120,
		30,
		9,
		4,
		43,
		26,
		17,
		1,
		22,
		28,
		2,
		19,
		14,
		28,
		3,
		4,
		113,
		28,
		3,
		11,
		44,
		26,
		17,
		4,
		21,
		26,
		9,
		16,
		13,
		26,
		3,
		5,
		107,
		28,
		3,
		13,
		41,
		26,
		15,
		5,
		24,
		30,
		15,
		10,
		15,
		28,
		4,
		4,
		116,
		28,
		17,
		0,
		42,
		26,
		17,
		6,
		22,
		28,
		19,
		6,
		16,
		30,
		2,
		7,
		111,
		28,
		17,
		0,
		46,
		28,
		7,
		16,
		24,
		30,
		34,
		0,
		13,
		24,
		4,
		5,
		121,
		30,
		4,
		14,
		47,
		28,
		11,
		14,
		24,
		30,
		16,
		14,
		15,
		30,
		6,
		4,
		117,
		30,
		6,
		14,
		45,
		28,
		11,
		16,
		24,
		30,
		30,
		2,
		16,
		30,
		8,
		4,
		106,
		26,
		8,
		13,
		47,
		28,
		7,
		22,
		24,
		30,
		22,
		13,
		15,
		30,
		10,
		2,
		114,
		28,
		19,
		4,
		46,
		28,
		28,
		6,
		22,
		28,
		33,
		4,
		16,
		30,
		8,
		4,
		122,
		30,
		22,
		3,
		45,
		28,
		8,
		26,
		23,
		30,
		12,
		28,
		15,
		30,
		3,
		10,
		117,
		30,
		3,
		23,
		45,
		28,
		4,
		31,
		24,
		30,
		11,
		31,
		15,
		30,
		7,
		7,
		116,
		30,
		21,
		7,
		45,
		28,
		1,
		37,
		23,
		30,
		19,
		26,
		15,
		30,
		5,
		10,
		115,
		30,
		19,
		10,
		47,
		28,
		15,
		25,
		24,
		30,
		23,
		25,
		15,
		30,
		13,
		3,
		115,
		30,
		2,
		29,
		46,
		28,
		42,
		1,
		24,
		30,
		23,
		28,
		15,
		30,
		17,
		0,
		115,
		30,
		10,
		23,
		46,
		28,
		10,
		35,
		24,
		30,
		19,
		35,
		15,
		30,
		17,
		1,
		115,
		30,
		14,
		21,
		46,
		28,
		29,
		19,
		24,
		30,
		11,
		46,
		15,
		30,
		13,
		6,
		115,
		30,
		14,
		23,
		46,
		28,
		44,
		7,
		24,
		30,
		59,
		1,
		16,
		30,
		12,
		7,
		121,
		30,
		12,
		26,
		47,
		28,
		39,
		14,
		24,
		30,
		22,
		41,
		15,
		30,
		6,
		14,
		121,
		30,
		6,
		34,
		47,
		28,
		46,
		10,
		24,
		30,
		2,
		64,
		15,
		30,
		17,
		4,
		122,
		30,
		29,
		14,
		46,
		28,
		49,
		10,
		24,
		30,
		24,
		46,
		15,
		30,
		4,
		18,
		122,
		30,
		13,
		32,
		46,
		28,
		48,
		14,
		24,
		30,
		42,
		32,
		15,
		30,
		20,
		4,
		117,
		30,
		40,
		7,
		47,
		28,
		43,
		22,
		24,
		30,
		10,
		67,
		15,
		30,
		19,
		6,
		118,
		30,
		18,
		31,
		47,
		28,
		34,
		34,
		24,
		30,
		20,
		61,
		15,
		30
	];
	var glog = [
		255,
		0,
		1,
		25,
		2,
		50,
		26,
		198,
		3,
		223,
		51,
		238,
		27,
		104,
		199,
		75,
		4,
		100,
		224,
		14,
		52,
		141,
		239,
		129,
		28,
		193,
		105,
		248,
		200,
		8,
		76,
		113,
		5,
		138,
		101,
		47,
		225,
		36,
		15,
		33,
		53,
		147,
		142,
		218,
		240,
		18,
		130,
		69,
		29,
		181,
		194,
		125,
		106,
		39,
		249,
		185,
		201,
		154,
		9,
		120,
		77,
		228,
		114,
		166,
		6,
		191,
		139,
		98,
		102,
		221,
		48,
		253,
		226,
		152,
		37,
		179,
		16,
		145,
		34,
		136,
		54,
		208,
		148,
		206,
		143,
		150,
		219,
		189,
		241,
		210,
		19,
		92,
		131,
		56,
		70,
		64,
		30,
		66,
		182,
		163,
		195,
		72,
		126,
		110,
		107,
		58,
		40,
		84,
		250,
		133,
		186,
		61,
		202,
		94,
		155,
		159,
		10,
		21,
		121,
		43,
		78,
		212,
		229,
		172,
		115,
		243,
		167,
		87,
		7,
		112,
		192,
		247,
		140,
		128,
		99,
		13,
		103,
		74,
		222,
		237,
		49,
		197,
		254,
		24,
		227,
		165,
		153,
		119,
		38,
		184,
		180,
		124,
		17,
		68,
		146,
		217,
		35,
		32,
		137,
		46,
		55,
		63,
		209,
		91,
		149,
		188,
		207,
		205,
		144,
		135,
		151,
		178,
		220,
		252,
		190,
		97,
		242,
		86,
		211,
		171,
		20,
		42,
		93,
		158,
		132,
		60,
		57,
		83,
		71,
		109,
		65,
		162,
		31,
		45,
		67,
		216,
		183,
		123,
		164,
		118,
		196,
		23,
		73,
		236,
		127,
		12,
		111,
		246,
		108,
		161,
		59,
		82,
		41,
		157,
		85,
		170,
		251,
		96,
		134,
		177,
		187,
		204,
		62,
		90,
		203,
		89,
		95,
		176,
		156,
		169,
		160,
		81,
		11,
		245,
		22,
		235,
		122,
		117,
		44,
		215,
		79,
		174,
		213,
		233,
		230,
		231,
		173,
		232,
		116,
		214,
		244,
		234,
		168,
		80,
		88,
		175
	];
	var gexp = [
		1,
		2,
		4,
		8,
		16,
		32,
		64,
		128,
		29,
		58,
		116,
		232,
		205,
		135,
		19,
		38,
		76,
		152,
		45,
		90,
		180,
		117,
		234,
		201,
		143,
		3,
		6,
		12,
		24,
		48,
		96,
		192,
		157,
		39,
		78,
		156,
		37,
		74,
		148,
		53,
		106,
		212,
		181,
		119,
		238,
		193,
		159,
		35,
		70,
		140,
		5,
		10,
		20,
		40,
		80,
		160,
		93,
		186,
		105,
		210,
		185,
		111,
		222,
		161,
		95,
		190,
		97,
		194,
		153,
		47,
		94,
		188,
		101,
		202,
		137,
		15,
		30,
		60,
		120,
		240,
		253,
		231,
		211,
		187,
		107,
		214,
		177,
		127,
		254,
		225,
		223,
		163,
		91,
		182,
		113,
		226,
		217,
		175,
		67,
		134,
		17,
		34,
		68,
		136,
		13,
		26,
		52,
		104,
		208,
		189,
		103,
		206,
		129,
		31,
		62,
		124,
		248,
		237,
		199,
		147,
		59,
		118,
		236,
		197,
		151,
		51,
		102,
		204,
		133,
		23,
		46,
		92,
		184,
		109,
		218,
		169,
		79,
		158,
		33,
		66,
		132,
		21,
		42,
		84,
		168,
		77,
		154,
		41,
		82,
		164,
		85,
		170,
		73,
		146,
		57,
		114,
		228,
		213,
		183,
		115,
		230,
		209,
		191,
		99,
		198,
		145,
		63,
		126,
		252,
		229,
		215,
		179,
		123,
		246,
		241,
		255,
		227,
		219,
		171,
		75,
		150,
		49,
		98,
		196,
		149,
		55,
		110,
		220,
		165,
		87,
		174,
		65,
		130,
		25,
		50,
		100,
		200,
		141,
		7,
		14,
		28,
		56,
		112,
		224,
		221,
		167,
		83,
		166,
		81,
		162,
		89,
		178,
		121,
		242,
		249,
		239,
		195,
		155,
		43,
		86,
		172,
		69,
		138,
		9,
		18,
		36,
		72,
		144,
		61,
		122,
		244,
		245,
		247,
		243,
		251,
		235,
		203,
		139,
		11,
		22,
		44,
		88,
		176,
		125,
		250,
		233,
		207,
		131,
		27,
		54,
		108,
		216,
		173,
		71,
		142,
		0
	];
	var strinbuf = [], eccbuf = [], qrframe = [], framask = [], rlens = [];
	var version, width, neccblk1, neccblk2, datablkw, eccblkwid;
	var ecclevel = 2;
	function setmask(x, y) {
		var bt;
		if (x > y) {
			bt = x;
			x = y;
			y = bt;
		}
		bt = y;
		bt *= y;
		bt += y;
		bt >>= 1;
		bt += x;
		framask[bt] = 1;
	}
	function putalign(x, y) {
		var j;
		qrframe[x + width * y] = 1;
		for (j = -2; j < 2; j++) {
			qrframe[x + j + width * (y - 2)] = 1;
			qrframe[x - 2 + width * (y + j + 1)] = 1;
			qrframe[x + 2 + width * (y + j)] = 1;
			qrframe[x + j + 1 + width * (y + 2)] = 1;
		}
		for (j = 0; j < 2; j++) {
			setmask(x - 1, y + j);
			setmask(x + 1, y - j);
			setmask(x - j, y - 1);
			setmask(x + j, y + 1);
		}
	}
	function modnn(x) {
		while (x >= 255) {
			x -= 255;
			x = (x >> 8) + (x & 255);
		}
		return x;
	}
	var genpoly = [];
	function appendrs(data, dlen, ecbuf, eclen) {
		var i, j, fb;
		for (i = 0; i < eclen; i++) strinbuf[ecbuf + i] = 0;
		for (i = 0; i < dlen; i++) {
			fb = glog[strinbuf[data + i] ^ strinbuf[ecbuf]];
			if (fb != 255) for (j = 1; j < eclen; j++) strinbuf[ecbuf + j - 1] = strinbuf[ecbuf + j] ^ gexp[modnn(fb + genpoly[eclen - j])];
			else for (j = ecbuf; j < ecbuf + eclen; j++) strinbuf[j] = strinbuf[j + 1];
			strinbuf[ecbuf + eclen - 1] = fb == 255 ? 0 : gexp[modnn(fb + genpoly[0])];
		}
	}
	function ismasked(x, y) {
		var bt;
		if (x > y) {
			bt = x;
			x = y;
			y = bt;
		}
		bt = y;
		bt += y * y;
		bt >>= 1;
		bt += x;
		return framask[bt];
	}
	function applymask(m) {
		var x, y, r3x, r3y;
		switch (m) {
			case 0:
				for (y = 0; y < width; y++) for (x = 0; x < width; x++) if (!(x + y & 1) && !ismasked(x, y)) qrframe[x + y * width] ^= 1;
				break;
			case 1:
				for (y = 0; y < width; y++) for (x = 0; x < width; x++) if (!(y & 1) && !ismasked(x, y)) qrframe[x + y * width] ^= 1;
				break;
			case 2:
				for (y = 0; y < width; y++) for (r3x = 0, x = 0; x < width; x++, r3x++) {
					if (r3x == 3) r3x = 0;
					if (!r3x && !ismasked(x, y)) qrframe[x + y * width] ^= 1;
				}
				break;
			case 3:
				for (r3y = 0, y = 0; y < width; y++, r3y++) {
					if (r3y == 3) r3y = 0;
					for (r3x = r3y, x = 0; x < width; x++, r3x++) {
						if (r3x == 3) r3x = 0;
						if (!r3x && !ismasked(x, y)) qrframe[x + y * width] ^= 1;
					}
				}
				break;
			case 4:
				for (y = 0; y < width; y++) for (r3x = 0, r3y = y >> 1 & 1, x = 0; x < width; x++, r3x++) {
					if (r3x == 3) {
						r3x = 0;
						r3y = !r3y;
					}
					if (!r3y && !ismasked(x, y)) qrframe[x + y * width] ^= 1;
				}
				break;
			case 5:
				for (r3y = 0, y = 0; y < width; y++, r3y++) {
					if (r3y == 3) r3y = 0;
					for (r3x = 0, x = 0; x < width; x++, r3x++) {
						if (r3x == 3) r3x = 0;
						if (!((x & y & 1) + !(!r3x | !r3y)) && !ismasked(x, y)) qrframe[x + y * width] ^= 1;
					}
				}
				break;
			case 6:
				for (r3y = 0, y = 0; y < width; y++, r3y++) {
					if (r3y == 3) r3y = 0;
					for (r3x = 0, x = 0; x < width; x++, r3x++) {
						if (r3x == 3) r3x = 0;
						if (!((x & y & 1) + (r3x && r3x == r3y) & 1) && !ismasked(x, y)) qrframe[x + y * width] ^= 1;
					}
				}
				break;
			case 7:
				for (r3y = 0, y = 0; y < width; y++, r3y++) {
					if (r3y == 3) r3y = 0;
					for (r3x = 0, x = 0; x < width; x++, r3x++) {
						if (r3x == 3) r3x = 0;
						if (!((r3x && r3x == r3y) + (x + y & 1) & 1) && !ismasked(x, y)) qrframe[x + y * width] ^= 1;
					}
				}
				break;
		}
	}
	var N1 = 3, N2 = 3, N3 = 40, N4 = 10;
	function badruns(length) {
		var i;
		var runsbad = 0;
		for (i = 0; i <= length; i++) if (rlens[i] >= 5) runsbad += N1 + rlens[i] - 5;
		for (i = 3; i < length - 1; i += 2) if (rlens[i - 2] == rlens[i + 2] && rlens[i + 2] == rlens[i - 1] && rlens[i - 1] == rlens[i + 1] && rlens[i - 1] * 3 == rlens[i] && (rlens[i - 3] == 0 || i + 3 > length || rlens[i - 3] * 3 >= rlens[i] * 4 || rlens[i + 3] * 3 >= rlens[i] * 4)) runsbad += N3;
		return runsbad;
	}
	function badcheck() {
		var x, y, h, b, b1;
		var thisbad = 0;
		var bw = 0;
		for (y = 0; y < width - 1; y++) for (x = 0; x < width - 1; x++) if (qrframe[x + width * y] && qrframe[x + 1 + width * y] && qrframe[x + width * (y + 1)] && qrframe[x + 1 + width * (y + 1)] || !(qrframe[x + width * y] || qrframe[x + 1 + width * y] || qrframe[x + width * (y + 1)] || qrframe[x + 1 + width * (y + 1)])) thisbad += N2;
		for (y = 0; y < width; y++) {
			rlens[0] = 0;
			for (h = b = x = 0; x < width; x++) {
				if ((b1 = qrframe[x + width * y]) == b) rlens[h]++;
				else rlens[++h] = 1;
				b = b1;
				bw += b ? 1 : -1;
			}
			thisbad += badruns(h);
		}
		if (bw < 0) bw = -bw;
		var big = bw;
		var count = 0;
		big += big << 2;
		big <<= 1;
		while (big > width * width) big -= width * width, count++;
		thisbad += count * N4;
		for (x = 0; x < width; x++) {
			rlens[0] = 0;
			for (h = b = y = 0; y < width; y++) {
				if ((b1 = qrframe[x + width * y]) == b) rlens[h]++;
				else rlens[++h] = 1;
				b = b1;
			}
			thisbad += badruns(h);
		}
		return thisbad;
	}
	function genframe(instring) {
		var x, y, k, t = instring.length, v, i, j, m;
		version = 0;
		do {
			version++;
			k = (ecclevel - 1) * 4 + (version - 1) * 16;
			neccblk1 = eccblocks[k++];
			neccblk2 = eccblocks[k++];
			datablkw = eccblocks[k++];
			eccblkwid = eccblocks[k];
			k = datablkw * (neccblk1 + neccblk2) + neccblk2 - 3 + (version <= 9);
			if (t <= k) break;
		} while (version < 40);
		width = 17 + 4 * version;
		v = datablkw + (datablkw + eccblkwid) * (neccblk1 + neccblk2) + neccblk2;
		for (t = 0; t < v; t++) eccbuf[t] = 0;
		strinbuf = instring.slice(0);
		for (t = 0; t < width * width; t++) qrframe[t] = 0;
		for (t = 0; t < (width * (width + 1) + 1) / 2; t++) framask[t] = 0;
		for (t = 0; t < 3; t++) {
			k = 0;
			y = 0;
			if (t == 1) k = width - 7;
			if (t == 2) y = width - 7;
			qrframe[y + 3 + width * (k + 3)] = 1;
			for (x = 0; x < 6; x++) {
				qrframe[y + x + width * k] = 1;
				qrframe[y + width * (k + x + 1)] = 1;
				qrframe[y + 6 + width * (k + x)] = 1;
				qrframe[y + x + 1 + width * (k + 6)] = 1;
			}
			for (x = 1; x < 5; x++) {
				setmask(y + x, k + 1);
				setmask(y + 1, k + x + 1);
				setmask(y + 5, k + x);
				setmask(y + x + 1, k + 5);
			}
			for (x = 2; x < 4; x++) {
				qrframe[y + x + width * (k + 2)] = 1;
				qrframe[y + 2 + width * (k + x + 1)] = 1;
				qrframe[y + 4 + width * (k + x)] = 1;
				qrframe[y + x + 1 + width * (k + 4)] = 1;
			}
		}
		if (version > 1) {
			t = adelta[version];
			y = width - 7;
			for (;;) {
				x = width - 7;
				while (x > t - 3) {
					putalign(x, y);
					if (x < t) break;
					x -= t;
				}
				if (y <= t + 9) break;
				y -= t;
				putalign(6, y);
				putalign(y, 6);
			}
		}
		qrframe[8 + width * (width - 8)] = 1;
		for (y = 0; y < 7; y++) {
			setmask(7, y);
			setmask(width - 8, y);
			setmask(7, y + width - 7);
		}
		for (x = 0; x < 8; x++) {
			setmask(x, 7);
			setmask(x + width - 8, 7);
			setmask(x, width - 8);
		}
		for (x = 0; x < 9; x++) setmask(x, 8);
		for (x = 0; x < 8; x++) {
			setmask(x + width - 8, 8);
			setmask(8, x);
		}
		for (y = 0; y < 7; y++) setmask(8, y + width - 7);
		for (x = 0; x < width - 14; x++) if (x & 1) {
			setmask(8 + x, 6);
			setmask(6, 8 + x);
		} else {
			qrframe[8 + x + width * 6] = 1;
			qrframe[6 + width * (8 + x)] = 1;
		}
		if (version > 6) {
			t = vpat[version - 7];
			k = 17;
			for (x = 0; x < 6; x++) for (y = 0; y < 3; y++, k--) if (1 & (k > 11 ? version >> k - 12 : t >> k)) {
				qrframe[5 - x + width * (2 - y + width - 11)] = 1;
				qrframe[2 - y + width - 11 + width * (5 - x)] = 1;
			} else {
				setmask(5 - x, 2 - y + width - 11);
				setmask(2 - y + width - 11, 5 - x);
			}
		}
		for (y = 0; y < width; y++) for (x = 0; x <= y; x++) if (qrframe[x + width * y]) setmask(x, y);
		v = strinbuf.length;
		for (i = 0; i < v; i++) eccbuf[i] = strinbuf.charCodeAt(i);
		strinbuf = eccbuf.slice(0);
		x = datablkw * (neccblk1 + neccblk2) + neccblk2;
		if (v >= x - 2) {
			v = x - 2;
			if (version > 9) v--;
		}
		i = v;
		if (version > 9) {
			strinbuf[i + 2] = 0;
			strinbuf[i + 3] = 0;
			while (i--) {
				t = strinbuf[i];
				strinbuf[i + 3] |= 255 & t << 4;
				strinbuf[i + 2] = t >> 4;
			}
			strinbuf[2] |= 255 & v << 4;
			strinbuf[1] = v >> 4;
			strinbuf[0] = 64 | v >> 12;
		} else {
			strinbuf[i + 1] = 0;
			strinbuf[i + 2] = 0;
			while (i--) {
				t = strinbuf[i];
				strinbuf[i + 2] |= 255 & t << 4;
				strinbuf[i + 1] = t >> 4;
			}
			strinbuf[1] |= 255 & v << 4;
			strinbuf[0] = 64 | v >> 4;
		}
		i = v + 3 - (version < 10);
		while (i < x) {
			strinbuf[i++] = 236;
			strinbuf[i++] = 17;
		}
		genpoly[0] = 1;
		for (i = 0; i < eccblkwid; i++) {
			genpoly[i + 1] = 1;
			for (j = i; j > 0; j--) genpoly[j] = genpoly[j] ? genpoly[j - 1] ^ gexp[modnn(glog[genpoly[j]] + i)] : genpoly[j - 1];
			genpoly[0] = gexp[modnn(glog[genpoly[0]] + i)];
		}
		for (i = 0; i <= eccblkwid; i++) genpoly[i] = glog[genpoly[i]];
		k = x;
		y = 0;
		for (i = 0; i < neccblk1; i++) {
			appendrs(y, datablkw, k, eccblkwid);
			y += datablkw;
			k += eccblkwid;
		}
		for (i = 0; i < neccblk2; i++) {
			appendrs(y, datablkw + 1, k, eccblkwid);
			y += datablkw + 1;
			k += eccblkwid;
		}
		y = 0;
		for (i = 0; i < datablkw; i++) {
			for (j = 0; j < neccblk1; j++) eccbuf[y++] = strinbuf[i + j * datablkw];
			for (j = 0; j < neccblk2; j++) eccbuf[y++] = strinbuf[neccblk1 * datablkw + i + j * (datablkw + 1)];
		}
		for (j = 0; j < neccblk2; j++) eccbuf[y++] = strinbuf[neccblk1 * datablkw + i + j * (datablkw + 1)];
		for (i = 0; i < eccblkwid; i++) for (j = 0; j < neccblk1 + neccblk2; j++) eccbuf[y++] = strinbuf[x + i + j * eccblkwid];
		strinbuf = eccbuf;
		x = y = width - 1;
		k = v = 1;
		m = (datablkw + eccblkwid) * (neccblk1 + neccblk2) + neccblk2;
		for (i = 0; i < m; i++) {
			t = strinbuf[i];
			for (j = 0; j < 8; j++, t <<= 1) {
				if (128 & t) qrframe[x + width * y] = 1;
				do {
					if (v) x--;
					else {
						x++;
						if (k) if (y != 0) y--;
						else {
							x -= 2;
							k = !k;
							if (x == 6) {
								x--;
								y = 9;
							}
						}
						else if (y != width - 1) y++;
						else {
							x -= 2;
							k = !k;
							if (x == 6) {
								x--;
								y -= 8;
							}
						}
					}
					v = !v;
				} while (ismasked(x, y));
			}
		}
		strinbuf = qrframe.slice(0);
		t = 0;
		y = 3e4;
		for (k = 0; k < 8; k++) {
			applymask(k);
			x = badcheck();
			if (x < y) {
				y = x;
				t = k;
			}
			if (t == 7) break;
			qrframe = strinbuf.slice(0);
		}
		if (t != k) applymask(t);
		y = fmtword[t + (ecclevel - 1 << 3)];
		for (k = 0; k < 8; k++, y >>= 1) if (y & 1) {
			qrframe[width - 1 - k + width * 8] = 1;
			if (k < 6) qrframe[8 + width * k] = 1;
			else qrframe[8 + width * (k + 1)] = 1;
		}
		for (k = 0; k < 7; k++, y >>= 1) if (y & 1) {
			qrframe[8 + width * (width - 7 + k)] = 1;
			if (k) qrframe[6 - k + width * 8] = 1;
			else qrframe[7 + width * 8] = 1;
		}
		return qrframe;
	}
	var _canvas = null;
	return {
		get ecclevel() {
			return ecclevel;
		},
		set ecclevel(val) {
			ecclevel = val;
		},
		get size() {
			return _size;
		},
		set size(val) {
			_size = val;
		},
		get canvas() {
			return _canvas;
		},
		set canvas(el) {
			_canvas = el;
		},
		getFrame: function(string) {
			return genframe(string);
		},
		utf16to8: function(str) {
			var out = "", i, len = str.length, c;
			for (i = 0; i < len; i++) {
				c = str.charCodeAt(i);
				if (c >= 1 && c <= 127) out += str.charAt(i);
				else if (c > 2047) {
					out += String.fromCharCode(224 | c >> 12 & 15);
					out += String.fromCharCode(128 | c >> 6 & 63);
					out += String.fromCharCode(128 | c >> 0 & 63);
				} else {
					out += String.fromCharCode(192 | c >> 6 & 31);
					out += String.fromCharCode(128 | c >> 0 & 63);
				}
			}
			return out;
		},
		/***********
		* QR.draw({
		*         content: text,
		*         width: 400,
		*         height: 400,
		*         margin: 0
		*       });
		* @param opts
		* @returns {Promise<unknown>}
		*/
		draw: function(opts) {
			var that = this;
			ecclevel = opts.level || ecclevel;
			var margin = opts.margin === void 0 ? 8 : opts.margin;
			var str = that.utf16to8(opts.content);
			const canvas = document.createElement("canvas");
			const dpr = 1;
			canvas.width = opts.width * dpr || 1e3;
			canvas.height = opts.height * dpr || 1e3;
			var frame = that.getFrame(str), ctx = canvas.getContext("2d"), px = Math.round(canvas.width / (width + margin));
			var roundedSize = px * (width + margin), offset = Math.floor((canvas.width - roundedSize) / 2);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = opts.backgroudColor || "#ffffff";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = opts.textColor || "#000000";
			for (var i = 0; i < width; i++) for (var j = 0; j < width; j++) if (frame[j * width + i]) ctx.fillRect(px * (margin / 2 + i) + offset, px * (margin / 2 + j) + offset, px, px);
			return canvas.toDataURL();
		}
	};
})();
//#endregion
//#region src/common/api/fetch/index.js
/************
* 获取文件配置信息
*/
async function FILES_PACKAGE() {
	const [res, err] = await $http.awaitTo($http.get($api.getRealSiteConf));
	if (err) return null;
	return getJSON(getJSON(res.data, null).extend, null);
}
//#endregion
//#region src/common/router/modules/index.js
/******
* 模块路由配置
*/
var modules_default = [
	{
		path: "/index",
		name: "首页",
		meta: { cache: false },
		component: () => import("./assets/index-DUuYUhfw.js")
	},
	{
		path: "/login",
		name: "登录",
		component: () => import("./assets/login-2F0Y3Y7u.js")
	},
	{
		path: "/:error*",
		name: "星途创新{views}",
		component: () => import("./assets/error-page-m5hSN-lI.js")
	}
];
//#endregion
//#region src/views/app/async-data.js
/******************
* 获取主模块scrolled函数
* @param route
*/
function componentScroll(route) {
	const { scrolled } = route?.matched?.[0]?.components?.default || {};
	if (scrolled) return {
		fn: scrolled,
		trigger: true,
		vm: route.matched[0].instances.default
	};
	return [];
}
//#endregion
//#region src/common/util/page-scroll.js
/**********
* 禁止body底层滚动
* @param e
* @private
*/
/*************
* 禁止body触摸滑动
* @param e
* @private
*/
function _stopScroll(e) {
	e.preventDefault();
}
var _events = [], _timer$1 = null, _clear = null;
/********
* 获取滚动值
* @param node
* @returns {{top: *, left: *}}
* @private
*/
function _getScrollOffset(node) {
	if (node !== document) return {
		left: node.scrollLeft,
		top: node.scrollTop
	};
	if (window.scrollY !== void 0) return {
		left: window.scrollX,
		top: window.scrollY
	};
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
	if (node === window || node === document.body) return document;
	return node;
}
var pageScroll = {
	/*********
	* 停止页面滚动
	*/
	stop() {
		if (isLock("page-scroll")) return pageScroll;
		lock("page-scroll");
		document.body.addEventListener("touchmove", _stopScroll, { passive: false });
		return pageScroll;
	},
	/******
	* 启用页面滚动
	*/
	start() {
		if (!isLock("page-scroll")) return this;
		unLock("page-scroll");
		document.body.removeEventListener("touchmove", _stopScroll, { passive: false });
		return pageScroll;
	},
	toggle(bool) {
		if (bool) return pageScroll.stop();
		else return pageScroll.start();
	},
	/**************
	* 解除滚动监听
	* @param node
	* @param fns
	* @returns {any}
	*/
	off(node, fns) {
		const methods = [].concat(node).concat(fns).filter((item) => isFunction(item?.fn || item)).map((item) => item.fn || item);
		if (methods.length === 0) return pageScroll;
		const dom = isNode(node) ? _getCurrentNode(node) : document;
		const index = _events.findIndex((item) => item.node === dom);
		if (index === -1) return pageScroll;
		const obj = _events[index];
		obj.events = obj.events.filter((item) => !methods.includes(item?.fn || item));
		if (obj.events.length === 0) {
			dom.removeEventListener("scroll", obj.scroll, { passive: true });
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
		const methods = [].concat(node).concat(fns).filter((item) => isFunction(item?.fn || item));
		if (methods.length === 0) return pageScroll;
		const dom = isNode(node) ? _getCurrentNode(node) : document;
		const obj = _events.find((item) => item.node === dom);
		if (obj) obj.events.push(...methods);
		else {
			const data = {
				node: dom,
				events: methods,
				scroll: (ev) => {
					const offset = _getScrollOffset(ev.target);
					const obj = {
						scrollLeft: offset.left,
						scrollTop: offset.top
					};
					data.events.forEach((item) => {
						if (isFunction(item)) item(obj);
						else if (isFunction(item.fn)) item.fn.call(item.vm, obj);
					});
				}
			};
			_events.push(data);
			dom.addEventListener("scroll", data.scroll, { passive: true });
		}
		methods.forEach((item) => {
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
		if (time > 0 && _timer$1 !== null) {
			clearInterval(_timer$1);
			clearTimeout(_clear);
			_timer$1 = null;
			_clear = null;
		}
		let isRoot = true;
		let node = document;
		if (isNode(this)) {
			isRoot = _getScrollOffset(this) === document;
			node = isRoot ? document : this;
		}
		if (time === 0) {
			isFunction(callback) && setTimeout(() => {
				callback({
					x: sx,
					y: sy
				});
			}, 50);
			if (isRoot) window.scrollTo(sx, sy);
			else {
				node.scrollTop = sy;
				node.scrollLeft = sx;
			}
		} else {
			const offset = _getScrollOffset(node);
			const x = sx - offset.left, y = sy - offset.top;
			const max = Math.max(Math.abs(x), Math.abs(y));
			const roll = Math.max(1, Math.round(max / (time / 5)));
			let min = 0;
			_timer$1 = setInterval(() => {
				if (min >= max) {
					clearInterval(_timer$1);
					clearTimeout(_clear);
					_timer$1 = null;
					min = max;
					isFunction(callback) && setTimeout(() => {
						const offset = _getScrollOffset(node);
						callback({
							x: offset.left,
							y: offset.top
						});
					}, 50);
				}
				const sTop = offset.top + Math.min(min, Math.abs(y)) * (y > 0 ? 1 : -1);
				const sLeft = offset.left + Math.min(min, Math.abs(x)) * (x > 0 ? 1 : -1);
				if (isRoot) window.scrollTo(sLeft, sTop);
				else {
					node.scrollTop = sTop;
					node.scrollLeft = sLeft;
				}
				min += roll;
			}, 5);
			_clear = setTimeout(() => {
				clearInterval(_timer$1);
				_timer$1 = null;
				isFunction(callback) && setTimeout(() => {
					if (isRoot) window.scrollTo(sx, sy);
					else {
						node.scrollTop = sy;
						node.scrollLeft = sx;
					}
					const offset = _getScrollOffset(node);
					callback({
						x: offset.left,
						y: offset.top
					});
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
//#endregion
//#region src/common/util/router-position.js
/**************
* 记录路由位置
*/
var router_position_default = {
	_map: {},
	add(path) {
		if (isArray(path)) path.forEach((key) => {
			this._map[key] = {
				left: 0,
				top: 0
			};
		});
		else this._map[path] = {
			left: 0,
			top: 0
		};
	},
	position(to, from, def) {
		if (this._map[to.path] && this._map[from.path]) return this._map[to.path];
		return def;
	},
	savedPosition(to, from) {
		console.log(to.path, from.path, this._map);
		if (this._map[to.path] && this._map[from.path]) this._map[from.path] = pageScroll.getScroll();
	}
};
//#endregion
//#region src/common/router/index.js
/**
*  路由配置
* **/
var _serverRouter = null;
router_position_default.add([
	"/index",
	"/product",
	"/shopping-cart",
	"/member"
]);
function _createRouter() {
	const router = createRouter({
		history: env_default.isServer() ? createMemoryHistory() : createWebHistory(),
		routes: modules_default,
		scrollBehavior(to, from, savedPosition) {
			if (router_map_default.isNext()) return router_position_default.position(to, from, { top: 0 });
			return router_position_default.position(to, from, savedPosition);
		}
	});
	const _push = router.push;
	router.push = function push(location) {
		if (arguments.length > 1) return _push.apply(this, arguments);
		return _push.call(this, location);
	};
	const _replace = router.replace;
	router.replace = function replace(location) {
		if (arguments.length > 1) return _replace.apply(this, arguments);
		return _replace.call(this, location);
	};
	/********************** loading chunk 出错处理 **********************/
	let reloadTimer = null;
	router.onError(async (error) => {
		if (error.message.match(/Loading chunk (.)+ failed/g) && reloadTimer === null) {
			const obj = _Storage.session.get("10041") || {
				now: Date.now(),
				num: 1
			};
			if (Date.now() - obj.now < 6e4 && obj.num <= 3) reloadTimer = setTimeout(() => {
				obj.now = Date.now();
				obj.num += 1;
				_Storage.session.set(LOADING_CHUNK, obj);
				window.location.reload();
			}, 1e3);
			else if (obj.num === 4) {
				const data = await FILES_PACKAGE();
				if (data) {
					const { css, js } = data.filename;
					css?.forEach((url) => {
						createCss(`/${url}`);
					});
					js?.forEach((url) => {
						createScript(`/${url}`);
					});
				}
				obj.num += 1;
				_Storage.session.set(LOADING_CHUNK, obj);
			}
		}
	});
	router.isReady().then(() => {
		$event.on(EVENTS.CLEAR_CACHE, () => {});
	});
	router.afterEach((to) => {
		$event.emit("afterEach", { to });
		if (env_default.isClient()) {
			setTimeout(() => {
				pageScroll.on(componentScroll(to));
			}, 20);
			if (to.query?.title || to.name) document.title = (to.query?.title || to.name).replace(/\{\s*([\w\W]*)\}/g, function() {
				const name = RegExp.$1.trim();
				return to.query?.[name] || "";
			});
		}
		$bar.finish();
	});
	_serverRouter = router;
	return router;
}
var clientRouter = _createRouter();
var useRouter = () => {
	return env_default.isServer() ? _serverRouter : clientRouter;
};
var getCurrentRoute = () => {
	const route = useRouter().currentRoute.value;
	return {
		url: env_default.isServer() ? route.fullPath : location.href,
		...route
	};
};
//#endregion
//#region src/lib/str/base64.js
/**
*  Base64 encode / decode
*  加密 encode() 解密 decode
*/
var base64_default = {
	_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	encode(input) {
		const _utf8_encode = function(string) {
			string = string.replace(/\r\n/g, "\n");
			let utftext = "";
			for (let n = 0; n < string.length; n++) {
				const c = string.charCodeAt(n);
				if (c < 128) utftext += String.fromCharCode(c);
				else if (c > 127 && c < 2048) {
					utftext += String.fromCharCode(c >> 6 | 192);
					utftext += String.fromCharCode(c & 63 | 128);
				} else {
					utftext += String.fromCharCode(c >> 12 | 224);
					utftext += String.fromCharCode(c >> 6 & 63 | 128);
					utftext += String.fromCharCode(c & 63 | 128);
				}
			}
			return utftext;
		};
		let output = "";
		let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		let i = 0;
		input = _utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = (chr1 & 3) << 4 | chr2 >> 4;
			enc3 = (chr2 & 15) << 2 | chr3 >> 6;
			enc4 = chr3 & 63;
			if (isNaN(chr2)) enc3 = enc4 = 64;
			else if (isNaN(chr3)) enc4 = 64;
			output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		}
		return output;
	},
	decode(input) {
		const _utf8_decode = function(utftext) {
			let string = "";
			let i = 0;
			let c = 0;
			let c1 = 0;
			let c2 = 0;
			while (i < utftext.length) {
				c = utftext.charCodeAt(i);
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if (c > 191 && c < 224) {
					c1 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode((c & 31) << 6 | c1 & 63);
					i += 2;
				} else {
					c1 = utftext.charCodeAt(i + 1);
					c2 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode((c & 15) << 12 | (c1 & 63) << 6 | c2 & 63);
					i += 3;
				}
			}
			return string;
		};
		let output = "";
		let chr1, chr2, chr3;
		let enc1, enc2, enc3, enc4;
		let i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
			chr1 = enc1 << 2 | enc2 >> 4;
			chr2 = (enc2 & 15) << 4 | enc3 >> 2;
			chr3 = (enc3 & 3) << 6 | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 !== 64) output = output + String.fromCharCode(chr2);
			if (enc4 !== 64) output = output + String.fromCharCode(chr3);
		}
		output = _utf8_decode(output);
		return output;
	}
};
//#endregion
//#region src/common/util/index.js
/***********
* 工具类，汇总
*/
function toLogin(replace, fullPath) {
	const router = useRouter();
	const route = router.currentRoute.value;
	if (env_default.isClient() && bridge.isApp()) return router.push({
		path: "/login/app",
		query: { url: fullPath || route.fullPath }
	});
	if (env_default.isClient() && bridge.isWeApp()) {
		const fetchId = getRandom(32);
		jweixin_1_6_0_default.miniProgram.navigateTo({ url: `/views/login/index?fetchId=${fetchId}&type=_ssr_activity_&time=${Date.now()}&url=${encodeURIComponent(fullPath || route.fullPath)}` });
		return fetchId;
	}
	const type = replace ? "replace" : "push";
	router[type]({
		path: "/login",
		query: {
			url: fullPath || route.fullPath,
			type
		}
	});
}
function toHome() {
	if (bridge.isApp()) bridge.toAppHomePage("0");
	else toPage("/index", "switchTab");
}
function isLogin() {
	return !!clientStore.state.token || !!_Storage.cookie.get("10001");
}
/**********
* 获取小程序实际URL
* @param url
* @returns {string}
*/
function realAppletUrl(url) {
	const arr = url.split("?");
	let path = arr[0].replace(/(\/?spread)|(\/?views)|(\/index)/g, "");
	if (path === "" && arr[0].includes("/index")) path = "/index";
	let packName = "";
	if (arr[0].includes("spread/")) packName = "/spread";
	return `${packName}/views${path}/index${arr.length > 1 ? "?" + arr[1] : ""}`;
}
/************
* 去其它页面
* @param url
* @param type 默认push
*/
function toPage(url, type) {
	if (bridge.isWeApp()) {
		if (isObject(url)) {
			const { path, query } = url;
			url = query_default.url(path, query);
		}
		let fullPath = realAppletUrl(url);
		jweixin_1_6_0_default.miniProgram[{
			replace: "redirectTo",
			launch: "reLaunch",
			switchTab: "switchTab"
		}[type] || "navigateTo"]({ url: fullPath });
	} else clientRouter.push(url);
}
/**********
* 图片加载
* @param src
* @param defImg
* @returns {Promise<unknown>}
*/
function imageLoad(src, defImg) {
	return new Promise((resolve) => {
		let img = new Image();
		img.crossOrigin = "";
		img.src = src;
		if (img.complete) {
			resolve(img);
			console.log("img-complete");
		}
		img.onload = (e) => {
			resolve(img);
			console.log("img-load", e);
		};
		img.onerror = (e) => {
			resolve(defImg || img);
			console.log("img-err", e);
		};
	});
}
/*******
* 返回JSON
* @param str
* @param def
* @returns {*}
*/
function getJSON(str, def) {
	if (!str) return def || str;
	try {
		return new Function(`return ${str}`)();
	} catch (e) {
		return def || str;
	}
}
/*********
* webp兼容
* @param url
* @returns {string|*}
*/
function getWebpImg(url) {
	if (!url) return null;
	const sign = "jpg_url=";
	if (url.indexOf(sign) > -1) {
		let value = url.split(sign)[1];
		let other = value.indexOf("&");
		if (other > -1) value = value.slice(0, other);
		return base64_default.decode(value);
	} else return null;
}
function createScript(url) {
	const root = document.getElementsByTagName("head")[0];
	const script = document.createElement("script");
	script.async = true;
	script.defer = "defer";
	script.src = url;
	root.appendChild(script);
}
function createCss(url) {
	const root = document.getElementsByTagName("head")[0];
	const link = document.createElement("link");
	link.href = url;
	link.type = "text/css";
	link.rel = "stylesheet";
	root.appendChild(link);
}
function getImageBase64(img, quality) {
	const canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	canvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
	return canvas.toDataURL("image/jpeg", quality || 1);
}
function transformTokenUrl(url) {
	if (url.includes("token")) {
		const arr = decodeURIComponent(url).split("?");
		const obj = query_default.parse(arr[1]);
		if (obj.token) {
			let token = obj.token.replace(/^([^\.]*)/g, "*****");
			return query_default.url(url, { token });
		}
	}
	return url;
}
//#endregion
//#region src/common/store/actions.js
var actions_default = {
	/***********
	* UTM数据点击上报
	* @param store
	* @returns {Promise<*|boolean|void>}
	* @constructor
	*/
	async UTM_HIT_REPORT(store) {
		const [res, err] = await $http.awaitTo($http.post($api.utmReportHits, {
			deviceType: String(store.state.deviceType),
			utmId: String(store.state.utm || ""),
			wechatOpenId: ""
		}, { alert: false }));
		return !err;
	},
	/**
	* @description: 初始化站点信息
	*/
	INIT_SITE_INFO({ commit }) {
		return $http.get($api.getRealSiteConf, { alert: false }).then((res) => {
			commit("UPDATE_SITE_INFO", res.data);
		});
	},
	/***************
	* 获取个人信息列表
	* @param store
	* @returns {Promise<void>}
	* @constructor
	*/
	async USER_INFO_LIST(store) {
		if (!store.state.token) return false;
		const [res, err] = await $http.awaitTo($http.get($api.userInfoNoJump, { alert: false }));
		if (err) return false;
		store.commit("UPDATE_USERINFO", res.data);
		return true;
	},
	/***********
	* 更新用户信息
	* @param store
	* @param data
	* @param msg
	* @returns {Promise<*|boolean>}
	* @constructor
	*/
	async UPDATE_USER_INFO(store, { data, msg }) {
		const [res, err] = await $http.awaitTo($http.post($api.updateUserInfo, data));
		if (err) return false;
		store.commit("UPDATE_USERINFO", res.data);
		if (msg) $layer.success(msg);
		return res.data;
	},
	/*************
	* 加入购物车
	* @param store
	* @param option
	* {
	*     num: 数量
	*     productSerialNumber: 商品序号
	*     skuId: 规格ID
	*     type: 1-增加该数量,2-置为该数量
	* }
	* @returns {Promise<boolean>}
	* @constructor
	*/
	async PUSH_SHOP_CART(store, option) {
		const loading = option.loading;
		const wait = option.wait;
		delete option.loading;
		delete option.wait;
		const [res, err] = await $http.awaitTo($http.lock.post($api.pushShopCart, option, {
			loading,
			wait,
			alert: false
		}));
		if (err) {
			$layer.alert(err.msg, " ", "我知道了");
			return false;
		}
		if (option.type === 1) {
			store.commit("REFRESH_SHOP_CART", true);
			$layer.success("已加入购物车");
		}
		return res.data;
	},
	/***************
	* 数据异常上报
	* @param store
	* @param option = {
	*      errorInfo: 错误信息 ,
	*      errorType (integer, optional): 错误类型 1请求超时 2地址错误 3其他 ,
	*      pageUrl (string, optional): 错误页面url ,
	*      source (integer, optional): 错误平台来源 1.小程序 2.APP 3.H5, 4.PC ,
	*      url (string, optional): 错误资源地址
	*      apiUrl (string, optional): 错误资源地址-对应/api/index.js内的url内容
	*      code (string, optional): 错误回包code
	*      clickPosition (string, optional): 点击位置
	*      prePage (string, optional): 上一个页面
	*      userId (integer, optional): 用户ID
	* }
	****/
	async CATCH_REPORT(store, option) {
		const { apiUrl, code, pageUrl } = option || {};
		if (HTTP_NOT_REPORT_MAP[apiUrl] && HTTP_NOT_REPORT_MAP[apiUrl]?.some((item) => item === code)) return;
		delete option.apiUrl;
		delete option.code;
		const sourceMap = {
			2: "3",
			3: "2",
			4: "1"
		};
		let prePage = "";
		const len = router_map_default.routers.length;
		if (len > 1) prePage = router_map_default.routers[len - 2]?.fullPath;
		else prePage = store.state.deviceType === 3 ? "APP首页|资源位|PUSH" : store.state.deviceType === 4 ? "小程序资源位" : "浏览器刚打开";
		$http.post($api.resourceError, Object.assign(option, {
			source: sourceMap[store.state.deviceType],
			clickPosition: window.__event_position__,
			userId: store.state.userInfo?.user_mark || "未登录",
			prePage: transformTokenUrl(prePage),
			pageUrl: transformTokenUrl(pageUrl)
		}), { alert: false });
	},
	/***************
	* 获取购物车数据列表
	* @param store
	* @param params
	* {
	*     pageNo: 1,
	*     pageSize: 10
	* }
	* @returns {Promise<void>}
	* @constructor
	*/
	async SHOP_CART_LIST(store, params) {
		if (!store.state.token) return false;
		const [res, err] = await $http.awaitTo($http.get($api.shopCartList, { params }));
		if (err) return false;
		const isReset = params.pageNo === 1;
		store.commit("PUSH_SHOP_CART", {
			reset: isReset,
			data: res.data
		});
		return true;
	},
	/***********
	* 删除购物车数据
	* @param store
	* @param list id列表
	* @returns {Promise<boolean>}
	* @constructor
	*/
	async DEL_SHOP_CART(store, list) {
		const [res, err] = await $http.awaitTo($http.lock.post($api.delShopCart, { ids: list }, { wait: "删除中..." }));
		if (err) return false;
		$layer.success("删除成功");
		store.commit("DEL_SHOP_CART", list);
		return true;
	},
	/*****************
	* @desc 获取aiot协议数据
	* @param store
	* @param data
	* @returns {Promise<void>}
	*/
	async GET_POLICY_DATA(store, data) {
		const [res, err] = await $http.awaitTo($http.post($api.getPolicyList, {
			country: "cn",
			language: "zh-CN",
			policy_type: [POLICY_MAP.service, POLICY_MAP.privacy]
		}, { alert: false }));
		if (err) return false;
		store.commit("SET_POLICY_LIST", res.data || []);
		return true;
	}
};
//#endregion
//#region src/common/store/getters.js
var getters_default = {};
//#endregion
//#region src/common/store/mutations.js
var mutations_default = {
	UPDATE_USERINFO(state, data) {
		if (!isObject(data)) return;
		const token = data.token;
		if (token) {
			state.token = token;
			_Storage.cookie.set(TOKEN, token, { secure: true });
		}
		const userInfo = state.userInfo || {};
		delete data.token;
		state.userInfo = {
			...userInfo,
			...data
		};
		_Storage.set(USER, { ...state.userInfo });
	},
	INIT_USER(state) {
		const userInfo = _Storage.get(USER);
		const token = _Storage.cookie.get(TOKEN);
		if (isObject(userInfo) && token) state.userInfo = userInfo;
		else state.userInfo = null;
	},
	DELETE_USERINFO(state) {
		state.token = null;
		_Storage.cookie.clear(TOKEN);
		state.userInfo = null;
		_Storage.clear(USER);
	},
	UPDATE_TOKEN(state, token) {
		state.token = token;
		_Storage.cookie.set(TOKEN, token, { secure: true });
	},
	UPDATE_TEMP_USER(state) {
		if (!state.userInfo) state.userInfo = { nickname: "一个云鲸用户" };
	},
	UPDATE_UTM(state, utm) {
		state.utm = utm;
		_Storage.cookie.set(UTM, utm);
	},
	UPDATE_DEVICE(state, type) {
		state.deviceType = type;
		_Storage.cookie.set(DEVICE_TYPE, type);
	},
	UPDATE_SITE_INFO(state, data) {
		state.siteInfo = getJSON(data, null);
		{
			const extend = getJSON(state.siteInfo?.extend, null);
			const app = extend.filename?.js?.find((url) => url.startsWith("app."));
			const nApp = window.__GLOBAL_ASSETS__?.js?.find((url) => url.startsWith("app."));
			if (app && app !== nApp) {
				window.__GLOBAL_ASSETS__ = extend.filename;
				const { css, js } = extend.filename;
				css?.forEach((url) => {
					createCss(`https://image-www.narwal.com/activity/${url}`);
				});
				js?.forEach((url) => {
					createScript(`https://image-www.narwal.com/activity/${url}`);
				});
			}
		}
	},
	/*******
	* 缓存数据
	* @param state
	* @param path
	* @param data
	* @constructor
	*/
	CACHE_DATA(state, { path, data }) {
		const ssrData = state.ssrData[path];
		state.ssrData[path] = Object.assign(ssrData || {}, data);
	},
	/*********
	* 添加购物车数据
	* @param state
	* @param data
	* @param reset
	*/
	PUSH_SHOP_CART(state, { data, reset }) {
		if (reset) {
			state.shoppingCart.couponList = filterCouponList(data?.couponList || []);
			state.shoppingCart.discountList = data?.discountList || [];
			state.shoppingCart.shopList = filterShoppingList(data?.pageResult?.list, state.shoppingCart.discountList);
		} else {
			state.shoppingCart.couponList.push(...filterCouponList(data?.couponList || []));
			state.shoppingCart.discountList.push(...data?.discountList || []);
			state.shoppingCart.couponList = filterReport(state.shoppingCart.couponList, "serialNumber");
			state.shoppingCart.discountList = filterReport(state.shoppingCart.discountList, "skuId");
			state.shoppingCart.shopList.push(...filterShoppingList(data?.pageResult?.list, state.shoppingCart.discountList));
		}
		state.shoppingCart.count = data?.count;
		state.shoppingCart.isChangeCart = false;
	},
	/*****************
	* 更新购物车数据
	* @param state
	* @param data
	* @constructor
	*/
	CHANGE_SHOP_CART(state, data) {
		let list = state.shoppingCart.shopList;
		const obj = list.find((r) => r.skuId === data.result.skuId);
		const productDiscount = data.result.discount;
		if (productDiscount) {
			let discount = state.shoppingCart.discountList?.find((item) => item.id === productDiscount.id && item.skuId === productDiscount.skuId);
			if (discount) discount = productDiscount;
			else state.shoppingCart.discountList?.push(productDiscount);
		}
		if (obj) {
			Object.assign(obj, data.result);
			list = list.filter((r) => r.skuId !== data.skuId);
		} else list.forEach((item) => {
			if (item.skuId === data.skuId) Object.assign(item, {
				currentPrice: null,
				discountPrice: null,
				underlinePrice: null
			}, data.result);
		});
		state.shoppingCart.shopList = filterShoppingList(list, state.shoppingCart.discountList || []);
	},
	/*************
	* 购物车数据全选
	* @param state
	* @param bool
	* @constructor
	*/
	SHOP_CART_CHECK_ALL(state, bool) {
		const isEdit = state.shoppingCart.isEdit;
		state.shoppingCart.shopList.forEach((item) => {
			if (item.salesStatus === 1 || isEdit) item.checked = bool;
		});
	},
	/*************
	* 购物车数据选择
	* @param state
	* @constructor
	*/
	SHOP_CART_CHECK(state) {
		const list = state.shoppingCart.checkSkuList;
		if (list.length > 0) {
			const map = {};
			list.forEach((item) => {
				map[item] = true;
			});
			state.shoppingCart.shopList.forEach((item) => {
				if (item.salesStatus === 1) item.checked = map[item.skuId] || item.checked;
				else item.checked = false;
			});
			state.shoppingCart.checkSkuList = [];
		}
	},
	/**********
	* 购物车商品数量
	* @param state
	* @param num
	*/
	SHOP_CART_COUNT(state, num) {
		state.shoppingCart.count = num;
	},
	/*********
	* 删除购物车
	* @param state
	* @param list
	* @constructor
	*/
	DEL_SHOP_CART(state, list) {
		const map = {};
		list.forEach((item) => {
			map[item] = true;
		});
		state.shoppingCart.shopList = state.shoppingCart.shopList.filter((r) => !map[r.id]);
	},
	/*********
	* 设置刷新购物车
	*/
	REFRESH_SHOP_CART(state, bool) {
		state.shoppingCart.isChangeCart = bool;
	},
	TOGGLE_TAB_BAR(state, bool) {
		state.tabBarShow = bool;
	},
	/**
	* 协议地址
	* @param {*} state
	* @param {*} data
	*/
	SET_POLICY_LIST(state, data) {
		state.policyList = data;
	}
};
//#endregion
//#region src/common/store/index.js
var _serverStore = null;
function _createStore() {
	_serverStore = createStore({
		state: {
			token: null,
			userInfo: null,
			siteInfo: null,
			utm: null,
			deviceType: 2,
			isServerRender: false,
			isClientCache: false,
			ssrData: {},
			tabBarShow: true,
			shoppingCart: {
				shopList: [],
				couponList: [],
				discountList: [],
				count: 0,
				isEdit: false,
				checkSkuList: [],
				isChangeCart: false
			},
			policyList: []
		},
		mutations: mutations_default,
		actions: actions_default,
		getters: getters_default
	});
	return _serverStore;
}
var clientStore = _createStore();
var useStore = () => {
	return env_default.isServer() ? _serverStore : clientStore;
};
//#endregion
//#region src/common/util/error-code.js
var error_code_default = {
	1e4: "成功",
	5e5: "服务器内部错误",
	900000100: "该资源不存在",
	900000200: "该语言不支持",
	900000300: "版本号为空",
	900000400: "语言参数为空",
	150101: "参数缺失",
	170002: "验证码错误",
	110903: "用户已绑定手机号",
	100201: "机器人不存在",
	110701: "图片格式错误",
	140103: "系统配置错误",
	150105: "数据格式错误",
	100102: "用户无权限操作",
	110402: "新密码为空",
	110401: "请输入正确的原密码",
	110505: "重置密码token错误",
	110203: "用户不存在",
	111501: "注册用户已绑定第三方",
	111201: "第三方登录类型错误",
	1030001: "苹果账号解绑成功",
	1030004: "是否需要合并",
	1010004: "区号不能为空",
	1010006: "区号和手机格式错误，示例：+86168XXXXXXXX",
	1010003: "与当前手机号码不一致",
	1011001: "验证码不能为空",
	111007: "验证码不正确",
	1011002: "验证码不正确",
	1012002: "修改手机号码验证旧手机号码错误",
	111008: "验证码错误，请重试",
	999: "操作失败，请重试",
	111003: "用户未设置密码，请设置密码后重试",
	111005: "密码错误，请更改或重新设置",
	111006: "密码错误，请更改或重新设置",
	110101: "请输入正确的手机号",
	110103: "请输入正确的密码",
	110104: "请输入设备id",
	110105: "该手机号已经注册",
	110904: "手机号用户已绑定第三方无法绑定当前用户",
	120301: "请输入正确的手机号",
	120303: "您的验证码次数今天已达上限，请明天再试",
	101502: "无权限操作",
	140102: "来源参数错误",
	140106: "文件太大",
	140105: "用户不存在",
	101802: "机器人版本错误无法匹配",
	101803: "当前App版本过低，请App版本后使用",
	101804: "当前机器人版本过低，请升级固件版本后使用",
	100702: "没有机器人版本更新信息",
	100302: "机器人不存在",
	100100100: "昵称为空",
	100100200: "请输入原密码",
	100100300: "请输入新密码",
	100100400: "请输入8-12位含字母和数字的字符",
	100100500: "原密码不正确",
	100100600: "area_code为空",
	100100700: "请输入原手机号",
	100100800: "昵称为空",
	100100900: "验证码为空，请输入",
	100101e3: "验证码错误，请重新输入",
	100101100: "原帐号验证错误，请重试",
	100101200: "更换的新手机号不能与原手机号相同",
	100101300: "验证原手机号token已失效，请重试",
	100101400: "用户暂无邮箱，请先绑定",
	100101500: "请输入更换邮箱token",
	100101600: "已经绑定的邮箱不能绑定，请更换",
	100101700: "请输入正确验证码",
	100101800: "该邮箱已被冻结，请更换",
	100101900: "请输入少于20位含字母和数字的字符",
	100200100: "密码格式不正确",
	100200200: "请输入邮箱地址",
	100200300: "请输入验证码",
	100200400: "请输入密码",
	100200500: "请输入用户名",
	100200600: "请输入最少3个字符的用户名",
	100200700: "请输入正确邮箱地址",
	100200800: "请输入8-12位含字母和数字的字符",
	100200900: "该邮箱已注册",
	100201e3: "请输入正确验证码",
	100201100: "区域代码为空",
	100201200: "手机号码为空",
	100201300: "code_type参数为空",
	100201400: "请输入正确的手机号",
	100201500: "手机号码格式不正确",
	100201600: "验证码错误，请重新输入",
	100201700: "该手机号已被其它用户绑定",
	100201800: "请先输入手机号",
	100201900: "请先输入验证码",
	100202e3: "请输入正确手机号",
	100202100: "该用户未绑定手机号",
	100202200: "输入手机号与原手机号不一致",
	100202300: "该用户已经绑定了手机号",
	100202400: "请先输入账号密码",
	100202500: "密码格式不正确",
	100202600: "未找到当前账户，请先注册",
	100202700: "密码错误，请更改或重新设置",
	100202800: "密码为空",
	100202900: "手机号格式不正确",
	100203e3: "手机号未注册，请注册并设置密码",
	100203100: "密码错误，请更改或重新设置",
	100203200: "未设置密码，请设置密码后重试",
	100203300: "两次输入的密码不一致，请修改后重试",
	100203400: "密码需包含8-12位数字和字母，请修改后重试",
	100203500: "token已失效，请发送验证码后重试",
	100203600: "用户不存在",
	100203700: "请先输入邮箱地址",
	100203800: "未找到该邮箱账户",
	100203900: "同一账户每天最多可发送10次，请明天再试",
	100204e3: "链接已失效，请重试",
	100204100: "请输入重置密码token",
	100204200: "用户不存在或已被注销",
	100204300: "不可与最近密码相同，请更换",
	100204400: "发送邮件失败，请稍后重试",
	100204500: "注册站点为空",
	100500100: "平台为空",
	100500200: "app版本为空",
	100500300: "用户行为为空",
	100500400: "app语言为空",
	100500500: "反馈id为空",
	100500600: "操作类型为空",
	100500700: "操作类型不合法",
	100500800: "消息中心类型为空",
	100500900: "消息中心类型不合法",
	100501e3: "固件版本为空",
	100501100: "升级新版本的内容为空",
	101400100: "请输入清洁计划名称",
	101400200: "清洁计划名称超过最长20字符",
	101400300: "与已有计划名称重复，请点击顶部修改名称后再试",
	101400400: "扫地计划已达到上限，请删除后重试",
	101400500: "拖地计划已达到上限，请删除后重试",
	100600100: "昵称最大输入字符为20",
	200100100: "区域代码为空",
	200100200: "手机号码为空",
	200100300: "code_type参数为空",
	200100400: "请输入正确的手机号",
	200100500: "手机号码格式不正确",
	101501: "缺少清洁报告id",
	101402: "没有权限",
	101403: "类型范围必须在[1,2,3,4]里",
	101405: "参数格式错误",
	111602: "平台类型错误",
	111302: "第三方登录id不为空，已被其它用户绑定",
	111203: "三方登录获取授权码错误",
	111204: "无法获取loginId",
	1030005: "不支持该第三方类型",
	100101: "机器人uuid格式错误",
	100602: "无权限操作",
	100402: "参数错误",
	100404: "帐号不存在",
	100503: "没有分享的相关字符串",
	100601: "机器人uuid格式错误",
	100606: "清洁模式格式错误",
	100610: "扫地计划已达到上限，请删除后重试",
	100608: "与已有计划重复，请修改后再试",
	101601: "地图id错误",
	101801: "缺少参数",
	110106: "您的账号已冻结，请稍后再试",
	111202: "用户不存在",
	130105: "您的登录已失效",
	102101: "地图id错误",
	200001: "地图名称格式错误",
	timeout: "请求超时~",
	catch: "数据异常~",
	err: "请求出错~",
	401: "未登录或者登陆信息已失效",
	403: "账号未授权",
	500: "系统繁忙，请稍后再试~",
	504: "网络超时，请稍后再试~",
	111207: "在云鲸账号内，您所选的手机号已绑定其他微信，请前往云鲸APP换绑微信号或更换授权手机号",
	111206: "新用户需手机号授权",
	111205: "登录签名已过期，请点击重试"
};
//#endregion
//#region src/common/util/upload-private.js
function getUploadPrivate(path) {
	const time = Date.now();
	return {
		"MALL-SIGN": md5_default(path, "narwal-mall-api-key-" + time),
		"MALL-TIMESTAMP": time
	};
}
//#endregion
//#region src/common/config/index.js
var config_default = {
	dev: {
		NODE_ENV: "\"development\"",
		EXEC_ENV: "\"dev\"",
		API: "\"/mall\"",
		BASE: "\"/api/narwal-mall-cbase-applets\"",
		USER: "\"/user\"",
		OPERATION: "\"/operation\"",
		STORE_URL: "\"https://ctest-act.narwaltech.com/\"",
		ACT_URL: "\"https://ctest-act.narwaltech.com\"",
		SERVICE_URL: "\"https://test-bsh5.narwaltech.com/universal/serviceSearch.html\"",
		COST_URL: "\"https://test-bsh5.narwaltech.com/fixPartsPrice.html\"",
		ECHAT_VISITOR: "\"https://ctest-act.narwaltech.com\"",
		ECHAT_STAFF: "\"https://ctest-admin.narwaltech.com\"",
		YM_APPKEY: "\"638d943788ccdf4b7e96de39\"",
		YM_SERVER_CENTRT_APPKEY: "\"638d943788ccdf4b7e96de39\"",
		YM_INVITE_APPKEY: "\"638d943788ccdf4b7e96de39\"",
		REPORT_DATA_CENTER_URL: "\"/report\"",
		YM_REFERRAL_APPKEY: "\"638d943788ccdf4b7e96de39\"",
		YM_RENEW_APPKEY: "\"638d943788ccdf4b7e96de39\""
	},
	test: {
		NODE_ENV: "\"production\"",
		EXEC_ENV: "\"test\"",
		API: "\"/mall\"",
		BASE: "\"/api/narwal-mall-cbase-applets\"",
		USER: "\"/user\"",
		OPERATION: "\"/operation\"",
		STORE_URL: "\"https://ctest-act.narwaltech.com/\"",
		ACT_URL: "\"https://ctest-act.narwaltech.com\"",
		SERVICE_URL: "\"https://test-bsh5.narwaltech.com/universal/serviceSearch.html\"",
		COST_URL: "\"https://test-bsh5.narwaltech.com/fixPartsPrice.html\"",
		ECHAT_VISITOR: "\"https://ctest-act.narwaltech.com\"",
		ECHAT_STAFF: "\"https://ctest-admin.narwaltech.com\"",
		YM_APPKEY: "\"638d943788ccdf4b7e96de39\"",
		YM_SERVER_CENTRT_APPKEY: "\"638d943788ccdf4b7e96de39\"",
		YM_INVITE_APPKEY: "\"638d943788ccdf4b7e96de39\"",
		REPORT_DATA_CENTER_URL: "\"/report\"",
		YM_REFERRAL_APPKEY: "\"638d943788ccdf4b7e96de39\"",
		YM_RENEW_APPKEY: "\"638d943788ccdf4b7e96de39\"",
		CDN_URL: "\"https://image-test-pc.narwaltech.com/activity/\""
	},
	stress: {
		NODE_ENV: "\"production\"",
		EXEC_ENV: "\"test\"",
		API: "\"/mall\"",
		BASE: "\"/api/narwal-mall-cbase-applets\"",
		USER: "\"/user\"",
		OPERATION: "\"/operation\"",
		STORE_URL: "\"https://ctest-act.narwaltech.com/\"",
		ACT_URL: "\"https://ctest-act.narwaltech.com\"",
		SERVICE_URL: "\"https://test-bsh5.narwaltech.com/universal/serviceSearch.html\"",
		COST_URL: "\"https://test-bsh5.narwaltech.com/fixPartsPrice.html\"",
		ECHAT_VISITOR: "\"https://ctest-act.narwaltech.com\"",
		ECHAT_STAFF: "\"https://ctest-admin.narwaltech.com\"",
		YM_APPKEY: "\"64127b0ed64e6861394bc569\"",
		YM_SERVER_CENTRT_APPKEY: "\"63915553ba6a5259c4c89273\"",
		YM_INVITE_APPKEY: "\"646d79f1e31d6071ec40c73b\"",
		REPORT_DATA_CENTER_URL: "\"/report\"",
		YM_REFERRAL_APPKEY: "\"63a55679ba6a5259c4d87121\"",
		YM_RENEW_APPKEY: "\"63915553ba6a5259c4c89273\"",
		CDN_URL: "\"https://image-test-pc.narwaltech.com/activity/\""
	},
	prod: {
		NODE_ENV: "\"production\"",
		EXEC_ENV: "\"prod\"",
		API: "\"/mall\"",
		BASE: "\"/api/narwal-mall-cbase-applets\"",
		USER: "\"/user\"",
		OPERATION: "\"/operation\"",
		STORE_URL: "\"https://activity.narwaltech.com/\"",
		ACT_URL: "\"https://activity.narwaltech.com\"",
		SERVICE_URL: "\"https://bsh5.narwaltech.com/universal/serviceSearch.html\"",
		COST_URL: "\"https://bsh5.narwaltech.com/fixPartsPrice.html\"",
		ECHAT_VISITOR: "\"https://activity.narwaltech.com\"",
		ECHAT_STAFF: "\"https://cn-admin.narwaltech.com\"",
		YM_APPKEY: "\"64127b0ed64e6861394bc569\"",
		YM_SERVER_CENTRT_APPKEY: "\"63915553ba6a5259c4c89273\"",
		YM_INVITE_APPKEY: "\"646d79f1e31d6071ec40c73b\"",
		REPORT_DATA_CENTER_URL: "\"/report\"",
		YM_REFERRAL_APPKEY: "\"63a55679ba6a5259c4d87121\"",
		YM_RENEW_APPKEY: "\"63915553ba6a5259c4c89273\"",
		CDN_URL: "\"https://image-www.narwal.com/activity/\""
	},
	file: {
		dev: {
			SERVER_URL: "https://ctest-act.narwaltech.com/mall",
			ASSETS_CDN: "/"
		},
		test: {
			SERVER_URL: "https://ctest-act.narwaltech.com/mall",
			ASSETS_CDN: "https://image-test-pc.narwaltech.com/activity/"
		},
		prod: {
			SERVER_URL: "https://api-applet.narwaltech.com/mall",
			ASSETS_CDN: "https://image-www.narwal.com/activity/"
		}
	},
	proxy: {
		dev: {
			"/mall": {
				target: "https://ctest-act.narwaltech.com",
				changeOrigin: true
			},
			"/api/narwal-mall-cbase-applets": {
				target: "https://ctest-act.narwaltech.com",
				changeOrigin: true
			},
			"/user": {
				target: "https://testcn-app.narwaltech.com",
				pathRewrite: { "^/user": "" },
				changeOrigin: true
			},
			"/operation": {
				target: "https://ctest-act.narwaltech.com/operation",
				pathRewrite: {
					"^/report": "",
					"^/operation": ""
				},
				changeOrigin: true
			},
			"/report": {
				target: "https://ctest-act.narwaltech.com",
				changeOrigin: true
			}
		},
		test: {
			"/mall": {
				target: "https://ctest-act.narwaltech.com",
				changeOrigin: true
			},
			"/api/narwal-mall-cbase-applets": {
				target: "https://ctest-act.narwaltech.com",
				changeOrigin: true
			},
			"/user": {
				target: "https://testcn-app.narwaltech.com",
				pathRewrite: { "^/user": "" },
				changeOrigin: true
			},
			"/operation": {
				target: "https://ctest-act.narwaltech.com",
				pathRewrite: { "^/report": "" },
				changeOrigin: true
			},
			"/report": {
				target: "https://ctest-act.narwaltech.com",
				changeOrigin: true
			}
		},
		stress: {
			"/mall": {
				target: "http://116.205.185.44:30193",
				changeOrigin: true
			},
			"/api/narwal-mall-cbase-applets": {
				target: "https://ctest-act.narwaltech.com",
				changeOrigin: true
			},
			"/user": {
				target: "https://testcn-app.narwaltech.com",
				pathRewrite: { "^/user": "" },
				changeOrigin: true
			},
			"/operation": {
				target: "https://ctest-act.narwaltech.com",
				pathRewrite: { "^/report": "" },
				changeOrigin: true
			},
			"/report": {
				target: "https://ctest-act.narwaltech.com",
				changeOrigin: true
			}
		},
		prod: {
			"/mall": {
				target: "https://api-applet.narwaltech.com",
				changeOrigin: true
			},
			"/api/narwal-mall-cbase-applets": {
				target: "https://api-applet.narwaltech.com",
				changeOrigin: true
			},
			"/user": {
				target: "https://cn-mall-app.narwaltech.com",
				pathRewrite: { "^/user": "" },
				changeOrigin: true
			},
			"/operation": {
				target: "https://cn-app.narwaltech.com/operate",
				pathRewrite: { "^/operation": "" },
				changeOrigin: true
			},
			"/report": {
				target: "https://store.narwal.com",
				changeOrigin: true
			}
		}
	}
};
//#endregion
//#region src/common/util/server-url.js
/***********************
* 获取服务端URL
*/
function rewritePath(url, pathRewrite = {}) {
	return Object.keys(pathRewrite).reduce((nextUrl, key) => nextUrl.replace(new RegExp(key), pathRewrite[key]), url);
}
function server_url_default(url) {
	if (env_default.isServer()) {
		const proxy = config_default.proxy["prod"] || config_default.proxy.dev;
		const keys = Object.keys(proxy);
		for (const i in keys) {
			const key = keys[i];
			if (new RegExp(key).test(url)) {
				url = rewritePath(url, proxy[key].pathRewrite);
				const target = proxy[key].target;
				if (target.substring(target.length - 1) === "/") return target + url.replace(/^\//, "");
				return target + url;
			}
		}
	}
	return url;
}
//#endregion
//#region src/common/util/http.js
var instance = axios.create({
	timeout: 2e4,
	withCredentials: false,
	headers: {
		"X-Requested-With": "XMLHttpRequest",
		"Content-Type": "application/json"
	}
});
var option = {
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
	if (isNumber(v)) return v;
	return d;
}
/**
* 根据不同模块，获取结果状态
*/
function _getResult(info, module) {
	switch (module) {
		case "/mall": return {
			code: info.result,
			data: info.data,
			msg: info.msg
		};
		case "/api/narwal-mall-cbase-applets": return {
			code: info.result,
			data: info.data,
			msg: info.msg
		};
		case "/user": return {
			code: info.err_code === 1e4 ? 1 : info.err_code,
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
	useStore().commit("DELETE_USERINFO");
	if (cache?.jump !== false) toLogin(true);
}
instance.intercept({
	config(p) {
		p.timestamp = +Date.now();
		const store = useStore();
		const headers = {
			"X-Content-Type-Options": "nosniff",
			"X-XSS-Protection": "1",
			"Accept-Language": "zh-cn",
			"SITE": "zh-cn",
			"UTM": String(store.state.utm || ""),
			"DEVICE-TYPE": String(store.state.deviceType),
			"Aiot-Application-Id": "GWeirQm8q1"
		};
		if (p.headers) delete p.headers["AUTH-TOKEN"];
		const token = store.state.token;
		if (token && p.token !== false) headers["AUTH-TOKEN"] = token;
		if (!!p.cacheURL?.timestamp) {
			if (!p.params) p.params = {};
			p.params._ = Date.now() + Math.round(Math.random() * 1e4);
		}
		p.headers = Object.assign(p.headers || {}, headers, getUploadPrivate(p.cacheURL?.url || ""));
		p.url = server_url_default(p.url);
		if (p.config.wait) {
			option.waits.push(p.key);
			$layer.wait(p.config.wait === true ? "加载中..." : p.config.wait);
		}
		console.log("请求地址--url:" + p.url);
		console.log("请求参数--data:", p.data, "--params:", p.params);
		if (p.config.alert === false) option.alerts.push(p.key);
		return p;
	},
	success(p, req) {
		if (isNumber(p.data.err_code)) p.data.code = p.data.err_code;
		else if (isNumber(p.data.result)) p.data.code = p.data.result;
		p.data.timeDiff = Date.now() - p.timestamp;
		try {
			return ((p, req) => {
				const info = _getResult(p.data, req?.cacheURL?.proxy);
				const code = parseInt(info.code);
				console.log("request result:", info);
				if (code === 1) return info;
				let login = false;
				if (code === 130105 || code === 110106 || code === 140105) {
					login = true;
					_codeLogout(error_code_default[code], req?.cacheURL);
				}
				if (p.config) {
					console.log("请求地址--url:" + p.config.url);
					console.log("请求时长--time:" + (Date.now() - p.config.timestamp) + "ms");
					console.log("响应结果--res:", p.data);
				}
				return Promise.reject(Object.assign({}, p.data, {
					login,
					code: _getCode(code, 500),
					msg: error_code_default[code] || p.data.msg || error_code_default.catch
				}));
			})(p, req);
		} catch (e) {
			console.log(e);
			return Promise.reject({
				code: 502,
				msg: error_code_default.timeout
			});
		}
	},
	fail(p) {
		const code = _getCode(p.data.code, 500);
		if (code === 401) return {
			type: -2,
			code,
			statusText: error_code_default["401"],
			data: p.data
		};
		else if (code === 403) return {
			type: -2,
			code,
			statusText: error_code_default["403"],
			data: p.data
		};
		else if (code === 500) return {
			type: -2,
			code,
			statusText: error_code_default[code],
			data: p.data
		};
		return {
			type: -2,
			code,
			statusText: p.data.msg || error_code_default.err,
			data: p.data
		};
	},
	complete(res, req) {
		try {
			$event.emit(EVENTS.REQUEST_DONE, {
				res,
				req
			});
			((p) => {
				const key = p.key;
				const index = option.waits.indexOf(key);
				if (index > -1) option.waits.splice(index, 1);
				if (option.waits.length === 0) $layer.closeWait();
				clearTimeout(option.compTimer);
				option.compTimer = setTimeout(() => {
					$layer.closeWait();
					option.waits = [];
					option.alerts = [];
				}, 5e3);
				const err = _getCode(p.data.code, p.status);
				if (p.config) console.log(p.config.url, " --请求时长：" + (Date.now() - p.config.timestamp) + "ms");
				if (![
					1,
					9999,
					1e4,
					130105,
					110106,
					406
				].includes(err)) {
					const msg = error_code_default[err] || p.data.msg || p.statusText || error_code_default.catch;
					if (!p.config?.url?.includes("reportLog/resourceError")) useStore().dispatch("CATCH_REPORT", {
						errorInfo: msg,
						errorType: 3,
						pageUrl: getCurrentRoute().url,
						url: p.config?.url,
						code: err,
						apiUrl: p.config?.cacheURL?.url
					});
					const a_i = option.alerts.indexOf(key);
					if (a_i > -1) {
						option.alerts.splice(a_i, 1);
						return;
					}
					if (msg !== "OK") {
						console.error("error", msg);
						$layer.toast(msg);
					}
				}
			})(res);
		} catch (err) {
			if (option.waits.length > 0) $layer.closeWait();
			if (!res.config?.url?.includes("reportLog/resourceError")) useStore().dispatch("CATCH_REPORT", {
				errorInfo: JSON.stringify(err),
				errorType: 2,
				pageUrl: getCurrentRoute().url,
				url: res.config?.url
			});
			option.waits = [];
			option.alerts = [];
			$layer.toast(error_code_default.timeout);
			console.error("请求异常", err);
		}
	}
});
//#endregion
//#region src/common/api/index.js
var api = [
	"activityList",
	"commentInfo",
	"couponTake",
	"couponTakeAll",
	"customPage",
	"customPageByKey",
	"delShopCart",
	"echatInfo",
	"fileUpload",
	"getActivityGroupPage",
	"getBase64",
	"getBuyRobotActivity",
	"getConf",
	"getConfV2",
	"getConsumableProduct",
	"getDetailByActivityId",
	"getIndexPage",
	"getNarwowAndUserInfo",
	"getPolicyList",
	"getProtectionDetailById",
	"getProtectionTemplateList",
	"getRealSiteConf",
	"getRegionsList",
	"getServiceReserveTime",
	"getShareInfo",
	"getToken",
	"getV2SmsCode",
	"getWxBase64",
	"myTrialList",
	"phoneCodeLogin",
	"phonePwdLogin",
	"postingDetailInfo",
	"postingGiftsList",
	"postingInfoNoLogin",
	"productInfo",
	"purchaseMyPrize",
	"pushShopCart",
	"queryActTag",
	"resourceError",
	"shopCartList",
	"tagInfo",
	"tagList",
	"totalProductNum",
	"trialInfo",
	"trialList",
	"trialReportInfo",
	"trialReportList",
	"updateUserInfo",
	"uploadFileToPrivate",
	"uploadImage",
	"userCouponList",
	"userInfoNoJump",
	"utmReportHits",
	"ymReport"
].reduce((res, key) => {
	res[key] = `/mall/${key}`;
	return res;
}, {});
var api_default = new Proxy(api, { get(target, key) {
	if (typeof key !== "string") return target[key];
	return target[key] || `/mall/${key}`;
} });
//#endregion
//#region \0plugin-vue:export-helper
var _plugin_vue_export_helper_default = (sfc, props) => {
	const target = sfc.__vccOpts || sfc;
	for (const [key, val] of props) target[key] = val;
	return target;
};
//#endregion
//#region src/lib/layer/overlay/overlay.vue
var _sfc_main$13 = {
	name: "overlay",
	data() {
		return {
			opacity: .5,
			color: "#000",
			animate: "fade",
			overlayShow: false,
			zIndex: getZIndex()
		};
	},
	computed: { style() {
		return {
			"opacity": this.opacity,
			"background-color": this.color,
			"z-index": this.zIndex
		};
	} },
	methods: {
		show() {
			document.body.appendChild(this.$el);
			this.overlayShow = true;
		},
		hide(app) {
			this.overlayShow = false;
			this._app = app;
		},
		afterLeave() {
			document.body.removeChild(this.$el);
			this._app?.unmount();
		},
		setStyle(option) {
			this.color = option.color;
			this.opacity = option.opacity;
			this.zIndex = option.zIndex;
			this.animate = option.animate || "fade";
		},
		bindClick(fn) {
			this._fn = fn;
		},
		handlerClick() {
			this._fn && this._fn({ type: "overlay" });
			this.$emit("overlayClick", { type: "overlay" });
		}
	}
};
function _sfc_ssrRender$13(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({
		class: "m-overlay",
		style: $options.style
	}, _attrs, { style: $data.overlayShow ? null : { display: "none" } }))} data-v-2c5dce0e></div>`);
}
var _sfc_setup$13 = _sfc_main$13.setup;
_sfc_main$13.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/lib/layer/overlay/overlay.vue");
	return _sfc_setup$13 ? _sfc_setup$13(props, ctx) : void 0;
};
var overlay_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$13, [["ssrRender", _sfc_ssrRender$13], ["__scopeId", "data-v-2c5dce0e"]]);
//#endregion
//#region src/lib/layer/overlay/index.js
/************
* 遮罩层
* 穆辰 20200701
*/
var OverlayManager = {
	options: [],
	overlay: false,
	app: null,
	open(option) {
		if (!option || this.options.indexOf(option) !== -1) return;
		if (!isNumber(option.zIndex)) option.zIndex = getZIndex();
		if (this.options.filter((r) => r.type === "change").length === 0 || option.type === "create") this.showOverlay(option);
		this.options.push(option);
		if (option.type === "change") this.changeOverlayStyle();
	},
	close(option) {
		let index = this.options.indexOf(option);
		if (index === -1) return;
		this.options.splice(index, 1);
		if (option.type === "create") option.overlay.hide(option.app);
		this.closeOverlay();
		this.changeOverlayStyle();
	},
	showOverlay(option) {
		const app = createApp(overlay_default);
		const vm = app.mount(document.createElement("DIV"));
		vm.bindClick(this.handlerOverlayClick.bind(this));
		if (option.type === "create") {
			option.animate = "none";
			option.overlay = vm;
			option.overlay.show();
			option.overlay.setStyle(option);
			option.app = app;
		} else {
			this.overlay = vm;
			this.app = app;
			this.overlay.show();
		}
	},
	closeOverlay() {
		if (!this.overlay || this.options.filter((r) => r.type === "change").length > 0) return;
		this.overlay.hide(this.app);
		this.overlay = null;
		this.app = null;
	},
	changeOverlayStyle() {
		if (!this.overlay || this.options.filter((r) => r.type === "change").length === 0) return;
		const option = this.options[this.options.length - 1];
		this.overlay.setStyle(option);
	},
	handlerOverlayClick() {
		if (this.options.length === 0) return;
		const option = this.options[this.options.length - 1];
		option.$event?.emit("overlayClick", {
			option,
			el: option.type === "change" ? this.overlay.$el : option.overlay.$el
		});
	}
};
//#endregion
//#region src/lib/dom/contains.js
/**
* 判断节点是否为另一个节点的父元素（如果两者是同一个元素，返回假）
* 例子：
* import contains from 'lib/dom/contains';
* console.log(contains(parentNode, node));
**/
function contains_default(parent, node) {
	if (parent === node) return false;
	else if (node.parentNode === null) return true;
	else if (parent.compareDocumentPosition) return (parent.compareDocumentPosition(node) & 16) === 16;
	else if (parent.contains && node.nodeType === 1) return parent.contains(node);
	else while (node = node.parentNode) if (parent === node) return true;
	return false;
}
//#endregion
//#region src/lib/util/getStyle.js
/*****
* 获取样式属性值
*/
function getStyle_default(element, styleName) {
	return element.style[styleName] ? element.style[styleName] : element.currentStyle ? element.currentStyle[styleName] : window.getComputedStyle(element, null)[styleName];
}
//#endregion
//#region src/lib/util/getSize.js
/********
* 获取元素的宽高
* @param element
* @returns {{width: number, height: number}}
* 穆辰：20200701
*/
function getSize_default(element) {
	const node = element.cloneNode(true);
	node.style.cssText = `position: fixed; top: -100000px; visibility: hidden;`;
	document.body.appendChild(node);
	node.childNodes.forEach((dom) => {
		if (dom.nodeType === 1) {
			if (getStyle_default(dom, "display") === "block") dom.style.display = "inline-block";
			dom.style.position = "relative";
		}
	});
	const width = node.offsetWidth;
	const height = node.offsetHeight;
	document.body.removeChild(node);
	return {
		width,
		height,
		screenWidth: window.innerWidth,
		screenHeight: window.top !== window.self ? window.screen.availHeight : window.innerHeight
	};
}
//#endregion
//#region src/lib/layer/popup/animate.js
var ani = {
	format(total, value, def) {
		if (!isNaN(parseInt(value))) if (/%$/.test(value)) return Math.round(total * parseFloat(value) / 100);
		else return parseInt(value);
		return def || value;
	},
	left(size, left, top, right, bottom, turn) {
		left = ani.format(size.screenWidth, left);
		if (!isNumber(left)) {
			right = ani.format(size.screenWidth, right);
			left = isNumber(right) ? size.screenWidth - size.width - right : 0;
		}
		const fh = turn ? "" : "-";
		const pos = turn ? "right" : "left";
		return `.m-popup.${pos}-enter-from,.m-popup.${pos}-leave-to {transform: translateX(${fh}${left + size.width + 20}px) !important;}`;
	},
	top(size, left, top, right, bottom, turn) {
		top = ani.format(size.screenHeight, top);
		if (!isNumber(top)) {
			bottom = ani.format(size.screenWidth, bottom);
			top = isNumber(bottom) ? size.screenHeight - size.height - bottom : 0;
		}
		const fh = turn ? "" : "-";
		const pos = turn ? "bottom" : "top";
		return `.m-popup.${pos}-enter-from,.m-popup.${pos}-leave-to {transform: translateY(${fh}${top + size.height + 20}px) !important;}`;
	},
	right(size, left, top, right, bottom) {
		return ani.left(size, right, top, left, bottom, true);
	},
	bottom(size, left, top, right, bottom) {
		return ani.top(size, left, bottom, right, top, true);
	}
};
//#endregion
//#region src/lib/util/history.js
/**
* @description 为组件绑定浏览器历史记录，解决移动端安卓物理返回键直接跳过关闭组件切换页面的问题；优化用户体验；
* 使用示例详见 plugin/audio/index.vue， common/router/index.js；另外需要为组件在 路由 的 beforeEach， 添加状态为前进的隐藏方法
*
*/
/**
* 定义事件存储数组
*/
var _event_state = [];
var ComponentHistory = class ComponentHistory {
	constructor(option) {
		this.opts = Object.assign({
			show: () => {},
			hide: () => {}
		}, option || {}, {
			arg: "",
			monitorDelay: false,
			monitorBack: true,
			bindFn: ({ state }) => {
				if (state && state._arg_history === this.opts.arg) if (this.opts.monitorDelay) setTimeout(() => {
					this.opts.show({ state: "forward" });
				}, 50);
				else this.opts.show({ state: "forward" });
				else {
					if (this.opts.monitorBack) this.opts.hide({ state: "back" });
					this.opts.monitorBack = true;
				}
			}
		});
		if (_event_state.length === 0) window.addEventListener("popstate", ComponentHistory.popstate, false);
		_event_state.push(this.opts.bindFn);
	}
	/**
	* 创建新记录
	*/
	push(_arg_history) {
		this.opts.arg = getUniqueId();
		const query = query_default.parse(location.href.split("?")[1] || "");
		window.history[`${!!query._arg_history && query._arg_history === _arg_history ? "replaceState" : "pushState"}`]({ _arg_history: this.opts.arg }, _arg_history, query_default.url(location.href, { _arg_history }));
		return new Promise((reject) => {
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
		return new Promise((reject) => {
			reject(this.opts.hide);
		});
	}
	/****
	* 监听前进事件
	*/
	static popstate(opts) {
		_event_state.forEach((fn) => fn(opts));
	}
	/*****
	* 清除首页次进来，浏览器携带的_arg_history参数
	*/
	static clearHistory() {
		const urls = location.href.split("?");
		const query = query_default.parse(urls[1] || "");
		if (!!query._arg_history) {
			delete query._arg_history;
			setTimeout(() => {
				window.history.replaceState({}, "", urls[0] + `${Object.keys(query).length > 0 ? "?" + query_default.stringify(query) : ""}`);
			}, 50);
		}
	}
	/***
	* 销毁
	*/
	destroy() {
		const index = _event_state.indexOf(this.opts.bindFn);
		if (index > -1) _event_state.splice(index, 1);
		if (_event_state.length === 0) window.removeEventListener("popstate", ComponentHistory.popstate, false);
		this.opts = null;
		this.isAndroid = null;
	}
};
//#endregion
//#region src/lib/layer/popup/popup.vue
var _sfc_main$12 = {
	name: "popup",
	props: { option: {
		type: Object,
		default() {
			return {};
		}
	} },
	created() {
		this.uniqueId = getUniqueId();
		this.overlay.$event = this.$event;
		if (this.option.history) this.history = new ComponentHistory({
			hide: this.hide,
			show: this.option.forward ? this.show : () => {}
		});
	},
	mounted() {
		this.$el.setAttribute("uid", this.uniqueId);
		if (this.option.pullDownHide) this.touchOption = {
			pageY: 0,
			moveY: 0
		};
	},
	data() {
		return {
			isShow: false,
			control: "",
			pullText: "下拉",
			pullStyle: {},
			insertNode: env_default.isClient() ? document.body : {},
			animate: Object.assign({
				name: "scale",
				beforeEnter: function() {},
				enter: function() {},
				leave: function() {},
				custom: false
			}, this.option.animate || {}),
			overlay: Object.assign({
				show: true,
				color: "",
				opacity: "",
				type: "change",
				zIndex: isNumber(this.option.zIndex) ? this.option.zIndex - 1 : void 0
			}, this.option.overlay || {}),
			progressBar: Object.assign({
				show: false,
				color: "#6AEE00",
				opacity: 1,
				showTime: 0
			}, this.option.progressBar || {}),
			zIndex: getZIndex(),
			absolute: this.option.absolute,
			left: this.getUnit(this.option.left, "auto"),
			top: this.getUnit(this.option.top, "auto"),
			right: this.getUnit(this.option.right, "auto"),
			bottom: this.getUnit(this.option.bottom, "auto"),
			width: this.getUnit(this.option.width, "auto"),
			height: this.getUnit(this.option.height, "auto"),
			popupMQ: []
		};
	},
	computed: {
		getStyle() {
			return {
				"position": this.absolute ? "absolute" : null,
				"left": this.left,
				"top": this.top,
				"right": this.right,
				"bottom": this.bottom,
				"width": this.width,
				"height": this.height,
				"z-index": this.zIndex,
				"overflow": this.option.pullDownHide ? "hidden" : null
			};
		},
		getTime() {
			return {
				"transition": `all ${this.progressBar.showTime}ms linear`,
				"background": this.progressBar.color
			};
		}
	},
	unmounted() {
		this.history && this.history.destroy();
	},
	methods: {
		getUnit(value, def) {
			if (!isNaN(value)) return value + "px";
			else if (isString(value)) return value;
			return def || value;
		},
		bindEvent() {
			if (this.option.autoHide) if (this.overlay.show) this.$event.on("overlayClick", this.autoClickHide);
			else document.body.addEventListener("click", this.autoClickHide);
			if (this.option.stop) document.body.addEventListener("touchmove", this.stopScroll, { passive: false });
			if (this.option.pullDownHide) {
				this.$el.addEventListener("touchstart", this.touchStart, { passive: false });
				this.$el.addEventListener("touchmove", this.touchMove, { passive: false });
				this.$el.addEventListener("touchend", this.touchEnd, { passive: false });
			}
		},
		unbindEvent() {
			if (this.option.autoHide) if (this.overlay.show) this.$event.off("overlayClick", this.autoClickHide);
			else document.body.removeEventListener("click", this.autoClickHide);
			if (this.option.stop) document.body.removeEventListener("touchmove", this.stopScroll, { passive: false });
			if (this.option.pullDownHide) {
				this.$el.removeEventListener("touchstart", this.touchStart, { passive: false });
				this.$el.removeEventListener("touchmove", this.touchMove, { passive: false });
				this.$el.removeEventListener("touchend", this.touchEnd, { passive: false });
			}
		},
		touchStart(ev) {
			if (ev.touches.length === 1) this.touchOption.pageY = ev.touches[0].pageY;
		},
		touchMove(ev) {
			if (ev.touches.length === 1) {
				this.touchOption.moveY = Math.min(150, ev.touches[0].pageY - this.touchOption.pageY);
				this.pullStyle = {
					transform: `translate3d(0, ${this.touchOption.moveY}px, 0)`,
					transition: `transform 0s`
				};
				this.pullText = this.touchOption.moveY > 80 ? "释放" : "下拉";
			}
		},
		touchEnd() {
			const o = this.touchOption;
			if (o.pageY > 0 && o.moveY > 80) this.hide(() => {
				this.pullStyle = {
					transform: `translate3d(0, 0, 0)`,
					transition: `transform 0s`
				};
			}, "touch");
			else this.pullStyle = {
				transform: `translate3d(0, 0, 0)`,
				transition: `transform 0.3s`
			};
			o.pageY = 0;
			o.moveY = 0;
		},
		autoClickHide(opt) {
			if (contains_default(this.$el, opt.el || opt.target)) return;
			this.hide(null, "auto");
		},
		afterEnter() {
			this.$event.emit("animateShow");
		},
		afterLeave() {
			this.$event.emit("animateHide");
		},
		useProgress() {
			if (this.progressBar.showTime > 0) {
				if (this.progressBar.show) this.$nextTick(() => {
					setTimeout(() => {
						this.control = "progress-leave";
					}, 50);
				});
				let time = 50;
				const timer = setInterval(() => {
					if (time >= this.progressBar.showTime) {
						this.hide(null, "time");
						clearInterval(timer);
					}
					this.$event.emit("progress", Math.max(0, this.progressBar.showTime - time));
					time += 50;
				}, 50);
			}
		},
		initProgress() {
			this.progressBar.show && (this.control = "");
		},
		setMiddle(left, top) {
			const x = ani.format(this._size.screenWidth, left, (this._size.screenWidth - this._size.width) / 2);
			const y = ani.format(this._size.screenHeight, top, (this._size.screenHeight - this._size.height) / 2);
			this.setPosition(x, y);
		},
		setLayout(left, top, right, bottom) {
			if (this.option.showCenter) this.setMiddle(left, top);
			else this.setPosition(left, top, right, bottom);
		},
		stopScroll(e) {
			e.preventDefault();
		},
		createStyle() {
			const call = ani[this.animate.name];
			if (!call) return;
			const id = "m-popup-style";
			let style = document.getElementById(id);
			if (style) style.innerHTML = call(this._size, this.left, this.top, this.right, this.bottom);
			else {
				style = document.createElement("style");
				style.id = id;
				style.innerHTML = call(this._size, this.left, this.top, this.right, this.bottom);
				document.getElementsByTagName("head")[0].appendChild(style);
			}
		},
		runMQ() {
			if (isLock(this.uniqueId)) return;
			const res = this.popupMQ.shift() || {};
			if (res.type === "show") this.popupShow.apply(this, res.args);
			else if (res.type === "hide") this.popupHide.apply(this, res.args);
		},
		popupShow(left, top, right, bottom, callback) {
			if (this.getStatus()) {
				isFunction(callback) && callback();
				this.$el.classList.add("gently-move");
				setTimeout(() => {
					this.$el.classList.remove("gently-move");
				}, 300);
				this.setLayout(left, top, right, bottom);
				return this;
			}
			lock(this.uniqueId);
			if (this.overlay.show) {
				OverlayManager.open(this.overlay);
				this.setTop();
			}
			this._size = getSize_default(this.$el);
			this.createStyle();
			this.setLayout(left, top, right, bottom);
			this.insertNode.appendChild(this.$el);
			this.$event.emit("beforeShow", { type: "beforeShow" });
			this.$nextTick(() => {
				setTimeout(() => {
					this.isShow = true;
					this.bindEvent();
					this.useProgress();
					if (this.history && !isObject(left)) this.history.push("popup");
				}, 0);
			});
			this.$event.once("animateShow", (_) => {
				unLock(this.uniqueId);
				this.$event.emit("show", { type: "show" });
				isFunction(callback) && callback();
				this.runMQ();
			});
		},
		popupHide(callback, state, data) {
			if (!this.getStatus()) {
				if (isFunction(callback) && callback !== this.destroy) callback();
				return this;
			}
			lock(this.uniqueId);
			this.$event.once("animateHide", (_) => {
				unLock(this.uniqueId);
				this.initProgress();
				this.insertNode.removeChild(this.$el);
				this.overlay.show && OverlayManager.close(this.overlay);
				this.$event.emit("hide", {
					type: "hide",
					state: state || "close",
					data: data || {}
				});
				isFunction(callback) && callback();
				this.runMQ();
			});
			this.$event.emit("beforeHide", {
				type: "hide",
				state: state || "close",
				data: data || {}
			});
			this.isShow = false;
			this.unbindEvent();
			if (this.history && !isObject(callback)) this.history.back(state === "close-all");
			return this;
		},
		/*** ----以下方法，支持外部调用---- ****/
		show(left, top, right, bottom, callback) {
			this.popupMQ.push({
				type: "show",
				args: [...arguments]
			});
			this.runMQ();
			return this;
		},
		hide(callback, state, data) {
			this.popupMQ.push({
				type: "hide",
				args: [...arguments]
			});
			this.runMQ();
			return this;
		},
		setInsertNode(node) {
			if (isNode(node)) this.insertNode = node;
			else this.insertNode = document.body;
			return this;
		},
		setAniCenter(left, top) {
			this.$el.classList.add("gently-move");
			setTimeout(() => {
				this.$el.classList.remove("gently-move");
			}, 300);
			this.$nextTick(() => {
				this.setMiddle(left, top);
			});
			return this;
		},
		setPosition(left, top, right, bottom) {
			if (isNumber(left) || isString(left)) this.left = this.getUnit(left);
			if (isNumber(top) || isString(top)) this.top = this.getUnit(top);
			if (isNumber(right) || isString(right)) this.right = this.getUnit(right);
			if (isNumber(bottom) || isString(bottom)) this.bottom = this.getUnit(bottom);
			return this;
		},
		postMessage(option) {
			this.$event.emit("message", option);
			return this;
		},
		setTop(index) {
			if (isNumber(this.option.zIndex)) this.zIndex = isNumber(index) ? index : this.option.zIndex;
			else this.zIndex = isNumber(index) ? index : getZIndex();
			return this;
		},
		getStatus() {
			return this.isShow;
		},
		destroy() {
			this.$event.emit("destroy", { type: "destroy" });
		},
		loader(component, option) {
			let node = document.createElement("DIV");
			this.$el.appendChild(node);
			let app = createApp(component, option);
			if (this.$store) app.use(this.$store);
			if (this.$router) app.use(this.$router);
			app.config.globalProperties.$event = this.$event;
			return app.mount(node);
		}
	}
};
function _sfc_ssrRender$12(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({
		class: "m-popup",
		style: $options.getStyle
	}, _attrs, { style: $data.isShow ? null : { display: "none" } }))} data-v-de81b477>`);
	if ($data.progressBar.show && $data.progressBar.showTime > 0) _push(`<div class="progress-bar" data-v-de81b477><div style="${ssrRenderStyle($options.getTime)}" class="${ssrRenderClass([$data.control, "bar"])}" data-v-de81b477></div></div>`);
	else _push(`<!---->`);
	if ($props.option.pullDownHide) _push(`<div class="pull-down-bar" style="${ssrRenderStyle($data.pullStyle)}" data-v-de81b477>${ssrInterpolate($data.pullText)}关闭</div>`);
	else _push(`<!---->`);
	_push(`</div>`);
}
var _sfc_setup$12 = _sfc_main$12.setup;
_sfc_main$12.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/lib/layer/popup/popup.vue");
	return _sfc_setup$12 ? _sfc_setup$12(props, ctx) : void 0;
};
var popup_default$1 = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$12, [["ssrRender", _sfc_ssrRender$12], ["__scopeId", "data-v-de81b477"]]);
//#endregion
//#region src/lib/comp/event-bus.js
function event_bus_default() {
	const _events = {};
	const bus = {
		on: (evtType, handler, isOnce) => {
			if (typeof handler !== "function") return;
			if (!_events[evtType]) _events[evtType] = [];
			var flat = true;
			const len = _events[evtType].length;
			for (let i = 0; i < len; i++) if (_events[evtType][i].fn === handler) {
				flat = false;
				break;
			}
			flat && _events[evtType].push({
				once: !!isOnce,
				fn: handler
			});
		},
		off: (evtType, handler) => {
			if (!_events[evtType]) return;
			const len = _events[evtType].length;
			for (let i = 0; i < len; i++) if (_events[evtType][i].fn === handler) {
				_events[evtType].splice(i, 1);
				break;
			}
			if (_events[evtType].length === 0) delete _events[evtType];
		},
		emit: (evtType, data, timer) => {
			if (!_events[evtType]) return;
			if (isNumber(timer) && timer > 0) {
				if (isLock(evtType)) return;
				lock(evtType);
				setTimeout(() => {
					unLock(evtType);
				}, timer);
			}
			const arr = [];
			_events[evtType].forEach((item) => {
				if (!item.once) arr.push(item);
				item.fn(data);
			});
			_events[evtType] = arr;
		},
		once: (evtType, handler) => {
			bus.on(evtType, handler, true);
		},
		clear: (evtType) => {
			delete _events[evtType];
		}
	};
	return bus;
}
//#endregion
//#region src/lib/layer/popup/index.js
/**
* popup浮层
* 穆辰 2020-07-01
* 子模块往外派发事件，和父组件共享$event
*
* 使用方法：
* 例1，装载使用VUE组件
* const popup = this.$layer.popup({
*   left: 0,
*   bottom: 0,
*   animate: {name: 'left'},
*   autoHide: true
* });
* popup.loader(App, {});
* popup.show();
*/
function popup_default(option, plugin) {
	const app = createApp(popup_default$1, { option });
	const { store, router } = plugin || {};
	store && app.use(store);
	router && app.use(router);
	const $event = event_bus_default();
	app.config.globalProperties.$event = $event;
	$event.once("destroy", () => {
		app.unmount();
	});
	return app.mount(document.createElement("DIV"));
}
//#endregion
//#region src/lib/layer/dialog/dialog.vue
var _sfc_main$11 = {
	name: "custom-dialog",
	props: {
		option: {
			type: Object,
			default() {
				return {};
			}
		},
		appComp: Object,
		disabled: {
			type: Boolean,
			default: false
		}
	},
	methods: {
		handleClick(id) {
			this.$event.emit(id);
		},
		handleClose() {
			this.$event.emit("close");
		}
	}
};
function _sfc_ssrRender$11(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: ["m-mobile-dialog", {
		"mobile-wait": $props.option.wait,
		"comp": !!$props.appComp
	}] }, _attrs))} data-v-192f0f38>`);
	if ($props.option.wait) {
		_push(`<div class="dialog-wait flex-center" data-v-192f0f38><div class="loading" data-v-192f0f38><!--[-->`);
		ssrRenderList(8, (n) => {
			_push(`<i data-v-192f0f38></i>`);
		});
		_push(`<!--]--></div><div class="wait-text" data-v-192f0f38>${ssrInterpolate($props.option.wait === true ? "加载中" : $props.option.wait)}</div></div>`);
	} else {
		_push(`<!--[-->`);
		if ($props.option.title) _push(`<div class="dialog-title flex-center" data-v-192f0f38>${ssrInterpolate($props.option.title)}</div>`);
		else _push(`<!---->`);
		if ($props.option.close !== false) _push(`<div class="dialog-close flex-center" data-v-192f0f38><i class="iconfont icon-close" data-v-192f0f38></i></div>`);
		else _push(`<!---->`);
		_push(`<div class="${ssrRenderClass([$props.option.type, "dialog-content"])}" data-v-192f0f38>`);
		if (!!$props.appComp) ssrRenderVNode(_push, createVNode(resolveDynamicComponent($props.appComp), { option: $props.option }, null), _parent);
		else if ($props.option.content) _push(`<p class="dialog-text" data-v-192f0f38>${$props.option.content ?? ""}</p>`);
		else _push(`<!---->`);
		_push(`</div>`);
		if ($props.option.type) {
			_push(`<div class="${ssrRenderClass([[$props.option.type, { disabled: $props.disabled }], "dialog-items flex-between"])}" data-v-192f0f38>`);
			if ($props.option.type === "confirm") _push(`<div style="${ssrRenderStyle({ color: $props.option.cancelColor })}" class="btn-cancel flex-center" data-v-192f0f38>${ssrInterpolate($props.option.cancelText || "取消")}</div>`);
			else _push(`<!---->`);
			_push(`<div style="${ssrRenderStyle({ color: $props.option.okColor })}" class="btn-ok flex-center" data-v-192f0f38>${ssrInterpolate($props.option.okText || "确定")}</div></div>`);
		} else _push(`<!---->`);
		_push(`<!--]-->`);
	}
	_push(`</div>`);
}
var _sfc_setup$11 = _sfc_main$11.setup;
_sfc_main$11.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/lib/layer/dialog/dialog.vue");
	return _sfc_setup$11 ? _sfc_setup$11(props, ctx) : void 0;
};
var dialog_default$2 = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$11, [["ssrRender", _sfc_ssrRender$11], ["__scopeId", "data-v-192f0f38"]]);
//#endregion
//#region src/lib/layer/dialog/index.js
/**********
* 弹框
* 穆辰 20200701
*/
function dialog_default$1(appContent, option = {}) {
	const store = option.store;
	const router = option.router;
	delete option.store;
	delete option.router;
	let m_dialog = popup_default({
		showCenter: true,
		autoHide: false,
		initIndex: option.initIndex,
		stop: option.stop,
		overlay: {
			opacity: option.opacity,
			type: "create",
			color: option.color
		},
		animate: { name: option.animate }
	}, {
		store,
		router
	});
	m_dialog.loader(dialog_default$2, {
		option,
		appComp: appContent
	});
	m_dialog.$event.on("close", () => {
		m_dialog.hide(m_dialog.destroy);
	});
	return m_dialog;
}
//#endregion
//#region src/common/plugin/dialog/toast.vue
function calcProgress(progress, expression) {
	const tokens = expression.match(/[+\-*/]\s*-?\d+(?:\.\d+)?/g);
	if (!tokens || tokens.join("").replace(/\s/g, "") !== expression.replace(/\s/g, "")) return progress;
	let result = Number(progress);
	tokens.forEach((token) => {
		const operator = token.trim().charAt(0);
		const value = Number(token.trim().substring(1));
		if (!Number.isFinite(value)) return;
		if (operator === "+") result += value;
		if (operator === "-") result -= value;
		if (operator === "*") result *= value;
		if (operator === "/" && value !== 0) result /= value;
	});
	return parseFloat(result.toFixed(2));
}
var _sfc_main$10 = {
	props: ["msg", "type"],
	data() {
		return { text: this.msg };
	},
	mounted() {
		if ((this.msg + "").match(/\{\s*time([\w\W]*)\}/)) this.$event.on("progress", this.message);
	},
	methods: {
		change(obj) {
			this.text = this.msg.replace(/\{\s*time([\w\W]*)\}/g, function() {
				const reg = RegExp.$1.trim();
				if (reg.length > 0) return calcProgress(obj.progress, reg);
				return obj.progress;
			});
		},
		message(obj) {
			try {
				this.change({ progress: obj });
			} catch (e) {
				console.log("解析出错");
			}
		}
	}
};
function _sfc_ssrRender$10(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: ["m-dialog-toast", { "show-icon": !!$props.type }] }, _attrs))} data-v-8e7d461a>`);
	if ($props.type) _push(`<div class="icon flex-center" data-v-8e7d461a><i class="${ssrRenderClass(["icon-" + $props.type, "iconfont"])}" data-v-8e7d461a></i></div>`);
	else _push(`<!---->`);
	_push(`<div data-v-8e7d461a>${$data.text ?? ""}</div></div>`);
}
var _sfc_setup$10 = _sfc_main$10.setup;
_sfc_main$10.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/common/plugin/dialog/toast.vue");
	return _sfc_setup$10 ? _sfc_setup$10(props, ctx) : void 0;
};
var toast_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$10, [["ssrRender", _sfc_ssrRender$10], ["__scopeId", "data-v-8e7d461a"]]);
//#endregion
//#region src/common/components/scroll-view/index.vue
var _sfc_main$9 = {
	name: "scroll-view",
	props: {
		scrollY: {
			type: Boolean,
			default: false
		},
		scrollX: {
			type: Boolean,
			default: false
		},
		scrollWithAnimation: {
			type: Boolean,
			default: true
		},
		scrollTop: {
			type: Number,
			default: 0
		},
		scrollLeft: {
			type: Number,
			default: 0
		}
	},
	emits: ["scroll"],
	mounted() {
		pageScroll.on(this.$el, this.onPageScroll);
	},
	unmounted() {
		pageScroll.off(this.$el, this.onPageScroll);
	},
	watch: {
		scrollTop(y) {
			if (!this.scrollY) return false;
			pageScroll.scrollTo.call(this.$el, 0, y, this.scrollWithAnimation ? 300 : 0);
		},
		scrollLeft(x) {
			if (this.scrollY || !this.scrollX) return false;
			pageScroll.scrollTo.call(this.$el, x, 0, this.scrollWithAnimation ? 300 : 0);
		}
	},
	methods: { onPageScroll(ev) {
		this.$emit("scroll", ev);
	} }
};
function _sfc_ssrRender$9(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: ["m-scroll-view hide-scroll-bar", {
		"scroll-y": $props.scrollY,
		"scroll-x": !$props.scrollY && $props.scrollX
	}] }, _attrs))} data-v-fb2da33b>`);
	ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
	_push(`</div>`);
}
var _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/common/components/scroll-view/index.vue");
	return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
//#endregion
//#region src/common/plugin/dialog/action-sheet.vue
var _sfc_main$8 = {
	name: "actionSheet",
	components: { scrollView: /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$9, [["ssrRender", _sfc_ssrRender$9], ["__scopeId", "data-v-fb2da33b"]]) },
	props: {
		itemList: {
			type: Array,
			default() {
				return [];
			}
		},
		cancel: [Object, Boolean],
		cancelType: {
			type: String,
			default: ""
		}
	},
	data() {
		return { cancelBtn: Object.assign({
			text: "取消",
			color: null
		}, this.cancel || {}) };
	},
	methods: {
		handleSheet(index) {
			this.$event.emit("message", parseInt(index));
		},
		handleCancel() {
			this.$event.emit("cancel");
		}
	}
};
function _sfc_ssrRender$8(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_scroll_view = resolveComponent("scroll-view");
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "m-action-sheets" }, _attrs))} data-v-85edf5ba>`);
	_push(ssrRenderComponent(_component_scroll_view, {
		"scroll-y": true,
		class: ["items-container", {
			bottom: $props.cancel === false,
			"margin-btn-bottom": $props.cancelType === "btn"
		}]
	}, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(`<!--[-->`);
				ssrRenderList($props.itemList, (item, index) => {
					_push(`<li class="${ssrRenderClass([{ "bd-b": index < $props.itemList.length - 1 }, "item flex-center"])}" style="${ssrRenderStyle(item.color ? "color: " + item.color : "")}" data-v-85edf5ba${_scopeId}>${ssrInterpolate(item.text)}</li>`);
				});
				_push(`<!--]-->`);
			} else return [(openBlock(true), createBlock(Fragment, null, renderList($props.itemList, (item, index) => {
				return openBlock(), createBlock("li", {
					class: ["item flex-center", { "bd-b": index < $props.itemList.length - 1 }],
					key: index,
					style: item.color ? "color: " + item.color : "",
					onClick: ($event) => $options.handleSheet(index)
				}, toDisplayString(item.text), 15, ["onClick"]);
			}), 128))];
		}),
		_: 1
	}, _parent));
	if ($props.cancelType === "btn") _push(`<div class="${ssrRenderClass([{ "cancel-btn-box": $props.cancelType === "btn" }, "cancel-box flex-center"])}" data-v-85edf5ba><li class="cancel flex-center cancel-text" data-v-85edf5ba>${ssrInterpolate($data.cancelBtn.text)}</li></div>`);
	else if ($props.cancel !== false) _push(`<div class="cancel-box flex-center" data-v-85edf5ba><li class="item flex-center" style="${ssrRenderStyle({ color: $data.cancelBtn.color })}" data-v-85edf5ba>${ssrInterpolate($data.cancelBtn.text)}</li></div>`);
	else _push(`<!---->`);
	_push(`</div>`);
}
var _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/common/plugin/dialog/action-sheet.vue");
	return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
var action_sheet_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$8, [["ssrRender", _sfc_ssrRender$8], ["__scopeId", "data-v-85edf5ba"]]);
//#endregion
//#region src/common/plugin/dialog/index.js
/**********
* 穆辰
* 2020-07-02
*/
var _common = function(msg, config = {}, type) {
	return new Promise((resolve, reject) => {
		let opts = Object.assign({
			okText: "确定",
			cancelText: "取消",
			title: "提示",
			wait: false,
			top: null,
			left: null,
			close: false,
			animate: "scale",
			ok: function() {},
			cancel: function() {}
		}, config);
		const m_dialog = dialog_default$1(type === "open" ? msg : null, type === "open" ? Object.assign({
			animate: "scale",
			stop: true,
			store: clientStore,
			router: clientRouter
		}, config) : {
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
		});
		m_dialog.show(opts.left, opts.top);
		_dialogList.push(m_dialog);
		if (type === "wait") {
			_closeWait = m_dialog;
			return false;
		}
		if (type === "open" && !opts.once && opts.type) {
			m_dialog.$event.on("ok", (res) => {
				m_dialog.postMessage({
					type: "ok",
					data: res,
					app: m_dialog
				});
			});
			m_dialog.$event.on("message", (res) => {
				opts.ok(res);
			});
		}
		if (type !== "open" || opts.type && opts.once) m_dialog.$event.once("ok", (res) => {
			m_dialog.hide(m_dialog.destroy, "ok");
			opts.ok(res);
			resolve(res);
		});
		if (opts.type === "confirm") m_dialog.$event.once("cancel", function(result) {
			m_dialog.hide(m_dialog.destroy, "cancel");
			opts.cancel(result);
			reject(result);
		});
	});
};
var _closeWait = null;
var _dialogList = [];
var dialog_default = {
	/*******
	*
	* @param msg
	* msg支持动态变量time,关闭时间,毫秒,获取方式'还有{time/1000}秒关闭'使用单大括号，支持简单运算
	* @param config
	* @returns {Promise<unknown>}
	*/
	toast(msg, config) {
		if (isLock("toast") || env_default.isServer()) return false;
		this.closeWait();
		let opts = Object.assign({
			overlay: true,
			barShow: false,
			barColor: "#fff",
			showTime: 2e3,
			top: 94,
			lock: false,
			callback: function() {}
		}, isObject(config) ? config : {});
		if (opts.lock) lock("toast");
		return new Promise((resolve) => {
			const m_dialog = popup_default({
				showCenter: true,
				autoHide: false,
				overlay: { show: false },
				animate: { name: "slide" },
				progressBar: {
					show: opts.barShow,
					showTime: opts.showTime,
					color: opts.barColor
				}
			}, {
				store: clientStore,
				router: clientRouter
			});
			m_dialog.loader(toast_default, {
				msg,
				type: opts.type
			});
			m_dialog.show(opts.left, opts.top);
			m_dialog.$event.once("hide", (result) => {
				unLock("toast");
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
		return this.toast(msg, Object.assign(config || {}, { type: "circle-success" }));
	},
	/********
	* 失败提示
	* @param msg
	* @param config
	* @returns {*|Promise<unknown>}
	*/
	fail(msg, config) {
		return this.toast(msg, Object.assign(config || {}, { type: "failed" }));
	},
	/***********
	* 等待加载
	* @param msg
	* @param opt
	* @returns {*|Promise<unknown>|boolean|Promise<void>}
	*/
	wait(msg, opt) {
		if (_closeWait || isLock("wait") || env_default.isServer()) return true;
		if (isNumber(opt?.lock)) {
			lock("wait");
			setTimeout(() => {
				unLock("wait");
				this.closeWait();
			}, opt.lock);
		}
		const config = {
			wait: isString(msg) ? msg : true,
			opacity: 0,
			type: "create",
			animate: "fade"
		};
		return _common(null, Object.assign(config, opt || {}), "wait");
	},
	/**********
	* 关闭等待加载
	*/
	closeWait() {
		if (_closeWait && !isLock("wait")) {
			_closeWait.hide(_closeWait.destroy, "wait");
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
		if (env_default.isServer()) return false;
		this.closeWait();
		return _common(vue, opts, "open");
	},
	/************
	* 打开alert
	* @param msg
	* @param config
	* @returns {*|Promise<unknown>|Promise<void>}
	*/
	alert(msg, config) {
		if (env_default.isServer()) return false;
		this.closeWait();
		let option = {};
		if (isObject(config)) option = config;
		else if (isFunction(config)) option.ok = config;
		option.type = "alert";
		return _common(msg, option, "alert");
	},
	/************
	* 确定框
	* @param msg
	* @param fn1
	* @param fn2
	* @returns {*|Promise<unknown>}
	*/
	confirm(msg, fn1, fn2) {
		if (env_default.isServer()) return false;
		this.closeWait();
		let option = {};
		if (isObject(fn1)) option = fn1;
		else if (isFunction(fn1)) {
			option.ok = fn1;
			if (isFunction(fn2)) option.cancel = fn2;
		}
		option.type = "confirm";
		return _common(msg, option, "confirm");
	},
	/************
	* 弹框
	* @param opts
	*/
	popup(opts) {
		if (env_default.isServer()) return false;
		[
			"width",
			"height",
			"top",
			"left",
			"right",
			"bottom"
		].forEach((pro) => {
			if (isNumber(opts[pro])) opts.pro = px2px(opts.pro);
		});
		const t = popup_default(opts, {
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
		if (env_default.isServer()) return false;
		_dialogList.forEach((item) => {
			item.hide && item.hide(item.destroy, "close-all");
		});
		_dialogList = [];
	},
	/***********
	* 显示sheet菜单
	* @param option
	* @returns {Promise<unknown>|Promise<void>}
	*/
	showActionSheet(option) {
		if (env_default.isServer()) return false;
		return new Promise((resolve, reject) => {
			let opts = Object.assign({
				itemList: [],
				cancel: true,
				stop: true,
				success() {}
			}, option || {});
			const m_dialog = popup_default({
				left: 0,
				bottom: 0,
				autoHide: true,
				stop: opts.stop,
				overlay: {
					show: true,
					opacity: .5
				},
				animate: { name: "bottom" }
			});
			m_dialog.loader(action_sheet_default, {
				itemList: opts.itemList,
				cancel: opts.cancel,
				cancelType: opts.cancelType
			});
			m_dialog.$event.once("message", (res) => {
				resolve({ index: res });
				opts.success({ index: res });
				m_dialog.hide(m_dialog.destroy);
			});
			m_dialog.$event.once("cancel", () => {
				m_dialog.hide(m_dialog.destroy);
				reject();
			});
			m_dialog.show();
			_dialogList.push(m_dialog);
		});
	},
	setMiddle() {
		if (env_default.isServer()) return false;
		_dialogList.forEach((item) => {
			if (item && item.getStatus()) item.setAniCenter();
		});
	}
};
//#endregion
//#region src/lib/comp/broadcast.js
/*********
* 当前作用域内，数据传输
*/
function _getUID(key, push) {
	const uid = md5_default(_scope + key);
	push && !_uid.includes(uid) && _uid.push(uid);
	return uid;
}
var _uid = [], _scope = "scope";
var broadcast_default = {
	init(to, from) {
		_scope = to.fullPath;
		if (from.fullPath !== _scope) this.clear();
	},
	emit(evtType, data, timer) {
		const emit = (evtType, data) => {
			if (isObject(data) && data.type) bus.$emit(_getUID(`${evtType}:${data.type}`), data);
			bus.$emit(_getUID(evtType), data);
		};
		if (timer && isNumber(timer)) setTimeout(() => emit(evtType, data), timer);
		else emit(evtType, data);
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
		if (typeof evtType === "string") bus.$clear(scope ? _getUID(evtType) : evtType);
		else {
			_uid.forEach((item) => {
				this.clear(item, false);
			});
			_uid = [];
		}
	}
};
//#endregion
//#region src/common/components/progress-bar/index.vue
var _sfc_main$7 = {
	data() {
		return {
			percent: 0,
			show: false,
			skeletonShow: false,
			canSuccess: true,
			duration: 3e3,
			height: "2px",
			color: "#00ef6c",
			failedColor: "#ff0000",
			type: ""
		};
	},
	computed: { getStyle() {
		return {
			"width": this.percent + "%",
			"height": this.height,
			"background-color": this.canSuccess ? this.color : this.failedColor,
			"opacity": this.show ? 1 : 0
		};
	} },
	methods: {
		scrollTo() {
			const obj = _Storage.get(SCROLL_POS);
			if (obj) {
				_Storage.clear(SCROLL_POS);
				pageScroll.scrollTo(0, obj.y, 200);
			}
		},
		start(type) {
			this.type = type;
			this.show = true;
			this.skeletonShow = true;
			this.canSuccess = true;
			if (this._timer) {
				clearInterval(this._timer);
				this.percent = 0;
			}
			this._cut = 1e4 / Math.floor(this.duration);
			this._timer = setInterval(() => {
				this.increase(this._cut * Math.random());
				if (this.percent > 95) this.finish();
			}, 100);
			return this;
		},
		set(num) {
			this.show = true;
			this.canSuccess = true;
			this.percent = Math.floor(num);
			return this;
		},
		get() {
			return Math.floor(this.percent);
		},
		increase(num) {
			this.percent = this.percent + Math.floor(num);
			return this;
		},
		decrease(num) {
			this.percent = this.percent - Math.floor(num);
			return this;
		},
		finish() {
			this.percent = 100;
			this.hide();
			this.skeletonShow = false;
			$broadcast.emit("loaded");
			setTimeout(() => {
				this.scrollTo();
			}, 50);
			return this;
		},
		pause() {
			clearInterval(this._timer);
			return this;
		},
		hide() {
			clearInterval(this._timer);
			this._timer = null;
			setTimeout(() => {
				this.show = false;
				this.$nextTick(() => {
					setTimeout(() => {
						this.percent = 0;
					}, 200);
				});
			}, 500);
			return this;
		},
		fail() {
			this.canSuccess = false;
			return this;
		}
	}
};
function _sfc_ssrRender$7(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({
		class: "progress",
		style: $options.getStyle
	}, _attrs))} data-v-7e9d1c9e></div>`);
}
var _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/common/components/progress-bar/index.vue");
	return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
var progress_bar_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$7, [["ssrRender", _sfc_ssrRender$7], ["__scopeId", "data-v-7e9d1c9e"]]);
//#endregion
//#region src/common/util/global-properties.js
/************
* 注意：不要在如下几个全局组件内引入该组件！！！！
*/
var $http = instance;
var $api = api_default;
var $layer = dialog_default;
var $broadcast = broadcast_default;
var $event = event_bus_default();
var $bar = (function() {
	if (env_default.isServer()) return {
		start: () => {},
		finish: () => {}
	};
	const node = document.createElement("DIV");
	document.body.appendChild(node);
	return createApp(progress_bar_default).mount(node);
})();
var global_properties_default = { install(app) {
	app.config.globalProperties.$http = $http;
	app.config.globalProperties.$api = $api;
	app.config.globalProperties.$layer = $layer;
	app.config.globalProperties.$broadcast = $broadcast;
	app.config.globalProperties.$event = $event;
	app.config.globalProperties.$bar = $bar;
} };
//#endregion
//#region src/common/components/swiper/js/swiper.js
/**
* Swiper 3.4.2
* Most modern mobile touch slider and framework with hardware accelerated transitions
*
* http://www.idangero.us/swiper/
*
* Copyright 2017, Vladimir Kharlampidi
* The iDangero.us
* http://www.idangero.us/
*
* Licensed under MIT
*
* Released on: March 10, 2017
*/
var swiper_default$1 = (function() {
	"use strict";
	var $;
	var Swiper = function(container, params) {
		if (!(this instanceof Swiper)) return new Swiper(container, params);
		var defaults = {
			direction: "horizontal",
			touchEventsTarget: "container",
			initialSlide: 0,
			speed: 300,
			autoplay: false,
			autoplayDisableOnInteraction: true,
			autoplayStopOnLast: false,
			iOSEdgeSwipeDetection: false,
			iOSEdgeSwipeThreshold: 20,
			freeMode: false,
			freeModeMomentum: true,
			freeModeMomentumRatio: 1,
			freeModeMomentumBounce: true,
			freeModeMomentumBounceRatio: 1,
			freeModeMomentumVelocityRatio: 1,
			freeModeSticky: false,
			freeModeMinimumVelocity: .02,
			autoHeight: false,
			setWrapperSize: false,
			virtualTranslate: false,
			effect: "slide",
			coverflow: {
				rotate: 50,
				stretch: 0,
				depth: 100,
				modifier: 1,
				slideShadows: true
			},
			flip: {
				slideShadows: true,
				limitRotation: true
			},
			cube: {
				slideShadows: true,
				shadow: true,
				shadowOffset: 20,
				shadowScale: .94
			},
			fade: { crossFade: false },
			parallax: false,
			zoom: false,
			zoomMax: 3,
			zoomMin: 1,
			zoomToggle: true,
			scrollbar: null,
			scrollbarHide: true,
			scrollbarDraggable: false,
			scrollbarSnapOnRelease: false,
			keyboardControl: false,
			mousewheelControl: false,
			mousewheelReleaseOnEdges: false,
			mousewheelInvert: false,
			mousewheelForceToAxis: false,
			mousewheelSensitivity: 1,
			mousewheelEventsTarged: "container",
			hashnav: false,
			hashnavWatchState: false,
			history: false,
			replaceState: false,
			breakpoints: void 0,
			spaceBetween: 0,
			slidesPerView: 1,
			slidesPerColumn: 1,
			slidesPerColumnFill: "column",
			slidesPerGroup: 1,
			centeredSlides: false,
			slidesOffsetBefore: 0,
			slidesOffsetAfter: 0,
			roundLengths: false,
			touchRatio: 1,
			touchAngle: 45,
			simulateTouch: true,
			shortSwipes: true,
			longSwipes: true,
			longSwipesRatio: .5,
			longSwipesMs: 300,
			followFinger: true,
			onlyExternal: false,
			threshold: 0,
			touchMoveStopPropagation: true,
			touchReleaseOnEdges: false,
			uniqueNavElements: true,
			pagination: null,
			paginationElement: "span",
			paginationClickable: false,
			paginationHide: false,
			paginationBulletRender: null,
			paginationProgressRender: null,
			paginationFractionRender: null,
			paginationCustomRender: null,
			paginationType: "bullets",
			resistance: true,
			resistanceRatio: .85,
			nextButton: null,
			prevButton: null,
			watchSlidesProgress: false,
			watchSlidesVisibility: false,
			grabCursor: false,
			preventClicks: true,
			preventClicksPropagation: true,
			slideToClickedSlide: false,
			lazyLoading: false,
			lazyLoadingInPrevNext: false,
			lazyLoadingInPrevNextAmount: 1,
			lazyLoadingOnTransitionStart: false,
			preloadImages: true,
			updateOnImagesReady: true,
			loop: false,
			loopAdditionalSlides: 0,
			loopedSlides: null,
			control: void 0,
			controlInverse: false,
			controlBy: "slide",
			normalizeSlideIndex: true,
			allowSwipeToPrev: true,
			allowSwipeToNext: true,
			swipeHandler: null,
			noSwiping: true,
			noSwipingClass: "swiper-no-swiping",
			passiveListeners: true,
			containerModifierClass: "swiper-container-",
			slideClass: "swiper-slide",
			slideActiveClass: "swiper-slide-active",
			slideDuplicateActiveClass: "swiper-slide-duplicate-active",
			slideVisibleClass: "swiper-slide-visible",
			slideDuplicateClass: "swiper-slide-duplicate",
			slideNextClass: "swiper-slide-next",
			slideDuplicateNextClass: "swiper-slide-duplicate-next",
			slidePrevClass: "swiper-slide-prev",
			slideDuplicatePrevClass: "swiper-slide-duplicate-prev",
			wrapperClass: "swiper-wrapper",
			bulletClass: "swiper-pagination-bullet",
			bulletActiveClass: "swiper-pagination-bullet-active",
			buttonDisabledClass: "swiper-button-disabled",
			paginationCurrentClass: "swiper-pagination-current",
			paginationTotalClass: "swiper-pagination-total",
			paginationHiddenClass: "swiper-pagination-hidden",
			paginationProgressbarClass: "swiper-pagination-progressbar",
			paginationClickableClass: "swiper-pagination-clickable",
			paginationModifierClass: "swiper-pagination-",
			lazyLoadingClass: "swiper-lazy",
			lazyStatusLoadingClass: "swiper-lazy-loading",
			lazyStatusLoadedClass: "swiper-lazy-loaded",
			lazyPreloaderClass: "swiper-lazy-preloader",
			notificationClass: "swiper-notification",
			preloaderClass: "preloader",
			zoomContainerClass: "swiper-zoom-container",
			observer: false,
			observeParents: false,
			a11y: false,
			prevSlideMessage: "Previous slide",
			nextSlideMessage: "Next slide",
			firstSlideMessage: "This is the first slide",
			lastSlideMessage: "This is the last slide",
			paginationBulletMessage: "Go to slide {{index}}",
			runCallbacksOnInit: true
		};
		var initialVirtualTranslate = params && params.virtualTranslate;
		params = params || {};
		var originalParams = {};
		for (var param in params) if (typeof params[param] === "object" && params[param] !== null && !(params[param].nodeType || params[param] === window || params[param] === document || typeof Dom7 !== "undefined" && params[param] instanceof Dom7 || typeof jQuery !== "undefined" && params[param] instanceof jQuery)) {
			originalParams[param] = {};
			for (var deepParam in params[param]) originalParams[param][deepParam] = params[param][deepParam];
		} else originalParams[param] = params[param];
		for (var def in defaults) if (typeof params[def] === "undefined") params[def] = defaults[def];
		else if (typeof params[def] === "object") {
			for (var deepDef in defaults[def]) if (typeof params[def][deepDef] === "undefined") params[def][deepDef] = defaults[def][deepDef];
		}
		var s = this;
		s.params = params;
		s.originalParams = originalParams;
		s.classNames = [];
		if (typeof $ !== "undefined" && typeof Dom7 !== "undefined") $ = Dom7;
		if (typeof $ === "undefined") {
			if (typeof Dom7 === "undefined") $ = window.Dom7 || window.Zepto || window.jQuery;
			else $ = Dom7;
			if (!$) return;
		}
		s.$ = $;
		s.currentBreakpoint = void 0;
		s.getActiveBreakpoint = function() {
			if (!s.params.breakpoints) return false;
			var breakpoint = false;
			var points = [], point;
			for (point in s.params.breakpoints) if (s.params.breakpoints.hasOwnProperty(point)) points.push(point);
			points.sort(function(a, b) {
				return parseInt(a, 10) > parseInt(b, 10);
			});
			for (var i = 0; i < points.length; i++) {
				point = points[i];
				if (point >= window.innerWidth && !breakpoint) breakpoint = point;
			}
			return breakpoint || "max";
		};
		s.setBreakpoint = function() {
			var breakpoint = s.getActiveBreakpoint();
			if (breakpoint && s.currentBreakpoint !== breakpoint) {
				var breakPointsParams = breakpoint in s.params.breakpoints ? s.params.breakpoints[breakpoint] : s.originalParams;
				var needsReLoop = s.params.loop && breakPointsParams.slidesPerView !== s.params.slidesPerView;
				for (var param in breakPointsParams) s.params[param] = breakPointsParams[param];
				s.currentBreakpoint = breakpoint;
				if (needsReLoop && s.destroyLoop) s.reLoop(true);
			}
		};
		if (s.params.breakpoints) s.setBreakpoint();
		s.container = $(container);
		if (s.container.length === 0) return;
		if (s.container.length > 1) {
			var swipers = [];
			s.container.each(function() {
				swipers.push(new Swiper(this, params));
			});
			return swipers;
		}
		s.container[0].swiper = s;
		s.container.data("swiper", s);
		s.classNames.push(s.params.containerModifierClass + s.params.direction);
		if (s.params.freeMode) s.classNames.push(s.params.containerModifierClass + "free-mode");
		if (!s.support.flexbox) {
			s.classNames.push(s.params.containerModifierClass + "no-flexbox");
			s.params.slidesPerColumn = 1;
		}
		if (s.params.autoHeight) s.classNames.push(s.params.containerModifierClass + "autoheight");
		if (s.params.parallax || s.params.watchSlidesVisibility) s.params.watchSlidesProgress = true;
		if (s.params.touchReleaseOnEdges) s.params.resistanceRatio = 0;
		if ([
			"cube",
			"coverflow",
			"flip"
		].indexOf(s.params.effect) >= 0) if (s.support.transforms3d) {
			s.params.watchSlidesProgress = true;
			s.classNames.push(s.params.containerModifierClass + "3d");
		} else s.params.effect = "slide";
		if (s.params.effect !== "slide") s.classNames.push(s.params.containerModifierClass + s.params.effect);
		if (s.params.effect === "cube") {
			s.params.resistanceRatio = 0;
			s.params.slidesPerView = 1;
			s.params.slidesPerColumn = 1;
			s.params.slidesPerGroup = 1;
			s.params.centeredSlides = false;
			s.params.spaceBetween = 0;
			s.params.virtualTranslate = true;
		}
		if (s.params.effect === "fade" || s.params.effect === "flip") {
			s.params.slidesPerView = 1;
			s.params.slidesPerColumn = 1;
			s.params.slidesPerGroup = 1;
			s.params.watchSlidesProgress = true;
			s.params.spaceBetween = 0;
			if (typeof initialVirtualTranslate === "undefined") s.params.virtualTranslate = true;
		}
		if (s.params.grabCursor && s.support.touch) s.params.grabCursor = false;
		s.wrapper = s.container.children("." + s.params.wrapperClass);
		if (s.params.pagination) {
			s.paginationContainer = $(s.params.pagination);
			if (s.params.uniqueNavElements && typeof s.params.pagination === "string" && s.paginationContainer.length > 1 && s.container.find(s.params.pagination).length === 1) s.paginationContainer = s.container.find(s.params.pagination);
			if (s.params.paginationType === "bullets" && s.params.paginationClickable) s.paginationContainer.addClass(s.params.paginationModifierClass + "clickable");
			else s.params.paginationClickable = false;
			s.paginationContainer.addClass(s.params.paginationModifierClass + s.params.paginationType);
		}
		if (s.params.nextButton || s.params.prevButton) {
			if (s.params.nextButton) {
				s.nextButton = $(s.params.nextButton);
				if (s.params.uniqueNavElements && typeof s.params.nextButton === "string" && s.nextButton.length > 1 && s.container.find(s.params.nextButton).length === 1) s.nextButton = s.container.find(s.params.nextButton);
			}
			if (s.params.prevButton) {
				s.prevButton = $(s.params.prevButton);
				if (s.params.uniqueNavElements && typeof s.params.prevButton === "string" && s.prevButton.length > 1 && s.container.find(s.params.prevButton).length === 1) s.prevButton = s.container.find(s.params.prevButton);
			}
		}
		s.isHorizontal = function() {
			return s.params.direction === "horizontal";
		};
		s.rtl = s.isHorizontal() && (s.container[0].dir.toLowerCase() === "rtl" || s.container.css("direction") === "rtl");
		if (s.rtl) s.classNames.push(s.params.containerModifierClass + "rtl");
		if (s.rtl) s.wrongRTL = s.wrapper.css("display") === "-webkit-box";
		if (s.params.slidesPerColumn > 1) s.classNames.push(s.params.containerModifierClass + "multirow");
		if (s.device.android) s.classNames.push(s.params.containerModifierClass + "android");
		s.container.addClass(s.classNames.join(" "));
		s.translate = 0;
		s.progress = 0;
		s.velocity = 0;
		s.lockSwipeToNext = function() {
			s.params.allowSwipeToNext = false;
			if (s.params.allowSwipeToPrev === false && s.params.grabCursor) s.unsetGrabCursor();
		};
		s.lockSwipeToPrev = function() {
			s.params.allowSwipeToPrev = false;
			if (s.params.allowSwipeToNext === false && s.params.grabCursor) s.unsetGrabCursor();
		};
		s.lockSwipes = function() {
			s.params.allowSwipeToNext = s.params.allowSwipeToPrev = false;
			if (s.params.grabCursor) s.unsetGrabCursor();
		};
		s.unlockSwipeToNext = function() {
			s.params.allowSwipeToNext = true;
			if (s.params.allowSwipeToPrev === true && s.params.grabCursor) s.setGrabCursor();
		};
		s.unlockSwipeToPrev = function() {
			s.params.allowSwipeToPrev = true;
			if (s.params.allowSwipeToNext === true && s.params.grabCursor) s.setGrabCursor();
		};
		s.unlockSwipes = function() {
			s.params.allowSwipeToNext = s.params.allowSwipeToPrev = true;
			if (s.params.grabCursor) s.setGrabCursor();
		};
		function round(a) {
			return Math.floor(a);
		}
		s.setGrabCursor = function(moving) {
			s.container[0].style.cursor = "move";
			s.container[0].style.cursor = moving ? "-webkit-grabbing" : "-webkit-grab";
			s.container[0].style.cursor = moving ? "-moz-grabbin" : "-moz-grab";
			s.container[0].style.cursor = moving ? "grabbing" : "grab";
		};
		s.unsetGrabCursor = function() {
			s.container[0].style.cursor = "";
		};
		if (s.params.grabCursor) s.setGrabCursor();
		s.imagesToLoad = [];
		s.imagesLoaded = 0;
		s.loadImage = function(imgElement, src, srcset, sizes, checkForComplete, callback) {
			var image;
			function onReady() {
				if (callback) callback();
			}
			if (!imgElement.complete || !checkForComplete) if (src) {
				image = new window.Image();
				image.onload = onReady;
				image.onerror = onReady;
				if (sizes) image.sizes = sizes;
				if (srcset) image.srcset = srcset;
				if (src) image.src = src;
			} else onReady();
			else onReady();
		};
		s.preloadImages = function() {
			s.imagesToLoad = s.container.find("img");
			function _onReady() {
				if (typeof s === "undefined" || s === null || !s) return;
				if (s.imagesLoaded !== void 0) s.imagesLoaded++;
				if (s.imagesLoaded === s.imagesToLoad.length) {
					if (s.params.updateOnImagesReady) s.update();
					s.emit("onImagesReady", s);
				}
			}
			for (var i = 0; i < s.imagesToLoad.length; i++) s.loadImage(s.imagesToLoad[i], s.imagesToLoad[i].currentSrc || s.imagesToLoad[i].getAttribute("src"), s.imagesToLoad[i].srcset || s.imagesToLoad[i].getAttribute("srcset"), s.imagesToLoad[i].sizes || s.imagesToLoad[i].getAttribute("sizes"), true, _onReady);
		};
		s.autoplayTimeoutId = void 0;
		s.autoplaying = false;
		s.autoplayPaused = false;
		function autoplay() {
			var autoplayDelay = s.params.autoplay;
			var activeSlide = s.slides.eq(s.activeIndex);
			if (activeSlide.attr("data-swiper-autoplay")) autoplayDelay = activeSlide.attr("data-swiper-autoplay") || s.params.autoplay;
			s.autoplayTimeoutId = setTimeout(function() {
				if (s.params.loop) {
					s.fixLoop();
					s._slideNext();
					s.emit("onAutoplay", s);
				} else if (!s.isEnd) {
					s._slideNext();
					s.emit("onAutoplay", s);
				} else if (!params.autoplayStopOnLast) {
					s._slideTo(0);
					s.emit("onAutoplay", s);
				} else s.stopAutoplay();
			}, autoplayDelay);
		}
		s.startAutoplay = function() {
			if (typeof s.autoplayTimeoutId !== "undefined") return false;
			if (!s.params.autoplay) return false;
			if (s.autoplaying) return false;
			s.autoplaying = true;
			s.emit("onAutoplayStart", s);
			autoplay();
		};
		s.stopAutoplay = function(internal) {
			if (!s.autoplayTimeoutId) return;
			if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
			s.autoplaying = false;
			s.autoplayTimeoutId = void 0;
			s.emit("onAutoplayStop", s);
		};
		s.pauseAutoplay = function(speed) {
			if (s.autoplayPaused) return;
			if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
			s.autoplayPaused = true;
			if (speed === 0) {
				s.autoplayPaused = false;
				autoplay();
			} else s.wrapper.transitionEnd(function() {
				if (!s) return;
				s.autoplayPaused = false;
				if (!s.autoplaying) s.stopAutoplay();
				else autoplay();
			});
		};
		s.minTranslate = function() {
			return -s.snapGrid[0];
		};
		s.maxTranslate = function() {
			return -s.snapGrid[s.snapGrid.length - 1];
		};
		s.updateAutoHeight = function() {
			var activeSlides = [];
			var newHeight = 0;
			var i;
			if (s.params.slidesPerView !== "auto" && s.params.slidesPerView > 1) for (i = 0; i < Math.ceil(s.params.slidesPerView); i++) {
				var index = s.activeIndex + i;
				if (index > s.slides.length) break;
				activeSlides.push(s.slides.eq(index)[0]);
			}
			else activeSlides.push(s.slides.eq(s.activeIndex)[0]);
			for (i = 0; i < activeSlides.length; i++) if (typeof activeSlides[i] !== "undefined") {
				var height = activeSlides[i].offsetHeight;
				newHeight = height > newHeight ? height : newHeight;
			}
			if (newHeight) s.wrapper.css("height", newHeight + "px");
		};
		s.updateContainerSize = function() {
			var width, height;
			if (typeof s.params.width !== "undefined") width = s.params.width;
			else width = s.container[0].clientWidth;
			if (typeof s.params.height !== "undefined") height = s.params.height;
			else height = s.container[0].clientHeight;
			if (width === 0 && s.isHorizontal() || height === 0 && !s.isHorizontal()) return;
			width = width - parseInt(s.container.css("padding-left"), 10) - parseInt(s.container.css("padding-right"), 10);
			height = height - parseInt(s.container.css("padding-top"), 10) - parseInt(s.container.css("padding-bottom"), 10);
			s.width = width;
			s.height = height;
			s.size = s.isHorizontal() ? s.width : s.height;
		};
		s.updateSlidesSize = function() {
			s.slides = s.wrapper.children("." + s.params.slideClass);
			s.snapGrid = [];
			s.slidesGrid = [];
			s.slidesSizesGrid = [];
			var spaceBetween = s.params.spaceBetween, slidePosition = -s.params.slidesOffsetBefore, i, prevSlideSize = 0, index = 0;
			if (typeof s.size === "undefined") return;
			if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * s.size;
			s.virtualSize = -spaceBetween;
			if (s.rtl) s.slides.css({
				marginLeft: "",
				marginTop: ""
			});
			else s.slides.css({
				marginRight: "",
				marginBottom: ""
			});
			var slidesNumberEvenToRows;
			if (s.params.slidesPerColumn > 1) {
				if (Math.floor(s.slides.length / s.params.slidesPerColumn) === s.slides.length / s.params.slidesPerColumn) slidesNumberEvenToRows = s.slides.length;
				else slidesNumberEvenToRows = Math.ceil(s.slides.length / s.params.slidesPerColumn) * s.params.slidesPerColumn;
				if (s.params.slidesPerView !== "auto" && s.params.slidesPerColumnFill === "row") slidesNumberEvenToRows = Math.max(slidesNumberEvenToRows, s.params.slidesPerView * s.params.slidesPerColumn);
			}
			var slideSize;
			var slidesPerColumn = s.params.slidesPerColumn;
			var slidesPerRow = slidesNumberEvenToRows / slidesPerColumn;
			var numFullColumns = slidesPerRow - (s.params.slidesPerColumn * slidesPerRow - s.slides.length);
			for (i = 0; i < s.slides.length; i++) {
				slideSize = 0;
				var slide = s.slides.eq(i);
				if (s.params.slidesPerColumn > 1) {
					var newSlideOrderIndex;
					var column, row;
					if (s.params.slidesPerColumnFill === "column") {
						column = Math.floor(i / slidesPerColumn);
						row = i - column * slidesPerColumn;
						if (column > numFullColumns || column === numFullColumns && row === slidesPerColumn - 1) {
							if (++row >= slidesPerColumn) {
								row = 0;
								column++;
							}
						}
						newSlideOrderIndex = column + row * slidesNumberEvenToRows / slidesPerColumn;
						slide.css({
							"-webkit-box-ordinal-group": newSlideOrderIndex,
							"-moz-box-ordinal-group": newSlideOrderIndex,
							"-ms-flex-order": newSlideOrderIndex,
							"-webkit-order": newSlideOrderIndex,
							"order": newSlideOrderIndex
						});
					} else {
						row = Math.floor(i / slidesPerRow);
						column = i - row * slidesPerRow;
					}
					slide.css("margin-" + (s.isHorizontal() ? "top" : "left"), row !== 0 && s.params.spaceBetween && s.params.spaceBetween + "px").attr("data-swiper-column", column).attr("data-swiper-row", row);
				}
				if (slide.css("display") === "none") continue;
				if (s.params.slidesPerView === "auto") {
					slideSize = s.isHorizontal() ? slide.outerWidth(true) : slide.outerHeight(true);
					if (s.params.roundLengths) slideSize = round(slideSize);
				} else {
					slideSize = (s.size - (s.params.slidesPerView - 1) * spaceBetween) / s.params.slidesPerView;
					if (s.params.roundLengths) slideSize = round(slideSize);
					if (s.isHorizontal()) s.slides[i].style.width = slideSize + "px";
					else s.slides[i].style.height = slideSize + "px";
				}
				s.slides[i].swiperSlideSize = slideSize;
				s.slidesSizesGrid.push(slideSize);
				if (s.params.centeredSlides) {
					slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
					if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - s.size / 2 - spaceBetween;
					if (i === 0) slidePosition = slidePosition - s.size / 2 - spaceBetween;
					if (Math.abs(slidePosition) < 1 / 1e3) slidePosition = 0;
					if (index % s.params.slidesPerGroup === 0) s.snapGrid.push(slidePosition);
					s.slidesGrid.push(slidePosition);
				} else {
					if (index % s.params.slidesPerGroup === 0) s.snapGrid.push(slidePosition);
					s.slidesGrid.push(slidePosition);
					slidePosition = slidePosition + slideSize + spaceBetween;
				}
				s.virtualSize += slideSize + spaceBetween;
				prevSlideSize = slideSize;
				index++;
			}
			s.virtualSize = Math.max(s.virtualSize, s.size) + s.params.slidesOffsetAfter;
			var newSlidesGrid;
			if (s.rtl && s.wrongRTL && (s.params.effect === "slide" || s.params.effect === "coverflow")) s.wrapper.css({ width: s.virtualSize + s.params.spaceBetween + "px" });
			if (!s.support.flexbox || s.params.setWrapperSize) if (s.isHorizontal()) s.wrapper.css({ width: s.virtualSize + s.params.spaceBetween + "px" });
			else s.wrapper.css({ height: s.virtualSize + s.params.spaceBetween + "px" });
			if (s.params.slidesPerColumn > 1) {
				s.virtualSize = (slideSize + s.params.spaceBetween) * slidesNumberEvenToRows;
				s.virtualSize = Math.ceil(s.virtualSize / s.params.slidesPerColumn) - s.params.spaceBetween;
				if (s.isHorizontal()) s.wrapper.css({ width: s.virtualSize + s.params.spaceBetween + "px" });
				else s.wrapper.css({ height: s.virtualSize + s.params.spaceBetween + "px" });
				if (s.params.centeredSlides) {
					newSlidesGrid = [];
					for (i = 0; i < s.snapGrid.length; i++) if (s.snapGrid[i] < s.virtualSize + s.snapGrid[0]) newSlidesGrid.push(s.snapGrid[i]);
					s.snapGrid = newSlidesGrid;
				}
			}
			if (!s.params.centeredSlides) {
				newSlidesGrid = [];
				for (i = 0; i < s.snapGrid.length; i++) if (s.snapGrid[i] <= s.virtualSize - s.size) newSlidesGrid.push(s.snapGrid[i]);
				s.snapGrid = newSlidesGrid;
				if (Math.floor(s.virtualSize - s.size) - Math.floor(s.snapGrid[s.snapGrid.length - 1]) > 1) s.snapGrid.push(s.virtualSize - s.size);
			}
			if (s.snapGrid.length === 0) s.snapGrid = [0];
			if (s.params.spaceBetween !== 0) if (s.isHorizontal()) if (s.rtl) s.slides.css({ marginLeft: spaceBetween + "px" });
			else s.slides.css({ marginRight: spaceBetween + "px" });
			else s.slides.css({ marginBottom: spaceBetween + "px" });
			if (s.params.watchSlidesProgress) s.updateSlidesOffset();
		};
		s.updateSlidesOffset = function() {
			for (var i = 0; i < s.slides.length; i++) s.slides[i].swiperSlideOffset = s.isHorizontal() ? s.slides[i].offsetLeft : s.slides[i].offsetTop;
		};
		s.currentSlidesPerView = function() {
			var spv = 1, i, j;
			if (s.params.centeredSlides) {
				var size = s.slides[s.activeIndex].swiperSlideSize;
				var breakLoop;
				for (i = s.activeIndex + 1; i < s.slides.length; i++) if (s.slides[i] && !breakLoop) {
					size += s.slides[i].swiperSlideSize;
					spv++;
					if (size > s.size) breakLoop = true;
				}
				for (j = s.activeIndex - 1; j >= 0; j--) if (s.slides[j] && !breakLoop) {
					size += s.slides[j].swiperSlideSize;
					spv++;
					if (size > s.size) breakLoop = true;
				}
			} else for (i = s.activeIndex + 1; i < s.slides.length; i++) if (s.slidesGrid[i] - s.slidesGrid[s.activeIndex] < s.size) spv++;
			return spv;
		};
		s.updateSlidesProgress = function(translate) {
			if (typeof translate === "undefined") translate = s.translate || 0;
			if (s.slides.length === 0) return;
			if (typeof s.slides[0].swiperSlideOffset === "undefined") s.updateSlidesOffset();
			var offsetCenter = -translate;
			if (s.rtl) offsetCenter = translate;
			s.slides.removeClass(s.params.slideVisibleClass);
			for (var i = 0; i < s.slides.length; i++) {
				var slide = s.slides[i];
				var slideProgress = (offsetCenter + (s.params.centeredSlides ? s.minTranslate() : 0) - slide.swiperSlideOffset) / (slide.swiperSlideSize + s.params.spaceBetween);
				if (s.params.watchSlidesVisibility) {
					var slideBefore = -(offsetCenter - slide.swiperSlideOffset);
					var slideAfter = slideBefore + s.slidesSizesGrid[i];
					if (slideBefore >= 0 && slideBefore < s.size || slideAfter > 0 && slideAfter <= s.size || slideBefore <= 0 && slideAfter >= s.size) s.slides.eq(i).addClass(s.params.slideVisibleClass);
				}
				slide.progress = s.rtl ? -slideProgress : slideProgress;
			}
		};
		s.updateProgress = function(translate) {
			if (typeof translate === "undefined") translate = s.translate || 0;
			var translatesDiff = s.maxTranslate() - s.minTranslate();
			var wasBeginning = s.isBeginning;
			var wasEnd = s.isEnd;
			if (translatesDiff === 0) {
				s.progress = 0;
				s.isBeginning = s.isEnd = true;
			} else {
				s.progress = (translate - s.minTranslate()) / translatesDiff;
				s.isBeginning = s.progress <= 0;
				s.isEnd = s.progress >= 1;
			}
			if (s.isBeginning && !wasBeginning) s.emit("onReachBeginning", s);
			if (s.isEnd && !wasEnd) s.emit("onReachEnd", s);
			if (s.params.watchSlidesProgress) s.updateSlidesProgress(translate);
			s.emit("onProgress", s, s.progress);
		};
		s.updateActiveIndex = function() {
			var translate = s.rtl ? s.translate : -s.translate;
			var newActiveIndex, i, snapIndex;
			for (i = 0; i < s.slidesGrid.length; i++) if (typeof s.slidesGrid[i + 1] !== "undefined") {
				if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1] - (s.slidesGrid[i + 1] - s.slidesGrid[i]) / 2) newActiveIndex = i;
				else if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1]) newActiveIndex = i + 1;
			} else if (translate >= s.slidesGrid[i]) newActiveIndex = i;
			if (s.params.normalizeSlideIndex) {
				if (newActiveIndex < 0 || typeof newActiveIndex === "undefined") newActiveIndex = 0;
			}
			snapIndex = Math.floor(newActiveIndex / s.params.slidesPerGroup);
			if (snapIndex >= s.snapGrid.length) snapIndex = s.snapGrid.length - 1;
			if (newActiveIndex === s.activeIndex) return;
			s.snapIndex = snapIndex;
			s.previousIndex = s.activeIndex;
			s.activeIndex = newActiveIndex;
			s.updateClasses();
			s.updateRealIndex();
		};
		s.updateRealIndex = function() {
			s.realIndex = parseInt(s.slides.eq(s.activeIndex).attr("data-swiper-slide-index") || s.activeIndex, 10);
		};
		s.updateClasses = function() {
			s.slides.removeClass(s.params.slideActiveClass + " " + s.params.slideNextClass + " " + s.params.slidePrevClass + " " + s.params.slideDuplicateActiveClass + " " + s.params.slideDuplicateNextClass + " " + s.params.slideDuplicatePrevClass);
			var activeSlide = s.slides.eq(s.activeIndex);
			activeSlide.addClass(s.params.slideActiveClass);
			if (params.loop) if (activeSlide.hasClass(s.params.slideDuplicateClass)) s.wrapper.children("." + s.params.slideClass + ":not(." + s.params.slideDuplicateClass + ")[data-swiper-slide-index=\"" + s.realIndex + "\"]").addClass(s.params.slideDuplicateActiveClass);
			else s.wrapper.children("." + s.params.slideClass + "." + s.params.slideDuplicateClass + "[data-swiper-slide-index=\"" + s.realIndex + "\"]").addClass(s.params.slideDuplicateActiveClass);
			var nextSlide = activeSlide.next("." + s.params.slideClass).addClass(s.params.slideNextClass);
			if (s.params.loop && nextSlide.length === 0) {
				nextSlide = s.slides.eq(0);
				nextSlide.addClass(s.params.slideNextClass);
			}
			var prevSlide = activeSlide.prev("." + s.params.slideClass).addClass(s.params.slidePrevClass);
			if (s.params.loop && prevSlide.length === 0) {
				prevSlide = s.slides.eq(-1);
				prevSlide.addClass(s.params.slidePrevClass);
			}
			if (params.loop) {
				if (nextSlide.hasClass(s.params.slideDuplicateClass)) s.wrapper.children("." + s.params.slideClass + ":not(." + s.params.slideDuplicateClass + ")[data-swiper-slide-index=\"" + nextSlide.attr("data-swiper-slide-index") + "\"]").addClass(s.params.slideDuplicateNextClass);
				else s.wrapper.children("." + s.params.slideClass + "." + s.params.slideDuplicateClass + "[data-swiper-slide-index=\"" + nextSlide.attr("data-swiper-slide-index") + "\"]").addClass(s.params.slideDuplicateNextClass);
				if (prevSlide.hasClass(s.params.slideDuplicateClass)) s.wrapper.children("." + s.params.slideClass + ":not(." + s.params.slideDuplicateClass + ")[data-swiper-slide-index=\"" + prevSlide.attr("data-swiper-slide-index") + "\"]").addClass(s.params.slideDuplicatePrevClass);
				else s.wrapper.children("." + s.params.slideClass + "." + s.params.slideDuplicateClass + "[data-swiper-slide-index=\"" + prevSlide.attr("data-swiper-slide-index") + "\"]").addClass(s.params.slideDuplicatePrevClass);
			}
			if (s.paginationContainer && s.paginationContainer.length > 0) {
				var current, total = s.params.loop ? Math.ceil((s.slides.length - s.loopedSlides * 2) / s.params.slidesPerGroup) : s.snapGrid.length;
				if (s.params.loop) {
					current = Math.ceil((s.activeIndex - s.loopedSlides) / s.params.slidesPerGroup);
					if (current > s.slides.length - 1 - s.loopedSlides * 2) current = current - (s.slides.length - s.loopedSlides * 2);
					if (current > total - 1) current = current - total;
					if (current < 0 && s.params.paginationType !== "bullets") current = total + current;
				} else if (typeof s.snapIndex !== "undefined") current = s.snapIndex;
				else current = s.activeIndex || 0;
				if (s.params.paginationType === "bullets" && s.bullets && s.bullets.length > 0) {
					s.bullets.removeClass(s.params.bulletActiveClass);
					if (s.paginationContainer.length > 1) s.bullets.each(function() {
						if ($(this).index() === current) $(this).addClass(s.params.bulletActiveClass);
					});
					else s.bullets.eq(current).addClass(s.params.bulletActiveClass);
				}
				if (s.params.paginationType === "fraction") {
					s.paginationContainer.find("." + s.params.paginationCurrentClass).text(current + 1);
					s.paginationContainer.find("." + s.params.paginationTotalClass).text(total);
				}
				if (s.params.paginationType === "progress") {
					var scale = (current + 1) / total, scaleX = scale, scaleY = 1;
					if (!s.isHorizontal()) {
						scaleY = scale;
						scaleX = 1;
					}
					s.paginationContainer.find("." + s.params.paginationProgressbarClass).transform("translate3d(0,0,0) scaleX(" + scaleX + ") scaleY(" + scaleY + ")").transition(s.params.speed);
				}
				if (s.params.paginationType === "custom" && s.params.paginationCustomRender) {
					s.paginationContainer.html(s.params.paginationCustomRender(s, current + 1, total));
					s.emit("onPaginationRendered", s, s.paginationContainer[0]);
				}
			}
			if (!s.params.loop) {
				if (s.params.prevButton && s.prevButton && s.prevButton.length > 0) if (s.isBeginning) {
					s.prevButton.addClass(s.params.buttonDisabledClass);
					if (s.params.a11y && s.a11y) s.a11y.disable(s.prevButton);
				} else {
					s.prevButton.removeClass(s.params.buttonDisabledClass);
					if (s.params.a11y && s.a11y) s.a11y.enable(s.prevButton);
				}
				if (s.params.nextButton && s.nextButton && s.nextButton.length > 0) if (s.isEnd) {
					s.nextButton.addClass(s.params.buttonDisabledClass);
					if (s.params.a11y && s.a11y) s.a11y.disable(s.nextButton);
				} else {
					s.nextButton.removeClass(s.params.buttonDisabledClass);
					if (s.params.a11y && s.a11y) s.a11y.enable(s.nextButton);
				}
			}
		};
		s.updatePagination = function() {
			if (!s.params.pagination) return;
			if (s.paginationContainer && s.paginationContainer.length > 0) {
				var paginationHTML = "";
				if (s.params.paginationType === "bullets") {
					var numberOfBullets = s.params.loop ? Math.ceil((s.slides.length - s.loopedSlides * 2) / s.params.slidesPerGroup) : s.snapGrid.length;
					for (var i = 0; i < numberOfBullets; i++) if (s.params.paginationBulletRender) paginationHTML += s.params.paginationBulletRender(s, i, s.params.bulletClass);
					else paginationHTML += "<" + s.params.paginationElement + " class=\"" + s.params.bulletClass + "\"></" + s.params.paginationElement + ">";
					s.paginationContainer.html(paginationHTML);
					s.bullets = s.paginationContainer.find("." + s.params.bulletClass);
					if (s.params.paginationClickable && s.params.a11y && s.a11y) s.a11y.initPagination();
				}
				if (s.params.paginationType === "fraction") {
					if (s.params.paginationFractionRender) paginationHTML = s.params.paginationFractionRender(s, s.params.paginationCurrentClass, s.params.paginationTotalClass);
					else paginationHTML = "<span class=\"" + s.params.paginationCurrentClass + "\"></span> / <span class=\"" + s.params.paginationTotalClass + "\"></span>";
					s.paginationContainer.html(paginationHTML);
				}
				if (s.params.paginationType === "progress") {
					if (s.params.paginationProgressRender) paginationHTML = s.params.paginationProgressRender(s, s.params.paginationProgressbarClass);
					else paginationHTML = "<span class=\"" + s.params.paginationProgressbarClass + "\"></span>";
					s.paginationContainer.html(paginationHTML);
				}
				if (s.params.paginationType !== "custom") s.emit("onPaginationRendered", s, s.paginationContainer[0]);
			}
		};
		s.update = function(updateTranslate) {
			if (!s) return;
			s.updateContainerSize();
			s.updateSlidesSize();
			s.updateProgress();
			s.updatePagination();
			s.updateClasses();
			if (s.params.scrollbar && s.scrollbar) s.scrollbar.set();
			var newTranslate;
			function forceSetTranslate() {
				s.rtl ? -s.translate : s.translate;
				newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
				s.setWrapperTranslate(newTranslate);
				s.updateActiveIndex();
				s.updateClasses();
			}
			if (updateTranslate) {
				var translated;
				if (s.controller && s.controller.spline) s.controller.spline = void 0;
				if (s.params.freeMode) {
					forceSetTranslate();
					if (s.params.autoHeight) s.updateAutoHeight();
				} else {
					if ((s.params.slidesPerView === "auto" || s.params.slidesPerView > 1) && s.isEnd && !s.params.centeredSlides) translated = s.slideTo(s.slides.length - 1, 0, false, true);
					else translated = s.slideTo(s.activeIndex, 0, false, true);
					if (!translated) forceSetTranslate();
				}
			} else if (s.params.autoHeight) s.updateAutoHeight();
		};
		s.onResize = function(forceUpdatePagination) {
			if (s.params.onBeforeResize) s.params.onBeforeResize(s);
			if (s.params.breakpoints) s.setBreakpoint();
			var allowSwipeToPrev = s.params.allowSwipeToPrev;
			var allowSwipeToNext = s.params.allowSwipeToNext;
			s.params.allowSwipeToPrev = s.params.allowSwipeToNext = true;
			s.updateContainerSize();
			s.updateSlidesSize();
			if (s.params.slidesPerView === "auto" || s.params.freeMode || forceUpdatePagination) s.updatePagination();
			if (s.params.scrollbar && s.scrollbar) s.scrollbar.set();
			if (s.controller && s.controller.spline) s.controller.spline = void 0;
			var slideChangedBySlideTo = false;
			if (s.params.freeMode) {
				var newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
				s.setWrapperTranslate(newTranslate);
				s.updateActiveIndex();
				s.updateClasses();
				if (s.params.autoHeight) s.updateAutoHeight();
			} else {
				s.updateClasses();
				if ((s.params.slidesPerView === "auto" || s.params.slidesPerView > 1) && s.isEnd && !s.params.centeredSlides) slideChangedBySlideTo = s.slideTo(s.slides.length - 1, 0, false, true);
				else slideChangedBySlideTo = s.slideTo(s.activeIndex, 0, false, true);
			}
			if (s.params.lazyLoading && !slideChangedBySlideTo && s.lazy) s.lazy.load();
			s.params.allowSwipeToPrev = allowSwipeToPrev;
			s.params.allowSwipeToNext = allowSwipeToNext;
			if (s.params.onAfterResize) s.params.onAfterResize(s);
		};
		s.touchEventsDesktop = {
			start: "mousedown",
			move: "mousemove",
			end: "mouseup"
		};
		if (window.navigator.pointerEnabled) s.touchEventsDesktop = {
			start: "pointerdown",
			move: "pointermove",
			end: "pointerup"
		};
		else if (window.navigator.msPointerEnabled) s.touchEventsDesktop = {
			start: "MSPointerDown",
			move: "MSPointerMove",
			end: "MSPointerUp"
		};
		s.touchEvents = {
			start: s.support.touch || !s.params.simulateTouch ? "touchstart" : s.touchEventsDesktop.start,
			move: s.support.touch || !s.params.simulateTouch ? "touchmove" : s.touchEventsDesktop.move,
			end: s.support.touch || !s.params.simulateTouch ? "touchend" : s.touchEventsDesktop.end
		};
		if (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) (s.params.touchEventsTarget === "container" ? s.container : s.wrapper).addClass("swiper-wp8-" + s.params.direction);
		s.initEvents = function(detach) {
			var actionDom = detach ? "off" : "on";
			var action = detach ? "removeEventListener" : "addEventListener";
			var touchEventsTarget = s.params.touchEventsTarget === "container" ? s.container[0] : s.wrapper[0];
			var target = s.support.touch ? touchEventsTarget : document;
			var moveCapture = s.params.nested ? true : false;
			if (s.browser.ie) {
				touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, false);
				target[action](s.touchEvents.move, s.onTouchMove, moveCapture);
				target[action](s.touchEvents.end, s.onTouchEnd, false);
			} else {
				if (s.support.touch) {
					var passiveListener = s.touchEvents.start === "touchstart" && s.support.passiveListener && s.params.passiveListeners ? {
						passive: true,
						capture: false
					} : false;
					touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, passiveListener);
					touchEventsTarget[action](s.touchEvents.move, s.onTouchMove, moveCapture);
					touchEventsTarget[action](s.touchEvents.end, s.onTouchEnd, passiveListener);
				}
				if (params.simulateTouch && !s.device.ios && !s.device.android || params.simulateTouch && !s.support.touch && s.device.ios) {
					touchEventsTarget[action]("mousedown", s.onTouchStart, false);
					document[action]("mousemove", s.onTouchMove, moveCapture);
					document[action]("mouseup", s.onTouchEnd, false);
				}
			}
			window[action]("resize", s.onResize);
			if (s.params.nextButton && s.nextButton && s.nextButton.length > 0) {
				s.nextButton[actionDom]("click", s.onClickNext);
				if (s.params.a11y && s.a11y) s.nextButton[actionDom]("keydown", s.a11y.onEnterKey);
			}
			if (s.params.prevButton && s.prevButton && s.prevButton.length > 0) {
				s.prevButton[actionDom]("click", s.onClickPrev);
				if (s.params.a11y && s.a11y) s.prevButton[actionDom]("keydown", s.a11y.onEnterKey);
			}
			if (s.params.pagination && s.params.paginationClickable) {
				s.paginationContainer[actionDom]("click", "." + s.params.bulletClass, s.onClickIndex);
				if (s.params.a11y && s.a11y) s.paginationContainer[actionDom]("keydown", "." + s.params.bulletClass, s.a11y.onEnterKey);
			}
			if (s.params.preventClicks || s.params.preventClicksPropagation) touchEventsTarget[action]("click", s.preventClicks, true);
		};
		s.attachEvents = function() {
			s.initEvents();
		};
		s.detachEvents = function() {
			s.initEvents(true);
		};
		s.allowClick = true;
		s.preventClicks = function(e) {
			if (!s.allowClick) {
				if (s.params.preventClicks) e.preventDefault();
				if (s.params.preventClicksPropagation && s.animating) {
					e.stopPropagation();
					e.stopImmediatePropagation();
				}
			}
		};
		s.onClickNext = function(e) {
			e.preventDefault();
			if (s.isEnd && !s.params.loop) return;
			s.slideNext();
		};
		s.onClickPrev = function(e) {
			e.preventDefault();
			if (s.isBeginning && !s.params.loop) return;
			s.slidePrev();
		};
		s.onClickIndex = function(e) {
			e.preventDefault();
			var index = $(this).index() * s.params.slidesPerGroup;
			if (s.params.loop) index = index + s.loopedSlides;
			s.slideTo(index);
		};
		function findElementInEvent(e, selector) {
			var el = $(e.target);
			if (!el.is(selector)) {
				if (typeof selector === "string") el = el.parents(selector);
				else if (selector.nodeType) {
					var found;
					el.parents().each(function(index, _el) {
						if (_el === selector) found = selector;
					});
					if (!found) return void 0;
					else return selector;
				}
			}
			if (el.length === 0) return;
			return el[0];
		}
		s.updateClickedSlide = function(e) {
			var slide = findElementInEvent(e, "." + s.params.slideClass);
			var slideFound = false;
			if (slide) {
				for (var i = 0; i < s.slides.length; i++) if (s.slides[i] === slide) slideFound = true;
			}
			if (slide && slideFound) {
				s.clickedSlide = slide;
				s.clickedIndex = $(slide).index();
			} else {
				s.clickedSlide = void 0;
				s.clickedIndex = void 0;
				return;
			}
			if (s.params.slideToClickedSlide && s.clickedIndex !== void 0 && s.clickedIndex !== s.activeIndex) {
				var slideToIndex = s.clickedIndex, realIndex, slidesPerView = s.params.slidesPerView === "auto" ? s.currentSlidesPerView() : s.params.slidesPerView;
				if (s.params.loop) {
					if (s.animating) return;
					realIndex = parseInt($(s.clickedSlide).attr("data-swiper-slide-index"), 10);
					if (s.params.centeredSlides) if (slideToIndex < s.loopedSlides - slidesPerView / 2 || slideToIndex > s.slides.length - s.loopedSlides + slidesPerView / 2) {
						s.fixLoop();
						slideToIndex = s.wrapper.children("." + s.params.slideClass + "[data-swiper-slide-index=\"" + realIndex + "\"]:not(." + s.params.slideDuplicateClass + ")").eq(0).index();
						setTimeout(function() {
							s.slideTo(slideToIndex);
						}, 0);
					} else s.slideTo(slideToIndex);
					else if (slideToIndex > s.slides.length - slidesPerView) {
						s.fixLoop();
						slideToIndex = s.wrapper.children("." + s.params.slideClass + "[data-swiper-slide-index=\"" + realIndex + "\"]:not(." + s.params.slideDuplicateClass + ")").eq(0).index();
						setTimeout(function() {
							s.slideTo(slideToIndex);
						}, 0);
					} else s.slideTo(slideToIndex);
				} else s.slideTo(slideToIndex);
			}
		};
		var isTouched, isMoved, allowTouchCallbacks, touchStartTime, isScrolling, currentTranslate, startTranslate, allowThresholdMove, formElements = "input, select, textarea, button, video", lastClickTime = Date.now(), clickTimeout, velocities = [], allowMomentumBounce;
		s.animating = false;
		s.touches = {
			startX: 0,
			startY: 0,
			currentX: 0,
			currentY: 0,
			diff: 0
		};
		var isTouchEvent, startMoving;
		s.onTouchStart = function(e) {
			if (e.originalEvent) e = e.originalEvent;
			isTouchEvent = e.type === "touchstart";
			if (!isTouchEvent && "which" in e && e.which === 3) return;
			if (s.params.noSwiping && findElementInEvent(e, "." + s.params.noSwipingClass)) {
				s.allowClick = true;
				return;
			}
			if (s.params.swipeHandler) {
				if (!findElementInEvent(e, s.params.swipeHandler)) return;
			}
			var startX = s.touches.currentX = e.type === "touchstart" ? e.targetTouches[0].pageX : e.pageX;
			var startY = s.touches.currentY = e.type === "touchstart" ? e.targetTouches[0].pageY : e.pageY;
			if (s.device.ios && s.params.iOSEdgeSwipeDetection && startX <= s.params.iOSEdgeSwipeThreshold) return;
			isTouched = true;
			isMoved = false;
			allowTouchCallbacks = true;
			isScrolling = void 0;
			startMoving = void 0;
			s.touches.startX = startX;
			s.touches.startY = startY;
			touchStartTime = Date.now();
			s.allowClick = true;
			s.updateContainerSize();
			s.swipeDirection = void 0;
			if (s.params.threshold > 0) allowThresholdMove = false;
			if (e.type !== "touchstart") {
				var preventDefault = true;
				if ($(e.target).is(formElements)) preventDefault = false;
				if (document.activeElement && $(document.activeElement).is(formElements)) document.activeElement.blur();
				if (preventDefault) e.preventDefault();
			}
			s.emit("onTouchStart", s, e);
		};
		s.onTouchMove = function(e) {
			if (e.originalEvent) e = e.originalEvent;
			if (isTouchEvent && e.type === "mousemove") return;
			if (e.preventedByNestedSwiper) {
				s.touches.startX = e.type === "touchmove" ? e.targetTouches[0].pageX : e.pageX;
				s.touches.startY = e.type === "touchmove" ? e.targetTouches[0].pageY : e.pageY;
				return;
			}
			if (s.params.onlyExternal) {
				s.allowClick = false;
				if (isTouched) {
					s.touches.startX = s.touches.currentX = e.type === "touchmove" ? e.targetTouches[0].pageX : e.pageX;
					s.touches.startY = s.touches.currentY = e.type === "touchmove" ? e.targetTouches[0].pageY : e.pageY;
					touchStartTime = Date.now();
				}
				return;
			}
			if (isTouchEvent && s.params.touchReleaseOnEdges && !s.params.loop) {
				if (!s.isHorizontal()) {
					if (s.touches.currentY < s.touches.startY && s.translate <= s.maxTranslate() || s.touches.currentY > s.touches.startY && s.translate >= s.minTranslate()) return;
				} else if (s.touches.currentX < s.touches.startX && s.translate <= s.maxTranslate() || s.touches.currentX > s.touches.startX && s.translate >= s.minTranslate()) return;
			}
			if (isTouchEvent && document.activeElement) {
				if (e.target === document.activeElement && $(e.target).is(formElements)) {
					isMoved = true;
					s.allowClick = false;
					return;
				}
			}
			if (allowTouchCallbacks) s.emit("onTouchMove", s, e);
			if (e.targetTouches && e.targetTouches.length > 1) return;
			s.touches.currentX = e.type === "touchmove" ? e.targetTouches[0].pageX : e.pageX;
			s.touches.currentY = e.type === "touchmove" ? e.targetTouches[0].pageY : e.pageY;
			if (typeof isScrolling === "undefined") {
				var touchAngle;
				if (s.isHorizontal() && s.touches.currentY === s.touches.startY || !s.isHorizontal() && s.touches.currentX === s.touches.startX) isScrolling = false;
				else {
					touchAngle = Math.atan2(Math.abs(s.touches.currentY - s.touches.startY), Math.abs(s.touches.currentX - s.touches.startX)) * 180 / Math.PI;
					isScrolling = s.isHorizontal() ? touchAngle > s.params.touchAngle : 90 - touchAngle > s.params.touchAngle;
				}
			}
			if (isScrolling) s.emit("onTouchMoveOpposite", s, e);
			if (typeof startMoving === "undefined") {
				if (s.touches.currentX !== s.touches.startX || s.touches.currentY !== s.touches.startY) startMoving = true;
			}
			if (!isTouched) return;
			if (isScrolling) {
				isTouched = false;
				return;
			}
			if (!startMoving) return;
			s.allowClick = false;
			s.emit("onSliderMove", s, e);
			e.preventDefault();
			if (s.params.touchMoveStopPropagation && !s.params.nested) e.stopPropagation();
			if (!isMoved) {
				if (params.loop) s.fixLoop();
				startTranslate = s.getWrapperTranslate();
				s.setWrapperTransition(0);
				if (s.animating) s.wrapper.trigger("webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd");
				if (s.params.autoplay && s.autoplaying) if (s.params.autoplayDisableOnInteraction) s.stopAutoplay();
				else s.pauseAutoplay();
				allowMomentumBounce = false;
				if (s.params.grabCursor && (s.params.allowSwipeToNext === true || s.params.allowSwipeToPrev === true)) s.setGrabCursor(true);
			}
			isMoved = true;
			var diff = s.touches.diff = s.isHorizontal() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;
			diff = diff * s.params.touchRatio;
			if (s.rtl) diff = -diff;
			s.swipeDirection = diff > 0 ? "prev" : "next";
			currentTranslate = diff + startTranslate;
			var disableParentSwiper = true;
			if (diff > 0 && currentTranslate > s.minTranslate()) {
				disableParentSwiper = false;
				if (s.params.resistance) currentTranslate = s.minTranslate() - 1 + Math.pow(-s.minTranslate() + startTranslate + diff, s.params.resistanceRatio);
			} else if (diff < 0 && currentTranslate < s.maxTranslate()) {
				disableParentSwiper = false;
				if (s.params.resistance) currentTranslate = s.maxTranslate() + 1 - Math.pow(s.maxTranslate() - startTranslate - diff, s.params.resistanceRatio);
			}
			if (disableParentSwiper) e.preventedByNestedSwiper = true;
			if (!s.params.allowSwipeToNext && s.swipeDirection === "next" && currentTranslate < startTranslate) currentTranslate = startTranslate;
			if (!s.params.allowSwipeToPrev && s.swipeDirection === "prev" && currentTranslate > startTranslate) currentTranslate = startTranslate;
			if (s.params.threshold > 0) if (Math.abs(diff) > s.params.threshold || allowThresholdMove) {
				if (!allowThresholdMove) {
					allowThresholdMove = true;
					s.touches.startX = s.touches.currentX;
					s.touches.startY = s.touches.currentY;
					currentTranslate = startTranslate;
					s.touches.diff = s.isHorizontal() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;
					return;
				}
			} else {
				currentTranslate = startTranslate;
				return;
			}
			if (!s.params.followFinger) return;
			if (s.params.freeMode || s.params.watchSlidesProgress) s.updateActiveIndex();
			if (s.params.freeMode) {
				if (velocities.length === 0) velocities.push({
					position: s.touches[s.isHorizontal() ? "startX" : "startY"],
					time: touchStartTime
				});
				velocities.push({
					position: s.touches[s.isHorizontal() ? "currentX" : "currentY"],
					time: new window.Date().getTime()
				});
			}
			s.updateProgress(currentTranslate);
			s.setWrapperTranslate(currentTranslate);
		};
		s.onTouchEnd = function(e) {
			if (e.originalEvent) e = e.originalEvent;
			if (allowTouchCallbacks) s.emit("onTouchEnd", s, e);
			allowTouchCallbacks = false;
			if (!isTouched) return;
			if (s.params.grabCursor && isMoved && isTouched && (s.params.allowSwipeToNext === true || s.params.allowSwipeToPrev === true)) s.setGrabCursor(false);
			var touchEndTime = Date.now();
			var timeDiff = touchEndTime - touchStartTime;
			if (s.allowClick) {
				s.updateClickedSlide(e);
				s.emit("onTap", s, e);
				if (timeDiff < 300 && touchEndTime - lastClickTime > 300) {
					if (clickTimeout) clearTimeout(clickTimeout);
					clickTimeout = setTimeout(function() {
						if (!s) return;
						if (s.params.paginationHide && s.paginationContainer.length > 0 && !$(e.target).hasClass(s.params.bulletClass)) s.paginationContainer.toggleClass(s.params.paginationHiddenClass);
						s.emit("onClick", s, e);
					}, 300);
				}
				if (timeDiff < 300 && touchEndTime - lastClickTime < 300) {
					if (clickTimeout) clearTimeout(clickTimeout);
					s.emit("onDoubleTap", s, e);
				}
			}
			lastClickTime = Date.now();
			setTimeout(function() {
				if (s) s.allowClick = true;
			}, 0);
			if (!isTouched || !isMoved || !s.swipeDirection || s.touches.diff === 0 || currentTranslate === startTranslate) {
				isTouched = isMoved = false;
				return;
			}
			isTouched = isMoved = false;
			var currentPos;
			if (s.params.followFinger) currentPos = s.rtl ? s.translate : -s.translate;
			else currentPos = -currentTranslate;
			if (s.params.freeMode) {
				if (currentPos < -s.minTranslate()) {
					s.slideTo(s.activeIndex);
					return;
				} else if (currentPos > -s.maxTranslate()) {
					if (s.slides.length < s.snapGrid.length) s.slideTo(s.snapGrid.length - 1);
					else s.slideTo(s.slides.length - 1);
					return;
				}
				if (s.params.freeModeMomentum) {
					if (velocities.length > 1) {
						var lastMoveEvent = velocities.pop(), velocityEvent = velocities.pop();
						var distance = lastMoveEvent.position - velocityEvent.position;
						var time = lastMoveEvent.time - velocityEvent.time;
						s.velocity = distance / time;
						s.velocity = s.velocity / 2;
						if (Math.abs(s.velocity) < s.params.freeModeMinimumVelocity) s.velocity = 0;
						if (time > 150 || new window.Date().getTime() - lastMoveEvent.time > 300) s.velocity = 0;
					} else s.velocity = 0;
					s.velocity = s.velocity * s.params.freeModeMomentumVelocityRatio;
					velocities.length = 0;
					var momentumDuration = 1e3 * s.params.freeModeMomentumRatio;
					var momentumDistance = s.velocity * momentumDuration;
					var newPosition = s.translate + momentumDistance;
					if (s.rtl) newPosition = -newPosition;
					var doBounce = false;
					var afterBouncePosition;
					var bounceAmount = Math.abs(s.velocity) * 20 * s.params.freeModeMomentumBounceRatio;
					if (newPosition < s.maxTranslate()) if (s.params.freeModeMomentumBounce) {
						if (newPosition + s.maxTranslate() < -bounceAmount) newPosition = s.maxTranslate() - bounceAmount;
						afterBouncePosition = s.maxTranslate();
						doBounce = true;
						allowMomentumBounce = true;
					} else newPosition = s.maxTranslate();
					else if (newPosition > s.minTranslate()) if (s.params.freeModeMomentumBounce) {
						if (newPosition - s.minTranslate() > bounceAmount) newPosition = s.minTranslate() + bounceAmount;
						afterBouncePosition = s.minTranslate();
						doBounce = true;
						allowMomentumBounce = true;
					} else newPosition = s.minTranslate();
					else if (s.params.freeModeSticky) {
						var j = 0, nextSlide;
						for (j = 0; j < s.snapGrid.length; j += 1) if (s.snapGrid[j] > -newPosition) {
							nextSlide = j;
							break;
						}
						if (Math.abs(s.snapGrid[nextSlide] - newPosition) < Math.abs(s.snapGrid[nextSlide - 1] - newPosition) || s.swipeDirection === "next") newPosition = s.snapGrid[nextSlide];
						else newPosition = s.snapGrid[nextSlide - 1];
						if (!s.rtl) newPosition = -newPosition;
					}
					if (s.velocity !== 0) if (s.rtl) momentumDuration = Math.abs((-newPosition - s.translate) / s.velocity);
					else momentumDuration = Math.abs((newPosition - s.translate) / s.velocity);
					else if (s.params.freeModeSticky) {
						s.slideReset();
						return;
					}
					if (s.params.freeModeMomentumBounce && doBounce) {
						s.updateProgress(afterBouncePosition);
						s.setWrapperTransition(momentumDuration);
						s.setWrapperTranslate(newPosition);
						s.onTransitionStart();
						s.animating = true;
						s.wrapper.transitionEnd(function() {
							if (!s || !allowMomentumBounce) return;
							s.emit("onMomentumBounce", s);
							s.setWrapperTransition(s.params.speed);
							s.setWrapperTranslate(afterBouncePosition);
							s.wrapper.transitionEnd(function() {
								if (!s) return;
								s.onTransitionEnd();
							});
						});
					} else if (s.velocity) {
						s.updateProgress(newPosition);
						s.setWrapperTransition(momentumDuration);
						s.setWrapperTranslate(newPosition);
						s.onTransitionStart();
						if (!s.animating) {
							s.animating = true;
							s.wrapper.transitionEnd(function() {
								if (!s) return;
								s.onTransitionEnd();
							});
						}
					} else s.updateProgress(newPosition);
					s.updateActiveIndex();
				}
				if (!s.params.freeModeMomentum || timeDiff >= s.params.longSwipesMs) {
					s.updateProgress();
					s.updateActiveIndex();
				}
				return;
			}
			var i, stopIndex = 0, groupSize = s.slidesSizesGrid[0];
			for (i = 0; i < s.slidesGrid.length; i += s.params.slidesPerGroup) if (typeof s.slidesGrid[i + s.params.slidesPerGroup] !== "undefined") {
				if (currentPos >= s.slidesGrid[i] && currentPos < s.slidesGrid[i + s.params.slidesPerGroup]) {
					stopIndex = i;
					groupSize = s.slidesGrid[i + s.params.slidesPerGroup] - s.slidesGrid[i];
				}
			} else if (currentPos >= s.slidesGrid[i]) {
				stopIndex = i;
				groupSize = s.slidesGrid[s.slidesGrid.length - 1] - s.slidesGrid[s.slidesGrid.length - 2];
			}
			var ratio = (currentPos - s.slidesGrid[stopIndex]) / groupSize;
			if (timeDiff > s.params.longSwipesMs) {
				if (!s.params.longSwipes) {
					s.slideTo(s.activeIndex);
					return;
				}
				if (s.swipeDirection === "next") if (ratio >= s.params.longSwipesRatio) s.slideTo(stopIndex + s.params.slidesPerGroup);
				else s.slideTo(stopIndex);
				if (s.swipeDirection === "prev") if (ratio > 1 - s.params.longSwipesRatio) s.slideTo(stopIndex + s.params.slidesPerGroup);
				else s.slideTo(stopIndex);
			} else {
				if (!s.params.shortSwipes) {
					s.slideTo(s.activeIndex);
					return;
				}
				if (s.swipeDirection === "next") s.slideTo(stopIndex + s.params.slidesPerGroup);
				if (s.swipeDirection === "prev") s.slideTo(stopIndex);
			}
		};
		s._slideTo = function(slideIndex, speed) {
			return s.slideTo(slideIndex, speed, true, true);
		};
		s.slideTo = function(slideIndex, speed, runCallbacks, internal) {
			if (typeof runCallbacks === "undefined") runCallbacks = true;
			if (typeof slideIndex === "undefined") slideIndex = 0;
			if (slideIndex < 0) slideIndex = 0;
			s.snapIndex = Math.floor(slideIndex / s.params.slidesPerGroup);
			if (s.snapIndex >= s.snapGrid.length) s.snapIndex = s.snapGrid.length - 1;
			var translate = -s.snapGrid[s.snapIndex];
			if (s.params.autoplay && s.autoplaying) if (internal || !s.params.autoplayDisableOnInteraction) s.pauseAutoplay(speed);
			else s.stopAutoplay();
			s.updateProgress(translate);
			if (s.params.normalizeSlideIndex) {
				for (var i = 0; i < s.slidesGrid.length; i++) if (-Math.floor(translate * 100) >= Math.floor(s.slidesGrid[i] * 100)) slideIndex = i;
			}
			if (!s.params.allowSwipeToNext && translate < s.translate && translate < s.minTranslate()) return false;
			if (!s.params.allowSwipeToPrev && translate > s.translate && translate > s.maxTranslate()) {
				if ((s.activeIndex || 0) !== slideIndex) return false;
			}
			if (typeof speed === "undefined") speed = s.params.speed;
			s.previousIndex = s.activeIndex || 0;
			s.activeIndex = slideIndex;
			s.updateRealIndex();
			if (s.rtl && -translate === s.translate || !s.rtl && translate === s.translate) {
				if (s.params.autoHeight) s.updateAutoHeight();
				s.updateClasses();
				if (s.params.effect !== "slide") s.setWrapperTranslate(translate);
				return false;
			}
			s.updateClasses();
			s.onTransitionStart(runCallbacks);
			if (speed === 0 || s.browser.lteIE9) {
				s.setWrapperTranslate(translate);
				s.setWrapperTransition(0);
				s.onTransitionEnd(runCallbacks);
			} else {
				s.setWrapperTranslate(translate);
				s.setWrapperTransition(speed);
				if (!s.animating) {
					s.animating = true;
					s.wrapper.transitionEnd(function() {
						if (!s) return;
						s.onTransitionEnd(runCallbacks);
					});
				}
			}
			return true;
		};
		s.onTransitionStart = function(runCallbacks) {
			if (typeof runCallbacks === "undefined") runCallbacks = true;
			if (s.params.autoHeight) s.updateAutoHeight();
			if (s.lazy) s.lazy.onTransitionStart();
			if (runCallbacks) {
				s.emit("onTransitionStart", s);
				if (s.activeIndex !== s.previousIndex) {
					s.emit("onSlideChangeStart", s);
					if (s.activeIndex > s.previousIndex) s.emit("onSlideNextStart", s);
					else s.emit("onSlidePrevStart", s);
				}
			}
		};
		s.onTransitionEnd = function(runCallbacks) {
			s.animating = false;
			s.setWrapperTransition(0);
			if (typeof runCallbacks === "undefined") runCallbacks = true;
			if (s.lazy) s.lazy.onTransitionEnd();
			if (runCallbacks) {
				s.emit("onTransitionEnd", s);
				if (s.activeIndex !== s.previousIndex) {
					s.emit("onSlideChangeEnd", s);
					if (s.activeIndex > s.previousIndex) s.emit("onSlideNextEnd", s);
					else s.emit("onSlidePrevEnd", s);
				}
			}
			if (s.params.history && s.history) s.history.setHistory(s.params.history, s.activeIndex);
			if (s.params.hashnav && s.hashnav) s.hashnav.setHash();
		};
		s.slideNext = function(runCallbacks, speed, internal) {
			if (s.params.loop) {
				if (s.animating) return false;
				s.fixLoop();
				s.container[0].clientLeft;
				return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
			} else return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
		};
		s._slideNext = function(speed) {
			return s.slideNext(true, speed, true);
		};
		s.slidePrev = function(runCallbacks, speed, internal) {
			if (s.params.loop) {
				if (s.animating) return false;
				s.fixLoop();
				s.container[0].clientLeft;
				return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
			} else return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
		};
		s._slidePrev = function(speed) {
			return s.slidePrev(true, speed, true);
		};
		s.slideReset = function(runCallbacks, speed, internal) {
			return s.slideTo(s.activeIndex, speed, runCallbacks);
		};
		s.disableTouchControl = function() {
			s.params.onlyExternal = true;
			return true;
		};
		s.enableTouchControl = function() {
			s.params.onlyExternal = false;
			return true;
		};
		s.setWrapperTransition = function(duration, byController) {
			s.wrapper.transition(duration);
			if (s.params.effect !== "slide" && s.effects[s.params.effect]) s.effects[s.params.effect].setTransition(duration);
			if (s.params.parallax && s.parallax) s.parallax.setTransition(duration);
			if (s.params.scrollbar && s.scrollbar) s.scrollbar.setTransition(duration);
			if (s.params.control && s.controller) s.controller.setTransition(duration, byController);
			s.emit("onSetTransition", s, duration);
		};
		s.setWrapperTranslate = function(translate, updateActiveIndex, byController) {
			var x = 0, y = 0, z = 0;
			if (s.isHorizontal()) x = s.rtl ? -translate : translate;
			else y = translate;
			if (s.params.roundLengths) {
				x = round(x);
				y = round(y);
			}
			if (!s.params.virtualTranslate) if (s.support.transforms3d) s.wrapper.transform("translate3d(" + x + "px, " + y + "px, " + z + "px)");
			else s.wrapper.transform("translate(" + x + "px, " + y + "px)");
			s.translate = s.isHorizontal() ? x : y;
			var progress;
			var translatesDiff = s.maxTranslate() - s.minTranslate();
			if (translatesDiff === 0) progress = 0;
			else progress = (translate - s.minTranslate()) / translatesDiff;
			if (progress !== s.progress) s.updateProgress(translate);
			if (updateActiveIndex) s.updateActiveIndex();
			if (s.params.effect !== "slide" && s.effects[s.params.effect]) s.effects[s.params.effect].setTranslate(s.translate);
			if (s.params.parallax && s.parallax) s.parallax.setTranslate(s.translate);
			if (s.params.scrollbar && s.scrollbar) s.scrollbar.setTranslate(s.translate);
			if (s.params.control && s.controller) s.controller.setTranslate(s.translate, byController);
			s.emit("onSetTranslate", s, s.translate);
		};
		s.getTranslate = function(el, axis) {
			var matrix, curTransform, curStyle, transformMatrix;
			if (typeof axis === "undefined") axis = "x";
			if (s.params.virtualTranslate) return s.rtl ? -s.translate : s.translate;
			curStyle = window.getComputedStyle(el, null);
			if (window.WebKitCSSMatrix) {
				curTransform = curStyle.transform || curStyle.webkitTransform;
				if (curTransform.split(",").length > 6) curTransform = curTransform.split(", ").map(function(a) {
					return a.replace(",", ".");
				}).join(", ");
				transformMatrix = new window.WebKitCSSMatrix(curTransform === "none" ? "" : curTransform);
			} else {
				transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
				matrix = transformMatrix.toString().split(",");
			}
			if (axis === "x") if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41;
			else if (matrix.length === 16) curTransform = parseFloat(matrix[12]);
			else curTransform = parseFloat(matrix[4]);
			if (axis === "y") if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42;
			else if (matrix.length === 16) curTransform = parseFloat(matrix[13]);
			else curTransform = parseFloat(matrix[5]);
			if (s.rtl && curTransform) curTransform = -curTransform;
			return curTransform || 0;
		};
		s.getWrapperTranslate = function(axis) {
			if (typeof axis === "undefined") axis = s.isHorizontal() ? "x" : "y";
			return s.getTranslate(s.wrapper[0], axis);
		};
		s.observers = [];
		function initObserver(target, options) {
			options = options || {};
			var observer = new (window.MutationObserver || window.WebkitMutationObserver)(function(mutations) {
				mutations.forEach(function(mutation) {
					s.onResize(true);
					s.emit("onObserverUpdate", s, mutation);
				});
			});
			observer.observe(target, {
				attributes: typeof options.attributes === "undefined" ? true : options.attributes,
				childList: typeof options.childList === "undefined" ? true : options.childList,
				characterData: typeof options.characterData === "undefined" ? true : options.characterData
			});
			s.observers.push(observer);
		}
		s.initObservers = function() {
			if (s.params.observeParents) {
				var containerParents = s.container.parents();
				for (var i = 0; i < containerParents.length; i++) initObserver(containerParents[i]);
			}
			initObserver(s.container[0], { childList: false });
			initObserver(s.wrapper[0], { attributes: false });
		};
		s.disconnectObservers = function() {
			for (var i = 0; i < s.observers.length; i++) s.observers[i].disconnect();
			s.observers = [];
		};
		s.createLoop = function() {
			s.wrapper.children("." + s.params.slideClass + "." + s.params.slideDuplicateClass).remove();
			var slides = s.wrapper.children("." + s.params.slideClass);
			if (s.params.slidesPerView === "auto" && !s.params.loopedSlides) s.params.loopedSlides = slides.length;
			s.loopedSlides = parseInt(s.params.loopedSlides || s.params.slidesPerView, 10);
			s.loopedSlides = s.loopedSlides + s.params.loopAdditionalSlides;
			if (s.loopedSlides > slides.length) s.loopedSlides = slides.length;
			var prependSlides = [], appendSlides = [], i;
			slides.each(function(index, el) {
				var slide = $(this);
				if (index < s.loopedSlides) appendSlides.push(el);
				if (index < slides.length && index >= slides.length - s.loopedSlides) prependSlides.push(el);
				slide.attr("data-swiper-slide-index", index);
			});
			for (i = 0; i < appendSlides.length; i++) s.wrapper.append($(appendSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
			for (i = prependSlides.length - 1; i >= 0; i--) s.wrapper.prepend($(prependSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
		};
		s.destroyLoop = function() {
			s.wrapper.children("." + s.params.slideClass + "." + s.params.slideDuplicateClass).remove();
			s.slides.removeAttr("data-swiper-slide-index");
		};
		s.reLoop = function(updatePosition) {
			var oldIndex = s.activeIndex - s.loopedSlides;
			s.destroyLoop();
			s.createLoop();
			s.updateSlidesSize();
			if (updatePosition) s.slideTo(oldIndex + s.loopedSlides, 0, false);
		};
		s.fixLoop = function() {
			var newIndex;
			if (s.activeIndex < s.loopedSlides) {
				newIndex = s.slides.length - s.loopedSlides * 3 + s.activeIndex;
				newIndex = newIndex + s.loopedSlides;
				s.slideTo(newIndex, 0, false, true);
			} else if (s.params.slidesPerView === "auto" && s.activeIndex >= s.loopedSlides * 2 || s.activeIndex > s.slides.length - s.params.slidesPerView * 2) {
				newIndex = -s.slides.length + s.activeIndex + s.loopedSlides;
				newIndex = newIndex + s.loopedSlides;
				s.slideTo(newIndex, 0, false, true);
			}
		};
		s.appendSlide = function(slides) {
			if (s.params.loop) s.destroyLoop();
			if (typeof slides === "object" && slides.length) {
				for (var i = 0; i < slides.length; i++) if (slides[i]) s.wrapper.append(slides[i]);
			} else s.wrapper.append(slides);
			if (s.params.loop) s.createLoop();
			if (!(s.params.observer && s.support.observer)) s.update(true);
		};
		s.prependSlide = function(slides) {
			if (s.params.loop) s.destroyLoop();
			var newActiveIndex = s.activeIndex + 1;
			if (typeof slides === "object" && slides.length) {
				for (var i = 0; i < slides.length; i++) if (slides[i]) s.wrapper.prepend(slides[i]);
				newActiveIndex = s.activeIndex + slides.length;
			} else s.wrapper.prepend(slides);
			if (s.params.loop) s.createLoop();
			if (!(s.params.observer && s.support.observer)) s.update(true);
			s.slideTo(newActiveIndex, 0, false);
		};
		s.removeSlide = function(slidesIndexes) {
			if (s.params.loop) {
				s.destroyLoop();
				s.slides = s.wrapper.children("." + s.params.slideClass);
			}
			var newActiveIndex = s.activeIndex, indexToRemove;
			if (typeof slidesIndexes === "object" && slidesIndexes.length) {
				for (var i = 0; i < slidesIndexes.length; i++) {
					indexToRemove = slidesIndexes[i];
					if (s.slides[indexToRemove]) s.slides.eq(indexToRemove).remove();
					if (indexToRemove < newActiveIndex) newActiveIndex--;
				}
				newActiveIndex = Math.max(newActiveIndex, 0);
			} else {
				indexToRemove = slidesIndexes;
				if (s.slides[indexToRemove]) s.slides.eq(indexToRemove).remove();
				if (indexToRemove < newActiveIndex) newActiveIndex--;
				newActiveIndex = Math.max(newActiveIndex, 0);
			}
			if (s.params.loop) s.createLoop();
			if (!(s.params.observer && s.support.observer)) s.update(true);
			if (s.params.loop) s.slideTo(newActiveIndex + s.loopedSlides, 0, false);
			else s.slideTo(newActiveIndex, 0, false);
		};
		s.removeAllSlides = function() {
			var slidesIndexes = [];
			for (var i = 0; i < s.slides.length; i++) slidesIndexes.push(i);
			s.removeSlide(slidesIndexes);
		};
		s.effects = {
			fade: {
				setTranslate: function() {
					for (var i = 0; i < s.slides.length; i++) {
						var slide = s.slides.eq(i);
						var tx = -slide[0].swiperSlideOffset;
						if (!s.params.virtualTranslate) tx = tx - s.translate;
						var ty = 0;
						if (!s.isHorizontal()) {
							ty = tx;
							tx = 0;
						}
						var slideOpacity = s.params.fade.crossFade ? Math.max(1 - Math.abs(slide[0].progress), 0) : 1 + Math.min(Math.max(slide[0].progress, -1), 0);
						slide.css({ opacity: slideOpacity }).transform("translate3d(" + tx + "px, " + ty + "px, 0px)");
					}
				},
				setTransition: function(duration) {
					s.slides.transition(duration);
					if (s.params.virtualTranslate && duration !== 0) {
						var eventTriggered = false;
						s.slides.transitionEnd(function() {
							if (eventTriggered) return;
							if (!s) return;
							eventTriggered = true;
							s.animating = false;
							var triggerEvents = [
								"webkitTransitionEnd",
								"transitionend",
								"oTransitionEnd",
								"MSTransitionEnd",
								"msTransitionEnd"
							];
							for (var i = 0; i < triggerEvents.length; i++) s.wrapper.trigger(triggerEvents[i]);
						});
					}
				}
			},
			flip: {
				setTranslate: function() {
					for (var i = 0; i < s.slides.length; i++) {
						var slide = s.slides.eq(i);
						var progress = slide[0].progress;
						if (s.params.flip.limitRotation) progress = Math.max(Math.min(slide[0].progress, 1), -1);
						var offset = slide[0].swiperSlideOffset;
						var rotateY = -180 * progress, rotateX = 0, tx = -offset, ty = 0;
						if (!s.isHorizontal()) {
							ty = tx;
							tx = 0;
							rotateX = -rotateY;
							rotateY = 0;
						} else if (s.rtl) rotateY = -rotateY;
						slide[0].style.zIndex = -Math.abs(Math.round(progress)) + s.slides.length;
						if (s.params.flip.slideShadows) {
							var shadowBefore = s.isHorizontal() ? slide.find(".swiper-slide-shadow-left") : slide.find(".swiper-slide-shadow-top");
							var shadowAfter = s.isHorizontal() ? slide.find(".swiper-slide-shadow-right") : slide.find(".swiper-slide-shadow-bottom");
							if (shadowBefore.length === 0) {
								shadowBefore = $("<div class=\"swiper-slide-shadow-" + (s.isHorizontal() ? "left" : "top") + "\"></div>");
								slide.append(shadowBefore);
							}
							if (shadowAfter.length === 0) {
								shadowAfter = $("<div class=\"swiper-slide-shadow-" + (s.isHorizontal() ? "right" : "bottom") + "\"></div>");
								slide.append(shadowAfter);
							}
							if (shadowBefore.length) shadowBefore[0].style.opacity = Math.max(-progress, 0);
							if (shadowAfter.length) shadowAfter[0].style.opacity = Math.max(progress, 0);
						}
						slide.transform("translate3d(" + tx + "px, " + ty + "px, 0px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)");
					}
				},
				setTransition: function(duration) {
					s.slides.transition(duration).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(duration);
					if (s.params.virtualTranslate && duration !== 0) {
						var eventTriggered = false;
						s.slides.eq(s.activeIndex).transitionEnd(function() {
							if (eventTriggered) return;
							if (!s) return;
							if (!$(this).hasClass(s.params.slideActiveClass)) return;
							eventTriggered = true;
							s.animating = false;
							var triggerEvents = [
								"webkitTransitionEnd",
								"transitionend",
								"oTransitionEnd",
								"MSTransitionEnd",
								"msTransitionEnd"
							];
							for (var i = 0; i < triggerEvents.length; i++) s.wrapper.trigger(triggerEvents[i]);
						});
					}
				}
			},
			cube: {
				setTranslate: function() {
					var wrapperRotate = 0, cubeShadow;
					if (s.params.cube.shadow) if (s.isHorizontal()) {
						cubeShadow = s.wrapper.find(".swiper-cube-shadow");
						if (cubeShadow.length === 0) {
							cubeShadow = $("<div class=\"swiper-cube-shadow\"></div>");
							s.wrapper.append(cubeShadow);
						}
						cubeShadow.css({ height: s.width + "px" });
					} else {
						cubeShadow = s.container.find(".swiper-cube-shadow");
						if (cubeShadow.length === 0) {
							cubeShadow = $("<div class=\"swiper-cube-shadow\"></div>");
							s.container.append(cubeShadow);
						}
					}
					for (var i = 0; i < s.slides.length; i++) {
						var slide = s.slides.eq(i);
						var slideAngle = i * 90;
						var round = Math.floor(slideAngle / 360);
						if (s.rtl) {
							slideAngle = -slideAngle;
							round = Math.floor(-slideAngle / 360);
						}
						var progress = Math.max(Math.min(slide[0].progress, 1), -1);
						var tx = 0, ty = 0, tz = 0;
						if (i % 4 === 0) {
							tx = -round * 4 * s.size;
							tz = 0;
						} else if ((i - 1) % 4 === 0) {
							tx = 0;
							tz = -round * 4 * s.size;
						} else if ((i - 2) % 4 === 0) {
							tx = s.size + round * 4 * s.size;
							tz = s.size;
						} else if ((i - 3) % 4 === 0) {
							tx = -s.size;
							tz = 3 * s.size + s.size * 4 * round;
						}
						if (s.rtl) tx = -tx;
						if (!s.isHorizontal()) {
							ty = tx;
							tx = 0;
						}
						var transform = "rotateX(" + (s.isHorizontal() ? 0 : -slideAngle) + "deg) rotateY(" + (s.isHorizontal() ? slideAngle : 0) + "deg) translate3d(" + tx + "px, " + ty + "px, " + tz + "px)";
						if (progress <= 1 && progress > -1) {
							wrapperRotate = i * 90 + progress * 90;
							if (s.rtl) wrapperRotate = -i * 90 - progress * 90;
						}
						slide.transform(transform);
						if (s.params.cube.slideShadows) {
							var shadowBefore = s.isHorizontal() ? slide.find(".swiper-slide-shadow-left") : slide.find(".swiper-slide-shadow-top");
							var shadowAfter = s.isHorizontal() ? slide.find(".swiper-slide-shadow-right") : slide.find(".swiper-slide-shadow-bottom");
							if (shadowBefore.length === 0) {
								shadowBefore = $("<div class=\"swiper-slide-shadow-" + (s.isHorizontal() ? "left" : "top") + "\"></div>");
								slide.append(shadowBefore);
							}
							if (shadowAfter.length === 0) {
								shadowAfter = $("<div class=\"swiper-slide-shadow-" + (s.isHorizontal() ? "right" : "bottom") + "\"></div>");
								slide.append(shadowAfter);
							}
							if (shadowBefore.length) shadowBefore[0].style.opacity = Math.max(-progress, 0);
							if (shadowAfter.length) shadowAfter[0].style.opacity = Math.max(progress, 0);
						}
					}
					s.wrapper.css({
						"-webkit-transform-origin": "50% 50% -" + s.size / 2 + "px",
						"-moz-transform-origin": "50% 50% -" + s.size / 2 + "px",
						"-ms-transform-origin": "50% 50% -" + s.size / 2 + "px",
						"transform-origin": "50% 50% -" + s.size / 2 + "px"
					});
					if (s.params.cube.shadow) if (s.isHorizontal()) cubeShadow.transform("translate3d(0px, " + (s.width / 2 + s.params.cube.shadowOffset) + "px, " + -s.width / 2 + "px) rotateX(90deg) rotateZ(0deg) scale(" + s.params.cube.shadowScale + ")");
					else {
						var shadowAngle = Math.abs(wrapperRotate) - Math.floor(Math.abs(wrapperRotate) / 90) * 90;
						var multiplier = 1.5 - (Math.sin(shadowAngle * 2 * Math.PI / 360) / 2 + Math.cos(shadowAngle * 2 * Math.PI / 360) / 2);
						var scale1 = s.params.cube.shadowScale, scale2 = s.params.cube.shadowScale / multiplier, offset = s.params.cube.shadowOffset;
						cubeShadow.transform("scale3d(" + scale1 + ", 1, " + scale2 + ") translate3d(0px, " + (s.height / 2 + offset) + "px, " + -s.height / 2 / scale2 + "px) rotateX(-90deg)");
					}
					var zFactor = s.isSafari || s.isUiWebView ? -s.size / 2 : 0;
					s.wrapper.transform("translate3d(0px,0," + zFactor + "px) rotateX(" + (s.isHorizontal() ? 0 : wrapperRotate) + "deg) rotateY(" + (s.isHorizontal() ? -wrapperRotate : 0) + "deg)");
				},
				setTransition: function(duration) {
					s.slides.transition(duration).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(duration);
					if (s.params.cube.shadow && !s.isHorizontal()) s.container.find(".swiper-cube-shadow").transition(duration);
				}
			},
			coverflow: {
				setTranslate: function() {
					var transform = s.translate;
					var center = s.isHorizontal() ? -transform + s.width / 2 : -transform + s.height / 2;
					var rotate = s.isHorizontal() ? s.params.coverflow.rotate : -s.params.coverflow.rotate;
					var translate = s.params.coverflow.depth;
					for (var i = 0, length = s.slides.length; i < length; i++) {
						var slide = s.slides.eq(i);
						var slideSize = s.slidesSizesGrid[i];
						var offsetMultiplier = (center - slide[0].swiperSlideOffset - slideSize / 2) / slideSize * s.params.coverflow.modifier;
						var rotateY = s.isHorizontal() ? rotate * offsetMultiplier : 0;
						var rotateX = s.isHorizontal() ? 0 : rotate * offsetMultiplier;
						var translateZ = -translate * Math.abs(offsetMultiplier);
						var translateY = s.isHorizontal() ? 0 : s.params.coverflow.stretch * offsetMultiplier;
						var translateX = s.isHorizontal() ? s.params.coverflow.stretch * offsetMultiplier : 0;
						if (Math.abs(translateX) < .001) translateX = 0;
						if (Math.abs(translateY) < .001) translateY = 0;
						if (Math.abs(translateZ) < .001) translateZ = 0;
						if (Math.abs(rotateY) < .001) rotateY = 0;
						if (Math.abs(rotateX) < .001) rotateX = 0;
						var slideTransform = "translate3d(" + translateX + "px," + translateY + "px," + translateZ + "px)  rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
						slide.transform(slideTransform);
						slide[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
						if (s.params.coverflow.slideShadows) {
							var shadowBefore = s.isHorizontal() ? slide.find(".swiper-slide-shadow-left") : slide.find(".swiper-slide-shadow-top");
							var shadowAfter = s.isHorizontal() ? slide.find(".swiper-slide-shadow-right") : slide.find(".swiper-slide-shadow-bottom");
							if (shadowBefore.length === 0) {
								shadowBefore = $("<div class=\"swiper-slide-shadow-" + (s.isHorizontal() ? "left" : "top") + "\"></div>");
								slide.append(shadowBefore);
							}
							if (shadowAfter.length === 0) {
								shadowAfter = $("<div class=\"swiper-slide-shadow-" + (s.isHorizontal() ? "right" : "bottom") + "\"></div>");
								slide.append(shadowAfter);
							}
							if (shadowBefore.length) shadowBefore[0].style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0;
							if (shadowAfter.length) shadowAfter[0].style.opacity = -offsetMultiplier > 0 ? -offsetMultiplier : 0;
						}
					}
					if (s.browser.ie) {
						var ws = s.wrapper[0].style;
						ws.perspectiveOrigin = center + "px 50%";
					}
				},
				setTransition: function(duration) {
					s.slides.transition(duration).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(duration);
				}
			}
		};
		s.lazy = {
			initialImageLoaded: false,
			loadImageInSlide: function(index, loadInDuplicate) {
				if (typeof index === "undefined") return;
				if (typeof loadInDuplicate === "undefined") loadInDuplicate = true;
				if (s.slides.length === 0) return;
				var slide = s.slides.eq(index);
				var img = slide.find("." + s.params.lazyLoadingClass + ":not(." + s.params.lazyStatusLoadedClass + "):not(." + s.params.lazyStatusLoadingClass + ")");
				if (slide.hasClass(s.params.lazyLoadingClass) && !slide.hasClass(s.params.lazyStatusLoadedClass) && !slide.hasClass(s.params.lazyStatusLoadingClass)) img = img.add(slide[0]);
				if (img.length === 0) return;
				img.each(function() {
					var _img = $(this);
					_img.addClass(s.params.lazyStatusLoadingClass);
					var background = _img.attr("data-background");
					var src = _img.attr("data-src"), srcset = _img.attr("data-srcset"), sizes = _img.attr("data-sizes");
					s.loadImage(_img[0], src || background, srcset, sizes, false, function() {
						if (typeof s === "undefined" || s === null || !s) return;
						if (background) {
							_img.css("background-image", "url(\"" + background + "\")");
							_img.removeAttr("data-background");
						} else {
							if (srcset) {
								_img.attr("srcset", srcset);
								_img.removeAttr("data-srcset");
							}
							if (sizes) {
								_img.attr("sizes", sizes);
								_img.removeAttr("data-sizes");
							}
							if (src) {
								_img.attr("src", src);
								_img.removeAttr("data-src");
							}
						}
						_img.addClass(s.params.lazyStatusLoadedClass).removeClass(s.params.lazyStatusLoadingClass);
						slide.find("." + s.params.lazyPreloaderClass + ", ." + s.params.preloaderClass).remove();
						if (s.params.loop && loadInDuplicate) {
							var slideOriginalIndex = slide.attr("data-swiper-slide-index");
							if (slide.hasClass(s.params.slideDuplicateClass)) {
								var originalSlide = s.wrapper.children("[data-swiper-slide-index=\"" + slideOriginalIndex + "\"]:not(." + s.params.slideDuplicateClass + ")");
								s.lazy.loadImageInSlide(originalSlide.index(), false);
							} else {
								var duplicatedSlide = s.wrapper.children("." + s.params.slideDuplicateClass + "[data-swiper-slide-index=\"" + slideOriginalIndex + "\"]");
								s.lazy.loadImageInSlide(duplicatedSlide.index(), false);
							}
						}
						s.emit("onLazyImageReady", s, slide[0], _img[0]);
					});
					s.emit("onLazyImageLoad", s, slide[0], _img[0]);
				});
			},
			load: function() {
				var i;
				var slidesPerView = s.params.slidesPerView;
				if (slidesPerView === "auto") slidesPerView = 0;
				if (!s.lazy.initialImageLoaded) s.lazy.initialImageLoaded = true;
				if (s.params.watchSlidesVisibility) s.wrapper.children("." + s.params.slideVisibleClass).each(function() {
					s.lazy.loadImageInSlide($(this).index());
				});
				else if (slidesPerView > 1) {
					for (i = s.activeIndex; i < s.activeIndex + slidesPerView; i++) if (s.slides[i]) s.lazy.loadImageInSlide(i);
				} else s.lazy.loadImageInSlide(s.activeIndex);
				if (s.params.lazyLoadingInPrevNext) if (slidesPerView > 1 || s.params.lazyLoadingInPrevNextAmount && s.params.lazyLoadingInPrevNextAmount > 1) {
					var amount = s.params.lazyLoadingInPrevNextAmount;
					var spv = slidesPerView;
					var maxIndex = Math.min(s.activeIndex + spv + Math.max(amount, spv), s.slides.length);
					var minIndex = Math.max(s.activeIndex - Math.max(spv, amount), 0);
					for (i = s.activeIndex + slidesPerView; i < maxIndex; i++) if (s.slides[i]) s.lazy.loadImageInSlide(i);
					for (i = minIndex; i < s.activeIndex; i++) if (s.slides[i]) s.lazy.loadImageInSlide(i);
				} else {
					var nextSlide = s.wrapper.children("." + s.params.slideNextClass);
					if (nextSlide.length > 0) s.lazy.loadImageInSlide(nextSlide.index());
					var prevSlide = s.wrapper.children("." + s.params.slidePrevClass);
					if (prevSlide.length > 0) s.lazy.loadImageInSlide(prevSlide.index());
				}
			},
			onTransitionStart: function() {
				if (s.params.lazyLoading) {
					if (s.params.lazyLoadingOnTransitionStart || !s.params.lazyLoadingOnTransitionStart && !s.lazy.initialImageLoaded) s.lazy.load();
				}
			},
			onTransitionEnd: function() {
				if (s.params.lazyLoading && !s.params.lazyLoadingOnTransitionStart) s.lazy.load();
			}
		};
		s.scrollbar = {
			isTouched: false,
			setDragPosition: function(e) {
				var sb = s.scrollbar;
				var position = (s.isHorizontal() ? e.type === "touchstart" || e.type === "touchmove" ? e.targetTouches[0].pageX : e.pageX || e.clientX : e.type === "touchstart" || e.type === "touchmove" ? e.targetTouches[0].pageY : e.pageY || e.clientY) - sb.track.offset()[s.isHorizontal() ? "left" : "top"] - sb.dragSize / 2;
				var positionMin = -s.minTranslate() * sb.moveDivider;
				var positionMax = -s.maxTranslate() * sb.moveDivider;
				if (position < positionMin) position = positionMin;
				else if (position > positionMax) position = positionMax;
				position = -position / sb.moveDivider;
				s.updateProgress(position);
				s.setWrapperTranslate(position, true);
			},
			dragStart: function(e) {
				var sb = s.scrollbar;
				sb.isTouched = true;
				e.preventDefault();
				e.stopPropagation();
				sb.setDragPosition(e);
				clearTimeout(sb.dragTimeout);
				sb.track.transition(0);
				if (s.params.scrollbarHide) sb.track.css("opacity", 1);
				s.wrapper.transition(100);
				sb.drag.transition(100);
				s.emit("onScrollbarDragStart", s);
			},
			dragMove: function(e) {
				var sb = s.scrollbar;
				if (!sb.isTouched) return;
				if (e.preventDefault) e.preventDefault();
				else e.returnValue = false;
				sb.setDragPosition(e);
				s.wrapper.transition(0);
				sb.track.transition(0);
				sb.drag.transition(0);
				s.emit("onScrollbarDragMove", s);
			},
			dragEnd: function(e) {
				var sb = s.scrollbar;
				if (!sb.isTouched) return;
				sb.isTouched = false;
				if (s.params.scrollbarHide) {
					clearTimeout(sb.dragTimeout);
					sb.dragTimeout = setTimeout(function() {
						sb.track.css("opacity", 0);
						sb.track.transition(400);
					}, 1e3);
				}
				s.emit("onScrollbarDragEnd", s);
				if (s.params.scrollbarSnapOnRelease) s.slideReset();
			},
			draggableEvents: (function() {
				if (s.params.simulateTouch === false && !s.support.touch) return s.touchEventsDesktop;
				else return s.touchEvents;
			})(),
			enableDraggable: function() {
				var sb = s.scrollbar;
				var target = s.support.touch ? sb.track : document;
				$(sb.track).on(sb.draggableEvents.start, sb.dragStart);
				$(target).on(sb.draggableEvents.move, sb.dragMove);
				$(target).on(sb.draggableEvents.end, sb.dragEnd);
			},
			disableDraggable: function() {
				var sb = s.scrollbar;
				var target = s.support.touch ? sb.track : document;
				$(sb.track).off(sb.draggableEvents.start, sb.dragStart);
				$(target).off(sb.draggableEvents.move, sb.dragMove);
				$(target).off(sb.draggableEvents.end, sb.dragEnd);
			},
			set: function() {
				if (!s.params.scrollbar) return;
				var sb = s.scrollbar;
				sb.track = $(s.params.scrollbar);
				if (s.params.uniqueNavElements && typeof s.params.scrollbar === "string" && sb.track.length > 1 && s.container.find(s.params.scrollbar).length === 1) sb.track = s.container.find(s.params.scrollbar);
				sb.drag = sb.track.find(".swiper-scrollbar-drag");
				if (sb.drag.length === 0) {
					sb.drag = $("<div class=\"swiper-scrollbar-drag\"></div>");
					sb.track.append(sb.drag);
				}
				sb.drag[0].style.width = "";
				sb.drag[0].style.height = "";
				sb.trackSize = s.isHorizontal() ? sb.track[0].offsetWidth : sb.track[0].offsetHeight;
				sb.divider = s.size / s.virtualSize;
				sb.moveDivider = sb.divider * (sb.trackSize / s.size);
				sb.dragSize = sb.trackSize * sb.divider;
				if (s.isHorizontal()) sb.drag[0].style.width = sb.dragSize + "px";
				else sb.drag[0].style.height = sb.dragSize + "px";
				if (sb.divider >= 1) sb.track[0].style.display = "none";
				else sb.track[0].style.display = "";
				if (s.params.scrollbarHide) sb.track[0].style.opacity = 0;
			},
			setTranslate: function() {
				if (!s.params.scrollbar) return;
				var sb = s.scrollbar;
				s.translate;
				var newPos;
				var newSize = sb.dragSize;
				newPos = (sb.trackSize - sb.dragSize) * s.progress;
				if (s.rtl && s.isHorizontal()) {
					newPos = -newPos;
					if (newPos > 0) {
						newSize = sb.dragSize - newPos;
						newPos = 0;
					} else if (-newPos + sb.dragSize > sb.trackSize) newSize = sb.trackSize + newPos;
				} else if (newPos < 0) {
					newSize = sb.dragSize + newPos;
					newPos = 0;
				} else if (newPos + sb.dragSize > sb.trackSize) newSize = sb.trackSize - newPos;
				if (s.isHorizontal()) {
					if (s.support.transforms3d) sb.drag.transform("translate3d(" + newPos + "px, 0, 0)");
					else sb.drag.transform("translateX(" + newPos + "px)");
					sb.drag[0].style.width = newSize + "px";
				} else {
					if (s.support.transforms3d) sb.drag.transform("translate3d(0px, " + newPos + "px, 0)");
					else sb.drag.transform("translateY(" + newPos + "px)");
					sb.drag[0].style.height = newSize + "px";
				}
				if (s.params.scrollbarHide) {
					clearTimeout(sb.timeout);
					sb.track[0].style.opacity = 1;
					sb.timeout = setTimeout(function() {
						sb.track[0].style.opacity = 0;
						sb.track.transition(400);
					}, 1e3);
				}
			},
			setTransition: function(duration) {
				if (!s.params.scrollbar) return;
				s.scrollbar.drag.transition(duration);
			}
		};
		s.controller = {
			LinearSpline: function(x, y) {
				var binarySearch = (function() {
					var maxIndex, minIndex, guess;
					return function(array, val) {
						minIndex = -1;
						maxIndex = array.length;
						while (maxIndex - minIndex > 1) if (array[guess = maxIndex + minIndex >> 1] <= val) minIndex = guess;
						else maxIndex = guess;
						return maxIndex;
					};
				})();
				this.x = x;
				this.y = y;
				this.lastIndex = x.length - 1;
				var i1, i3;
				this.x.length;
				this.interpolate = function(x2) {
					if (!x2) return 0;
					i3 = binarySearch(this.x, x2);
					i1 = i3 - 1;
					return (x2 - this.x[i1]) * (this.y[i3] - this.y[i1]) / (this.x[i3] - this.x[i1]) + this.y[i1];
				};
			},
			getInterpolateFunction: function(c) {
				if (!s.controller.spline) s.controller.spline = s.params.loop ? new s.controller.LinearSpline(s.slidesGrid, c.slidesGrid) : new s.controller.LinearSpline(s.snapGrid, c.snapGrid);
			},
			setTranslate: function(translate, byController) {
				var controlled = s.params.control;
				var multiplier, controlledTranslate;
				function setControlledTranslate(c) {
					translate = c.rtl && c.params.direction === "horizontal" ? -s.translate : s.translate;
					if (s.params.controlBy === "slide") {
						s.controller.getInterpolateFunction(c);
						controlledTranslate = -s.controller.spline.interpolate(-translate);
					}
					if (!controlledTranslate || s.params.controlBy === "container") {
						multiplier = (c.maxTranslate() - c.minTranslate()) / (s.maxTranslate() - s.minTranslate());
						controlledTranslate = (translate - s.minTranslate()) * multiplier + c.minTranslate();
					}
					if (s.params.controlInverse) controlledTranslate = c.maxTranslate() - controlledTranslate;
					c.updateProgress(controlledTranslate);
					c.setWrapperTranslate(controlledTranslate, false, s);
					c.updateActiveIndex();
				}
				if (Array.isArray(controlled)) {
					for (var i = 0; i < controlled.length; i++) if (controlled[i] !== byController && controlled[i] instanceof Swiper) setControlledTranslate(controlled[i]);
				} else if (controlled instanceof Swiper && byController !== controlled) setControlledTranslate(controlled);
			},
			setTransition: function(duration, byController) {
				var controlled = s.params.control;
				var i;
				function setControlledTransition(c) {
					c.setWrapperTransition(duration, s);
					if (duration !== 0) {
						c.onTransitionStart();
						c.wrapper.transitionEnd(function() {
							if (!controlled) return;
							if (c.params.loop && s.params.controlBy === "slide") c.fixLoop();
							c.onTransitionEnd();
						});
					}
				}
				if (Array.isArray(controlled)) {
					for (i = 0; i < controlled.length; i++) if (controlled[i] !== byController && controlled[i] instanceof Swiper) setControlledTransition(controlled[i]);
				} else if (controlled instanceof Swiper && byController !== controlled) setControlledTransition(controlled);
			}
		};
		s.hashnav = {
			onHashCange: function(e, a) {
				var newHash = document.location.hash.replace("#", "");
				if (newHash !== s.slides.eq(s.activeIndex).attr("data-hash")) s.slideTo(s.wrapper.children("." + s.params.slideClass + "[data-hash=\"" + newHash + "\"]").index());
			},
			attachEvents: function(detach) {
				var action = detach ? "off" : "on";
				$(window)[action]("hashchange", s.hashnav.onHashCange);
			},
			setHash: function() {
				if (!s.hashnav.initialized || !s.params.hashnav) return;
				if (s.params.replaceState && window.history && window.history.replaceState) window.history.replaceState(null, null, "#" + s.slides.eq(s.activeIndex).attr("data-hash") || "");
				else {
					var slide = s.slides.eq(s.activeIndex);
					var hash = slide.attr("data-hash") || slide.attr("data-history");
					document.location.hash = hash || "";
				}
			},
			init: function() {
				if (!s.params.hashnav || s.params.history) return;
				s.hashnav.initialized = true;
				var hash = document.location.hash.replace("#", "");
				if (hash) {
					var speed = 0;
					for (var i = 0, length = s.slides.length; i < length; i++) {
						var slide = s.slides.eq(i);
						if ((slide.attr("data-hash") || slide.attr("data-history")) === hash && !slide.hasClass(s.params.slideDuplicateClass)) {
							var index = slide.index();
							s.slideTo(index, speed, s.params.runCallbacksOnInit, true);
						}
					}
				}
				if (s.params.hashnavWatchState) s.hashnav.attachEvents();
			},
			destroy: function() {
				if (s.params.hashnavWatchState) s.hashnav.attachEvents(true);
			}
		};
		s.history = {
			init: function() {
				if (!s.params.history) return;
				if (!window.history || !window.history.pushState) {
					s.params.history = false;
					s.params.hashnav = true;
					return;
				}
				s.history.initialized = true;
				this.paths = this.getPathValues();
				if (!this.paths.key && !this.paths.value) return;
				this.scrollToSlide(0, this.paths.value, s.params.runCallbacksOnInit);
				if (!s.params.replaceState) window.addEventListener("popstate", this.setHistoryPopState);
			},
			setHistoryPopState: function() {
				s.history.paths = s.history.getPathValues();
				s.history.scrollToSlide(s.params.speed, s.history.paths.value, false);
			},
			getPathValues: function() {
				var pathArray = window.location.pathname.slice(1).split("/");
				var total = pathArray.length;
				return {
					key: pathArray[total - 2],
					value: pathArray[total - 1]
				};
			},
			setHistory: function(key, index) {
				if (!s.history.initialized || !s.params.history) return;
				var slide = s.slides.eq(index);
				var value = this.slugify(slide.attr("data-history"));
				if (!window.location.pathname.includes(key)) value = key + "/" + value;
				if (s.params.replaceState) window.history.replaceState(null, null, value);
				else window.history.pushState(null, null, value);
			},
			slugify: function(text) {
				return text.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
			},
			scrollToSlide: function(speed, value, runCallbacks) {
				if (value) for (var i = 0, length = s.slides.length; i < length; i++) {
					var slide = s.slides.eq(i);
					if (this.slugify(slide.attr("data-history")) === value && !slide.hasClass(s.params.slideDuplicateClass)) {
						var index = slide.index();
						s.slideTo(index, speed, runCallbacks);
					}
				}
				else s.slideTo(0, speed, runCallbacks);
			}
		};
		function handleKeyboard(e) {
			if (e.originalEvent) e = e.originalEvent;
			var kc = e.keyCode || e.charCode;
			if (!s.params.allowSwipeToNext && (s.isHorizontal() && kc === 39 || !s.isHorizontal() && kc === 40)) return false;
			if (!s.params.allowSwipeToPrev && (s.isHorizontal() && kc === 37 || !s.isHorizontal() && kc === 38)) return false;
			if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
			if (document.activeElement && document.activeElement.nodeName && (document.activeElement.nodeName.toLowerCase() === "input" || document.activeElement.nodeName.toLowerCase() === "textarea")) return;
			if (kc === 37 || kc === 39 || kc === 38 || kc === 40) {
				var inView = false;
				if (s.container.parents("." + s.params.slideClass).length > 0 && s.container.parents("." + s.params.slideActiveClass).length === 0) return;
				var windowScroll = {
					left: window.pageXOffset,
					top: window.pageYOffset
				};
				var windowWidth = window.innerWidth;
				var windowHeight = window.innerHeight;
				var swiperOffset = s.container.offset();
				if (s.rtl) swiperOffset.left = swiperOffset.left - s.container[0].scrollLeft;
				var swiperCoord = [
					[swiperOffset.left, swiperOffset.top],
					[swiperOffset.left + s.width, swiperOffset.top],
					[swiperOffset.left, swiperOffset.top + s.height],
					[swiperOffset.left + s.width, swiperOffset.top + s.height]
				];
				for (var i = 0; i < swiperCoord.length; i++) {
					var point = swiperCoord[i];
					if (point[0] >= windowScroll.left && point[0] <= windowScroll.left + windowWidth && point[1] >= windowScroll.top && point[1] <= windowScroll.top + windowHeight) inView = true;
				}
				if (!inView) return;
			}
			if (s.isHorizontal()) {
				if (kc === 37 || kc === 39) if (e.preventDefault) e.preventDefault();
				else e.returnValue = false;
				if (kc === 39 && !s.rtl || kc === 37 && s.rtl) s.slideNext();
				if (kc === 37 && !s.rtl || kc === 39 && s.rtl) s.slidePrev();
			} else {
				if (kc === 38 || kc === 40) if (e.preventDefault) e.preventDefault();
				else e.returnValue = false;
				if (kc === 40) s.slideNext();
				if (kc === 38) s.slidePrev();
			}
			s.emit("onKeyPress", s, kc);
		}
		s.disableKeyboardControl = function() {
			s.params.keyboardControl = false;
			$(document).off("keydown", handleKeyboard);
		};
		s.enableKeyboardControl = function() {
			s.params.keyboardControl = true;
			$(document).on("keydown", handleKeyboard);
		};
		s.mousewheel = {
			event: false,
			lastScrollTime: new window.Date().getTime()
		};
		function isEventSupported() {
			var eventName = "onwheel";
			var isSupported = eventName in document;
			if (!isSupported) {
				var element = document.createElement("div");
				element.setAttribute(eventName, "return;");
				isSupported = typeof element[eventName] === "function";
			}
			if (!isSupported && document.implementation && document.implementation.hasFeature && document.implementation.hasFeature("", "") !== true) isSupported = document.implementation.hasFeature("Events.wheel", "3.0");
			return isSupported;
		}
		/**
		* Mouse wheel (and 2-finger trackpad) support on the web sucks.  It is
		* complicated, thus this doc is long and (hopefully) detailed enough to answer
		* your questions.
		*
		* If you need to react to the mouse wheel in a predictable way, this code is
		* like your bestest friend. * hugs *
		*
		* As of today, there are 4 DOM event types you can listen to:
		*
		*   'wheel'                -- Chrome(31+), FF(17+), IE(9+)
		*   'mousewheel'           -- Chrome, IE(6+), Opera, Safari
		*   'MozMousePixelScroll'  -- FF(3.5 only!) (2010-2013) -- don't bother!
		*   'DOMMouseScroll'       -- FF(0.9.7+) since 2003
		*
		* So what to do?  The is the best:
		*
		*   normalizeWheel.getEventType();
		*
		* In your event callback, use this code to get sane interpretation of the
		* deltas.  This code will return an object with properties:
		*
		*   spinX   -- normalized spin speed (use for zoom) - x plane
		*   spinY   -- " - y plane
		*   pixelX  -- normalized distance (to pixels) - x plane
		*   pixelY  -- " - y plane
		*
		* Wheel values are provided by the browser assuming you are using the wheel to
		* scroll a web page by a number of lines or pixels (or pages).  Values can vary
		* significantly on different platforms and browsers, forgetting that you can
		* scroll at different speeds.  Some devices (like trackpads) emit more events
		* at smaller increments with fine granularity, and some emit massive jumps with
		* linear speed or acceleration.
		*
		* This code does its best to normalize the deltas for you:
		*
		*   - spin is trying to normalize how far the wheel was spun (or trackpad
		*     dragged).  This is super useful for zoom support where you want to
		*     throw away the chunky scroll steps on the PC and make those equal to
		*     the slow and smooth tiny steps on the Mac. Key data: This code tries to
		*     resolve a single slow step on a wheel to 1.
		*
		*   - pixel is normalizing the desired scroll delta in pixel units.  You'll
		*     get the crazy differences between browsers, but at least it'll be in
		*     pixels!
		*
		*   - positive value indicates scrolling DOWN/RIGHT, negative UP/LEFT.  This
		*     should translate to positive value zooming IN, negative zooming OUT.
		*     This matches the newer 'wheel' event.
		*
		* Why are there spinX, spinY (or pixels)?
		*
		*   - spinX is a 2-finger side drag on the trackpad, and a shift + wheel turn
		*     with a mouse.  It results in side-scrolling in the browser by default.
		*
		*   - spinY is what you expect -- it's the classic axis of a mouse wheel.
		*
		*   - I dropped spinZ/pixelZ.  It is supported by the DOM 3 'wheel' event and
		*     probably is by browsers in conjunction with fancy 3D controllers .. but
		*     you know.
		*
		* Implementation info:
		*
		* Examples of 'wheel' event if you scroll slowly (down) by one step with an
		* average mouse:
		*
		*   OS X + Chrome  (mouse)     -    4   pixel delta  (wheelDelta -120)
		*   OS X + Safari  (mouse)     -  N/A   pixel delta  (wheelDelta  -12)
		*   OS X + Firefox (mouse)     -    0.1 line  delta  (wheelDelta  N/A)
		*   Win8 + Chrome  (mouse)     -  100   pixel delta  (wheelDelta -120)
		*   Win8 + Firefox (mouse)     -    3   line  delta  (wheelDelta -120)
		*
		* On the trackpad:
		*
		*   OS X + Chrome  (trackpad)  -    2   pixel delta  (wheelDelta   -6)
		*   OS X + Firefox (trackpad)  -    1   pixel delta  (wheelDelta  N/A)
		*
		* On other/older browsers.. it's more complicated as there can be multiple and
		* also missing delta values.
		*
		* The 'wheel' event is more standard:
		*
		* http://www.w3.org/TR/DOM-Level-3-Events/#events-wheelevents
		*
		* The basics is that it includes a unit, deltaMode (pixels, lines, pages), and
		* deltaX, deltaY and deltaZ.  Some browsers provide other values to maintain
		* backward compatibility with older events.  Those other values help us
		* better normalize spin speed.  Example of what the browsers provide:
		*
		*                          | event.wheelDelta | event.detail
		*        ------------------+------------------+--------------
		*          Safari v5/OS X  |       -120       |       0
		*          Safari v5/Win7  |       -120       |       0
		*         Chrome v17/OS X  |       -120       |       0
		*         Chrome v17/Win7  |       -120       |       0
		*                IE9/Win7  |       -120       |   undefined
		*         Firefox v4/OS X  |     undefined    |       1
		*         Firefox v4/Win7  |     undefined    |       3
		*
		*/
		function normalizeWheel(event) {
			var PIXEL_STEP = 10;
			var LINE_HEIGHT = 40;
			var PAGE_HEIGHT = 800;
			var sX = 0, sY = 0, pX = 0, pY = 0;
			if ("detail" in event) sY = event.detail;
			if ("wheelDelta" in event) sY = -event.wheelDelta / 120;
			if ("wheelDeltaY" in event) sY = -event.wheelDeltaY / 120;
			if ("wheelDeltaX" in event) sX = -event.wheelDeltaX / 120;
			if ("axis" in event && event.axis === event.HORIZONTAL_AXIS) {
				sX = sY;
				sY = 0;
			}
			pX = sX * PIXEL_STEP;
			pY = sY * PIXEL_STEP;
			if ("deltaY" in event) pY = event.deltaY;
			if ("deltaX" in event) pX = event.deltaX;
			if ((pX || pY) && event.deltaMode) if (event.deltaMode === 1) {
				pX *= LINE_HEIGHT;
				pY *= LINE_HEIGHT;
			} else {
				pX *= PAGE_HEIGHT;
				pY *= PAGE_HEIGHT;
			}
			if (pX && !sX) sX = pX < 1 ? -1 : 1;
			if (pY && !sY) sY = pY < 1 ? -1 : 1;
			return {
				spinX: sX,
				spinY: sY,
				pixelX: pX,
				pixelY: pY
			};
		}
		if (s.params.mousewheelControl)
 /**
		* The best combination if you prefer spinX + spinY normalization.  It favors
		* the older DOMMouseScroll for Firefox, as FF does not include wheelDelta with
		* 'wheel' event, making spin speed determination impossible.
		*/
		s.mousewheel.event = navigator.userAgent.indexOf("firefox") > -1 ? "DOMMouseScroll" : isEventSupported() ? "wheel" : "mousewheel";
		function handleMousewheel(e) {
			if (e.originalEvent) e = e.originalEvent;
			var delta = 0;
			var rtlFactor = s.rtl ? -1 : 1;
			var data = normalizeWheel(e);
			if (s.params.mousewheelForceToAxis) if (s.isHorizontal()) if (Math.abs(data.pixelX) > Math.abs(data.pixelY)) delta = data.pixelX * rtlFactor;
			else return;
			else if (Math.abs(data.pixelY) > Math.abs(data.pixelX)) delta = data.pixelY;
			else return;
			else delta = Math.abs(data.pixelX) > Math.abs(data.pixelY) ? -data.pixelX * rtlFactor : -data.pixelY;
			if (delta === 0) return;
			if (s.params.mousewheelInvert) delta = -delta;
			if (!s.params.freeMode) {
				if (new window.Date().getTime() - s.mousewheel.lastScrollTime > 60) {
					if (delta < 0) {
						if ((!s.isEnd || s.params.loop) && !s.animating) {
							s.slideNext();
							s.emit("onScroll", s, e);
						} else if (s.params.mousewheelReleaseOnEdges) return true;
					} else if ((!s.isBeginning || s.params.loop) && !s.animating) {
						s.slidePrev();
						s.emit("onScroll", s, e);
					} else if (s.params.mousewheelReleaseOnEdges) return true;
				}
				s.mousewheel.lastScrollTime = new window.Date().getTime();
			} else {
				var position = s.getWrapperTranslate() + delta * s.params.mousewheelSensitivity;
				var wasBeginning = s.isBeginning, wasEnd = s.isEnd;
				if (position >= s.minTranslate()) position = s.minTranslate();
				if (position <= s.maxTranslate()) position = s.maxTranslate();
				s.setWrapperTransition(0);
				s.setWrapperTranslate(position);
				s.updateProgress();
				s.updateActiveIndex();
				if (!wasBeginning && s.isBeginning || !wasEnd && s.isEnd) s.updateClasses();
				if (s.params.freeModeSticky) {
					clearTimeout(s.mousewheel.timeout);
					s.mousewheel.timeout = setTimeout(function() {
						s.slideReset();
					}, 300);
				} else if (s.params.lazyLoading && s.lazy) s.lazy.load();
				s.emit("onScroll", s, e);
				if (s.params.autoplay && s.params.autoplayDisableOnInteraction) s.stopAutoplay();
				if (position === 0 || position === s.maxTranslate()) return;
			}
			if (e.preventDefault) e.preventDefault();
			else e.returnValue = false;
			return false;
		}
		s.disableMousewheelControl = function() {
			if (!s.mousewheel.event) return false;
			var target = s.container;
			if (s.params.mousewheelEventsTarged !== "container") target = $(s.params.mousewheelEventsTarged);
			target.off(s.mousewheel.event, handleMousewheel);
			s.params.mousewheelControl = false;
			return true;
		};
		s.enableMousewheelControl = function() {
			if (!s.mousewheel.event) return false;
			var target = s.container;
			if (s.params.mousewheelEventsTarged !== "container") target = $(s.params.mousewheelEventsTarged);
			target.on(s.mousewheel.event, handleMousewheel);
			s.params.mousewheelControl = true;
			return true;
		};
		function setParallaxTransform(el, progress) {
			el = $(el);
			var p, pX, pY;
			var rtlFactor = s.rtl ? -1 : 1;
			p = el.attr("data-swiper-parallax") || "0";
			pX = el.attr("data-swiper-parallax-x");
			pY = el.attr("data-swiper-parallax-y");
			if (pX || pY) {
				pX = pX || "0";
				pY = pY || "0";
			} else if (s.isHorizontal()) {
				pX = p;
				pY = "0";
			} else {
				pY = p;
				pX = "0";
			}
			if (pX.indexOf("%") >= 0) pX = parseInt(pX, 10) * progress * rtlFactor + "%";
			else pX = pX * progress * rtlFactor + "px";
			if (pY.indexOf("%") >= 0) pY = parseInt(pY, 10) * progress + "%";
			else pY = pY * progress + "px";
			el.transform("translate3d(" + pX + ", " + pY + ",0px)");
		}
		s.parallax = {
			setTranslate: function() {
				s.container.children("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function() {
					setParallaxTransform(this, s.progress);
				});
				s.slides.each(function() {
					var slide = $(this);
					slide.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function() {
						var progress = Math.min(Math.max(slide[0].progress, -1), 1);
						setParallaxTransform(this, progress);
					});
				});
			},
			setTransition: function(duration) {
				if (typeof duration === "undefined") duration = s.params.speed;
				s.container.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function() {
					var el = $(this);
					var parallaxDuration = parseInt(el.attr("data-swiper-parallax-duration"), 10) || duration;
					if (duration === 0) parallaxDuration = 0;
					el.transition(parallaxDuration);
				});
			}
		};
		s.zoom = {
			scale: 1,
			currentScale: 1,
			isScaling: false,
			gesture: {
				slide: void 0,
				slideWidth: void 0,
				slideHeight: void 0,
				image: void 0,
				imageWrap: void 0,
				zoomMax: s.params.zoomMax
			},
			image: {
				isTouched: void 0,
				isMoved: void 0,
				currentX: void 0,
				currentY: void 0,
				minX: void 0,
				minY: void 0,
				maxX: void 0,
				maxY: void 0,
				width: void 0,
				height: void 0,
				startX: void 0,
				startY: void 0,
				touchesStart: {},
				touchesCurrent: {}
			},
			velocity: {
				x: void 0,
				y: void 0,
				prevPositionX: void 0,
				prevPositionY: void 0,
				prevTime: void 0
			},
			getDistanceBetweenTouches: function(e) {
				if (e.targetTouches.length < 2) return 1;
				var x1 = e.targetTouches[0].pageX, y1 = e.targetTouches[0].pageY, x2 = e.targetTouches[1].pageX, y2 = e.targetTouches[1].pageY;
				return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
			},
			onGestureStart: function(e) {
				var z = s.zoom;
				if (!s.support.gestures) {
					if (e.type !== "touchstart" || e.type === "touchstart" && e.targetTouches.length < 2) return;
					z.gesture.scaleStart = z.getDistanceBetweenTouches(e);
				}
				if (!z.gesture.slide || !z.gesture.slide.length) {
					z.gesture.slide = $(this);
					if (z.gesture.slide.length === 0) z.gesture.slide = s.slides.eq(s.activeIndex);
					z.gesture.image = z.gesture.slide.find("img, svg, canvas");
					z.gesture.imageWrap = z.gesture.image.parent("." + s.params.zoomContainerClass);
					z.gesture.zoomMax = z.gesture.imageWrap.attr("data-swiper-zoom") || s.params.zoomMax;
					if (z.gesture.imageWrap.length === 0) {
						z.gesture.image = void 0;
						return;
					}
				}
				z.gesture.image.transition(0);
				z.isScaling = true;
			},
			onGestureChange: function(e) {
				var z = s.zoom;
				if (!s.support.gestures) {
					if (e.type !== "touchmove" || e.type === "touchmove" && e.targetTouches.length < 2) return;
					z.gesture.scaleMove = z.getDistanceBetweenTouches(e);
				}
				if (!z.gesture.image || z.gesture.image.length === 0) return;
				if (s.support.gestures) z.scale = e.scale * z.currentScale;
				else z.scale = z.gesture.scaleMove / z.gesture.scaleStart * z.currentScale;
				if (z.scale > z.gesture.zoomMax) z.scale = z.gesture.zoomMax - 1 + Math.pow(z.scale - z.gesture.zoomMax + 1, .5);
				if (z.scale < s.params.zoomMin) z.scale = s.params.zoomMin + 1 - Math.pow(s.params.zoomMin - z.scale + 1, .5);
				z.gesture.image.transform("translate3d(0,0,0) scale(" + z.scale + ")");
			},
			onGestureEnd: function(e) {
				var z = s.zoom;
				if (!s.support.gestures) {
					if (e.type !== "touchend" || e.type === "touchend" && e.changedTouches.length < 2) return;
				}
				if (!z.gesture.image || z.gesture.image.length === 0) return;
				z.scale = Math.max(Math.min(z.scale, z.gesture.zoomMax), s.params.zoomMin);
				z.gesture.image.transition(s.params.speed).transform("translate3d(0,0,0) scale(" + z.scale + ")");
				z.currentScale = z.scale;
				z.isScaling = false;
				if (z.scale === 1) z.gesture.slide = void 0;
			},
			onTouchStart: function(s, e) {
				var z = s.zoom;
				if (!z.gesture.image || z.gesture.image.length === 0) return;
				if (z.image.isTouched) return;
				if (s.device.os === "android") e.preventDefault();
				z.image.isTouched = true;
				z.image.touchesStart.x = e.type === "touchstart" ? e.targetTouches[0].pageX : e.pageX;
				z.image.touchesStart.y = e.type === "touchstart" ? e.targetTouches[0].pageY : e.pageY;
			},
			onTouchMove: function(e) {
				var z = s.zoom;
				if (!z.gesture.image || z.gesture.image.length === 0) return;
				s.allowClick = false;
				if (!z.image.isTouched || !z.gesture.slide) return;
				if (!z.image.isMoved) {
					z.image.width = z.gesture.image[0].offsetWidth;
					z.image.height = z.gesture.image[0].offsetHeight;
					z.image.startX = s.getTranslate(z.gesture.imageWrap[0], "x") || 0;
					z.image.startY = s.getTranslate(z.gesture.imageWrap[0], "y") || 0;
					z.gesture.slideWidth = z.gesture.slide[0].offsetWidth;
					z.gesture.slideHeight = z.gesture.slide[0].offsetHeight;
					z.gesture.imageWrap.transition(0);
					if (s.rtl) z.image.startX = -z.image.startX;
					if (s.rtl) z.image.startY = -z.image.startY;
				}
				var scaledWidth = z.image.width * z.scale;
				var scaledHeight = z.image.height * z.scale;
				if (scaledWidth < z.gesture.slideWidth && scaledHeight < z.gesture.slideHeight) return;
				z.image.minX = Math.min(z.gesture.slideWidth / 2 - scaledWidth / 2, 0);
				z.image.maxX = -z.image.minX;
				z.image.minY = Math.min(z.gesture.slideHeight / 2 - scaledHeight / 2, 0);
				z.image.maxY = -z.image.minY;
				z.image.touchesCurrent.x = e.type === "touchmove" ? e.targetTouches[0].pageX : e.pageX;
				z.image.touchesCurrent.y = e.type === "touchmove" ? e.targetTouches[0].pageY : e.pageY;
				if (!z.image.isMoved && !z.isScaling) {
					if (s.isHorizontal() && Math.floor(z.image.minX) === Math.floor(z.image.startX) && z.image.touchesCurrent.x < z.image.touchesStart.x || Math.floor(z.image.maxX) === Math.floor(z.image.startX) && z.image.touchesCurrent.x > z.image.touchesStart.x) {
						z.image.isTouched = false;
						return;
					} else if (!s.isHorizontal() && Math.floor(z.image.minY) === Math.floor(z.image.startY) && z.image.touchesCurrent.y < z.image.touchesStart.y || Math.floor(z.image.maxY) === Math.floor(z.image.startY) && z.image.touchesCurrent.y > z.image.touchesStart.y) {
						z.image.isTouched = false;
						return;
					}
				}
				e.preventDefault();
				e.stopPropagation();
				z.image.isMoved = true;
				z.image.currentX = z.image.touchesCurrent.x - z.image.touchesStart.x + z.image.startX;
				z.image.currentY = z.image.touchesCurrent.y - z.image.touchesStart.y + z.image.startY;
				if (z.image.currentX < z.image.minX) z.image.currentX = z.image.minX + 1 - Math.pow(z.image.minX - z.image.currentX + 1, .8);
				if (z.image.currentX > z.image.maxX) z.image.currentX = z.image.maxX - 1 + Math.pow(z.image.currentX - z.image.maxX + 1, .8);
				if (z.image.currentY < z.image.minY) z.image.currentY = z.image.minY + 1 - Math.pow(z.image.minY - z.image.currentY + 1, .8);
				if (z.image.currentY > z.image.maxY) z.image.currentY = z.image.maxY - 1 + Math.pow(z.image.currentY - z.image.maxY + 1, .8);
				if (!z.velocity.prevPositionX) z.velocity.prevPositionX = z.image.touchesCurrent.x;
				if (!z.velocity.prevPositionY) z.velocity.prevPositionY = z.image.touchesCurrent.y;
				if (!z.velocity.prevTime) z.velocity.prevTime = Date.now();
				z.velocity.x = (z.image.touchesCurrent.x - z.velocity.prevPositionX) / (Date.now() - z.velocity.prevTime) / 2;
				z.velocity.y = (z.image.touchesCurrent.y - z.velocity.prevPositionY) / (Date.now() - z.velocity.prevTime) / 2;
				if (Math.abs(z.image.touchesCurrent.x - z.velocity.prevPositionX) < 2) z.velocity.x = 0;
				if (Math.abs(z.image.touchesCurrent.y - z.velocity.prevPositionY) < 2) z.velocity.y = 0;
				z.velocity.prevPositionX = z.image.touchesCurrent.x;
				z.velocity.prevPositionY = z.image.touchesCurrent.y;
				z.velocity.prevTime = Date.now();
				z.gesture.imageWrap.transform("translate3d(" + z.image.currentX + "px, " + z.image.currentY + "px,0)");
			},
			onTouchEnd: function(s, e) {
				var z = s.zoom;
				if (!z.gesture.image || z.gesture.image.length === 0) return;
				if (!z.image.isTouched || !z.image.isMoved) {
					z.image.isTouched = false;
					z.image.isMoved = false;
					return;
				}
				z.image.isTouched = false;
				z.image.isMoved = false;
				var momentumDurationX = 300;
				var momentumDurationY = 300;
				var momentumDistanceX = z.velocity.x * momentumDurationX;
				var newPositionX = z.image.currentX + momentumDistanceX;
				var momentumDistanceY = z.velocity.y * momentumDurationY;
				var newPositionY = z.image.currentY + momentumDistanceY;
				if (z.velocity.x !== 0) momentumDurationX = Math.abs((newPositionX - z.image.currentX) / z.velocity.x);
				if (z.velocity.y !== 0) momentumDurationY = Math.abs((newPositionY - z.image.currentY) / z.velocity.y);
				var momentumDuration = Math.max(momentumDurationX, momentumDurationY);
				z.image.currentX = newPositionX;
				z.image.currentY = newPositionY;
				var scaledWidth = z.image.width * z.scale;
				var scaledHeight = z.image.height * z.scale;
				z.image.minX = Math.min(z.gesture.slideWidth / 2 - scaledWidth / 2, 0);
				z.image.maxX = -z.image.minX;
				z.image.minY = Math.min(z.gesture.slideHeight / 2 - scaledHeight / 2, 0);
				z.image.maxY = -z.image.minY;
				z.image.currentX = Math.max(Math.min(z.image.currentX, z.image.maxX), z.image.minX);
				z.image.currentY = Math.max(Math.min(z.image.currentY, z.image.maxY), z.image.minY);
				z.gesture.imageWrap.transition(momentumDuration).transform("translate3d(" + z.image.currentX + "px, " + z.image.currentY + "px,0)");
			},
			onTransitionEnd: function(s) {
				var z = s.zoom;
				if (z.gesture.slide && s.previousIndex !== s.activeIndex) {
					z.gesture.image.transform("translate3d(0,0,0) scale(1)");
					z.gesture.imageWrap.transform("translate3d(0,0,0)");
					z.gesture.slide = z.gesture.image = z.gesture.imageWrap = void 0;
					z.scale = z.currentScale = 1;
				}
			},
			toggleZoom: function(s, e) {
				var z = s.zoom;
				if (!z.gesture.slide) {
					z.gesture.slide = s.clickedSlide ? $(s.clickedSlide) : s.slides.eq(s.activeIndex);
					z.gesture.image = z.gesture.slide.find("img, svg, canvas");
					z.gesture.imageWrap = z.gesture.image.parent("." + s.params.zoomContainerClass);
				}
				if (!z.gesture.image || z.gesture.image.length === 0) return;
				var touchX, touchY, offsetX, offsetY, diffX, diffY, translateX, translateY, imageWidth, imageHeight, scaledWidth, scaledHeight, translateMinX, translateMinY, translateMaxX, translateMaxY, slideWidth, slideHeight;
				if (typeof z.image.touchesStart.x === "undefined" && e) {
					touchX = e.type === "touchend" ? e.changedTouches[0].pageX : e.pageX;
					touchY = e.type === "touchend" ? e.changedTouches[0].pageY : e.pageY;
				} else {
					touchX = z.image.touchesStart.x;
					touchY = z.image.touchesStart.y;
				}
				if (z.scale && z.scale !== 1) {
					z.scale = z.currentScale = 1;
					z.gesture.imageWrap.transition(300).transform("translate3d(0,0,0)");
					z.gesture.image.transition(300).transform("translate3d(0,0,0) scale(1)");
					z.gesture.slide = void 0;
				} else {
					z.scale = z.currentScale = z.gesture.imageWrap.attr("data-swiper-zoom") || s.params.zoomMax;
					if (e) {
						slideWidth = z.gesture.slide[0].offsetWidth;
						slideHeight = z.gesture.slide[0].offsetHeight;
						offsetX = z.gesture.slide.offset().left;
						offsetY = z.gesture.slide.offset().top;
						diffX = offsetX + slideWidth / 2 - touchX;
						diffY = offsetY + slideHeight / 2 - touchY;
						imageWidth = z.gesture.image[0].offsetWidth;
						imageHeight = z.gesture.image[0].offsetHeight;
						scaledWidth = imageWidth * z.scale;
						scaledHeight = imageHeight * z.scale;
						translateMinX = Math.min(slideWidth / 2 - scaledWidth / 2, 0);
						translateMinY = Math.min(slideHeight / 2 - scaledHeight / 2, 0);
						translateMaxX = -translateMinX;
						translateMaxY = -translateMinY;
						translateX = diffX * z.scale;
						translateY = diffY * z.scale;
						if (translateX < translateMinX) translateX = translateMinX;
						if (translateX > translateMaxX) translateX = translateMaxX;
						if (translateY < translateMinY) translateY = translateMinY;
						if (translateY > translateMaxY) translateY = translateMaxY;
					} else {
						translateX = 0;
						translateY = 0;
					}
					z.gesture.imageWrap.transition(300).transform("translate3d(" + translateX + "px, " + translateY + "px,0)");
					z.gesture.image.transition(300).transform("translate3d(0,0,0) scale(" + z.scale + ")");
				}
			},
			attachEvents: function(detach) {
				var action = detach ? "off" : "on";
				if (s.params.zoom) {
					s.slides;
					var passiveListener = s.touchEvents.start === "touchstart" && s.support.passiveListener && s.params.passiveListeners ? {
						passive: true,
						capture: false
					} : false;
					if (s.support.gestures) {
						s.slides[action]("gesturestart", s.zoom.onGestureStart, passiveListener);
						s.slides[action]("gesturechange", s.zoom.onGestureChange, passiveListener);
						s.slides[action]("gestureend", s.zoom.onGestureEnd, passiveListener);
					} else if (s.touchEvents.start === "touchstart") {
						s.slides[action](s.touchEvents.start, s.zoom.onGestureStart, passiveListener);
						s.slides[action](s.touchEvents.move, s.zoom.onGestureChange, passiveListener);
						s.slides[action](s.touchEvents.end, s.zoom.onGestureEnd, passiveListener);
					}
					s[action]("touchStart", s.zoom.onTouchStart);
					s.slides.each(function(index, slide) {
						if ($(slide).find("." + s.params.zoomContainerClass).length > 0) $(slide)[action](s.touchEvents.move, s.zoom.onTouchMove);
					});
					s[action]("touchEnd", s.zoom.onTouchEnd);
					s[action]("transitionEnd", s.zoom.onTransitionEnd);
					if (s.params.zoomToggle) s.on("doubleTap", s.zoom.toggleZoom);
				}
			},
			init: function() {
				s.zoom.attachEvents();
			},
			destroy: function() {
				s.zoom.attachEvents(true);
			}
		};
		s._plugins = [];
		for (var plugin in s.plugins) {
			var p = s.plugins[plugin](s, s.params[plugin]);
			if (p) s._plugins.push(p);
		}
		s.callPlugins = function(eventName) {
			for (var i = 0; i < s._plugins.length; i++) if (eventName in s._plugins[i]) s._plugins[i][eventName](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
		};
		function normalizeEventName(eventName) {
			if (eventName.indexOf("on") !== 0) if (eventName[0] !== eventName[0].toUpperCase()) eventName = "on" + eventName[0].toUpperCase() + eventName.substring(1);
			else eventName = "on" + eventName;
			return eventName;
		}
		s.emitterEventListeners = {};
		s.emit = function(eventName) {
			if (s.params[eventName]) s.params[eventName](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
			var i;
			if (s.emitterEventListeners[eventName]) for (i = 0; i < s.emitterEventListeners[eventName].length; i++) s.emitterEventListeners[eventName][i](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
			if (s.callPlugins) s.callPlugins(eventName, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
		};
		s.on = function(eventName, handler) {
			eventName = normalizeEventName(eventName);
			if (!s.emitterEventListeners[eventName]) s.emitterEventListeners[eventName] = [];
			s.emitterEventListeners[eventName].push(handler);
			return s;
		};
		s.off = function(eventName, handler) {
			var i;
			eventName = normalizeEventName(eventName);
			if (typeof handler === "undefined") {
				s.emitterEventListeners[eventName] = [];
				return s;
			}
			if (!s.emitterEventListeners[eventName] || s.emitterEventListeners[eventName].length === 0) return;
			for (i = 0; i < s.emitterEventListeners[eventName].length; i++) if (s.emitterEventListeners[eventName][i] === handler) s.emitterEventListeners[eventName].splice(i, 1);
			return s;
		};
		s.once = function(eventName, handler) {
			eventName = normalizeEventName(eventName);
			var _handler = function() {
				handler(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
				s.off(eventName, _handler);
			};
			s.on(eventName, _handler);
			return s;
		};
		s.a11y = {
			makeFocusable: function($el) {
				$el.attr("tabIndex", "0");
				return $el;
			},
			addRole: function($el, role) {
				$el.attr("role", role);
				return $el;
			},
			addLabel: function($el, label) {
				$el.attr("aria-label", label);
				return $el;
			},
			disable: function($el) {
				$el.attr("aria-disabled", true);
				return $el;
			},
			enable: function($el) {
				$el.attr("aria-disabled", false);
				return $el;
			},
			onEnterKey: function(event) {
				if (event.keyCode !== 13) return;
				if ($(event.target).is(s.params.nextButton)) {
					s.onClickNext(event);
					if (s.isEnd) s.a11y.notify(s.params.lastSlideMessage);
					else s.a11y.notify(s.params.nextSlideMessage);
				} else if ($(event.target).is(s.params.prevButton)) {
					s.onClickPrev(event);
					if (s.isBeginning) s.a11y.notify(s.params.firstSlideMessage);
					else s.a11y.notify(s.params.prevSlideMessage);
				}
				if ($(event.target).is("." + s.params.bulletClass)) $(event.target)[0].click();
			},
			liveRegion: $("<span class=\"" + s.params.notificationClass + "\" aria-live=\"assertive\" aria-atomic=\"true\"></span>"),
			notify: function(message) {
				var notification = s.a11y.liveRegion;
				if (notification.length === 0) return;
				notification.html("");
				notification.html(message);
			},
			init: function() {
				if (s.params.nextButton && s.nextButton && s.nextButton.length > 0) {
					s.a11y.makeFocusable(s.nextButton);
					s.a11y.addRole(s.nextButton, "button");
					s.a11y.addLabel(s.nextButton, s.params.nextSlideMessage);
				}
				if (s.params.prevButton && s.prevButton && s.prevButton.length > 0) {
					s.a11y.makeFocusable(s.prevButton);
					s.a11y.addRole(s.prevButton, "button");
					s.a11y.addLabel(s.prevButton, s.params.prevSlideMessage);
				}
				$(s.container).append(s.a11y.liveRegion);
			},
			initPagination: function() {
				if (s.params.pagination && s.params.paginationClickable && s.bullets && s.bullets.length) s.bullets.each(function() {
					var bullet = $(this);
					s.a11y.makeFocusable(bullet);
					s.a11y.addRole(bullet, "button");
					s.a11y.addLabel(bullet, s.params.paginationBulletMessage.replace(/{{index}}/, bullet.index() + 1));
				});
			},
			destroy: function() {
				if (s.a11y.liveRegion && s.a11y.liveRegion.length > 0) s.a11y.liveRegion.remove();
			}
		};
		s.init = function() {
			if (s.params.loop) s.createLoop();
			s.updateContainerSize();
			s.updateSlidesSize();
			s.updatePagination();
			if (s.params.scrollbar && s.scrollbar) {
				s.scrollbar.set();
				if (s.params.scrollbarDraggable) s.scrollbar.enableDraggable();
			}
			if (s.params.effect !== "slide" && s.effects[s.params.effect]) {
				if (!s.params.loop) s.updateProgress();
				s.effects[s.params.effect].setTranslate();
			}
			if (s.params.loop) s.slideTo(s.params.initialSlide + s.loopedSlides, 0, s.params.runCallbacksOnInit);
			else {
				s.slideTo(s.params.initialSlide, 0, s.params.runCallbacksOnInit);
				if (s.params.initialSlide === 0) {
					if (s.parallax && s.params.parallax) s.parallax.setTranslate();
					if (s.lazy && s.params.lazyLoading) {
						s.lazy.load();
						s.lazy.initialImageLoaded = true;
					}
				}
			}
			s.attachEvents();
			if (s.params.observer && s.support.observer) s.initObservers();
			if (s.params.preloadImages && !s.params.lazyLoading) s.preloadImages();
			if (s.params.zoom && s.zoom) s.zoom.init();
			if (s.params.autoplay) s.startAutoplay();
			if (s.params.keyboardControl) {
				if (s.enableKeyboardControl) s.enableKeyboardControl();
			}
			if (s.params.mousewheelControl) {
				if (s.enableMousewheelControl) s.enableMousewheelControl();
			}
			if (s.params.hashnavReplaceState) s.params.replaceState = s.params.hashnavReplaceState;
			if (s.params.history) {
				if (s.history) s.history.init();
			}
			if (s.params.hashnav) {
				if (s.hashnav) s.hashnav.init();
			}
			if (s.params.a11y && s.a11y) s.a11y.init();
			s.emit("onInit", s);
		};
		s.cleanupStyles = function() {
			s.container.removeClass(s.classNames.join(" ")).removeAttr("style");
			s.wrapper.removeAttr("style");
			if (s.slides && s.slides.length) s.slides.removeClass([
				s.params.slideVisibleClass,
				s.params.slideActiveClass,
				s.params.slideNextClass,
				s.params.slidePrevClass
			].join(" ")).removeAttr("style").removeAttr("data-swiper-column").removeAttr("data-swiper-row");
			if (s.paginationContainer && s.paginationContainer.length) s.paginationContainer.removeClass(s.params.paginationHiddenClass);
			if (s.bullets && s.bullets.length) s.bullets.removeClass(s.params.bulletActiveClass);
			if (s.params.prevButton) $(s.params.prevButton).removeClass(s.params.buttonDisabledClass);
			if (s.params.nextButton) $(s.params.nextButton).removeClass(s.params.buttonDisabledClass);
			if (s.params.scrollbar && s.scrollbar) {
				if (s.scrollbar.track && s.scrollbar.track.length) s.scrollbar.track.removeAttr("style");
				if (s.scrollbar.drag && s.scrollbar.drag.length) s.scrollbar.drag.removeAttr("style");
			}
		};
		s.destroy = function(deleteInstance, cleanupStyles) {
			s.detachEvents();
			s.stopAutoplay();
			if (s.params.scrollbar && s.scrollbar) {
				if (s.params.scrollbarDraggable) s.scrollbar.disableDraggable();
			}
			if (s.params.loop) s.destroyLoop();
			if (cleanupStyles) s.cleanupStyles();
			s.disconnectObservers();
			if (s.params.zoom && s.zoom) s.zoom.destroy();
			if (s.params.keyboardControl) {
				if (s.disableKeyboardControl) s.disableKeyboardControl();
			}
			if (s.params.mousewheelControl) {
				if (s.disableMousewheelControl) s.disableMousewheelControl();
			}
			if (s.params.a11y && s.a11y) s.a11y.destroy();
			if (s.params.history && !s.params.replaceState) window.removeEventListener("popstate", s.history.setHistoryPopState);
			if (s.params.hashnav && s.hashnav) s.hashnav.destroy();
			s.emit("onDestroy");
			if (deleteInstance !== false) s = null;
		};
		s.init();
		return s;
	};
	if (typeof window !== "object") return Swiper;
	Swiper.prototype = {
		isSafari: (function() {
			var ua = window.navigator.userAgent.toLowerCase();
			return ua.indexOf("safari") >= 0 && ua.indexOf("chrome") < 0 && ua.indexOf("android") < 0;
		})(),
		isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent),
		isArray: function(arr) {
			return Object.prototype.toString.apply(arr) === "[object Array]";
		},
		browser: {
			ie: window.navigator.pointerEnabled || window.navigator.msPointerEnabled,
			ieTouch: window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 1 || window.navigator.pointerEnabled && window.navigator.maxTouchPoints > 1,
			lteIE9: (function() {
				var div = document.createElement("div");
				div.innerHTML = "<!--[if lte IE 9]><i></i><![endif]-->";
				return div.getElementsByTagName("i").length === 1;
			})()
		},
		device: (function() {
			var ua = window.navigator.userAgent;
			var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
			var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
			var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
			var iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
			return {
				ios: ipad || iphone || ipod,
				android
			};
		})(),
		support: {
			touch: window.Modernizr && Modernizr.touch === true || (function() {
				return !!("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch);
			})(),
			transforms3d: window.Modernizr && Modernizr.csstransforms3d === true || (function() {
				var div = document.createElement("div").style;
				return "webkitPerspective" in div || "MozPerspective" in div || "OPerspective" in div || "MsPerspective" in div || "perspective" in div;
			})(),
			flexbox: (function() {
				var div = document.createElement("div").style;
				var styles = "alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient".split(" ");
				for (var i = 0; i < styles.length; i++) if (styles[i] in div) return true;
			})(),
			observer: (function() {
				return "MutationObserver" in window || "WebkitMutationObserver" in window;
			})(),
			passiveListener: (function() {
				var supportsPassive = false;
				try {
					var opts = Object.defineProperty({}, "passive", { get: function() {
						supportsPassive = true;
					} });
					window.addEventListener("testPassiveListener", null, opts);
				} catch (e) {}
				return supportsPassive;
			})(),
			gestures: (function() {
				return "ongesturestart" in window;
			})()
		},
		plugins: {}
	};
	var Dom7 = (function() {
		var Dom7 = function(arr) {
			var _this = this, i = 0;
			for (i = 0; i < arr.length; i++) _this[i] = arr[i];
			_this.length = arr.length;
			return this;
		};
		var $ = function(selector, context) {
			var arr = [], i = 0;
			if (selector && !context) {
				if (selector instanceof Dom7) return selector;
			}
			if (selector) {
				if (typeof selector === "string") {
					var els, tempParent, html = selector.trim();
					if (html.indexOf("<") >= 0 && html.indexOf(">") >= 0) {
						var toCreate = "div";
						if (html.indexOf("<li") === 0) toCreate = "ul";
						if (html.indexOf("<tr") === 0) toCreate = "tbody";
						if (html.indexOf("<td") === 0 || html.indexOf("<th") === 0) toCreate = "tr";
						if (html.indexOf("<tbody") === 0) toCreate = "table";
						if (html.indexOf("<option") === 0) toCreate = "select";
						tempParent = document.createElement(toCreate);
						tempParent.innerHTML = selector;
						for (i = 0; i < tempParent.childNodes.length; i++) arr.push(tempParent.childNodes[i]);
					} else {
						if (!context && selector[0] === "#" && !selector.match(/[ .<>:~]/)) els = [document.getElementById(selector.split("#")[1])];
						else els = (context || document).querySelectorAll(selector);
						for (i = 0; i < els.length; i++) if (els[i]) arr.push(els[i]);
					}
				} else if (selector.nodeType || selector === window || selector === document) arr.push(selector);
				else if (selector.length > 0 && selector[0].nodeType) for (i = 0; i < selector.length; i++) arr.push(selector[i]);
			}
			return new Dom7(arr);
		};
		Dom7.prototype = {
			addClass: function(className) {
				if (typeof className === "undefined") return this;
				var classes = className.split(" ");
				for (var i = 0; i < classes.length; i++) for (var j = 0; j < this.length; j++) this[j].classList.add(classes[i]);
				return this;
			},
			removeClass: function(className) {
				var classes = className.split(" ");
				for (var i = 0; i < classes.length; i++) for (var j = 0; j < this.length; j++) this[j].classList.remove(classes[i]);
				return this;
			},
			hasClass: function(className) {
				if (!this[0]) return false;
				else return this[0].classList.contains(className);
			},
			toggleClass: function(className) {
				var classes = className.split(" ");
				for (var i = 0; i < classes.length; i++) for (var j = 0; j < this.length; j++) this[j].classList.toggle(classes[i]);
				return this;
			},
			attr: function(attrs, value) {
				if (arguments.length === 1 && typeof attrs === "string") if (this[0]) return this[0].getAttribute(attrs);
				else return void 0;
				else {
					for (var i = 0; i < this.length; i++) if (arguments.length === 2) this[i].setAttribute(attrs, value);
					else for (var attrName in attrs) {
						this[i][attrName] = attrs[attrName];
						this[i].setAttribute(attrName, attrs[attrName]);
					}
					return this;
				}
			},
			removeAttr: function(attr) {
				for (var i = 0; i < this.length; i++) this[i].removeAttribute(attr);
				return this;
			},
			data: function(key, value) {
				if (typeof value === "undefined") if (this[0]) {
					var dataKey = this[0].getAttribute("data-" + key);
					if (dataKey) return dataKey;
					else if (this[0].dom7ElementDataStorage && key in this[0].dom7ElementDataStorage) return this[0].dom7ElementDataStorage[key];
					else return void 0;
				} else return void 0;
				else {
					for (var i = 0; i < this.length; i++) {
						var el = this[i];
						if (!el.dom7ElementDataStorage) el.dom7ElementDataStorage = {};
						el.dom7ElementDataStorage[key] = value;
					}
					return this;
				}
			},
			transform: function(transform) {
				for (var i = 0; i < this.length; i++) {
					var elStyle = this[i].style;
					elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
				}
				return this;
			},
			transition: function(duration) {
				if (typeof duration !== "string") duration = duration + "ms";
				for (var i = 0; i < this.length; i++) {
					var elStyle = this[i].style;
					elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
				}
				return this;
			},
			on: function(eventName, targetSelector, listener, capture) {
				function handleLiveEvent(e) {
					var target = e.target;
					if ($(target).is(targetSelector)) listener.call(target, e);
					else {
						var parents = $(target).parents();
						for (var k = 0; k < parents.length; k++) if ($(parents[k]).is(targetSelector)) listener.call(parents[k], e);
					}
				}
				var events = eventName.split(" ");
				var i, j;
				for (i = 0; i < this.length; i++) if (typeof targetSelector === "function" || targetSelector === false) {
					if (typeof targetSelector === "function") {
						listener = arguments[1];
						capture = arguments[2] || false;
					}
					for (j = 0; j < events.length; j++) this[i].addEventListener(events[j], listener, capture);
				} else for (j = 0; j < events.length; j++) {
					if (!this[i].dom7LiveListeners) this[i].dom7LiveListeners = [];
					this[i].dom7LiveListeners.push({
						listener,
						liveListener: handleLiveEvent
					});
					this[i].addEventListener(events[j], handleLiveEvent, capture);
				}
				return this;
			},
			off: function(eventName, targetSelector, listener, capture) {
				var events = eventName.split(" ");
				for (var i = 0; i < events.length; i++) for (var j = 0; j < this.length; j++) if (typeof targetSelector === "function" || targetSelector === false) {
					if (typeof targetSelector === "function") {
						listener = arguments[1];
						capture = arguments[2] || false;
					}
					this[j].removeEventListener(events[i], listener, capture);
				} else if (this[j].dom7LiveListeners) {
					for (var k = 0; k < this[j].dom7LiveListeners.length; k++) if (this[j].dom7LiveListeners[k].listener === listener) this[j].removeEventListener(events[i], this[j].dom7LiveListeners[k].liveListener, capture);
				}
				return this;
			},
			once: function(eventName, targetSelector, listener, capture) {
				var dom = this;
				if (typeof targetSelector === "function") {
					targetSelector = false;
					listener = arguments[1];
					capture = arguments[2];
				}
				function proxy(e) {
					listener(e);
					dom.off(eventName, targetSelector, proxy, capture);
				}
				dom.on(eventName, targetSelector, proxy, capture);
			},
			trigger: function(eventName, eventData) {
				for (var i = 0; i < this.length; i++) {
					var evt;
					try {
						evt = new window.CustomEvent(eventName, {
							detail: eventData,
							bubbles: true,
							cancelable: true
						});
					} catch (e) {
						evt = document.createEvent("Event");
						evt.initEvent(eventName, true, true);
						evt.detail = eventData;
					}
					this[i].dispatchEvent(evt);
				}
				return this;
			},
			transitionEnd: function(callback) {
				var events = [
					"webkitTransitionEnd",
					"transitionend",
					"oTransitionEnd",
					"MSTransitionEnd",
					"msTransitionEnd"
				], i, dom = this;
				function fireCallBack(e) {
					if (e.target !== this) return;
					callback.call(this, e);
					for (i = 0; i < events.length; i++) dom.off(events[i], fireCallBack);
				}
				if (callback) for (i = 0; i < events.length; i++) dom.on(events[i], fireCallBack);
				return this;
			},
			width: function() {
				if (this[0] === window) return window.innerWidth;
				else if (this.length > 0) return parseFloat(this.css("width"));
				else return null;
			},
			outerWidth: function(includeMargins) {
				if (this.length > 0) if (includeMargins) return this[0].offsetWidth + parseFloat(this.css("margin-right")) + parseFloat(this.css("margin-left"));
				else return this[0].offsetWidth;
				else return null;
			},
			height: function() {
				if (this[0] === window) return window.innerHeight;
				else if (this.length > 0) return parseFloat(this.css("height"));
				else return null;
			},
			outerHeight: function(includeMargins) {
				if (this.length > 0) if (includeMargins) return this[0].offsetHeight + parseFloat(this.css("margin-top")) + parseFloat(this.css("margin-bottom"));
				else return this[0].offsetHeight;
				else return null;
			},
			offset: function() {
				if (this.length > 0) {
					var el = this[0];
					var box = el.getBoundingClientRect();
					var body = document.body;
					var clientTop = el.clientTop || body.clientTop || 0;
					var clientLeft = el.clientLeft || body.clientLeft || 0;
					var scrollTop = window.pageYOffset || el.scrollTop;
					var scrollLeft = window.pageXOffset || el.scrollLeft;
					return {
						top: box.top + scrollTop - clientTop,
						left: box.left + scrollLeft - clientLeft
					};
				} else return null;
			},
			css: function(props, value) {
				var i;
				if (arguments.length === 1) if (typeof props === "string") {
					if (this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(props);
				} else {
					for (i = 0; i < this.length; i++) for (var prop in props) this[i].style[prop] = props[prop];
					return this;
				}
				if (arguments.length === 2 && typeof props === "string") {
					for (i = 0; i < this.length; i++) this[i].style[props] = value;
					return this;
				}
				return this;
			},
			each: function(callback) {
				for (var i = 0; i < this.length; i++) callback.call(this[i], i, this[i]);
				return this;
			},
			html: function(html) {
				if (typeof html === "undefined") return this[0] ? this[0].innerHTML : void 0;
				else {
					for (var i = 0; i < this.length; i++) this[i].innerHTML = html;
					return this;
				}
			},
			text: function(text) {
				if (typeof text === "undefined") if (this[0]) return this[0].textContent.trim();
				else return null;
				else {
					for (var i = 0; i < this.length; i++) this[i].textContent = text;
					return this;
				}
			},
			is: function(selector) {
				if (!this[0]) return false;
				var compareWith, i;
				if (typeof selector === "string") {
					var el = this[0];
					if (el === document) return selector === document;
					if (el === window) return selector === window;
					if (el.matches) return el.matches(selector);
					else if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);
					else if (el.mozMatchesSelector) return el.mozMatchesSelector(selector);
					else if (el.msMatchesSelector) return el.msMatchesSelector(selector);
					else {
						compareWith = $(selector);
						for (i = 0; i < compareWith.length; i++) if (compareWith[i] === this[0]) return true;
						return false;
					}
				} else if (selector === document) return this[0] === document;
				else if (selector === window) return this[0] === window;
				else {
					if (selector.nodeType || selector instanceof Dom7) {
						compareWith = selector.nodeType ? [selector] : selector;
						for (i = 0; i < compareWith.length; i++) if (compareWith[i] === this[0]) return true;
						return false;
					}
					return false;
				}
			},
			index: function() {
				if (this[0]) {
					var child = this[0];
					var i = 0;
					while ((child = child.previousSibling) !== null) if (child.nodeType === 1) i++;
					return i;
				} else return void 0;
			},
			eq: function(index) {
				if (typeof index === "undefined") return this;
				var length = this.length;
				var returnIndex;
				if (index > length - 1) return new Dom7([]);
				if (index < 0) {
					returnIndex = length + index;
					if (returnIndex < 0) return new Dom7([]);
					else return new Dom7([this[returnIndex]]);
				}
				return new Dom7([this[index]]);
			},
			append: function(newChild) {
				var i, j;
				for (i = 0; i < this.length; i++) if (typeof newChild === "string") {
					var tempDiv = document.createElement("div");
					tempDiv.innerHTML = newChild;
					while (tempDiv.firstChild) this[i].appendChild(tempDiv.firstChild);
				} else if (newChild instanceof Dom7) for (j = 0; j < newChild.length; j++) this[i].appendChild(newChild[j]);
				else this[i].appendChild(newChild);
				return this;
			},
			prepend: function(newChild) {
				var i, j;
				for (i = 0; i < this.length; i++) if (typeof newChild === "string") {
					var tempDiv = document.createElement("div");
					tempDiv.innerHTML = newChild;
					for (j = tempDiv.childNodes.length - 1; j >= 0; j--) this[i].insertBefore(tempDiv.childNodes[j], this[i].childNodes[0]);
				} else if (newChild instanceof Dom7) for (j = 0; j < newChild.length; j++) this[i].insertBefore(newChild[j], this[i].childNodes[0]);
				else this[i].insertBefore(newChild, this[i].childNodes[0]);
				return this;
			},
			insertBefore: function(selector) {
				var before = $(selector);
				for (var i = 0; i < this.length; i++) if (before.length === 1) before[0].parentNode.insertBefore(this[i], before[0]);
				else if (before.length > 1) for (var j = 0; j < before.length; j++) before[j].parentNode.insertBefore(this[i].cloneNode(true), before[j]);
			},
			insertAfter: function(selector) {
				var after = $(selector);
				for (var i = 0; i < this.length; i++) if (after.length === 1) after[0].parentNode.insertBefore(this[i], after[0].nextSibling);
				else if (after.length > 1) for (var j = 0; j < after.length; j++) after[j].parentNode.insertBefore(this[i].cloneNode(true), after[j].nextSibling);
			},
			next: function(selector) {
				if (this.length > 0) if (selector) if (this[0].nextElementSibling && $(this[0].nextElementSibling).is(selector)) return new Dom7([this[0].nextElementSibling]);
				else return new Dom7([]);
				else if (this[0].nextElementSibling) return new Dom7([this[0].nextElementSibling]);
				else return new Dom7([]);
				else return new Dom7([]);
			},
			nextAll: function(selector) {
				var nextEls = [];
				var el = this[0];
				if (!el) return new Dom7([]);
				while (el.nextElementSibling) {
					var next = el.nextElementSibling;
					if (selector) {
						if ($(next).is(selector)) nextEls.push(next);
					} else nextEls.push(next);
					el = next;
				}
				return new Dom7(nextEls);
			},
			prev: function(selector) {
				if (this.length > 0) if (selector) if (this[0].previousElementSibling && $(this[0].previousElementSibling).is(selector)) return new Dom7([this[0].previousElementSibling]);
				else return new Dom7([]);
				else if (this[0].previousElementSibling) return new Dom7([this[0].previousElementSibling]);
				else return new Dom7([]);
				else return new Dom7([]);
			},
			prevAll: function(selector) {
				var prevEls = [];
				var el = this[0];
				if (!el) return new Dom7([]);
				while (el.previousElementSibling) {
					var prev = el.previousElementSibling;
					if (selector) {
						if ($(prev).is(selector)) prevEls.push(prev);
					} else prevEls.push(prev);
					el = prev;
				}
				return new Dom7(prevEls);
			},
			parent: function(selector) {
				var parents = [];
				for (var i = 0; i < this.length; i++) if (selector) {
					if ($(this[i].parentNode).is(selector)) parents.push(this[i].parentNode);
				} else parents.push(this[i].parentNode);
				return $($.unique(parents));
			},
			parents: function(selector) {
				var parents = [];
				for (var i = 0; i < this.length; i++) {
					var parent = this[i].parentNode;
					while (parent) {
						if (selector) {
							if ($(parent).is(selector)) parents.push(parent);
						} else parents.push(parent);
						parent = parent.parentNode;
					}
				}
				return $($.unique(parents));
			},
			find: function(selector) {
				var foundElements = [];
				for (var i = 0; i < this.length; i++) {
					var found = this[i].querySelectorAll(selector);
					for (var j = 0; j < found.length; j++) foundElements.push(found[j]);
				}
				return new Dom7(foundElements);
			},
			children: function(selector) {
				var children = [];
				for (var i = 0; i < this.length; i++) {
					var childNodes = this[i].childNodes;
					for (var j = 0; j < childNodes.length; j++) if (!selector) {
						if (childNodes[j].nodeType === 1) children.push(childNodes[j]);
					} else if (childNodes[j].nodeType === 1 && $(childNodes[j]).is(selector)) children.push(childNodes[j]);
				}
				return new Dom7($.unique(children));
			},
			remove: function() {
				for (var i = 0; i < this.length; i++) if (this[i].parentNode) this[i].parentNode.removeChild(this[i]);
				return this;
			},
			add: function() {
				var dom = this;
				var i, j;
				for (i = 0; i < arguments.length; i++) {
					var toAdd = $(arguments[i]);
					for (j = 0; j < toAdd.length; j++) {
						dom[dom.length] = toAdd[j];
						dom.length++;
					}
				}
				return dom;
			}
		};
		$.fn = Dom7.prototype;
		$.unique = function(arr) {
			var unique = [];
			for (var i = 0; i < arr.length; i++) if (unique.indexOf(arr[i]) === -1) unique.push(arr[i]);
			return unique;
		};
		return $;
	})();
	var swiperDomPlugins = [
		"jQuery",
		"Zepto",
		"Dom7"
	];
	for (var i = 0; i < swiperDomPlugins.length; i++) if (window[swiperDomPlugins[i]]) addLibraryPlugin(window[swiperDomPlugins[i]]);
	var domLib;
	if (typeof Dom7 === "undefined") domLib = window.Dom7 || window.Zepto || window.jQuery;
	else domLib = Dom7;
	function addLibraryPlugin(lib) {
		lib.fn.swiper = function(params) {
			var firstInstance;
			lib(this).each(function() {
				var s = new Swiper(this, params);
				if (!firstInstance) firstInstance = s;
			});
			return firstInstance;
		};
	}
	if (domLib) {
		if (!("transitionEnd" in domLib.fn)) domLib.fn.transitionEnd = function(callback) {
			var events = [
				"webkitTransitionEnd",
				"transitionend",
				"oTransitionEnd",
				"MSTransitionEnd",
				"msTransitionEnd"
			], i, dom = this;
			function fireCallBack(e) {
				if (e.target !== this) return;
				callback.call(this, e);
				for (i = 0; i < events.length; i++) dom.off(events[i], fireCallBack);
			}
			if (callback) for (i = 0; i < events.length; i++) dom.on(events[i], fireCallBack);
			return this;
		};
		if (!("transform" in domLib.fn)) domLib.fn.transform = function(transform) {
			for (var i = 0; i < this.length; i++) {
				var elStyle = this[i].style;
				elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
			}
			return this;
		};
		if (!("transition" in domLib.fn)) domLib.fn.transition = function(duration) {
			if (typeof duration !== "string") duration = duration + "ms";
			for (var i = 0; i < this.length; i++) {
				var elStyle = this[i].style;
				elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
			}
			return this;
		};
		if (!("outerWidth" in domLib.fn)) domLib.fn.outerWidth = function(includeMargins) {
			if (this.length > 0) if (includeMargins) return this[0].offsetWidth + parseFloat(this.css("margin-right")) + parseFloat(this.css("margin-left"));
			else return this[0].offsetWidth;
			else return null;
		};
	}
	return Swiper;
})();
//#endregion
//#region src/common/components/swiper/swiper.vue
var _sfc_main$6 = {
	name: "swiper",
	props: { options: {
		type: Object,
		default() {
			return { autoplay: 3500 };
		}
	} },
	data() {
		return { defaultSwiperClasses: { wrapperClass: "swiper-wrapper" } };
	},
	mounted() {
		var mount = () => {
			if (!this.swiper) {
				var setClassName = false;
				for (let className in this.defaultSwiperClasses) if (this.defaultSwiperClasses.hasOwnProperty(className)) {
					if (this.options[className]) {
						setClassName = true;
						this.defaultSwiperClasses[className] = this.options[className];
					}
				}
				var mountInstance = () => {
					if (!this.options.loop) this.swiper = new swiper_default$1(this.$el, this.options);
					else setTimeout(() => {
						this.swiper = new swiper_default$1(this.$el, this.options);
						if (this.swiper.slides.length <= 3) this.swiper.lockSwipes();
					}, 520);
				};
				setClassName ? this.$nextTick(mountInstance) : mountInstance();
			}
		};
		this.options.notNextTick ? mount() : this.$nextTick(mount);
	},
	updated() {
		if (this.swiper) this.swiper.update();
	},
	unmounted() {
		if (this.swiper) {
			this.swiper.destroy();
			delete this.swiper;
		}
	}
};
function _sfc_ssrRender$6(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "swiper-container" }, _attrs))} data-v-c3aef57d>`);
	ssrRenderSlot(_ctx.$slots, "parallax-bg", {}, null, _push, _parent);
	_push(`<div class="${ssrRenderClass($data.defaultSwiperClasses.wrapperClass)}" data-v-c3aef57d>`);
	ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
	_push(`</div>`);
	ssrRenderSlot(_ctx.$slots, "pagination", {}, null, _push, _parent);
	ssrRenderSlot(_ctx.$slots, "button-prev", {}, null, _push, _parent);
	ssrRenderSlot(_ctx.$slots, "button-next", {}, null, _push, _parent);
	ssrRenderSlot(_ctx.$slots, "scrollbar", {}, null, _push, _parent);
	_push(`</div>`);
}
var _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/common/components/swiper/swiper.vue");
	return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
var swiper_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$6, [["ssrRender", _sfc_ssrRender$6], ["__scopeId", "data-v-c3aef57d"]]);
//#endregion
//#region src/common/components/swiper/slide.vue
var _sfc_main$5 = {
	name: "swiper-slide",
	data() {
		return { slideClass: "swiper-slide" };
	},
	ready() {
		this.update();
	},
	mounted() {
		this.update();
		if (this.$parent.options.slideClass) this.slideClass = this.$parent.options.slideClass;
	},
	updated() {
		this.update();
	},
	attached() {
		this.update();
	},
	methods: { update() {
		if (this.$parent && this.$parent.swiper && this.$parent.swiper.update) {
			this.$parent.swiper.update(true);
			if (this.$parent.options.loop) this.$parent.swiper.reLoop();
		}
	} }
};
function _sfc_ssrRender$5(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: $data.slideClass }, _attrs))}>`);
	ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
	_push(`</div>`);
}
var _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/common/components/swiper/slide.vue");
	return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
var slide_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$5, [["ssrRender", _sfc_ssrRender$5]]);
//#endregion
//#region src/common/components/swiper/index.js
/**
* Vue-awesome-swiper
* @author Surmon.me
*/
var swiper = swiper_default;
var swiperSlide = slide_default;
//#endregion
//#region src/common/components/movable-view/index.vue
var _sfc_main$4 = {
	name: "movable-view",
	props: {
		offsetLeft: {
			type: Number,
			default: 0
		},
		offsetTop: {
			type: Number,
			default: 0
		},
		active: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			touch: {
				startX1: 0,
				startX2: 0,
				startY1: 0,
				startY2: 0,
				moveX1: 0,
				moveX2: 0,
				moveY1: 0,
				moveY2: 0,
				endX: 0,
				endY: 0,
				startScale: 0,
				moveScale: 0,
				endScale: 1,
				timeStamp: 0,
				multiFinger: false
			},
			scale: 1,
			moveX: 0,
			moveY: 0,
			width: 0,
			areaWidth: 0,
			height: 0,
			areaHeight: 0,
			initX: 0,
			initY: 0,
			transition: "transform 0ms",
			isTouch: true,
			isEmit: false
		};
	},
	watch: { active(v) {
		v && this.initAreaSize();
	} },
	mounted() {
		if (this.active) this.initAreaSize();
	},
	computed: { moveStyle() {
		return {
			transition: `${this.transition}`,
			transform: `translate3d(${this.moveX + this.initX}px, ${this.moveY + this.initY}px, 0) scale3d(${this.scale}, ${this.scale}, ${this.scale})`
		};
	} },
	methods: {
		initAreaSize() {
			if (this.width === 0) {
				this.width = this.$refs.movableView.offsetWidth;
				this.height = this.$refs.movableView.scrollHeight;
				this.areaWidth = window.innerWidth;
				this.areaHeight = window.innerHeight;
				if (this.width < this.areaWidth) this.initX = (this.areaWidth - this.width) / 2;
				if (this.height < this.areaHeight) this.initY = (this.areaHeight - this.height) / 2;
			}
		},
		onResetTouch() {
			this.scale = 1;
			this.transition = "transform 0ms";
			this.moveX = 0;
			this.moveY = 0;
			this.touch.endScale = 1;
			this.touch.endX = 0;
			this.touch.endY = 0;
		},
		handleTouchStart(ev) {
			if (this.width === 0 || !this.isTouch) return false;
			this.isEmit = false;
			this.transition = "transform 0ms";
			this.touch.startX1 = ev.touches[0].pageX;
			this.touch.startY1 = ev.touches[0].pageY;
			if (ev.touches.length > 1) {
				this.touch.startX2 = ev.touches[1].pageX;
				this.touch.startY2 = ev.touches[1].pageY;
				this.touch.startScale = Math.sqrt(Math.pow(this.touch.startX2 - this.touch.startX1, 2) + Math.pow(this.touch.startY2 - this.touch.startY1, 2));
				ev.preventDefault();
				ev.stopPropagation();
			} else if (ev.touches.length === 1) this.touch.timeStamp = Date.now();
		},
		handelTouchMove(ev) {
			if (this.width === 0 || !this.isTouch) return false;
			this.touch.moveX1 = ev.touches[0].pageX;
			this.touch.moveY1 = ev.touches[0].pageY;
			if (ev.touches.length > 1) {
				this.touch.multiFinger = true;
				this.touch.moveX2 = ev.touches[1].pageX;
				this.touch.moveY2 = ev.touches[1].pageY;
				this.touch.moveScale = Math.sqrt(Math.pow(this.touch.moveX2 - this.touch.moveX1, 2) + Math.pow(this.touch.moveY2 - this.touch.moveY1, 2));
				this.scale = this.touch.endScale + (this.touch.moveScale - this.touch.startScale) / 200;
				this.scale = Math.min(3, Math.max(.3, this.scale));
				this.moveX = this.touch.endX - this.width * (this.scale - this.touch.endScale) / 2;
				this.moveY = this.touch.endY - this.height * (this.scale - this.touch.endScale) / 2;
				ev.preventDefault();
				ev.stopPropagation();
			} else if (!this.touch.multiFinger && ev.touches.length === 1) {
				const pageX = this.touch.moveX1 - this.touch.startX1;
				const pageY = this.touch.moveY1 - this.touch.startY1;
				this.moveX = pageX + this.touch.endX;
				this.moveY = pageY + this.touch.endY;
				this.transition = "transform 0ms";
				const maxWidth = this.width * this.scale - this.areaWidth;
				const maxHeight = this.height * this.scale - this.areaHeight;
				if (maxWidth <= 0) this.moveX = 0;
				if (maxHeight <= 0) this.moveY = -maxHeight / 2 - this.initY;
				if (this.moveX === 0) {
					if (Math.abs(pageX) > Math.abs(pageY)) return false;
				}
				if (this.moveX !== 0 || this.moveY !== 0) {
					if (this.moveX > 50 || this.moveX + 50 < -maxWidth) {
						if (!this.isEmit) {
							this.isEmit = true;
							this.$emit("touch", ev);
						}
						this.moveX = Math.min(50, Math.max(-maxWidth - 50, this.moveX));
						return false;
					}
					ev.preventDefault();
					ev.stopPropagation();
				}
			}
		},
		handleTouchEnd(ev) {
			if (this.width === 0 || !this.isTouch) return false;
			this.isTouch = false;
			if (this.touch.multiFinger) {
				this.transition = "transform 300ms";
				if (this.scale < 1) {
					this.scale = 1;
					this.moveX = 0;
					this.moveY = 0;
				} else {
					const maxWidth = this.width * this.scale - this.areaWidth;
					const maxHeight = this.height * this.scale - this.areaHeight;
					this.moveX = Math.min(-this.initX, Math.max(-maxWidth - this.initX, this.moveX));
					if (maxHeight <= 0) this.moveY = -maxHeight / 2 - this.initY;
					else this.moveY = Math.min(-this.initY, Math.max(-maxHeight - this.initY, this.moveY));
				}
			} else if (this.touch.timeStamp !== 0) {
				const mod = Date.now() - this.touch.timeStamp;
				const pageX = ev.changedTouches[0].pageX;
				const pageY = ev.changedTouches[0].pageY;
				const distanceX = pageX - this.touch.startX1;
				const distanceY = pageY - this.touch.startY1;
				const maxWidth = this.width * this.scale - this.areaWidth;
				const maxHeight = this.height * this.scale - this.areaHeight;
				const speedX = distanceX / mod * 200;
				const speedY = distanceY / mod * 200;
				this.transition = "transform 500ms cubic-bezier(0.1, 0.57, 0.1, 1)";
				if (this.moveX !== 0) {
					this.moveX += speedX;
					this.moveX = Math.min(-this.initX, Math.max(-maxWidth - this.initX, this.moveX));
				}
				if (maxHeight <= 0) this.moveY = -maxHeight / 2 - this.initY;
				else {
					this.moveY += speedY;
					this.moveY = Math.min(-this.initY, Math.max(-maxHeight - this.initY, this.moveY));
				}
				const x = Math.abs(this.touch.startX1 - pageX) < 5;
				const y = Math.abs(this.touch.startY1 - pageY) < 5;
				this.touch.timeStamp = 0;
				this.touch.startX1 = 0;
				this.touch.startY1 = 0;
				if (mod < 200 && x && y) this.$emit("select", {
					pageX,
					pageY
				});
			}
			this.touch.endScale = this.scale;
			this.touch.endX = this.moveX;
			this.touch.endY = this.moveY;
			this.touch.multiFinger = false;
			setTimeout(() => {
				this.isTouch = true;
			}, 50);
		}
	}
};
function _sfc_ssrRender$4(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: ["m-movable-area", { done: this.width > 0 }] }, _attrs))} data-v-0b8c1d03><div style="${ssrRenderStyle($options.moveStyle)}" class="movable-view" data-v-0b8c1d03>`);
	ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
	_push(`</div></div>`);
}
var _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/common/components/movable-view/index.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
//#endregion
//#region src/common/plugin/preview-media/preview.vue
var _sfc_main$3 = {
	name: "preview",
	components: {
		swiper,
		swiperSlide,
		movableView: /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$4, [["ssrRender", _sfc_ssrRender$4], ["__scopeId", "data-v-0b8c1d03"]])
	},
	props: {
		sources: {
			type: Array,
			default() {
				return [];
			}
		},
		current: Number
	},
	data() {
		return {
			selected: this.current + 1,
			prev: null,
			options: {
				initialSlide: this.current,
				onSlideChangeStart: ({ realIndex }) => {
					this.prev = this.selected - 1;
					this.selected = realIndex + 1;
				},
				onSlideChangeEnd: () => {
					if (this.prev !== null) this.$refs[`movable${this.prev}`]?.[0]?.onResetTouch();
				}
			}
		};
	},
	methods: {
		handleClose() {
			this.$event.emit("close");
		},
		handleError(url, ev) {
			const webp = getWebpImg(url);
			if (webp) ev.target.src = webp;
		},
		handleLoad(index) {
			this.$nextTick(() => {
				this.$refs[`movable${index}`]?.[0]?.initAreaSize();
			});
		},
		handleTouch(ev) {
			const swipe = this.$refs.swipe.$el;
			const touch = ev.touches[0];
			var clickEvent = new TouchEvent("touchstart", {
				touches: [touch],
				changedTouches: [touch],
				targetTouches: [touch],
				target: swipe
			});
			swipe.dispatchEvent(clickEvent);
		}
	}
};
function _sfc_ssrRender$3(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_swiper = resolveComponent("swiper");
	const _component_swiper_slide = resolveComponent("swiper-slide");
	const _component_movable_view = resolveComponent("movable-view");
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "m-preview-media" }, _attrs))} data-v-d5f78d70>`);
	_push(ssrRenderComponent(_component_swiper, {
		ref: "swipe",
		options: $data.options,
		class: "preview-media-swiper"
	}, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(`<!--[-->`);
				ssrRenderList($props.sources, (item, index) => {
					_push(ssrRenderComponent(_component_swiper_slide, {
						class: "flex-center",
						key: index
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) if (item.type === "video") _push(`<video class="media-item"${ssrRenderAttr("src", item.url)}${ssrRenderAttr("poster", item.poster)}${ssrRenderAttr("initial-time", 0)}${ssrIncludeBooleanAttr(true) ? " controls" : ""}${ssrIncludeBooleanAttr(false) ? " autoplay" : ""}${ssrIncludeBooleanAttr(false) ? " loop" : ""}${ssrIncludeBooleanAttr(false) ? " muted" : ""} data-v-d5f78d70${_scopeId}></video>`);
							else _push(ssrRenderComponent(_component_movable_view, {
								class: "image-wrap",
								onTouch: $options.handleTouch,
								ref_for: true,
								ref: `movable${index}`
							}, {
								default: withCtx((_, _push, _parent, _scopeId) => {
									if (_push) _push(`<img alt="" class="media-item"${ssrRenderAttr("src", item.url)} data-v-d5f78d70${_scopeId}>`);
									else return [createVNode("img", {
										alt: "",
										class: "media-item",
										onLoad: ($event) => $options.handleLoad(index),
										onError: ($event) => $options.handleError(item.url, $event),
										src: item.url
									}, null, 40, [
										"onLoad",
										"onError",
										"src"
									])];
								}),
								_: 2
							}, _parent, _scopeId));
							else return [item.type === "video" ? (openBlock(), createBlock("video", {
								key: 0,
								onClick: withModifiers(() => {}, ["stop"]),
								class: "media-item",
								src: item.url,
								poster: item.poster,
								"initial-time": 0,
								controls: true,
								autoplay: false,
								loop: false,
								muted: false
							}, null, 8, [
								"onClick",
								"src",
								"poster"
							])) : (openBlock(), createBlock(_component_movable_view, {
								key: 1,
								class: "image-wrap",
								onTouch: $options.handleTouch,
								ref_for: true,
								ref: `movable${index}`
							}, {
								default: withCtx(() => [createVNode("img", {
									alt: "",
									class: "media-item",
									onLoad: ($event) => $options.handleLoad(index),
									onError: ($event) => $options.handleError(item.url, $event),
									src: item.url
								}, null, 40, [
									"onLoad",
									"onError",
									"src"
								])]),
								_: 2
							}, 1032, ["onTouch"]))];
						}),
						_: 2
					}, _parent, _scopeId));
				});
				_push(`<!--]-->`);
			} else return [(openBlock(true), createBlock(Fragment, null, renderList($props.sources, (item, index) => {
				return openBlock(), createBlock(_component_swiper_slide, {
					class: "flex-center",
					key: index
				}, {
					default: withCtx(() => [item.type === "video" ? (openBlock(), createBlock("video", {
						key: 0,
						onClick: withModifiers(() => {}, ["stop"]),
						class: "media-item",
						src: item.url,
						poster: item.poster,
						"initial-time": 0,
						controls: true,
						autoplay: false,
						loop: false,
						muted: false
					}, null, 8, [
						"onClick",
						"src",
						"poster"
					])) : (openBlock(), createBlock(_component_movable_view, {
						key: 1,
						class: "image-wrap",
						onTouch: $options.handleTouch,
						ref_for: true,
						ref: `movable${index}`
					}, {
						default: withCtx(() => [createVNode("img", {
							alt: "",
							class: "media-item",
							onLoad: ($event) => $options.handleLoad(index),
							onError: ($event) => $options.handleError(item.url, $event),
							src: item.url
						}, null, 40, [
							"onLoad",
							"onError",
							"src"
						])]),
						_: 2
					}, 1032, ["onTouch"]))]),
					_: 2
				}, 1024);
			}), 128))];
		}),
		_: 1
	}, _parent));
	if ($props.sources.length > 1) _push(`<div class="progress oswald-light" data-v-d5f78d70>${ssrInterpolate($data.selected)}  /  ${ssrInterpolate($props.sources.length)}</div>`);
	else _push(`<!---->`);
	_push(`<div class="close flex-center" data-v-d5f78d70><i class="iconfont icon-close-full" data-v-d5f78d70></i></div></div>`);
}
var _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/common/plugin/preview-media/preview.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var preview_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$3, [["ssrRender", _sfc_ssrRender$3], ["__scopeId", "data-v-d5f78d70"]]);
//#endregion
//#region src/common/plugin/preview-media/index.js
/********************
* 使用方式 支持以下三种传参方式
* this.$preview.media(
* {sources: [{url: 'xxxxx', type: 'video', poster: ''}, {url: 'xxxxx', type: 'image'}], current: 0})
*/
preview_default.install = (app) => {
	let _media = null;
	const previewInfo = {
		media: ({ sources, current }) => {
			_media = $layer.popup({
				autoHide: false,
				top: 0,
				left: 0,
				animate: { name: "fade" },
				overlay: { opacity: 1 }
			});
			_media.show();
			_media.$event.once("show", () => {
				_media.loader(preview_default, {
					sources,
					current
				});
			});
			_media.$event.once("close", previewInfo.hide);
		},
		hide: () => {
			_media && _media.hide(_media.destroy);
			_media = null;
		}
	};
	app.config.globalProperties.$preview = previewInfo;
};
var preview_media_default = preview_default;
//#endregion
//#region src/lib/dom/matches.js
/**
* 判断当前节点是否匹配查询规则
*/
function matches_default(node, selector) {
	if (node.nodeType !== 1) return false;
	let p = Element.prototype;
	return (p.matches || p.webkitMatchesSelector || function(s) {
		return Array.from(document.querySelectorAll(s)).indexOf(this) !== -1;
	}).call(node, selector);
}
//#endregion
//#region src/lib/dom/closest.js
/*************
* 向上查找某个节点
* node: 当前节点
* selector: 选择器名称
* box: 在哪个节点范围内
*/
function closest_default(node, selector, box) {
	let result = null;
	box = box || document.body;
	if (node.closest) {
		result = node.closest(selector);
		if (result === null || !contains_default(box, result)) return null;
		return result;
	}
	while (node && node !== box && node.nodeType === 1) {
		if (matches_default(node, selector)) return node;
		node = node.parentNode;
	}
	return null;
}
//#endregion
//#region src/common/directives/href.js
var _vHrefList = {};
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
if (env_default.isClient()) {
	document.body.addEventListener("click", bodyClickJump, false);
	clientRouter.afterEach((to) => {
		Object.keys(_vHrefList).forEach((k) => {
			const obj = _vHrefList[k];
			if (obj.stop) if (to.matched[0].path === obj.page) obj.el.addEventListener("click", bodyClickJump);
			else obj.el.removeEventListener("click", bodyClickJump);
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
		obj.path = res || "";
		if (isNumber(res)) obj.type = "go";
	}
	if (obj.type !== "go" && obj.path.indexOf("http") === 0) obj.type = "http";
	const isExclude = ![
		"go",
		"http",
		"report"
	].includes(obj.type);
	if (isExclude && obj.path.substr(0, 1) !== "/") obj.path = "/" + obj.path;
	if (isExclude) {
		const qs = obj.path.split("?");
		obj.query = Object.assign(obj.query, query_default.parse(qs[1]) || {});
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
	if (obj.type === "post") {
		if (window.top !== window.self) {
			window.top?.postMessage({
				options: obj.post,
				type: "push"
			}, "*");
			return false;
		}
		obj.type = "push";
	}
	if (obj.verify && !isLogin() || obj.login) {
		if (!location.pathname.includes("/login")) return toLogin();
	} else if (obj.type === "push") if (obj.refresh && location.pathname === obj.path) $broadcast.emit("refresh");
	else clientRouter.push({
		path: obj.path,
		query: obj.query
	});
	else if (obj.type === "replace") clientRouter.replace({
		path: obj.path,
		query: obj.query
	});
	else if (obj.type === "go") clientRouter.go(obj.path);
	else if (obj.type === "http") window.open(query_default.url(obj.path, obj.query));
}
var _bindMap = {
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
	if (_bindMap.node === node) return _bindMap.obj;
	let key = node.dataset.vkey;
	let report = node.dataset.report;
	let post = node.dataset.post;
	if (!key) {
		const rNode = closest_default(node, "[data-vkey]");
		if (rNode) {
			key = rNode.dataset.vkey;
			report = rNode.dataset.report;
			post = rNode.dataset.post;
		}
	}
	let obj = _vHrefList[key];
	if (obj) {
		obj = {
			...obj,
			report,
			post
		};
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
	if (!obj) return;
	ev.stopPropagation();
	if (obj.lazy) setTimeout(() => {
		_assign(obj);
	}, 20);
	else _assign(obj);
}
function _createHref(el, binding, res) {
	const key = getUniqueId();
	const obj = {
		lazy: binding.modifiers.lazy,
		verify: binding.modifiers.verify,
		login: binding.modifiers.login,
		refresh: binding.modifiers.refresh,
		query: {},
		type: "push"
	};
	if (binding.modifiers.replace) obj.type = "replace";
	else if (binding.modifiers.report) obj.type = "report";
	else if (binding.modifiers.post) obj.type = "post";
	_changeHref(res, obj);
	_vHrefList[key] = obj;
	el.dataset.vkey = key;
	if (binding.modifiers.stop) {
		console.log(clientRouter.currentRoute);
		_vHrefList[key].page = clientRouter.currentRoute._value.matched[0].path;
		_vHrefList[key].stop = true;
		_vHrefList[key].el = el;
		el.addEventListener("click", bodyClickJump);
	}
	return obj;
}
var href_default = env_default.isServer() ? {} : {
	created(el, binding) {
		const res = binding.value;
		if ((res === "" || isUndefined(res)) && !binding.modifiers.login) return;
		_createHref(el, binding, res);
	},
	beforeMount(el, binding, vnode, prevVnode) {},
	mounted(el, binding, vnode, prevVnode) {},
	beforeUpdate(el, binding, vnode, prevVnode) {},
	updated(el, binding) {
		const res = binding.value;
		const key = el.dataset.vkey;
		if ((res === "" || isUndefined(res)) && !binding.modifiers.login) {
			delete _vHrefList[key];
			return;
		}
		const obj = _vHrefList[key];
		if (obj) _changeHref(res, obj);
		else _createHref(el, binding, res);
	},
	beforeUnmount(el, binding, vnode, prevVnode) {},
	unmounted(el, binding, vnode, prevVnode) {}
};
//#endregion
//#region src/common/directives/hover.js
/*********
* 添加指命，完成触摸添加cls，离开去除cls，解决点击效果问题
* @type {{}}
* @private
*/
var _hoverList = {};
(function(isClient) {
	if (isClient) {
		document.body.addEventListener("touchstart", _bodyTouchStart, false);
		document.body.addEventListener("touchmove", _bodyMoveEnd, false);
		document.body.addEventListener("touchend", _bodyTouchEnd, false);
	}
})(env_default.isClient());
var _node = null, _cls = null, _option = null, _timer = null;
function _bodyTouchStart(ev) {
	_node = null;
	_cls = null;
	if (ev.touches.length > 1) return;
	let el = ev.target;
	let key = el.dataset.hkey;
	if (!key) {
		const node = closest_default(ev.target, "[data-hkey]");
		if (node) {
			el = node;
			key = node.dataset.hkey;
		}
	}
	const cls = _hoverList[key];
	if (cls) {
		_node = el;
		_cls = cls;
		_option = {
			pageX: ev.touches[0].pageX,
			pageY: ev.touches[0].pageY
		};
		if (!el.classList.contains(cls)) el.classList.add(cls);
		_timer = setTimeout(() => {
			_bodyTouchEnd();
		}, 1200);
	}
}
function _bodyMoveEnd(ev) {
	if (_option) {
		const x = ev.touches[0].pageX;
		const y = ev.touches[0].pageY;
		if (Math.abs(x - _option.pageX) >= 10 || Math.abs(y - _option.pageY) >= 10) {
			if (_node && _cls) {
				_node.classList.remove(_cls);
				_node = null;
				_cls = null;
			}
			_option = null;
		}
		clearTimeout(_timer);
	}
}
function _bodyTouchEnd() {
	if (_node && _cls) {
		_node.classList.remove(_cls);
		_node = null;
		_cls = null;
		clearTimeout(_timer);
	}
}
var hover_default = {
	created(el, binding) {
		const val = binding.value;
		if (val === "") return;
		const key = getUniqueId();
		_hoverList[key] = val;
		el.dataset.hkey = key;
	},
	update(el, binding) {
		const val = binding.value;
		const key = el.dataset.hkey;
		if (val === "") {
			delete _hoverList[key];
			return;
		}
		_hoverList[key] = val;
	}
};
//#endregion
//#region src/common/components/button/index.vue
var _sfc_main$2 = {
	name: "n-button",
	props: {
		round: {
			type: Boolean,
			default: false
		},
		type: {
			type: String,
			default: "primary"
		},
		color: String,
		disabled: {
			type: Boolean,
			default: false
		},
		loading: {
			type: Boolean,
			default: false
		},
		loadingText: {
			type: String,
			default: ""
		},
		size: {
			type: String,
			default: "medium"
		},
		stop: {
			type: Boolean,
			default: false
		},
		theme: {
			type: String,
			default: "white"
		},
		id: {
			type: String,
			default: ""
		},
		reportId: {
			type: String,
			default: ""
		}
	},
	data() {
		return { fnLoading: false };
	},
	computed: {
		realType() {
			return this.type || "primary";
		},
		getLoading() {
			return this.loading || this.fnLoading;
		},
		btnStyle() {
			if (this.color) return { backgroundColor: this.color };
			return null;
		}
	},
	methods: {
		/*******
		* 设置loading状态
		*/
		setLoading(bool) {
			this.fnLoading = !!bool;
		},
		/**
		* @description: 点击事件
		* @param e {Object} 事件类
		*/
		tapHandler(e) {
			if (this.disabled) this.$emit("disabled");
			else if (!this.disabled && !this.getLoading) this.$emit("tap", {
				loading: this.setLoading,
				event: e
			});
			this.stop && e.stopPropagation();
		}
	},
	mounted() {
		if (this.id && this.$refs[this.id]) this.$refs[this.id].setAttribute("id", this.id);
	}
};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _directive_hover = resolveDirective("hover");
	_push(`<div${ssrRenderAttrs(mergeProps({
		ref: $props.id,
		id: $props.id,
		"report-id": $props.reportId,
		class: ["nl-button", [
			$options.realType,
			$props.size,
			$props.theme,
			{
				round: $props.round,
				loading: $props.loading,
				disabled: $props.disabled,
				color: $props.color
			}
		]],
		style: $options.btnStyle
	}, _attrs, ssrGetDirectiveProps(_ctx, _directive_hover, "hover")))} data-v-4507a2e0>`);
	if ($options.getLoading) {
		_push(`<!--[-->`);
		if ($props.loadingText) _push(`<span class="nl-button-text" data-v-4507a2e0>${ssrInterpolate($props.loadingText)}</span>`);
		else {
			_push(`<span class="nl-button-text" data-v-4507a2e0>`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(` ... </span>`);
		}
		_push(`<!--]-->`);
	} else {
		_push(`<span class="nl-button-text" data-v-4507a2e0>`);
		ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
		_push(`</span>`);
	}
	_push(`</div>`);
}
var _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/common/components/button/index.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var button_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$2, [["ssrRender", _sfc_ssrRender$2], ["__scopeId", "data-v-4507a2e0"]]);
//#endregion
//#region src/common/components/checkbox/checkbox.vue
var _sfc_main$1 = {
	name: "n-checkbox",
	props: {
		disabled: {
			type: Boolean,
			default: false
		},
		checked: {
			type: Boolean,
			default: false
		},
		defaultChecked: {
			type: Boolean,
			default: false
		},
		autoFocus: {
			type: Boolean,
			default: false
		},
		value: void 0
	},
	data() {
		return {};
	},
	computed: {},
	methods: { clickHandler() {
		if (this.disabled) return;
	} }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _directive_hover = resolveDirective("hover");
	_push(`<div${ssrRenderAttrs(mergeProps({ class: ["nl-checkbox", {
		disabled: $props.disabled,
		checked: $props.checked
	}] }, _attrs, ssrGetDirectiveProps(_ctx, _directive_hover, "hover")))} data-v-f48cdeb6><i class="${ssrRenderClass([`icon-${$props.checked ? "rect-check" : "rect-nocheck"}`, "iconfont"])}" data-v-f48cdeb6></i></div>`);
}
var _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/common/components/checkbox/checkbox.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var checkbox_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-f48cdeb6"]]);
//#endregion
//#region src/common/components/radio/radio.vue
var _sfc_main = {
	name: "n-radio",
	props: {
		disabled: {
			type: Boolean,
			default: false
		},
		checked: {
			type: Boolean,
			default: false
		},
		defaultChecked: {
			type: Boolean,
			default: false
		},
		value: void 0,
		autoFocus: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {};
	},
	computed: {},
	methods: { clickHandler() {
		if (this.disabled) return;
		this.$emit("change", this.value);
	} }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _directive_hover = resolveDirective("hover");
	_push(`<div${ssrRenderAttrs(mergeProps({ class: ["nl-radio", {
		disabled: $props.disabled,
		checked: $props.checked
	}] }, _attrs, ssrGetDirectiveProps(_ctx, _directive_hover, "hover")))} data-v-ca5f6d01><i class="${ssrRenderClass([`icon-${$props.checked ? "circle-check" : "circle-nocheck"}`, "iconfont"])}" data-v-ca5f6d01></i></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/common/components/radio/radio.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var radio_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-ca5f6d01"]]);
//#endregion
//#region src/views/app/main.js
function _createApp({ router, store }) {
	const app = createSSRApp(_sfc_main$14);
	app.use(router).use(store).use(global_properties_default).use(preview_media_default);
	app.directive("href", href_default);
	app.directive("hover", hover_default);
	app.component("n-button", button_default);
	app.component("n-checkbox", checkbox_default);
	app.component("n-radio", radio_default);
	return { app };
}
//#endregion
//#region src/views/app/entry-server.js
/**
* @param {string} _url
*/
async function render(_url) {
	const router = _createRouter();
	const store = _createStore();
	const { app } = _createApp({
		router,
		store
	});
	await router.push(_url === "/" ? "/index" : _url);
	await router.isReady();
	return {
		html: await renderToString(app, {}),
		state: store.state
	};
}
//#endregion
export { SMS_CODE_TYPE as a, isArray as c, isUndefined as d, toHome as i, isObject as l, getImageBase64 as n, SYSTEM_USER_PLATFORM_VERSION as o, imageLoad as r, render, clone as s, _plugin_vue_export_helper_default as t, isString as u };
