/**
 * 允许强制将设置倍数为 1
 * 移动适配解决方案
 */
import env from 'lib/comp/env';

const ua = env.isServer() ? 'iphone' : navigator.userAgent.toLocaleLowerCase();

export const viewport = {
    isAndroid: ua.match(/android/gi),
    isIPhone: ua.match(/iphone/gi),
    isWeChat: ua.match(/micromessenger/gi),
    scale: 1,
    init(absDpr) {
        const doc = document;
        const rootEl = doc.documentElement;
        const header = doc.getElementsByTagName('head')[0];
        let viewport = doc.createElement('meta');
        let fontScale = doc.createElement('meta');
        let devicePixelRatio = window.devicePixelRatio;
        let dpr = null;
        let tid = null;
        let rDpr = null;

        if (typeof devicePixelRatio === 'number') {
            rDpr = Math.min(3, Math.max(1, parseInt(devicePixelRatio)));
        } else {
            rDpr = absDpr || 1;
        }

        dpr = typeof absDpr === 'number' ? +absDpr : (this.isIPhone ? rDpr : 1);
        const scale = 1 / dpr;
        const type = this.isIPhone ? 'iphone' : (this.isAndroid ? 'android' : 'other');
        rootEl.setAttribute('data-dpr', dpr);
        rootEl.setAttribute('data-device-type', type);
        rootEl.classList.add(type + '-data-dir-' + rDpr, type + '-h5');
        rootEl.classList.add('device-pixel-' + (rDpr > 1 ? 'n' : '1'));

        viewport.name = 'viewport';
        viewport.content = 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no';
        header.appendChild(viewport);
        fontScale.name = 'wap-han-serif-scale';
        fontScale.content = 'no';
        header.appendChild(fontScale);
        this.scale = scale;

        function refreshRem() {
            let width = doc.documentElement.clientWidth;
            let height = doc.documentElement.clientHeight;
            if (width === 0 || !width) {
                width = rootEl.getBoundingClientRect().width;
            }
            // const rem = (Math.min(width, height) / 10);
            const rem = width / 7.5;
            rootEl.style.fontSize = rem + 'px';
        }

        window.addEventListener('resize', function() {
            clearTimeout(tid);
            tid = setTimeout(refreshRem, 300);
        }, false);

        window.addEventListener('pageshow', function(e) {
            if (e.persisted) {
                clearTimeout(tid);
                tid = setTimeout(refreshRem, 300);
            }
        }, false);

        refreshRem();

        setTimeout(function() {
            refreshRem();
        }, 500);
    }
};

export const rem = function() {
    return env.isServer() ? 50 : parseFloat(window.getComputedStyle(document.documentElement, null).fontSize, 10);
};
export const px2px = function(px, dpr = 1) {
    return rem2px(px2rem(px)) * dpr;
};

export function px2rem(px) {
    return px / 100;
}

export const rem2px = function(px) {
    return px * rem();
};
export const getCurDpr = function() {
    return document.documentElement.hasAttribute('data-dpr') ? parseInt(document.documentElement.hasAttribute('data-dpr'), 10) : window.devicePixelRatio;
};
export const getDeviceType = function() {
    return viewport.isIPhone ? 'iphone' : (viewport.isAndroid ? 'android' : 'other');
};