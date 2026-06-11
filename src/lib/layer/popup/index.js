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

import { createApp } from 'vue';
import popup from './popup.vue';
import eventBus from 'lib/comp/event-bus';

export default function(option, plugin) {
    const app = createApp(popup, { option });
    const { store, router } = plugin || {};
    store && app.use(store);
    router && app.use(router);

    const $event = eventBus();
    app.config.globalProperties.$event = $event;

    $event.once('destroy', () => {
        app.unmount();
    });

    return app.mount(document.createElement('DIV'));
};