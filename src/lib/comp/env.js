export default {
    isClient() {
        return typeof window === 'object';
    },
    isServer() {
        return typeof window === 'undefined';
    },
    value() {
        return process.env.VUE_ENV;
    },
    isProd() {
        return process.env.NODE_ENV === 'production';
    }
};