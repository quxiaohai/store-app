import 'common/style/_common.scss'
import {_createApp} from './main'
import {clientRouter} from 'common/router';
import {clientStore} from 'common/store';

const {app} = _createApp({
    router: clientRouter,
    store: clientStore
});

// 判断window.__INITIAL_STATE__是否存在，存在的替换store的值
if (window.__INITIAL_STATE__) {
    clientStore.replaceState(window.__INITIAL_STATE__);
}
clientRouter.isReady().then(() => {
    app.mount('#app')
});
