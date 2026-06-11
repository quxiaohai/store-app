/**********
 * 弹框
 * 穆辰 20200701
 */
import popup from 'lib/layer/popup';
import appDialog from './dialog.vue';

export default function(appContent, option = {}) {
    const store = option.store;
    const router = option.router;
    delete option.store;
    delete option.router;

    let m_dialog = popup({
        showCenter: true,
        autoHide: false,
        initIndex: option.initIndex,
        stop: option.stop,
        overlay: {
            opacity: option.opacity,
            type: 'create',
            color: option.color
        },
        animate: {
            name: option.animate
        }
    }, {
        store,
        router
    });

    m_dialog.loader(appDialog, {
        option,
        appComp: appContent
    });

    m_dialog.$event.on('close', () => {
        m_dialog.hide(m_dialog.destroy);
    });

    return m_dialog;
};