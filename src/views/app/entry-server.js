import {renderToString} from 'vue/server-renderer'
import {_createApp} from './main'
import {_createStore} from 'common/store';
import {_createRouter} from 'common/router';

/**
 * @param {string} _url
 */
export async function render(_url) {
    const router = _createRouter();
    const store = _createStore();
    const {app} = _createApp({router, store});

    await router.push(_url === '/' ? '/index' : _url);
    await router.isReady();

    // passing SSR context object which will be available via useSSRContext()
    // @vitejs/plugin-vue injects code into a component's setup() that registers
    // itself on ctx.modules. After the render, ctx.modules would contain all the
    // components that have been instantiated during this render call.
    const ctx = {}
    const html = await renderToString(app, ctx)

    return {html, state: store.state}
}
