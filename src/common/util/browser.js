/// 是否IOS
export function isIOS() {
    return !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
}

/// 是否安卓
export function isAndroid() {
    return !!navigator.userAgent.toLocaleLowerCase().match(/android/gi);
}

/// 是否微信浏览器
export function isWeChat() {
    return !!navigator.userAgent.toLocaleLowerCase().match(/micromessenger/gi);
}

// 是否是PC端微信内置浏览器
export function isWeChatPC() {
    return !!navigator.userAgent.toLocaleLowerCase().match(/windowswechat/i);
}

// 是否微信小程序
export function isWeApp() {
    return /miniprogram/.test(navigator.userAgent.toLocaleLowerCase());
}

// 是否是微博内置浏览器
export function isWeibo() {
    return !!navigator.userAgent.toLocaleLowerCase().match(/weibo/i);
}

// 否是支付宝内置浏览器
export function isAlipay() {
    return !!navigator.userAgent.toLocaleLowerCase().match(/alipayclient/i);
}

// 是否是钉钉内置浏览器
export function isDingTalk() {
    return !!navigator.userAgent.toLocaleLowerCase().match(/dingtalk/i);
}

// 是否是safari
export function isSafari() {
    return !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
}