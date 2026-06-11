import { ssrInterpolate, ssrRenderAttr } from "vue/server-renderer";
import { ref, unref, useSSRContext } from "vue";
//#region /icons.svg
var icons_default = "/icons.svg";
//#endregion
//#region src/assets/vite.svg
var vite_default = "/assets/vite-BF8QNONU.svg";
//#endregion
//#region src/assets/hero.png
var hero_default = "/assets/hero-CLDdwZDr.png";
//#endregion
//#region src/assets/vue.svg
var vue_default = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20aria-hidden='true'%20role='img'%20class='iconify%20iconify--logos'%20width='37.07'%20height='36'%20preserveAspectRatio='xMidYMid%20meet'%20viewBox='0%200%20256%20198'%3e%3cpath%20fill='%2341B883'%20d='M204.8%200H256L128%20220.8L0%200h97.92L128%2051.2L157.44%200h47.36Z'%3e%3c/path%3e%3cpath%20fill='%2341B883'%20d='m0%200l128%20220.8L256%200h-51.2L128%20132.48L50.56%200H0Z'%3e%3c/path%3e%3cpath%20fill='%2335495E'%20d='M50.56%200L128%20133.12L204.8%200h-47.36L128%2051.2L97.92%200H50.56Z'%3e%3c/path%3e%3c/svg%3e";
//#endregion
//#region src/views/index/index.vue
var _sfc_main = {
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		const count = ref(0);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<!--[--><section id="center"><div class="hero"><img${ssrRenderAttr("src", unref(hero_default))} class="base" width="170" height="179" alt=""><img${ssrRenderAttr("src", unref(vue_default))} class="framework" alt="Vue logo"><img${ssrRenderAttr("src", unref(vite_default))} class="vite" alt="Vite logo"></div><div><h1>Get started</h1><p>Edit <code>src/App.vue</code> and save to test <code>HMR</code></p></div><button class="counter">Count is ${ssrInterpolate(count.value)}</button></section><div class="ticks"></div><section id="next-steps"><div id="docs"><svg class="icon" role="presentation" aria-hidden="true"><use${ssrRenderAttr("href", icons_default + "#documentation-icon")}></use></svg><h2>Documentation</h2><p>Your questions, answered</p><ul><li><a href="https://vite.dev/" target="_blank"><img class="logo"${ssrRenderAttr("src", unref(vite_default))} alt=""> Explore Vite </a></li><li><a href="https://vuejs.org/" target="_blank"><img class="button-icon"${ssrRenderAttr("src", unref(vue_default))} alt=""> Learn more </a></li></ul></div><div id="social"><svg class="icon" role="presentation" aria-hidden="true"><use${ssrRenderAttr("href", icons_default + "#social-icon")}></use></svg><h2>Connect with us</h2><p>Join the Vite community</p><ul><li><a href="https://github.com/vitejs/vite" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use${ssrRenderAttr("href", icons_default + "#github-icon")}></use></svg> GitHub </a></li><li><a href="https://chat.vite.dev/" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use${ssrRenderAttr("href", icons_default + "#discord-icon")}></use></svg> Discord </a></li><li><a href="https://x.com/vite_js" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use${ssrRenderAttr("href", icons_default + "#x-icon")}></use></svg> X.com </a></li><li><a href="https://bsky.app/profile/vite.dev" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use${ssrRenderAttr("href", icons_default + "#bluesky-icon")}></use></svg> Bluesky </a></li></ul></div></section><div class="ticks"></div><section id="spacer"></section><!--]-->`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/views/index/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
//#endregion
export { _sfc_main as default };
