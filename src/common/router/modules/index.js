/******
 * 模块路由配置
 */
export default [
    {
        path: '/admin',
        name: '后台管理',
        component: () => import('views/admin/layout'),
        redirect: '/admin/dashboard',
        meta: {cache: false},
        children: [
            {
                path: 'dashboard',
                name: '管理首页',
                component: () => import('views/admin/dashboard'),
                meta: {
                    adminCache: true,
                    module: 'dashboard',
                    title: '管理首页'
                }
            },
            {
                path: 'products',
                name: '商品管理',
                component: () => import('views/admin/products'),
                meta: {
                    adminCache: true,
                    module: 'products',
                    title: '商品管理'
                }
            },
            {
                path: 'orders',
                name: '订单中心',
                component: () => import('views/admin/orders'),
                meta: {
                    adminCache: true,
                    module: 'orders',
                    title: '订单中心'
                }
            },
            {
                path: 'settings',
                name: '系统设置',
                component: () => import('views/admin/settings'),
                meta: {
                    adminCache: true,
                    module: 'settings',
                    title: '系统设置'
                }
            }
        ]
    },
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
