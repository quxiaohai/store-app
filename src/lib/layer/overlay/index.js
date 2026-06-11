/************
 * 遮罩层
 * 穆辰 20200701
 */
import { createApp } from 'vue';
import overlay from './overlay.vue';
import { getZIndex } from 'lib/util/digit';
import { isNumber } from 'lib/util/dataType';

const OverlayManager = {
    options: [],
    overlay: false,
    app: null,
    open(option) {
        if (!option || this.options.indexOf(option) !== -1) return;

        if (!isNumber(option.zIndex)) {
            option.zIndex = getZIndex();
        }

        if (this.options.filter(r => r.type === 'change').length === 0 || option.type === 'create') {
            this.showOverlay(option);
        }

        this.options.push(option);

        if (option.type === 'change') {
            this.changeOverlayStyle();
        }
    },
    close(option) {
        let index = this.options.indexOf(option);
        if (index === -1) return;
        this.options.splice(index, 1);
        if (option.type === 'create') {
            option.overlay.hide(option.app);
        }
        this.closeOverlay();
        this.changeOverlayStyle();
    },
    showOverlay(option) {
        const app = createApp(overlay);
        const vm = app.mount(document.createElement('DIV'));
        vm.bindClick(this.handlerOverlayClick.bind(this));
        if (option.type === 'create') {
            option.animate = 'none';
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
        if (!this.overlay || this.options.filter(r => r.type === 'change').length > 0) return;
        this.overlay.hide(this.app);
        this.overlay = null;
        this.app = null;
    },
    changeOverlayStyle() {
        if (!this.overlay || this.options.filter(r => r.type === 'change').length === 0) return;
        const option = this.options[this.options.length - 1];
        this.overlay.setStyle(option);
    },
    handlerOverlayClick() {
        if (this.options.length === 0) return;
        const option = this.options[this.options.length - 1];
        option.$event?.emit('overlayClick', {
            option: option,
            el: option.type === 'change' ? this.overlay.$el : option.overlay.$el
        });
    }
};

export default OverlayManager;
