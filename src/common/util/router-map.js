import storage from 'lib/util/storage';
import { ROUTER_TRACK } from 'common/util/constant';

/************
 * 路由轨迹记录
 */
export default {
    routers: storage.session.get(ROUTER_TRACK) || [],
    routerState: 0,
    to: null,
    from: null,
    push(to, from, type) {
        this.to = to;
        this.from = from;
        const lastIndex = this.routers.length - 1;
        const lastPrevIndex = Math.max(0, lastIndex - 1);

        // 判断页是否刷新
        if (to.fullPath === this.routers[lastIndex]?.fullPath) {
            this.routerState = 0;
            return false;
        }

        // 判断是前进还是后退
        if (type === 'replace' && this.routers.length > 0) {// 判断页面是否replace
            this.routerState = 1;
            this.routers.splice(lastIndex, 1);
            this.routers.push({ fullPath: to.fullPath });
        } else if (this.routers.length > 0
            && from.fullPath === this.routers[lastIndex].fullPath
            && to.fullPath === this.routers[lastPrevIndex].fullPath) {// 后退
            this.routerState = -1;
            this.routers.splice(lastIndex, 1);
        } else {// 前进
            this.routers.push({ fullPath: to.fullPath });
            this.routerState = 1;
        }

        storage.session.set(ROUTER_TRACK, this.routers);
    },
    isPrev() {
        return this.routerState === -1;
    },
    isNext() {
        return this.routerState === 1;
    },
    isInit() {
        return this.routerState === 0;
    }
};