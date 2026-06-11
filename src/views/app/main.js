import {createSSRApp} from 'vue'
import App from './App.vue'
import globalProperties from 'common/util/global-properties';
import previewMedia from 'common/plugin/preview-media';
import href from 'common/directives/href';
import hover from 'common/directives/hover';
import NButton from 'common/components/button';
import NCheckbox from 'common/components/checkbox/checkbox';
import NRadio from 'common/components/radio/radio';

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function _createApp({router, store}) {
    const app = createSSRApp(App);
    app.use(router)
        .use(store)
        .use(globalProperties)
        .use(previewMedia);

    app.directive('href', href);
    app.directive('hover', hover);
    app.component('n-button', NButton);
    app.component('n-checkbox', NCheckbox);
    app.component('n-radio', NRadio);

    return {app}
}
