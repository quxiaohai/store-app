/**************
 * 记录路由位置
 */
import pageScroll from 'common/util/page-scroll';
import { isArray } from 'lib/util/dataType';

export default {
    _map: {},
    add(path) {
        if (isArray(path)) {
            path.forEach(key => {
                this._map[key] = { left: 0, top: 0 };
            });
        } else {
            this._map[path] = { left: 0, top: 0 };
        }
    },
    position(to, from, def) {
        if (this._map[to.path] && this._map[from.path]) {
            return this._map[to.path];
        }
        return def;
    },
    savedPosition(to, from) {
        console.log(to.path, from.path, this._map);
        if (this._map[to.path] && this._map[from.path]) {
            this._map[from.path] = pageScroll.getScroll();
        }
    }
};