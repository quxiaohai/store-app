/*********
 * 横向滑动滑动
 * @param event
 * @param type
 * @param fn
 */

export default class TouchSlide {
    constructor(option) {
        this.option = Object.assign({
            max: 100,
            time: 0.5,// 动画时间
            stop: '_stop',// 阻止冒泡class
            direction: 'left'// left|top
        }, option || {}, {
            left: 0,
            top: 0,
            pageX: 0,
            pageY: 0,
        })
    }

    /*****
     * 回退
     * @param fn
     */
    back(fn) {
        fn && fn({
            transform: `translate3d(0, 0, 0)`,
            transition: `transform ${this.option.time }s`
        });
    }

    /*******
     * 按下手指
     * @param event
     * @param fn
     */
    start(event, fn) {
        fn({
            transform: `translate3d(0, 0, 0)`,
            transition: `transform 0s`
        });
        this.option.pageX = event.touches[0].pageX;
        this.option.pageY = event.touches[0].pageY;
    }

    /********
     * 手指滑动
     * @param event
     * @param fn
     */
    move(event, fn) {
        const opts = this.option;
        opts.left = Math.max(-opts.max * 1.2, Math.min(0, event.touches[0].pageX - opts.pageX));
        opts.top = Math.min(opts.max * 1.2, Math.max(0, event.touches[0].pageY - opts.pageY));
        if (opts.direction === 'left') {
            fn({
                transform: `translate3d(${opts.left }px, 0, 0)`,
                transition: `transform 0s`
            });
        } else if (opts.direction === 'top') {
            fn({
                transform: `translate3d(0, ${opts.top }px, 0)`,
                transition: `transform 0s`
            });
        }
    }

    /******
     * 触摸结束
     * @param fn
     */
    end(fn) {
        const opts = this.option;
        if (opts.direction === 'left') {
            if (Math.abs(opts.left * 2) > opts.max) {
                fn({
                    transform: `translate3d(${-opts.max }px, 0, 0)`,
                    transition: `transform ${opts.time }s`
                });
            } else {
                fn({
                    transform: `translate3d(0, 0, 0)`,
                    transition: `transform ${opts.time }s`
                });
            }
        } else if (opts.direction === 'top') {
            if (Math.abs(opts.top * 2) > opts.max) {
                fn({
                    transform: `translate3d(0, ${opts.max }px, 0)`,
                    transition: `transform ${opts.time }s`
                });
            } else {
                fn({
                    transform: `translate3d(0, 0, 0)`,
                    transition: `transform ${opts.time }s`
                });
            }
        }

        opts.left = 0;
        opts.top = 0;
        opts.pageX = 0;
        opts.pageY = 0;
    }

    /*****
     * 是否阻止执行
     * @param event
     * @param type
     * @returns {boolean}
     */
    isStop(event, type) {
        const isMuch = event.touches.length !== 1 && type !== 'end';// 只支持单指并且手指在屏目上
        const isStop = event.target.classList.contains(this.option.stop);
        return isMuch || isStop;
    }

    /*****
     * 执行
     * @param event
     * @param type
     * @param fn
     */

    run(event, type, fn = Function.prototype) {

        if (this.isStop(event, type)) {
            return false;
        }

        switch (type) {
            case 'start':
                this.start(event, fn);
                break;
            case 'move':
                this.move(event, fn);
                break;
            case 'end':
                this.end(fn);
        }
    }
}