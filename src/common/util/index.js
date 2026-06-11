/***********
 * 工具类，汇总
 */
import bridge from 'common/util/bridge';
import wx from 'common/util/jweixin-1.6.0';
import { getRandom } from 'lib/util/digit';
import { GET_TOKEN, UPLOAD_BASE64 } from 'common/api/fetch';
import { clientRouter, useRouter } from 'common/router';
import { clientStore } from 'common/store';
import env from 'lib/comp/env';
import base64 from 'lib/str/base64';
import {
    DEFAULT_VIDEO_COVER,
    ORDER_SOURCE_PLATFORM,
    TOKEN,
    CACHE_WECHAT_OPENID,
    CACHE_H5_REDIRECT,
    WX_PAY_APPID, APPLET_ID_MAP
} from 'common/util/constant';
import storage from 'lib/util/storage';
import { isObject, isString, isFunction } from 'lib/util/dataType';
import queryUtil from 'lib/json/query';
import calendar from 'lib/util/calendar';
import { isWeChat, isWeChatPC } from 'common/util/browser';
import { $layer } from 'common/util/global-properties';

// 记录最后一次token
let _lastCreateToken = null;

// 登录
export function toLogin(replace, fullPath) {
    const router = useRouter();
    const route = router.currentRoute.value;
    if (env.isClient() && bridge.isApp()) {
        return router.push({
            path: '/login/app',
            query: {
                url: fullPath || route.fullPath
            }
        });
    }

    if (env.isClient() && bridge.isWeApp()) {
        // 小程序
        const fetchId = getRandom(32);
        wx.miniProgram.navigateTo({
            url: `/views/login/index?fetchId=${fetchId}&type=_ssr_activity_&time=${Date.now()}&url=${encodeURIComponent(fullPath || route.fullPath)}`
        });

        return fetchId;
    }

    const type = replace ? 'replace' : 'push';
    router[type]({
        path: '/login',
        query: {
            url: fullPath || route.fullPath,
            type
        }
    });
}

// 回首页
export function toHome() {
    if (bridge.isApp()) {
        bridge.toAppHomePage('0');
    } else {
        toPage('/index', 'switchTab');
    }
}

// 判断是否登录
export function isLogin() {
    return !!clientStore.state.token || !!storage.cookie.get(TOKEN);
}

// 获取token
export function getToken() {
    let timer = null;
    let count = 0;

    function start(fetchId) {
        timer = setTimeout(async () => {
            const token = await GET_TOKEN({
                params: {
                    fetchId,
                    type: 'get'
                }
            });

            if (token) {
                console.log('token', token);
                clientStore.commit('UPDATE_TOKEN', token);
                return over();
            }

            count++;
            if (count < 50) {
                start(fetchId);
            }
        }, 200);
    }

    function over() {
        console.log('已经结束');
        clearTimeout(timer);
        timer = null;
    }

    return {
        start,
        over
    };
}

/// 解析地址，看是否需要显示缩略图
export function getThumbnailImg(url, only) {
    const def = only === true ? DEFAULT_VIDEO_COVER : url;
    if (!url) return def;
    const sign = 'thumbnailUrl=';
    const key = url.indexOf(sign);
    if (key > -1) {
        const array = url.split(sign);
        let value = array[1];
        let other = value.indexOf('&');
        if (other > -1) value = value.slice(0, other);
        return base64.decode(value);
    } else {
        return def;
    }
}

/**********
 * 获取小程序实际URL
 * @param url
 * @returns {string}
 */
export function realAppletUrl(url) {
    const arr = url.split('?');
    let path = arr[0].replace(/(\/?spread)|(\/?views)|(\/index)/g, '');

    // 去首页
    if (path === '' && arr[0].includes('/index')) {
        path = '/index';
    }

    let packName = '';
    // 判断是否在分包内
    // 第一个分包名称 - spread
    if (arr[0].includes('spread/')) {
        packName = '/spread';
    }

    return `${packName}/views${path}/index${arr.length > 1 ? '?' + arr[1] : ''}`;
}

/**********
 * 获取活动平台实际URL
 * @param url
 * @returns {string}
 */
export function realUrl(url) {
    const arr = url.split('?');
    let path = arr[0].replace(/(\/?spread)|(\/?views)|(\/index)/g, '');

    // 如果是完整域名，直接返回
    if (/^(https?:\/\/)/.test(url)) {
        return url;
    }

    // 去活动平台
    if (path === '/act') {
        const obj = queryUtil.parse(arr[1]);
        const url = obj.path;
        delete obj.path;
        return queryUtil.url(url, obj);
    }

    // 小程序推荐有礼地址
    if (path === '/activities/referral') {
        const obj = queryUtil.parse(arr[1]);
        return queryUtil.url(`/referral/${obj.referral_id}`, obj);
    }

    // 去首页
    if (path === '' && arr[0].includes('/index')) {
        path = '/index';
    }

    let packName = '';
    // 判断是否在分包内
    // 第一个分包名称 - spread
    if (arr[0].includes('spread/')) {
        packName = '/spread';
    }

    return `${packName}${path}${arr.length > 1 ? '?' + arr[1] : ''}`;
}

/*************
 * 判断是否是小程序路径
 * @param url
 */
export function isWeAppUrl(url) {
    if (/\/pages\/[a-z0-9_]/.test(url)) {
        return false;
    }
    return !!(/(\/?views)/g.test(url) || url?.startsWith('/act'));
}

/************
 * 去其它页面
 * @param url
 * @param type 默认push
 */
export function toPage(url, type) {
    if (bridge.isWeApp()) {
        if (isObject(url)) {
            const { path, query } = url;
            url = queryUtil.url(path, query);
        }

        let fullPath = realAppletUrl(url);

        const map = {
            replace: 'redirectTo',
            launch: 'reLaunch',
            switchTab: 'switchTab'
        };

        wx.miniProgram[map[type] || 'navigateTo']({
            url: fullPath
        });
    } else {
        clientRouter.push(url);
    }
}

/************
 * base64转文件
 * @param dataURL
 * @param filename
 * @returns {File}
 */
export function dataURLtoFile(dataURL, filename) {
    // 获取到base64编码
    const base64 = dataURL.split(',')[1];
    // 将base64编码转为字符串
    const bStr = window.atob(base64);
    let n = bStr.length;
    const u8arr = new Uint8Array(n); // 创建初始化为0的，包含length个元素的无符号整型数组
    while (n--) {
        u8arr[n] = bStr.charCodeAt(n);
    }
    return new File([u8arr], filename, {
        type: 'image/jpeg'
    });
}

/**************
 *
 * @param dataURL
 * @returns {File}
 */
export function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    // 将base64编码转为字符串
    const bStr = window.atob(arr[1]);
    let n = bStr.length;
    const u8arr = new Uint8Array(n); // 创建初始化为0的，包含length个元素的无符号整型数组
    while (n--) {
        u8arr[n] = bStr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

/***************
 * 下载文件
 * @param url
 * @param name
 */
export function downloadFile(url, name) {
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', name);
    a.setAttribute('target', '_blank');
    // let clickEvent = document.createEvent('MouseEvents');
    // clickEvent.initEvent('click', true, true);
    // a.dispatchEvent(clickEvent);
    // 创建鼠标事件并初始化（参考文档吧https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent）
    var clickEvent = new MouseEvent(
        'click',
        (true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    );
    //派遣后，它将不再执行任何操作。执行保存到本地
    a.dispatchEvent(clickEvent);
    setTimeout(() => {
        //释放一个已经存在的路径（有创建createObjectURL就要释放revokeObjectURL）
        URL.revokeObjectURL(url);
    }, 1000);
}

/*******
 * 下载服务端文件
 * @param url
 */
export function downLoadServerFile(url) {
    return new Promise((resolve, reject) => {
        try {
            const format = url?.split('?')[0]?.split('.')?.pop();
            const req = new XMLHttpRequest();
            var rejectWithError = function() {
                reject();
            };
            req.open('GET', url, true);
            req.responseType = 'blob';
            req.onload = () => {
                const blob = new Blob([req.response], {
                    type: `application/${format}`
                });
                var url = URL.createObjectURL(blob);
                downloadFile(url, `file-${Date.now()}.${format}`);
                resolve(url);
            };
            req.onerror = rejectWithError;
            req.send();
        } catch (e) {
            reject();
        }
    });
}

/************
 * 下载base64文件
 * @param base64
 * @param name
 */
export function downloadBase64File(base64, name = 'image.jpg') {
    var blob = dataURLtoBlob(base64);
    var url = URL.createObjectURL(blob);
    downloadFile(url, name);
}

/***********
 *保存相册
 * @param option
 * {
 *     activityName: 活动名称
 *     base64: 保存图片
 *     onClose: 关闭
 *     onWxSave: 保存
 *     toast: 提示
 *     complete: 完成
 * }
 */
export function photoAlbum(option) {
    bridge
        .shareItemAction({
            type: 'PhotoAlbum',
            extraParam: { activityName: option.activityName },
            thumbUrl: option.base64
        })
        .then((res) => {
            option?.complete(true);
            option?.onClose();
            option?.toast(res.errMsg || '保存成功');
        })
        .catch((res) => {
            option?.complete(false);
            option?.toast(res.errMsg || '保存失败，请重试~');
        });
}

/********
 * 分享朋友圈
 * @param option
 * {
 *     base64: 海报
 *     url: 海报网络地址
 *     title: 分享标题
 *     activityName: 活动名称
 *     onClose: 关闭
 *     toast: 提示
 *     complete: 完成
 * }
 */
export async function moments(option) {
    // 分享朋友圈
    const data = !!option.url ? { url: option.url } : await UPLOAD_BASE64({
        base64: option.base64,
        wait: '分享中'
    });

    if (!data) {
        option?.complete(false);
        return option?.toast('分享失败，请重试~');
    }

    bridge
        .shareItemAction({
            type: 'Moments',
            sourceId: 'app',
            title: option.title || '推荐有礼',
            resourceType: 'image',
            url: data.url,
            extraParam: { activityName: option.activityName }
        })
        .then((res) => {
            option?.complete(true);
            option?.onClose();
            option?.toast(res.errMsg || '分享成功');
        })
        .catch((res) => {
            option?.complete(false);
            option?.toast(res.errMsg || '分享失败，请重试~');
        });
}

/*********
 * 分享微信好友
 * @param option
 * {
 *     image: 分享图片
 *     url: 分享URL
 *     title: 分享标题
 *     activityName: 活动名称
 *     onClose: 关闭
 *     toast: 提示
 *     complete: 完成
 * }
 */
export function wxChat(option) {
    bridge
        .shareItemAction({
            type: 'WxChat',
            sourceId: 'app',
            miniprogramType: process.env.EXEC_ENV === 'prod' ? 'release' : 'beta',
            title: option.title,
            resourceType: 'miniProgram',
            url: option.url,
            thumbUrl: option.image,
            extraParam: { activityName: option.activityName }
        })
        .then((res) => {
            option?.complete(true);
            option?.onClose();
            option?.toast(res.errMsg || '分享成功');
        })
        .catch((res) => {
            option?.complete(false);
            option?.toast(res.errMsg || '分享失败，请重试~');
        });
}

/**********
 * 图片加载
 * @param src
 * @param defImg
 * @returns {Promise<unknown>}
 */
export function imageLoad(src, defImg) {
    return new Promise((resolve) => {
        let img = new Image();
        img.crossOrigin = '';
        img.src = src;
        if (img.complete) {
            resolve(img);
            console.log('img-complete');
        }

        img.onload = (e) => {
            resolve(img);
            console.log('img-load', e);
        };

        img.onerror = (e) => {
            resolve(defImg || img);
            console.log('img-err', e);
        };
    });
}

/*********
 * 获取媒体类型
 * @param url
 */
export function getMediaType(url) {
    const regImage = /(.png|.jpg|.jpeg|.dng|.gif|.webp|.jfif|.heic)/;
    const regVideo = /(\.quicktime|\.mp4|\.mov|\.webm|\.ogg|\.3gp)/;
    url = url?.toLocaleLowerCase() || '';
    if (regImage.test(url)) {
        return 'image';
    } else if (regVideo.test(url)) {
        return 'video';
    }
    return 'other';
}

// 获取文件名后缀
export function getFileType(filePath) {
    const key1 = filePath?.indexOf('?');
    const path = key1 > -1 ? filePath?.slice(0, key1) : filePath;
    const startIndex = path?.lastIndexOf('.');
    if (startIndex !== -1) return path.substring(startIndex + 1, path.length).toLowerCase();
    else return '';
}

/**
 * 不用转换的图片格式
 * @param {*} url
 * @returns
 */
export function getNormalImageType(url) {
    const regImage = /(.png|.jpg|.jpeg|.dng|.gif|.webp|.jfif)/;
    url = url?.toLocaleLowerCase() || '';
    return regImage.test(url);
}

/**
 * 全部图片格式
 * @param {*} url
 * @returns
 */
export function getAllImageType(url) {
    const regImage = /(.png|.jpg|.jpeg|.dng|.gif|.webp|.jfif|.heic)/;
    url = url?.toLocaleLowerCase() || '';
    return regImage.test(url);
}

/**********
 * 图片转换为jpg
 * @param file
 * @param maxWidth
 */
export function convertImgToJpg(file) {
    return new Promise((resolve) => {
        try {
            const reader = new FileReader();
            reader.onload = function(result) {
                if (file.type?.indexOf('/gif') > -1) {
                    return resolve({
                        file
                    });
                }
                const maxWidth = 1080;
                const img = new Image();
                img.src = result?.target?.result;
                img.onload = function() {
                    const radio = img.width > maxWidth ? maxWidth / img.width : 1;
                    const w = radio * img.width;
                    const h = radio * img.height;
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.setAttribute('width', w);
                    canvas.setAttribute('height', h);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, w, h);
                    ctx.drawImage(img, 0, 0, w, h);
                    const base64 = canvas.toDataURL('image/jpeg', 1);
                    const newFile = dataURLtoFile(base64, `${file.name}.jpg`);

                    resolve({
                        file: newFile
                    });
                };
                img.onerror = function() {
                    resolve({
                        file: file
                    });
                };
            };
            reader.readAsDataURL(file);
        } catch (e) {
            resolve({ file });
        }
    });
}

/**********
 * 压缩图片
 * @param file
 * @param maxWidth
 */
export function compressPictures(file, maxWidth) {
    return new Promise((resolve) => {
        try {
            const reader = new FileReader();
            reader.onload = function(result) {
                if (file.type?.indexOf('/gif') > -1) {
                    return resolve({
                        file,
                        base64: result?.target?.result
                    });
                }

                const img = new Image();
                img.src = result?.target?.result;
                img.onload = function() {
                    const radio = img.width > maxWidth ? maxWidth / img.width : 1;
                    const w = radio * img.width;
                    const h = radio * img.height;
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.setAttribute('width', w);
                    canvas.setAttribute('height', h);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, w, h);
                    ctx.drawImage(img, 0, 0, w, h);
                    const base64 = canvas.toDataURL(file.type, 0.8);
                    const newFile = dataURLtoFile(base64, file.name);

                    resolve({
                        file: newFile,
                        base64,
                        width: w,
                        height: h
                    });
                };
            };
            reader.readAsDataURL(file);
        } catch (e) {
            resolve({ file });
        }
    });
}

/*******
 * 返回JSON
 * @param str
 * @param def
 * @returns {*}
 */
export function getJSON(str, def) {
    if (!str) {
        return def || str;
    }
    try {
        return new Function(`return ${str}`)();
    } catch (e) {
        return def || str;
    }
}

/*******
 * 设置title
 * @param title
 */
export function setTitle(title) {
    if (title && env.isClient()) {
        document.title = title?.value || title;
    }
}

/***********
 * SSR数据回调
 * @param info
 * @param fullPath
 */
export function ssrCallback(info, fullPath) {
    setTitle(info?.title);
    setAppTool(info?.appToolStatus);
}

// 获取设备来源
export function getDeviceSource() {
    if (bridge.isWeApp()) {
        return ORDER_SOURCE_PLATFORM.applet;
    } else if (bridge.isApp()) {
        return ORDER_SOURCE_PLATFORM.app;
    } else {
        return ORDER_SOURCE_PLATFORM.h5;
    }
}

// 获取评价时间
export function getDayText(v) {
    let day = calendar.getCompareDateDay(v, calendar.getDate());
    let rs = calendar.format(v, 'yyyy-MM-dd HH:mm');
    if (day < 360) {
        rs = Math.ceil(day / 30) + '月前评价';
    } else {
        rs = Math.ceil(day / 360) + '年前评价';
    }
    if (day < 30) {
        rs = parseInt(day) + '天前评价';
    }
    if (day < 1) {
        day *= 24;
        rs = parseInt(day) + '小时前评价';
    }
    if (day < 1) {
        day *= 60;
        rs = parseInt(day) + '分钟前评价';
    }
    if (day < 1) {
        rs = '刚刚评价';
    }
    return rs;
}

// 拼接地址
export function getAddressString(address) {
    const list = [address.stateName, address.cityName, address.regionsName, address.detailAddr];
    return list.join(', ');
}

// 获取定位
export function geoLocation(option) {
    return new Promise((resolve, reason) => {
        option = Object.assign({
            enableHighAccuracy: true,
            timeout: 3000,
            maximumAge: 5000
        }, option || {});

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(function(pos) {
                var obj = {};

                for (var p in pos['coords']) {
                    obj[p] = pos['coords'][p];
                }

                resolve({
                    'code': 0,
                    'msg': 'success',
                    'data': obj
                });
            }, function(error) {
                var msg = '';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = '用户拒绝对获取地理位置的请求。';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = '位置信息是不可用的。';
                        break;
                    case error.TIMEOUT:
                        msg = '请求用户地理位置超时。';
                        break;
                    // case error.UNKNOWN_ERROR:
                    default:
                        msg = '未知错误。';
                        break;
                }

                console.error('定位获取失败，原因：' + msg);

                reason({
                    'code': -1,
                    'msg': msg,
                    'data': null
                });
            }, option);
        } else {
            console.error('定位获取失败，原因：不支持geolocation');

            reason({
                'code': -2,
                'msg': '不支持geolocation',
                'data': null
            });
        }
    });
}

/// 替换掉特殊字符
export function filterSpecString(value) {
    try {
        if (isString(value)) {
            const reg = /[^A-Za-z0-9\u4e00-\u9fa5～！@#¥（）=【】「」｜、’”；：《》，。——……\-\^\.\,\|\?\<\>\{\}\x20]/g;
            return value.replace(reg, '');
        } else {
            return value;
        }
    } catch (e) {
        return value;
    }
}

/*********
 * webp兼容
 * @param url
 * @returns {string|*}
 */
export function getWebpImg(url) {
    if (!url) return null;
    const sign = 'jpg_url=';
    const key = url.indexOf(sign);
    if (key > -1) {
        const array = url.split(sign);
        let value = array[1];
        let other = value.indexOf('&');
        if (other > -1) value = value.slice(0, other);
        return base64.decode(value);
    } else {
        return null;
    }
}

/*******
 * 去支付页面
 * @param orderNo
 * @param mode
 * @param params 附加参数 以旧换新使用
 */
export function toPay(orderNo, mode, params = {}) {

    // 如果在小程序内，直接跳到小程序支付
    if (bridge.isWeApp()) {
        if (mode === 'trade' || mode === 'act') {
            toPage({
                path: '/order/pay',
                query: { orderNo, mode, ...params }
            }, 'replace');
        } else {
            toPage({
                path: '/order/pay',
                query: { orderNo, mode }
            }, 'replace');
        }
        return false;
    }


    function toWebPay() {
        if (mode === 'trade' || mode === 'act') {
            clientRouter.replace({
                path: '/order/pay',
                query: { orderNo, mode, ...params }
            });
        } else {
            clientRouter.replace({
                path: '/order/pay',
                query: { orderNo, mode }
            });
        }
    }

    try {
        const isWxBro = isWeChat() && !isWeChatPC();
        if (isWxBro) {
            const openid = storage.get(CACHE_WECHAT_OPENID);
            if (!!openid) {
                toWebPay();
            } else {
                // 没有拿到openId时进行授权
                const base = 'https://open.weixin.qq.com/connect/oauth2/authorize';
                const api = 'https://mall.narwal.com/mall/pay/getOpenId';
                const state = encodeURIComponent(getLocationOrigin() + '/order/h5-redirect');
                storage.set(CACHE_H5_REDIRECT, orderNo);
                location.href = `${base}?appid=${WX_PAY_APPID}&redirect_uri=${api}&response_type=code&scope=snsapi_base&state=${state}&connect_redirect=1#wechat_redirect`;
            }
        } else {
            toWebPay();
        }
    } catch (e) {
        toWebPay();
    }
}

// 获取路由的域名
export function getLocationOrigin() {
    if (!location.origin) {
        return (
            location.protocol +
            '//' +
            location.hostname +
            (location.port ? ':' + location.port : '')
        );
    } else {
        return location.origin;
    }
}

/// 获取当前支付回调地址
export function getOrderPayCallback() {
    return {
        payCancelUrl: getLocationOrigin() + '/order/pay-finish?orderNo={orderNo}',
        payResultUrl: getLocationOrigin() + '/order/pay-finish?orderNo={orderNo}'
    };
}

/// 获取当前微信支付回调地址
export function getOrderWxPayCallback(orderNo) {
    return encodeURIComponent(getLocationOrigin() + '/order/pay-finish?orderNo=' + orderNo);
}

// 获取手机号掩码
export function getMaskPhone(phone) {
    if (isString(phone)) {
        return phone.slice(0, 3) + '******' + phone.slice(-3);
    } else {
        return phone;
    }
}

/************
 * 复制文字
 * @param content
 */
export function copyText(content) {
    const node = document.createElement('INPUT');
    node.style.cssText = 'position: fixed; top: -100000px;';
    document.body.appendChild(node);
    node.value = content;
    node.focus();
    node.select();
    let range = document.createRange();
    range.selectNodeContents(node);
    let sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    node.setSelectionRange(0, 9999);
    document.execCommand('copy');
    node.blur();
    document.body.removeChild(node);
}

/***********
 * 获取文案长度
 * @param text
 * @param size
 */
export function getTextWidth(text, size) {
    const canvas = document.createElement('CANVAS');
    canvas.width = 1000;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.font = `${size || 14}px sans-serif`;
    return ctx.measureText(text).width;
}

/// 解析图片尺寸
export function getImageSize(url) {
    if (!url) return null;
    const sign = 'size=';
    const key = url.indexOf(sign);
    if (key > -1) {
        const array = url.split(sign);
        let value = array[1];
        let other = value.indexOf('&');
        if (other > -1) value = value.slice(0, other);
        const arr = value.split('-');
        return {
            width: arr[0],
            height: arr[1]
        };
    } else {
        return null;
    }
}

// 微信订阅消息
export function subscribeMessage(callback, mode) {
    if (isFunction(callback)) callback();
    if (bridge.isWeApp()) {
        toPage({
            path: '/subscribe',
            query: {
                mode
            }
        });
    }
}

// 资源位跳转
export function toPageLink(obj = {}) {
    const type = obj.pageType;
    switch (type) {
        case 1:
            // 站内路径
            clientRouter.push(realUrl(decodeURIComponent(obj.pageUrl)));
            break;
        case 2:
            // 站外路径
            location.href = decodeURIComponent(obj.pageUrl);
            break;
        case 3:
            // 商品详情
            toPage(`/product/detail?serialNumber=${obj.productSerialNumber}&skuId=${obj.productSku}`);
            break;
        case 4:
            // 自定义页面
            // 活动专区
            if (obj.customPageType === 4) {
                clientRouter.push(`/spread/custom-iwd?pageId=${obj.customPageId}`);
            } else {
                clientRouter.push(`/rich?pageId=${obj.customPageId}`);
            }
            break;
        case 5:
            // 以旧换新
            clientRouter.push(`/spread/renew/detail/${obj.activityId}`);
            break;
        case 6:
            // 商品类型
            toPage(`/product/classify?productTypeId=${obj.productTypeId}`);
            break;
        case 7:
            // 跳转其它小程序
            if (!bridge.isWeApp()) {
                const url = decodeURIComponent(obj.pageUrl);
                if (url?.length > 4) {
                    location.href = url;
                    return true;
                }

                return $layer.toast('当前环境不支持跳转其它小程序');
            }

            toPage({
                path: '/navigate-applet',
                query: {
                    appId: APPLET_ID_MAP[obj.appletId] || obj.appletId,
                    appPath: obj.appletPath || ''
                }
            });
            break;
    }
}

// 创建JS
export function createScript(url) {
    const root = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.async = true;
    script.defer = 'defer';
    script.src = url;
    root.appendChild(script);
}

// 创建CSS
export function createCss(url) {
    const root = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');
    link.href = url;
    link.type = 'text/css';
    link.rel = 'stylesheet';
    root.appendChild(link);
}

// 获取图片base64
export function getImageBase64(img, quality) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
    return canvas.toDataURL('image/jpeg', quality || 1);
}

/*********
 * 资源位是否显示
 * @param date 当前时间
 * @param obj 资源位数据
 */
export function resourceShow(date, obj) {
    const now = !!date ? calendar.now(date) : Date.now();
    const start = calendar.now(obj.showStartTime);
    const end = calendar.now(obj.showEndTime);
    if (now < start || now >= end) {
        return false;
    }
    // 不重复，按照配置的时间范围
    if (obj.activityPeriod === 0) {
        return now >= start && now <= end;
    }
    const str = calendar.format(now, 'yyyy-MM-dd');
    const timeStart = calendar.now(`${str} ${obj.startShowPeriod}`);
    const timeEnd = calendar.now(`${str} ${obj.endShowPeriod}`);
    // 每天重复 范围内
    const isTimeScope = now >= timeStart && now < timeEnd;
    if (obj.activityPeriod === 2) {// 每周重复
        const week = calendar.parse(now).getDay() + 1;
        const repeatDay = isString(obj.repeatDay) ? obj.repeatDay.split(',').filter(r => !isNaN(r)).map(r => parseInt(r)) : obj.repeatDay;
        return isTimeScope && !!repeatDay.includes(week);

    } else if (obj.activityPeriod === 3) {// 每月重复
        const day = calendar.parse(now).getDate();
        const repeatDay = isString(obj.repeatDay) ? obj.repeatDay.split(',').filter(r => !isNaN(r)).map(r => parseInt(r)) : obj.repeatDay;
        return isTimeScope && !!repeatDay.includes(day);
    }

    return isTimeScope;
}

// 验证用户浏览器是否是微信内置浏览器
export function isWeiXinFun() {
    const ua = navigator.userAgent.toLowerCase();
    const list = ua.match(/MicroMessenger/i) || [];
    return list[0] === 'micromessenger';
}

// token前半段替换为*****
export function transformTokenUrl(url) {
    if (url.includes('token')) {
        const arr = decodeURIComponent(url).split('?');
        const obj = queryUtil.parse(arr[1]);
        if (obj.token) {
            let token = obj.token.replace(/^([^\.]*)/g, '*****');
            return queryUtil.url(url, { token });
        }
    }
    return url;
}