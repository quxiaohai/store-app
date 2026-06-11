/************
 * 注意：不要在如下几个全局组件内引入该组件！！！！
 */
import http from 'common/util/http';
import api from 'common/api';
import layer from 'common/plugin/dialog';
import broadcast from 'lib/comp/broadcast';
import progressBar from 'common/components/progress-bar';
import { createApp } from 'vue';
import env from 'lib/comp/env';
import eventBus from 'lib/comp/event-bus';

export const $http = http;
export const $api = api;
export const $layer = layer;
export const $broadcast = broadcast;
export const $event = eventBus();
export const $bar = (function() {
    if (env.isServer()) {
        return {
            start: () => {
            },
            finish: () => {
            }
        };
    }
    // global progress bar
    const node = document.createElement('DIV');
    document.body.appendChild(node);
    return createApp(progressBar).mount(node);
})();

export default {
    install(app) {
        app.config.globalProperties.$http = $http;
        app.config.globalProperties.$api = $api;
        app.config.globalProperties.$layer = $layer;
        app.config.globalProperties.$broadcast = $broadcast;
        app.config.globalProperties.$event = $event;
        app.config.globalProperties.$bar = $bar;
    }
};
