const path = require('path');
module.exports = {
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../src'),
            lib: path.resolve(__dirname, '../src/lib'),
            common: path.resolve(__dirname, '../src/common'),
            views: path.resolve(__dirname, '../src/views'),
            assets: path.resolve(__dirname, '../assets')
        },
        fallback: {
            'punycode': require.resolve('punycode/'),
            'querystring': require.resolve('querystring-es3')
        },
        extensions: ['*', '.js', '.vue', '.json', '.scss']
    }
};
