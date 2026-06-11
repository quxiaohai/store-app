import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import px2rem from 'postcss-pxtorem';
import defineConf from './src/common/config';
import {fileURLToPath} from "url";

function getExecEnv(mode) {
    const execEnv = process.env.EXEC_ENV || mode;
    return defineConf[execEnv] ? execEnv : 'dev';
}

function createDefine(execEnv, vueEnv) {
    const obj = Object.assign({}, defineConf[execEnv]);
    const env = {
        'process.env.VUE_ENV': JSON.stringify(vueEnv)
    };
    Object.keys(obj).forEach((key) => {
        env[`process.env.${key}`] = obj[key];
    });
    return env;
}

function createHmrConfig() {
    const host = process.env.HOST ? process.env.HOST.replace(/https?:\/\//, '') : 'localhost';
    if (host === 'localhost') {
        return {
            protocol: 'ws',
            host: 'localhost',
            port: 64999,
            clientPort: 64999
        };
    }
    return {
        protocol: 'wss',
        host: host,
        port: process.env.FRONTEND_PORT,
        clientPort: 443
    };
}

function normalizeProxy(proxy = {}) {
    return Object.keys(proxy).reduce((res, key) => {
        const item = Object.assign({}, proxy[key]);
        const pathRewrite = item.pathRewrite;
        delete item.pathRewrite;
        if (pathRewrite) {
            item.rewrite = (path) => Object.keys(pathRewrite).reduce(
                (nextPath, pattern) => nextPath.replace(new RegExp(pattern), pathRewrite[pattern]),
                path
            );
        }
        res[key] = item;
        return res;
    }, {});
}
// https://vite.dev/config/
export default defineConfig(({mode, isSsrBuild}) => {
    const execEnv = getExecEnv(mode);
    const vueEnv = isSsrBuild ? 'server' : 'client';
    return {
        plugins: [vue()],
        define: createDefine(execEnv, vueEnv),
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',   // 推荐指定现代 API 以获得最佳性能和未来兼容性
                    silenceDeprecations: ['import', 'if-function', 'global-builtin'],
                },
            },
        },
        postcss: {
            plugins: [
                px2rem({
                    rootValue: 24, // 设计稿宽度除以10，通常是750或者375
                    propList: ['*'], // 需要转换的属性，这里选择转换所有属性
                    unitPrecision: 5, // 转换后的rem单位保留几位小数
                    selectorBlackList: ['._pc-', 'html'], // 要忽略的选择器
                    replace: true, // 转换后直接更换属性值
                    mediaQuery: false, // 是否转换媒体查询中的单位
                    minPixelValue: 0 // 设置要转换的最小单位
                })
            ]
        },
        resolve: {
            preserveSymlinks: true,
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                'lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
                'common': fileURLToPath(new URL('./src/common', import.meta.url)),
                'views': fileURLToPath(new URL('./src/views', import.meta.url)),
                'assets': fileURLToPath(new URL('./src/assets', import.meta.url))
            },
            extensions: ['.js', '.jsx', '.json', '.scss', '.vue']
        },
        server: {
            host: true,
            port: Number(process.env.FRONTEND_PORT) || 5173,
            hmr: createHmrConfig(),
            proxy: normalizeProxy(defineConf.proxy[execEnv])
        }
    }
});
