export default {
    dev: {
        NODE_ENV: '"development"',
        EXEC_ENV: '"dev"',
        API: '"/mall"',
        BASE: '"/api/narwal-mall-cbase-applets"',
        USER: '"/user"',
        OPERATION: '"/operation"',
        STORE_URL: '"https://ctest-act.narwaltech.com/"',
        ACT_URL: '"https://ctest-act.narwaltech.com"',
        SERVICE_URL: '"https://test-bsh5.narwaltech.com/universal/serviceSearch.html"',
        COST_URL: '"https://test-bsh5.narwaltech.com/fixPartsPrice.html"',
        ECHAT_VISITOR: '"https://ctest-act.narwaltech.com"',
        ECHAT_STAFF: '"https://ctest-admin.narwaltech.com"',
        YM_APPKEY: '"638d943788ccdf4b7e96de39"',
        YM_SERVER_CENTRT_APPKEY: '"638d943788ccdf4b7e96de39"',
        YM_INVITE_APPKEY: '"638d943788ccdf4b7e96de39"',
        REPORT_DATA_CENTER_URL: '"/report"',
        YM_REFERRAL_APPKEY: '"638d943788ccdf4b7e96de39"',
        YM_RENEW_APPKEY: '"638d943788ccdf4b7e96de39"'
    },
    test: {
        NODE_ENV: '"production"',
        EXEC_ENV: '"test"',
        API: '"/mall"',
        BASE: '"/api/narwal-mall-cbase-applets"',
        USER: '"/user"',
        OPERATION: '"/operation"',
        STORE_URL: '"https://ctest-act.narwaltech.com/"',
        ACT_URL: '"https://ctest-act.narwaltech.com"',
        SERVICE_URL: '"https://test-bsh5.narwaltech.com/universal/serviceSearch.html"',
        COST_URL: '"https://test-bsh5.narwaltech.com/fixPartsPrice.html"',
        ECHAT_VISITOR: '"https://ctest-act.narwaltech.com"',
        ECHAT_STAFF: '"https://ctest-admin.narwaltech.com"',
        YM_APPKEY: '"638d943788ccdf4b7e96de39"',
        YM_SERVER_CENTRT_APPKEY: '"638d943788ccdf4b7e96de39"',
        YM_INVITE_APPKEY: '"638d943788ccdf4b7e96de39"',
        REPORT_DATA_CENTER_URL: '"/report"',
        YM_REFERRAL_APPKEY: '"638d943788ccdf4b7e96de39"',
        YM_RENEW_APPKEY: '"638d943788ccdf4b7e96de39"',
        CDN_URL: '"https://image-test-pc.narwaltech.com/activity/"'
    },
    stress: {
        NODE_ENV: '"production"',
        EXEC_ENV: '"test"',
        API: '"/mall"',
        BASE: '"/api/narwal-mall-cbase-applets"',
        USER: '"/user"',
        OPERATION: '"/operation"',
        STORE_URL: '"https://ctest-act.narwaltech.com/"',
        ACT_URL: '"https://ctest-act.narwaltech.com"',
        SERVICE_URL: '"https://test-bsh5.narwaltech.com/universal/serviceSearch.html"',
        COST_URL: '"https://test-bsh5.narwaltech.com/fixPartsPrice.html"',
        ECHAT_VISITOR: '"https://ctest-act.narwaltech.com"',
        ECHAT_STAFF: '"https://ctest-admin.narwaltech.com"',
        YM_APPKEY: '"64127b0ed64e6861394bc569"',
        YM_SERVER_CENTRT_APPKEY: '"63915553ba6a5259c4c89273"',
        YM_INVITE_APPKEY: '"646d79f1e31d6071ec40c73b"',
        REPORT_DATA_CENTER_URL: '"/report"',
        YM_REFERRAL_APPKEY: '"63a55679ba6a5259c4d87121"',
        YM_RENEW_APPKEY: '"63915553ba6a5259c4c89273"',
        CDN_URL: '"https://image-test-pc.narwaltech.com/activity/"'
    },
    prod: {
        NODE_ENV: '"production"',
        EXEC_ENV: '"prod"',
        API: '"/mall"',
        BASE: '"/api/narwal-mall-cbase-applets"',
        USER: '"/user"',
        OPERATION: '"/operation"',
        STORE_URL: '"https://activity.narwaltech.com/"',
        ACT_URL: '"https://activity.narwaltech.com"',
        SERVICE_URL: '"https://bsh5.narwaltech.com/universal/serviceSearch.html"',
        COST_URL: '"https://bsh5.narwaltech.com/fixPartsPrice.html"',
        ECHAT_VISITOR: '"https://activity.narwaltech.com"',
        ECHAT_STAFF: '"https://cn-admin.narwaltech.com"',
        YM_APPKEY: '"64127b0ed64e6861394bc569"',
        YM_SERVER_CENTRT_APPKEY: '"63915553ba6a5259c4c89273"',
        YM_INVITE_APPKEY: '"646d79f1e31d6071ec40c73b"',
        REPORT_DATA_CENTER_URL: '"/report"',
        YM_REFERRAL_APPKEY: '"63a55679ba6a5259c4d87121"',
        YM_RENEW_APPKEY: '"63915553ba6a5259c4c89273"',
        CDN_URL: '"https://image-www.narwal.com/activity/"'
    },
    // 配置文件上传
    file: {
        dev: {
            SERVER_URL: 'https://ctest-act.narwaltech.com/mall',
            ASSETS_CDN: '/'
        },
        test: {
            SERVER_URL: 'https://ctest-act.narwaltech.com/mall',
            // ASSETS_CDN: '/'
            ASSETS_CDN: 'https://image-test-pc.narwaltech.com/activity/'
        },
        prod: {
            SERVER_URL: 'https://api-applet.narwaltech.com/mall',
            // ASSETS_CDN: '/'
            ASSETS_CDN: 'https://image-www.narwal.com/activity/'
        }
    },
    // 代理配置
    proxy: {
        dev: {
            '/mall': {
                // target: 'http://121.37.19.237:9193',
                // target: 'http://116.205.185.44:30193',
                // target: 'http://10.0.83.1:9193',
                // target: 'http://10.0.83.7:9193',
                target: 'https://ctest-act.narwaltech.com',
                changeOrigin: true
            },
            '/api/narwal-mall-cbase-applets': {
                target: 'https://ctest-act.narwaltech.com',
                changeOrigin: true
            },
            '/user': {
                target: 'https://testcn-app.narwaltech.com',
                pathRewrite: {'^/user': ''},
                changeOrigin: true
            },
            '/operation': {
                // target: 'http://121.37.19.237:9183/operate',
                target: 'https://ctest-act.narwaltech.com/operation',
                pathRewrite: {'^/report': '', '^/operation': ''},
                changeOrigin: true
            },
            '/report': {
                target: 'https://ctest-act.narwaltech.com',
                changeOrigin: true
            }
        },
        test: {
            '/mall': {
                target: 'https://ctest-act.narwaltech.com',
                changeOrigin: true
            },
            '/api/narwal-mall-cbase-applets': {
                target: 'https://ctest-act.narwaltech.com',
                changeOrigin: true
            },
            '/user': {
                target: 'https://testcn-app.narwaltech.com',
                pathRewrite: {'^/user': ''},
                changeOrigin: true
            },
            '/operation': {
                target: 'https://ctest-act.narwaltech.com',
                pathRewrite: {'^/report': ''},
                changeOrigin: true
            },
            '/report': {
                target: 'https://ctest-act.narwaltech.com',
                changeOrigin: true
            }
        },
        stress: {
            '/mall': {
                target: 'http://116.205.185.44:30193',
                changeOrigin: true
            },
            '/api/narwal-mall-cbase-applets': {
                target: 'https://ctest-act.narwaltech.com',
                changeOrigin: true
            },
            '/user': {
                target: 'https://testcn-app.narwaltech.com',
                pathRewrite: {'^/user': ''},
                changeOrigin: true
            },
            '/operation': {
                target: 'https://ctest-act.narwaltech.com',
                pathRewrite: {'^/report': ''},
                changeOrigin: true
            },
            '/report': {
                target: 'https://ctest-act.narwaltech.com',
                changeOrigin: true
            }
        },
        prod: {
            '/mall': {
                target: 'https://api-applet.narwaltech.com',
                changeOrigin: true
            },
            '/api/narwal-mall-cbase-applets': {
                target: 'https://api-applet.narwaltech.com',
                changeOrigin: true
            },
            '/user': {
                target: 'https://cn-mall-app.narwaltech.com',
                pathRewrite: {'^/user': ''},
                changeOrigin: true
            },
            '/operation': {
                target: 'https://cn-app.narwaltech.com/operate',
                pathRewrite: {'^/operation': ''},
                changeOrigin: true
            },
            '/report': {
                target: 'https://store.narwal.com',
                changeOrigin: true
            }
        }
    }
};