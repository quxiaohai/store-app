/***********************
 * 获取服务端URL
 */
import env from 'lib/comp/env';
import config from 'common/config';

function rewritePath(url, pathRewrite = {}) {
    return Object.keys(pathRewrite).reduce(
        (nextUrl, key) => nextUrl.replace(new RegExp(key), pathRewrite[key]),
        url
    );
}

export default function(url) {
    if (env.isServer()) {
        // 获取全部代理数据
        const proxy = config.proxy[process.env.EXEC_ENV] || config.proxy.dev;
        const keys = Object.keys(proxy);
        for (const i in keys) {
            const key = keys[i];
            const reg = new RegExp(key);
            if (reg.test(url)) {
                url = rewritePath(url, proxy[key].pathRewrite);

                const target = proxy[key].target;
                if (target.substring(target.length - 1) === '/') {
                    return target + url.replace(/^\//, '');
                }

                return target + url;
            }
        }
    }

    return url;
}
