/*******
 * 模拟滚动
 * import scroll from 'lib/dom/scroll'
 * scroll('#id', {scrollX: true, scrollY: true});
 *
 */
import simulationScrollX from 'simulation-scroll-x'
import simulationScrollY from 'simulation-scroll-y'
import {isObject } from "lib/util/dataType"
import env from "lib/comp/env"

let Finger = function () {};

if (env.isClient()) {
    Finger = require('finger-mover');
}

export default function (el, option = {}) {

    const plugins = [];
    if (option.scrollX) {
        if (isObject(option.scrollX)) {
            plugins.push(simulationScrollX(option.scrollX));
        } else {
            plugins.push(simulationScrollX());
        }
    }
    if (option.scrollY) {
        if (isObject(option.scrollY)) {
            plugins.push(simulationScrollY(option.scrollY));
        } else {
            plugins.push(simulationScrollY());
        }
    }

    return new Finger({
        el: el,
        plugins: plugins
    });
}