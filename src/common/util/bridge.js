import { $layer } from 'common/util/global-properties';
import { getJSON } from 'common/util/index';

/*********
 * APP对接
 * window.getTitle.postMessage(string)
 * window.toAppPage.postMessage(string) // 前往app页面
 * window.toContactService.postMessage(string)
 * window.toAppDownloadApk.postMessage(string)
 * window.toShareWxSession.postMessage(string)
 * window.getUseLoginMessage.postMessage(string) // 获取登陆信息
 * window.EchatJsBridge.postMessage(string)
 */
let _back_events = [];

const _appRequestMQ = {
    map: {},
    mq: [],
    running: [],
    push: function push(fn) {
        fn.t = +new Date();
        while (this.mq.indexOf(fn.t) > -1 || this.running.indexOf(fn.t) > -1) {
            fn.t += (Math.random() * 10) >> 0;
        }
        this.mq.push(fn.t);
        this.map[fn.t] = fn;
        return this.next();
    },
    next: function next() {
        var me = this;
        if (this.mq.length === 0) return;
        if (this.running.length === 0) {
            var newone = this.mq.shift();
            var fn = this.map[newone];
            fn(function() {
                me.running.splice(me.running.indexOf(fn.t), 1);
                delete me.map[fn.t];
                me.next();
            });
            this.running.push(fn.t);
        }
    }
};

// 请求回调名称
const getCallbackName = (() => {
    let num = 1;
    return function() {
        return `callback_${num++}`;
    };
})();

const bridge = {
    initMethods(route) {
        window.showWebToast = function(obj) {
            const opt = getJSON(obj.content);
            if (opt?.type === 'alert') {
                $layer.alert(opt.content, {
                    title: opt.title,
                    okText: opt.confirmText
                }).then(res => {
                    bridge.webDialogConfirm('alert');
                });
            } else if (opt?.type === 'confirm') {
                $layer.confirm(opt.content, {
                    title: opt.title,
                    okText: opt.confirmText,
                    cancelText: opt.cancelText
                }).then(res => {
                    bridge.webDialogConfirm('confirm');
                }).catch(res => {
                    bridge.webDialogCancel('confirm');
                });
            } else {
                $layer.toast(opt.content, {
                    showTime: opt.duration ? opt.duration * 1000 : 2000
                });
            }
        };

        console.log('函数初始化了：goBackHomePage');

        window.goBackHomePage = function() {
            window.location.href = `${process.env.STORE_URL}`;
        };

        // 回退前执行
        window.beforeBack = function() {
            _back_events.forEach(fn => {
                fn();
            });

            _back_events = null;
        };

        /// 清除标题
        bridge.setAppTitle();
    },
    // 添加后退监听事件
    addListenerBack(fn) {
        if (typeof fn === 'function') {
            _back_events.push(fn);
        }
    },
    // 设置APP导航标题
    setAppTitle(title) {
        window.getTitle?.postMessage(title || '  ');
    },
    // 弹框确认
    webDialogConfirm(type) {
        window.webDialogConfirm?.postMessage(type);
    },
    // 弹框取消
    webDialogCancel(type) {
        window.webDialogCancel?.postMessage(type);
    },
    isApp() {
        return !!window.getUseLoginMessage;
    },
    // 是否微信小程序
    isWeApp() {
        return /miniprogram/.test(navigator.userAgent.toLocaleLowerCase());
    },
    // 跳商城首页
    toAppHomePage(tabType) {
        window.toAppHomePage?.postMessage(tabType);
    },
    toBindDevice() {
        window.toBindDevice?.postMessage('');
    },
    toLogin() {
        window.toLogin?.postMessage('');
    },
    toExit() {
        window.toExitWebview?.postMessage('');
    },
    getUserInfo(call) {
        return new Promise(resolve => {
            _appRequestMQ.push(callback => {
                let fail = false;
                const timer = setTimeout(() => {
                    resolve(null);
                    fail = true;
                    callback && callback();
                }, 2000);
                window.setUseLoginMessage = json => {
                    clearTimeout(timer);
                    window.setUseLoginMessage = null;
                    call && call(json);
                    resolve(json);
                    console.log(json);
                    !fail && callback && callback();
                };
                window.getUseLoginMessage?.postMessage('');
            });
        });
    },
    // 是否符合指定版本 s1版本号 2.2.35及之后 j4版本号2.3.16
    minVersion(ver) {
        return new Promise(resolve => {
            const timer = setTimeout(() => {
                resolve(false);
            }, 2000);
            bridge.getUserInfo(json => {
                    clearTimeout(timer);
                    const lows = ver?.split('.')?.map(r => Number(r)) || [2, 2, 35];
                    const version = json.version?.split('.');
                    const one = Number(version[0]);
                    const two = Number(version[1]);
                    let three = Number(version[2]);
                    three = three < 10 ? three * 10 : three;
                    if (one > lows[0]) {
                        resolve(true);
                    } else if (one === lows[0] && two > lows[1]) {
                        resolve(true);
                    } else if (one === lows[0] && two === lows[1] && three >= lows[2]) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            );
        });
    },
    // APP分享
    shareItemAction(option) {
        return new Promise((resolve, reject) => {
            window.appCommonResponse = json => {
                if (json?.result?.errCode === 0) {
                    resolve(json.result);
                } else {
                    reject(json.result);
                }
                console.log(json);
                window.appCommonResponse = null;
            };
            window.shareItemAction?.postMessage(JSON.stringify(option));
        });
    },
    // 分享弹框时调用，APP埋点
    showWebShareDialog(actName) {
        window.showWebShareDialog?.postMessage(actName);
    },
    // 分享弹框关闭时调用，APP埋点
    webShareDialogCloseAction(actName) {
        window.webShareDialogCloseAction?.postMessage(actName);
    },
    // 选择相册和拍照
    chooseImage() {
        return new Promise((resolve, reject) => {
            window.appCommonResponse = json => {
                if (json?.result?.errCode === 0) {
                    resolve(json.result);
                } else {
                    reject(json.result);
                }
                console.log(json);
                window.appCommonResponse = null;
            };
            window.chooseImage?.postMessage('');
        });
    },
    // 支付
    toLaunchAppPayment(option) {
        return new Promise((resolve, reject) => {
            window.appCommonResponse = json => {
                if (json?.result?.errCode === 0) {
                    resolve(json.result);
                } else {
                    reject(json.result);
                }
                console.log(json);
                window.appCommonResponse = null;
            };
            window.toLaunchAppPayment?.postMessage(JSON.stringify(option));
        });
    },
    /// 是否可以设置App Bar
    canCustomSetAppBar() {
        return !!window.syncCustomAppBarElements;
    },
    /// 同步App Bar
    syncCustomAppBarElements(type) {
        window.syncCustomAppBarElements?.postMessage(type);
    },
    /// 跳APP ar
    toAppArPage(deviceName) {
        window.toAppArPage?.postMessage(JSON.stringify({
            resourceId: deviceName || ''
        }));
    },
    /// APP帮助中心
    gotoHelperCenter() {
        window.gotoHelperCenter?.postMessage('');
    },
    /// APP在线客服
    gotoEchat() {
        window.gotoEchat?.postMessage('');
    },
    // 是否显示上传日志
    isShowUpLog() {
        return new Promise(resolve => {
            window.appCommonResponse = json => {
                if (json?.result) {
                    resolve(true);
                } else {
                    resolve(false);
                }
                console.log(json);
                window.appCommonResponse = null;
            };
            window.isShowUpLog?.postMessage('');
        });
    },
    // 是否展示问题反馈平台按钮
    isShowFeedback() {
        return new Promise(resolve => {
            window.appCommonResponse = json => {
                if (json?.result) {
                    resolve(true);
                } else {
                    resolve(false);
                }
                console.log(json);
                window.appCommonResponse = null;
            };
            window.isShowFeedback?.postMessage('');
        });
    },
    // 上传日志
    toUploadLog() {
        window.toUploadLog?.postMessage('');
    },
    // 问题反馈
    toFeedback() {
        window.toFeedback?.postMessage('');
    },
    /// APP文件上传
    getAppPhoto(option) {
        return new Promise((resolve, reject) => {
            window.appCommonResponse = json => {
                if (json?.result === 1) {
                    resolve(json.data);
                } else {
                    reject(json);
                }
                console.log(json);
                window.appCommonResponse = null;
            };
            window.getAppPhoto?.postMessage(JSON.stringify(option || { private: 2, type: 1 }));
        });
    },
    /**
     * @description: jsBridge通用方法
     * @param name 参数
     * @param {*} args 参数
     * @param {*} timeout 超时时间 默认300毫秒
     * @return {*}
     */
    jsBridgeCall(name, args = [], timeout = 300) {
        return new Promise((resolve, reject) => {
            // 请求超时设置
            const timer = setTimeout(() => {
                // @ts-ignore
                window[callbackName] = null;
                reject(new Error('jsBridge超时'));
            }, timeout);

            //  生成回调名称
            const callbackName = getCallbackName();

            const params = {
                'id': callbackName,
                'action': 'call',
                'name': name,
                'param_t': 0,
                args,
                receiver: callbackName
            };

            window[callbackName] = (res) => {
                resolve(res);
                window[callbackName] = null;
                clearTimeout(timer);
            };

            window.NrCommonMsgPort?.postMessage(JSON.stringify(params));
        });
    },
    // 获取当前主题模式
    appThemeMode() {
        return bridge.jsBridgeCall('appThemeMode').then((res = { value: [] }) => {
            return res.value[0];
        });
    },
    /**
     * @description: 接收App消息
     * @return {*}
     */
    createNotify() {
        // 监听Set
        const observers = new Set();

        // 添加监听
        function addObserver(observer) {
            observers.add(observer);
        }

        // 移除监听
        function removeObserver(observer) {
            observers.delete(observer);
        }

        // 通知所有监听者
        window.handleMessageFromNrApp = (message) => {
            observers.forEach((observer) => {
                observer(message);
            });
        };

        return {
            addObserver,
            removeObserver
        };
    },
    isHarmonyOs() {
        const nrAppInformation = getJSON(window.nrAppInformation, null);
        return nrAppInformation && !!nrAppInformation.OS.toLocaleLowerCase().match(/ohos/i);
    }
};

export default bridge;
