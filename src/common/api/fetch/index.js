import http from 'common/util/http';
import api from 'common/api';

const REQUEST_CONFIG_KEYS = [
    'alert',
    'cacheURL',
    'headers',
    'loading',
    'lock',
    'params',
    'serialize',
    'token',
    'wait'
];

function splitOption(option = {}) {
    const data = {};
    const config = {};

    Object.keys(option).forEach((key) => {
        if (REQUEST_CONFIG_KEYS.includes(key)) {
            config[key] = option[key];
        } else {
            data[key] = option[key];
        }
    });

    return {data, config};
}

function postApi(name) {
    return function request(option = {}) {
        const {data, config} = splitOption(option);
        return http.post(api[name], data, config);
    };
}

function getApi(name) {
    return function request(option = {}) {
        const {data, config} = splitOption(option);
        return http.get(api[name], {
            ...config,
            params: config.params || data
        });
    };
}

export const FILES_PACKAGE = getApi('FILES_PACKAGE');
export const GET_TOKEN = getApi('GET_TOKEN');
export const UPLOAD_BASE64 = postApi('UPLOAD_BASE64');
export const CREATE_APPLET_CODE = postApi('CREATE_APPLET_CODE');
export const COUPON_TAKE = postApi('COUPON_TAKE');

export function UPLOAD_FILE(option = {}) {
    const formData = new FormData();
    const {file, url, extraData, ...rest} = option;
    const {config} = splitOption(rest);

    if (file) {
        formData.append('file', file);
    }

    Object.keys(extraData || {}).forEach((key) => {
        formData.append(key, extraData[key]);
    });

    return http.post(url || api.UPLOAD_FILE, formData, {
        ...config,
        headers: {
            ...(config.headers || {}),
            'Content-Type': 'multipart/form-data'
        }
    });
}
