/********************
 * 使用方式 支持以下三种传参方式
 * this.$preview.media(
 * {sources: [{url: 'xxxxx', type: 'video', poster: ''}, {url: 'xxxxx', type: 'image'}], current: 0})
 */
import preview from './preview';
import { $layer } from 'common/util/global-properties';

preview.install = app => {
    let _media = null;
    const previewInfo = {
        media: ({ sources, current }) => {
            _media = $layer.popup({
                autoHide: false,
                top: 0,
                left: 0,
                animate: {
                    name: 'fade'
                },
                overlay: {
                    opacity: 1
                }
            });

            _media.show();
            _media.$event.once('show', () => {
                _media.loader(preview, {
                    sources, current
                });
            });
            _media.$event.once('close', previewInfo.hide);
        },
        hide: () => {
            _media && _media.hide(_media.destroy);
            _media = null;
        }
    };

    app.config.globalProperties.$preview = previewInfo;
};

export default preview;
