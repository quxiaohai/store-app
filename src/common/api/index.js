const keys = [

];

const api = keys.reduce((res, key) => {
    res[key] = `/mall/${key}`;
    return res;
}, {});

export default new Proxy(api, {
    get(target, key) {
        if (typeof key !== 'string') {
            return target[key];
        }
        return target[key] || `/mall/${key}`;
    }
});
