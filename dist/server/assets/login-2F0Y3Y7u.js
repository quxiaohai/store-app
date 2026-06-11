import { a as SMS_CODE_TYPE, c as isArray, d as isUndefined, l as isObject, o as SYSTEM_USER_PLATFORM_VERSION, s as clone, t as _plugin_vue_export_helper_default, u as isString } from "../entry-server.js";
import { ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderSlot, ssrRenderStyle } from "vue/server-renderer";
import { createBlock, createCommentVNode, createTextVNode, createVNode, getCurrentInstance, mergeProps, openBlock, resolveComponent, useSSRContext, vModelText, withCtx, withDirectives, withModifiers } from "vue";
import Schema from "async-validator";
//#region src/lib/json/getLevelData.js
/***************
* 获取平层数据
* 例：
* import getLevelData from 'lib/json/getLevelData'
* let obj = {a: {b: {c: {d: [2, 3], e: 2}}}}
* getLevelData(obj) = {'a.b.c.d': [2, 3], 'a.b.c.e': 2};
* @param data
*/
function getLevelData_default(data) {
	const result = {};
	const formatFilterName = (name, val) => {
		if (isObject(val)) Object.keys(val).forEach((key) => {
			formatFilterName(`${name}.${key}`, val[key]);
		});
		else result[name] = val;
	};
	if (isObject(data)) {
		Object.keys(data).forEach((key) => {
			formatFilterName(key, data[key]);
		});
		return result;
	}
	return data;
}
//#endregion
//#region src/common/components/form-model/index.vue
var _sfc_main$5 = {
	name: "form-model",
	props: {
		model: {
			type: Object,
			required: true
		},
		rules: {
			type: Object,
			required: true
		},
		hintType: {
			type: String,
			default: "toast"
		},
		real: {
			type: Boolean,
			default: false
		}
	},
	provide() {
		return {
			formModel: this,
			model: this.model,
			rules: this.rules
		};
	},
	mounted() {
		this.currentInstance = getCurrentInstance();
	},
	updated() {
		this.currentInstance = getCurrentInstance();
	},
	methods: {
		fireChildChange(nodes, errors) {
			let isOver = false;
			let isScrollToTop = false;
			nodes.forEach((vNode) => {
				if (!isOver && isObject(vNode.type) && vNode.type?.name === "form-model-item") isOver = vNode.component?.proxy.onParentChange(errors);
				if (!isScrollToTop) {
					if (vNode?.props?.prop === errors[0]?.field) {
						window.scrollTo(0, vNode?.el?.offsetTop);
						isScrollToTop = true;
					}
				}
			});
		},
		getChildProp(nodes) {
			const props = [];
			nodes.forEach((vNode) => {
				if (isObject(vNode.type) && vNode.type?.name === "form-model-item") {
					const prop = vNode.props.prop;
					if (prop) props.push(prop);
				}
			});
			return props;
		},
		validate(callback, isNeedLevelData = true) {
			const valid = {};
			const rules = getLevelData_default(this.rules);
			const slotList = this.findSlotList(this.currentInstance?.subTree?.dynamicChildren[0]?.children, []);
			this.getChildProp(slotList).forEach((key) => {
				if (rules[key]) valid[key] = rules[key];
			});
			const model = isNeedLevelData ? getLevelData_default(this.model) : this.model;
			const validator = new Schema(valid);
			return new Promise((resolve) => {
				validator.validate(model, (errors) => {
					if (errors) {
						callback && callback(false);
						resolve(false);
						return this.fireChildChange(slotList, errors);
					}
					const result = clone(this.model);
					resolve(result);
					callback && callback(result);
				});
			});
		},
		findSlotList(children = [], result) {
			if (!children || !isArray(children)) return result || [];
			children.forEach((item) => {
				if (isObject(item.type) && item.type?.name === "form-model-item") result.push(item);
				else this.findSlotList(item.children, result);
			});
			return result;
		}
	}
};
function _sfc_ssrRender$5(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "m-form-model" }, _attrs))}>`);
	ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
	_push(`</div>`);
}
var _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/common/components/form-model/index.vue");
	return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
var form_model_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$5, [["ssrRender", _sfc_ssrRender$5]]);
//#endregion
//#region src/lib/json/filterData.js
/**
* 对数据进行过滤
* * 例子：
*
* import filterData from 'lib/json/filterData'
* let obj = {a: {b: {c: {d: [2, 3], e: 2}}}}
* filterData(obj, "a.b.c.d[1]");
* => 3
*/
function filterData_default(data, name) {
	if (!name || !isObject(data)) return data;
	const fd = Object.assign({}, data), filter = function(res, names) {
		let reg = /\[([\s\S]+?)\]/g, bool = false, stop = false;
		names.forEach((v) => {
			if (bool || stop) return false;
			const arr = [];
			v = v.replace(reg, function(a, b) {
				arr.push(b);
				return "";
			});
			res = res[v];
			stop = isUndefined(res);
			!stop && arr.forEach((val) => {
				if (bool) return false;
				res = res[val];
				bool = isUndefined(res);
			});
		});
		return res;
	};
	try {
		if (isArray(name)) return filter(fd, name);
		else if (isString(name)) {
			if (name.indexOf(",") > -1) {
				let obj = {}, bool = true;
				name.split(",").forEach((v) => {
					const result = filter(fd, v.split("."));
					if (!isUndefined(result)) {
						bool = false;
						obj = Object.assign(obj, result);
					}
				});
				return bool ? void 0 : obj;
			}
			return filter(fd, name.split("."));
		}
		return data;
	} catch (ex) {
		return;
	}
}
//#endregion
//#region src/common/components/form-model-item/index.vue
var _sfc_main$4 = {
	name: "form-model-item",
	props: { prop: String },
	inject: [
		"model",
		"rules",
		"formModel"
	],
	data() {
		return {
			value: null,
			showAni: false,
			showMsg: false,
			message: null
		};
	},
	watch: { prop() {
		this.initValid();
	} },
	mounted() {
		this.initModelWatch();
		this.initValid();
	},
	computed: { hintType() {
		return this.formModel.hintType;
	} },
	methods: {
		initModelWatch() {
			if (this.formModel.real) this.$watch("model", {
				deep: true,
				handler: () => {
					this.onFieldChange(true);
				}
			});
		},
		afterLeave() {
			this.showAni = false;
			this.message = null;
		},
		initValid() {
			if (!this.prop) {
				this.value = null;
				this.validator = null;
				this.showMsg = false;
				return false;
			}
			const valid = {};
			this.value = filterData_default(this.model, this.prop);
			valid[this.prop] = filterData_default(this.rules, this.prop);
			if (valid[this.prop]) this.validator = new Schema(valid);
		},
		onParentChange(errors) {
			const obj = errors.find((r) => r.field === this.prop);
			if (!obj) {
				this.showMsg = false;
				return false;
			}
			this.showAni = true;
			if (this.hintType === "text") this.$nextTick(() => {
				this.message = obj.message;
				this.showMsg = true;
			});
			else {
				this.$layer.toast(obj.message);
				setTimeout(() => {
					this.showAni = false;
				}, 300);
			}
			return true;
		},
		/***********
		* 显示错误信息
		* @param errorMsg 错误信息，默认为空
		*/
		onShowErrorMsg(errorMsg) {
			this.showAni = true;
			this.$nextTick(() => {
				this.message = errorMsg;
				this.showMsg = true;
			});
		},
		/*********
		* 验证model
		* @param isChange 是否监听值有变化，默认false
		* @returns {boolean}
		*/
		onFieldChange(isChange) {
			if (!this.prop || !this.validator) {
				this.showMsg = false;
				return false;
			}
			const nVal = filterData_default(this.model, this.prop);
			if (isChange && this.value !== nVal || isChange && (isObject(this.value) || isArray(this.value)) || !isChange) {
				const obj = {};
				obj[this.prop] = nVal;
				this.value = nVal;
				this.validator.validate(obj, (errors) => {
					if (errors) {
						this.showAni = true;
						this.$nextTick(() => {
							this.message = errors[0]?.message;
							this.showMsg = true;
						});
						return false;
					}
					this.showMsg = false;
				});
			}
		}
	}
};
function _sfc_ssrRender$4(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: ["form-model-item", [{ "has-error": $data.showAni }, $options.hintType]] }, _attrs))} data-v-734cc9a4>`);
	ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
	if ($data.showAni) if ($options.hintType === "text") _push(`<div class="form-explain" style="${ssrRenderStyle($data.showMsg ? null : { display: "none" })}" data-v-734cc9a4>${ssrInterpolate($data.message)}</div>`);
	else _push(`<!---->`);
	else _push(`<!---->`);
	_push(`</div>`);
}
var _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/common/components/form-model-item/index.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var form_model_item_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$4, [["ssrRender", _sfc_ssrRender$4], ["__scopeId", "data-v-734cc9a4"]]);
//#endregion
//#region src/lib/form/regular.js
/**
* 最新版
* 常用正则验证
**/
var regular_default = {
	mobile: function() {
		var val = arguments[0];
		if ("undefined" === typeof val) return false;
		return /^(1[0-9]{1}[0-9]{1}[0-9]{8})$/.test(val);
	},
	phone: function() {
		var val = arguments[0];
		if ("undefined" === typeof val) return false;
		return /^(((0\d{2,3}-)+\d{7,8})|((0\d{2,3})+\d{7,8})|(\+\d{6,20})|(\d{6,20})|((0\d{2,3}-)+\d{7,8}-)+\d{1,6})$/.test(val);
	},
	email: function() {
		var val = arguments[0];
		if ("undefined" === typeof val) return false;
		var reg1 = /@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
		var reg2 = /^([a-zA-Z0-9_-]+[_|\_|\.]?)+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
		if (reg1.test(val)) return reg2.test(val);
		return false;
	},
	code: function() {
		var val = arguments[0];
		if ("undefined" === typeof val) return false;
		return /^(([1-9]{1})\d{5})$/.test(val);
	},
	number: function() {
		var val = arguments[0];
		if ("undefined" === typeof val) return false;
		return /^(-?\d+)$/.test(val);
	},
	double: function() {
		var val = arguments[0];
		if ("undefined" === typeof val) return false;
		return /^(-?\d+)\.?\d*$/.test(val);
	},
	url: function() {
		var val = arguments[0];
		if ("undefined" === typeof val) return false;
		return /^((https|http|ftp|rtsp|mms)?:\/\/)+[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/.test(val);
	},
	chinese: function() {
		var val = arguments[0];
		if ("undefined" === typeof val) return false;
		return /([\u4E00-\u9FA5]|[\uFE30-\uFFA0])+/gi.test(val);
	},
	verify(val) {
		return /^\d{6}$/.test(val);
	},
	password(val) {
		return /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,12}$/.test(val);
	}
};
//#endregion
//#region src/common/components/verify-code/index.vue
var times = 60;
var _sfc_main$3 = {
	name: "verify-code",
	props: {
		url: Object,
		phone: String,
		code: Number
	},
	data() {
		return {
			loading: false,
			running: false,
			sent: false,
			timer: null,
			times
		};
	},
	methods: {
		sendHandler() {
			const isPhone = regular_default.mobile(this.phone);
			if (isPhone && !this.loading && !this.running) {
				this.loading = true;
				this.$http.lock.post(this.url, {
					area_code: "86",
					mobile: this.phone,
					code_type: this.code
				}).then(() => {
					this.sent = true;
					this.startTimer();
					this.$layer.toast("发送成功");
				}).finally(() => {
					this.loading = false;
				});
			} else if (!isPhone) this.$layer.toast("请输入正确的手机号");
		},
		startTimer() {
			this.running = true;
			this.times = times;
			this.timer = setInterval(() => {
				this.times--;
				if (this.times <= 0) {
					this.running = false;
					this.times = times;
					clearInterval(this.timer);
				}
			}, 1e3);
		}
	}
};
function _sfc_ssrRender$3(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: ["m-verify-code", {
		loading: $data.loading,
		running: $data.running
	}] }, _attrs))} data-v-e08eba77>${ssrInterpolate($data.running ? $data.times + "(S)" : $data.sent ? "重新发送" : "获取验证码")}</div>`);
}
var _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/common/components/verify-code/index.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var verify_code_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$3, [["ssrRender", _sfc_ssrRender$3], ["__scopeId", "data-v-e08eba77"]]);
//#endregion
//#region src/views/login/_components/login-password.vue
var _sfc_main$2 = {
	name: "LoginPassword",
	props: {
		modelValue: [String, Number],
		placeholder: String
	},
	emits: ["update:modelValue"],
	data() {
		return { view: false };
	},
	computed: {
		icon() {
			return this.view ? "icon-view" : "icon-view-close";
		},
		type() {
			return this.view ? "text" : "password";
		}
	},
	methods: {
		inputHandler(e) {
			this.$emit("update:modelValue", e.target.value);
		},
		viewPwd() {
			this.view = !this.view;
		}
	}
};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "login-password flex-left" }, _attrs))} data-v-a7ae3545><input${ssrRenderAttr("value", $props.modelValue)}${ssrRenderAttr("type", $options.type)} class="u-input"${ssrRenderAttr("placeholder", $props.placeholder)} data-v-a7ae3545><i class="${ssrRenderClass([$options.icon, "iconfont"])}" data-v-a7ae3545></i></div>`);
}
var _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/views/login/_components/login-password.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var login_password_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$2, [["ssrRender", _sfc_ssrRender$2], ["__scopeId", "data-v-a7ae3545"]]);
//#endregion
//#region src/assets/images/common/narwal-logo.svg
var narwal_logo_default = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20360%2096'%20role='img'%20aria-label='Narwal'%3e%3crect%20width='360'%20height='96'%20rx='18'%20fill='%23111827'/%3e%3cpath%20fill='%23ffffff'%20d='M48%2067V29h9l18%2024V29h10v38h-9L58%2043v24H48Zm55%200%2015-38h11l15%2038h-11l-3-8h-14l-3%208h-10Zm16-17h8l-4-12-4%2012Zm35%2017V29h18c9%200%2015%205%2015%2013%200%205-3%2010-8%2012l10%2013h-12l-9-12h-4v12h-10Zm10-20h7c4%200%206-2%206-5s-2-5-6-5h-7v10Zm43%2020-11-38h10l6%2023%207-23h8l7%2023%206-23h10l-11%2038h-10l-7-22-7%2022h-8Zm53%200%2015-38h11l15%2038h-11l-3-8h-14l-3%208h-10Zm16-17h8l-4-12-4%2012Zm37%2017V29h10v29h18v9h-28Z'/%3e%3c/svg%3e";
//#endregion
//#region src/views/login/_components/content.vue
var _sfc_main$1 = {
	name: "login-content",
	components: {
		formModel: form_model_default,
		formModelItem: form_model_item_default,
		loginPassword: login_password_default,
		verifyCode: verify_code_default
	},
	data() {
		return {
			type: "code",
			form: {
				area_code: "86",
				mobile: "",
				verification: "",
				password: "",
				code_type: SMS_CODE_TYPE.login,
				check: false
			},
			rules: {
				mobile: [{
					required: true,
					message: "请输入手机号"
				}, {
					pattern: /^(1[0-9]{1}[0-9]{1}[0-9]{8})$/,
					message: "请输入正确的手机号"
				}],
				verification: [{
					required: true,
					message: "请输入验证码"
				}, {
					pattern: /^(\d+)$/,
					message: "请输入正整数"
				}],
				password: [{
					required: true,
					message: "请输入密码"
				}]
			}
		};
	},
	methods: {
		/**
		* @description: 登录操作
		*/
		async handleLogin({ loading }) {
			if (!await this.$refs.form.validate()) return false;
			if (!this.form.check) return this.$layer.confirm("还未勾选用户协议,是否勾选?").then((res) => {
				this.form.check = true;
			});
			let params = {};
			const url = this.type === "code" ? this.$api.phoneCodeLogin : this.$api.phonePwdLogin;
			if (this.type === "code") {
				params = { ...this.form };
				delete params.password;
			} else params = {
				area_code: this.form.area_code,
				mobile: this.form.mobile,
				password: this.form.password,
				last_login_system: 4,
				last_login_app_version: SYSTEM_USER_PLATFORM_VERSION,
				source: 2
			};
			const [res, err] = await this.$http.awaitTo(this.$http.lock.post(url, params, { loading }));
			if (err) return false;
			this.$store.commit("UPDATE_USERINFO", res.data);
			this.redirectPath();
		},
		/*****
		* 重定向路径
		*/
		redirectPath() {
			const query = this.$route.query;
			const url = query.url ? decodeURIComponent(query.url) : null;
			if (url) {
				if (!url.includes("/login") && !url.includes("%2F")) if (query.type === "replace") return this.$router.replace(url);
				else return this.$router.push(url);
			}
			return this.$router.push("/index");
		},
		changeType(type) {
			this.type = type;
		},
		handleToPact(name) {
			this.$router.push(`/spread/policy?pageKeyword=${name}`);
		},
		handleInput(e) {
			let value = e.target?.value;
			if (value.length > 6) {
				value = value.slice(0, 6);
				this.form.verification = value;
			}
		}
	}
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_form_model = resolveComponent("form-model");
	const _component_form_model_item = resolveComponent("form-model-item");
	const _component_verify_code = resolveComponent("verify-code");
	const _component_login_password = resolveComponent("login-password");
	const _component_n_button = resolveComponent("n-button");
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "login-h5-page" }, _attrs))} data-v-a42e5665><div class="login-box" data-v-a42e5665><div class="title flex-center" data-v-a42e5665><img alt="" class="narwal-logo"${ssrRenderAttr("src", narwal_logo_default)} data-v-a42e5665></div><div class="jump-box" data-v-a42e5665><span class="${ssrRenderClass([{ "login-active-color": $data.type === "pwd" }, "tab-item"])}" data-v-a42e5665> 密码登录 </span><span class="tab-line" data-v-a42e5665>|</span><span class="${ssrRenderClass([{ "login-active-color": $data.type === "code" }, "tab-item"])}" data-v-a42e5665> 短信登录 </span></div>`);
	_push(ssrRenderComponent(_component_form_model, {
		ref: "form",
		class: "form",
		rules: $data.rules,
		model: $data.form
	}, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_form_model_item, {
					class: "l-input flex-left",
					prop: "mobile"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<input${ssrRenderAttr("value", $data.form.mobile)} class="u-input" placeholder="请输入手机号码" data-v-a42e5665${_scopeId}>`);
						else return [withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => $data.form.mobile = $event,
							class: "u-input",
							placeholder: "请输入手机号码"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, $data.form.mobile]])];
					}),
					_: 1
				}, _parent, _scopeId));
				if ($data.type === "code") _push(ssrRenderComponent(_component_form_model_item, {
					class: "l-input-last flex-left",
					prop: "verification"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) {
							_push(`<input${ssrRenderAttr("value", $data.form.verification)} class="u-input" type="number"${ssrRenderAttr("maxlength", 6)} placeholder="6位数字验证码" data-v-a42e5665${_scopeId}>`);
							_push(ssrRenderComponent(_component_verify_code, {
								url: _ctx.$api.getV2SmsCode,
								phone: $data.form.mobile,
								code: $data.form.code_type
							}, null, _parent, _scopeId));
						} else return [withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => $data.form.verification = $event,
							class: "u-input",
							type: "number",
							maxlength: 6,
							placeholder: "6位数字验证码",
							onInput: $options.handleInput
						}, null, 40, ["onUpdate:modelValue", "onInput"]), [[vModelText, $data.form.verification]]), createVNode(_component_verify_code, {
							url: _ctx.$api.getV2SmsCode,
							phone: $data.form.mobile,
							code: $data.form.code_type
						}, null, 8, [
							"url",
							"phone",
							"code"
						])];
					}),
					_: 1
				}, _parent, _scopeId));
				else _push(`<!---->`);
				if ($data.type === "pwd") _push(ssrRenderComponent(_component_form_model_item, {
					class: "l-input-last flex-left",
					prop: "password"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(ssrRenderComponent(_component_login_password, {
							modelValue: $data.form.password,
							"onUpdate:modelValue": ($event) => $data.form.password = $event,
							placeholder: "请输入密码"
						}, null, _parent, _scopeId));
						else return [createVNode(_component_login_password, {
							modelValue: $data.form.password,
							"onUpdate:modelValue": ($event) => $data.form.password = $event,
							placeholder: "请输入密码"
						}, null, 8, ["modelValue", "onUpdate:modelValue"])];
					}),
					_: 1
				}, _parent, _scopeId));
				else _push(`<!---->`);
				_push(`<div class="submit-wrap" data-v-a42e5665${_scopeId}>`);
				_push(ssrRenderComponent(_component_n_button, {
					class: "submit-button",
					type: "primary",
					size: "large",
					round: "",
					onTap: $options.handleLogin
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(` 登录 `);
						else return [createTextVNode(" 登录 ")];
					}),
					_: 1
				}, _parent, _scopeId));
				_push(`</div><div class="${ssrRenderClass([{ checked: $data.form.check }, "check-policy flex-top"])}" data-v-a42e5665${_scopeId}><i class="${ssrRenderClass([`icon-${$data.form.check ? "circle-success" : "round"}`, "iconfont"])}" data-v-a42e5665${_scopeId}></i><div data-v-a42e5665${_scopeId}><span data-v-a42e5665${_scopeId}>勾选表示您同意</span><span class="href" data-v-a42e5665${_scopeId}>云鲸用户使用协议、 </span><span class="href" data-v-a42e5665${_scopeId}>隐私政策 </span></div></div>`);
			} else return [
				createVNode(_component_form_model_item, {
					class: "l-input flex-left",
					prop: "mobile"
				}, {
					default: withCtx(() => [withDirectives(createVNode("input", {
						"onUpdate:modelValue": ($event) => $data.form.mobile = $event,
						class: "u-input",
						placeholder: "请输入手机号码"
					}, null, 8, ["onUpdate:modelValue"]), [[vModelText, $data.form.mobile]])]),
					_: 1
				}),
				$data.type === "code" ? (openBlock(), createBlock(_component_form_model_item, {
					key: 0,
					class: "l-input-last flex-left",
					prop: "verification"
				}, {
					default: withCtx(() => [withDirectives(createVNode("input", {
						"onUpdate:modelValue": ($event) => $data.form.verification = $event,
						class: "u-input",
						type: "number",
						maxlength: 6,
						placeholder: "6位数字验证码",
						onInput: $options.handleInput
					}, null, 40, ["onUpdate:modelValue", "onInput"]), [[vModelText, $data.form.verification]]), createVNode(_component_verify_code, {
						url: _ctx.$api.getV2SmsCode,
						phone: $data.form.mobile,
						code: $data.form.code_type
					}, null, 8, [
						"url",
						"phone",
						"code"
					])]),
					_: 1
				})) : createCommentVNode("", true),
				$data.type === "pwd" ? (openBlock(), createBlock(_component_form_model_item, {
					key: 1,
					class: "l-input-last flex-left",
					prop: "password"
				}, {
					default: withCtx(() => [createVNode(_component_login_password, {
						modelValue: $data.form.password,
						"onUpdate:modelValue": ($event) => $data.form.password = $event,
						placeholder: "请输入密码"
					}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
					_: 1
				})) : createCommentVNode("", true),
				createVNode("div", { class: "submit-wrap" }, [createVNode(_component_n_button, {
					class: "submit-button",
					type: "primary",
					size: "large",
					round: "",
					onTap: $options.handleLogin
				}, {
					default: withCtx(() => [createTextVNode(" 登录 ")]),
					_: 1
				}, 8, ["onTap"])]),
				createVNode("div", {
					class: ["check-policy flex-top", { checked: $data.form.check }],
					onClick: ($event) => $data.form.check = !$data.form.check
				}, [createVNode("i", { class: [`icon-${$data.form.check ? "circle-success" : "round"}`, "iconfont"] }, null, 2), createVNode("div", null, [
					createVNode("span", { onClick: withModifiers(($event) => $data.form.check = !$data.form.check, ["stop"]) }, "勾选表示您同意", 8, ["onClick"]),
					createVNode("span", {
						onClick: withModifiers(($event) => $options.handleToPact("service"), ["stop"]),
						class: "href"
					}, "云鲸用户使用协议、 ", 8, ["onClick"]),
					createVNode("span", {
						onClick: withModifiers(($event) => $options.handleToPact("privacy"), ["stop"]),
						class: "href"
					}, "隐私政策 ", 8, ["onClick"])
				])], 10, ["onClick"])
			];
		}),
		_: 1
	}, _parent));
	_push(`</div></div>`);
}
var _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/views/login/_components/content.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
//#endregion
//#region src/views/login/index.vue
var _sfc_main = {
	name: "Login",
	components: { appContent: /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-a42e5665"]]) }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_app_content = resolveComponent("app-content");
	_push(`<view${ssrRenderAttrs(mergeProps({ class: "m-views-login" }, _attrs))}>`);
	_push(ssrRenderComponent(_component_app_content, null, null, _parent));
	_push(`</view>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/views/login/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var login_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { login_default as default };
