/******
 * 模块路由配置
 */
export default [
    {
        path: '/index',
        name: '首页',
        meta: {cache: false},
        component: () => import('views/index')
    },
    {
        path: '/login',
        name: '登录',
        component: () => import('views/login')
    },
    {
        path: '/:error*',
        name: '星途创新{views}',
        component: () => import('views/error-page')
    }
];
