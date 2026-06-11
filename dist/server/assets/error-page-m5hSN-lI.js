import { i as toHome, n as getImageBase64, r as imageLoad, t as _plugin_vue_export_helper_default } from "../entry-server.js";
import { ssrRenderAttr, ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { createTextVNode, mergeProps, resolveComponent, useSSRContext, withCtx } from "vue";
//#region src/views/error-page/index.vue
var _sfc_main = {
	name: "error-page",
	data() {
		return { base64: null };
	},
	mounted() {
		this.initImage();
	},
	methods: {
		initImage() {
			imageLoad("/assets/images/common/500.jpg").then((img) => {
				this.base64 = getImageBase64(img, .8);
			});
		},
		handleToHome() {
			toHome();
		}
	}
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_n_button = resolveComponent("n-button");
	_push(`<div${ssrRenderAttrs(mergeProps({ class: "m-error-page" }, _attrs))} data-v-5b2cb8c0><div class="network-wrap" data-v-5b2cb8c0><img alt=""${ssrRenderAttr("src", $data.base64)} class="image" data-v-5b2cb8c0><p class="desc" data-v-5b2cb8c0>请稍后再试~</p><div class="btn-group flex-center" data-v-5b2cb8c0>`);
	_push(ssrRenderComponent(_component_n_button, {
		round: "",
		class: "btn",
		onTap: $options.handleToHome
	}, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) _push(`返回首页`);
			else return [createTextVNode("返回首页")];
		}),
		_: 1
	}, _parent));
	_push(`</div></div></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/views/error-page/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var error_page_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-5b2cb8c0"]]);
//#endregion
export { error_page_default as default };
