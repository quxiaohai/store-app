/**************
 * 一洽图文消息
 */
import {
    ECHAT_SEND_INFO,
    ECHAT_TYPE,
    ORDER_REFUND_STATUS_NAME,
    ORDER_REFUND_TYPE_PAGE,
    ORDER_STATUS_MAP,
    ORDER_STATUS_SHOW
} from 'common/util/constant';
import storage from 'lib/util/storage';
import { clientRouter } from 'common/router';
import calendar from 'lib/util/calendar';

export default {
    // 如果是半屏显示，需要先初始化
    async init(query) {
        const _echatServer = ['e.echatsoft.com'];
        window._echat =
            window._echat ||
            function() {
                (_echat.q = _echat.q || []).push(arguments);
            };
        _echat.l = +new Date();
        _echat('initParam', { companyId: query.companyId, metaData: query.metaData.replaceAll(' ', '+') });

        const echat = document.createElement('script');
        echat.type = 'text/javascript';
        echat.async = true;
        echat.id = 'echatmodulejs';
        echat.setAttribute('charset', 'UTF-8');
        echat.src =
            ('https:' === document.location.protocol ? 'https://' : 'http://') +
            'www.echatsoft.com/visitor/echat.js?v=' +
            Date.now();
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(echat, s);
    },
    send(obj, type, replace) {
        replace = replace === 'replace' ? replace : 'push';
        !!obj && storage.set(ECHAT_SEND_INFO, obj);
        !!type && clientRouter[replace]('/echat?type=' + type);
    },
    // 商品图文
    product() {
        const obj = storage.get(ECHAT_SEND_INFO);
        if (!obj) {
            return '';
        }
        storage.clear(ECHAT_SEND_INFO);

        const skuInfo = obj?.skuList[obj.selected];

        const chatData = {
            cardId: `card-${obj.serialNumber}`,
            cardStyle: 1,
            cardType: 0,
            cardLink: `${process.env.ECHAT_VISITOR}/proxy?type=detail&serialNumber=${obj.serialNumber}&skuId=${obj.skuId}`,
            customCards: [{
                customCardId: `product-${obj.serialNumber}`,
                customCardName: obj.title,
                customCardDesc: obj.summary || ' ',
                customCardThumbnail: obj.skuList[obj.selected]?.imageUri,
                customCardCount: skuInfo?.size ? `规格：${skuInfo?.size}` : ' ',
                customCardLink: `${process.env.ECHAT_VISITOR}/proxy?type=detail&serialNumber=${obj.serialNumber}&skuId=${obj.skuId}`
            }],
            cardMenus: [{
                menuType: 2,
                menuName: '发送客服'
            }]
        };

        return { card_info: JSON.stringify(chatData) };
    },
    /// 新品试用
    trial() {
        const obj = storage.get(ECHAT_SEND_INFO);
        if (!obj) {
            return '';
        }
        storage.clear(ECHAT_SEND_INFO);

        const trialInfo = obj.trialInfo;


        const chatData = {
            cardId: `card-${trialInfo.id}`,
            cardStyle: 1,
            cardType: 0,
            cardLink: `${process.env.ECHAT_VISITOR}/product/trial/detail/${trialInfo.id}`,
            customCards: [{
                customCardId: `trial-${trialInfo.id}`,
                customCardName: trialInfo.name,
                customCardDesc: trialInfo.detail || '',
                customCardThumbnail: trialInfo.thumbnail,
                customCardLink: `${process.env.ECHAT_VISITOR}/product/trial/detail/${trialInfo.id}`
            }],
            cardMenus: [{
                menuType: 2,
                menuName: '发送客服'
            }]
        };

        return { card_info: JSON.stringify(chatData) };
    },
    // 以旧换新图文
    trade() {
        const obj = storage.get(ECHAT_SEND_INFO);
        if (!obj) {
            return '';
        }
        storage.clear(ECHAT_SEND_INFO);
        const actInfo = obj.actInfo || {};

        const robotInfo = actInfo.record || {};
        let desc = '';
        if (robotInfo.deviceModel) {
            desc = `机器型号：${robotInfo.deviceModel}`;
        } else if (robotInfo.bindSn) {
            desc = `SN码：${robotInfo.bindSn}`;
        }

        const chatData = {
            cardId: `card-${actInfo.id}`,
            cardStyle: 1,
            cardType: 0,
            cardLink: `${process.env.ECHAT_VISITOR}/spread/renew/detail/${actInfo.id}`,
            customCards: [{
                customCardId: `trade-${actInfo.id}`,
                customCardName: actInfo.name,
                customCardDesc: desc,
                customCardThumbnail: 'https://image-www.narwal.com/applet/images/common/robot-j3.jpg',
                customCardLink: `${process.env.ECHAT_VISITOR}/spread/renew/detail/${actInfo.id}`
            }],
            cardMenus: [{
                menuType: 2,
                menuName: '发送客服'
            }]
        };

        return { card_info: JSON.stringify(chatData) };
    },
    // 购物车图文
    cart(res) {
        const obj = res || storage.get(ECHAT_SEND_INFO);
        if (!obj) {
            return '';
        }
        storage.clear(ECHAT_SEND_INFO);

        const chatData = {
            cardId: `card-${obj.productSerialNumber}`,
            cardStyle: 1,
            cardType: 0,
            cardLink: `${process.env.ECHAT_VISITOR}/proxy?type=detail&serialNumber=${obj.productSerialNumber}&skuId=${obj.skuId}`,
            customCards: [{
                customCardId: `cart-${obj.productSerialNumber}`,
                customCardName: obj.title,
                customCardDesc: ' ',
                customCardThumbnail: obj.imageUrl,
                customCardCount: obj.size ? `规格：${obj.size}` : ' ',
                customCardLink: `${process.env.ECHAT_VISITOR}/proxy?type=detail&serialNumber=${obj.productSerialNumber}&skuId=${obj.skuId}`
            }],
            cardMenus: [{
                menuType: 2,
                menuName: '发送客服'
            }]
        };

        if (res) {
            return chatData;
        }

        return { card_info: JSON.stringify(chatData) };
    },
    // 订单详情图文
    orderDetail4(res) {
        const obj = res || storage.get(ECHAT_SEND_INFO);
        if (!obj) {
            return '';
        }
        storage.clear(ECHAT_SEND_INFO);

        const productList = obj.productList || [];
        const fullNum = productList.reduce((p, value) => {
            return p + value.num;
        }, 0);
        const imageUrl = productList[0]?.productImgUrl;
        const labelList = [ORDER_STATUS_MAP.cancel, ORDER_STATUS_MAP.nopaid];
        const amountLabel = labelList.includes(obj.status) ? '金额' : '实付';
        const statusName = (function() {
            if (obj.isPresale && obj.status === ORDER_STATUS_MAP.nopaid) {
                return '待付定金';
            }

            return ORDER_STATUS_SHOW[obj.status]?.name || 'Unknow';
        })();
        const payAmount = (function() {
            if (obj.isPresale && obj.status === ORDER_STATUS_MAP.nopaid) {
                return obj.depositAmount;
            }

            let price = obj.payAmount;
            if (obj.payInfo) {
                const payMoney = obj.payInfo.filter(r => !!r.successTime).reduce((p, value) => {
                    return p + value.payMoney;
                }, 0);
                price = payMoney > 0 ? payMoney : price;
            }
            return parseFloat(price.toFixed(2));
        })();
        const chatData = {
            eventId: `order-${obj.bigOrderNo}`,
            title: `订单号：${obj.bigOrderNo}`,
            content: `<div style="font-size:12px;white-space:normal;"><div style="line-height:20px;">${fullNum}件商品，${amountLabel}￥${
                payAmount
            }</div><div style="line-height:20px;">状态：${statusName}</div></div>`,
            imageUrl: imageUrl,
            urlForVisitor: `http('${process.env.ECHAT_VISITOR}/proxy?type=${ECHAT_TYPE.ORDER_DETAIL}&orderNo=${obj.bigOrderNo}','blank')`,
            urlForStaff: `${process.env.ECHAT_STAFF}/#/order/detail/${obj.bigOrderNo}`,
            memo: `创建时间: ${obj.createTime}`
        };

        if (res) {
            return chatData;
        }

        return 'visEvt=' + encodeURIComponent(JSON.stringify(chatData));
    },
    // 订单详情图文
    orderDetail(res) {
        const obj = res || storage.get(ECHAT_SEND_INFO);
        if (!obj) {
            return '';
        }
        storage.clear(ECHAT_SEND_INFO);

        const productList = obj.productList || [];
        const imageUrl = productList[0]?.productImgUrl;
        const fullNum = productList.reduce((p, value) => {
            return p + value.num;
        }, 0);
        const labelList = [ORDER_STATUS_MAP.cancel, ORDER_STATUS_MAP.nopaid];
        const amountLabel = labelList.includes(obj.status) ? '金额' : '实付';
        const statusName = (function() {
            if (obj.isPresale && obj.status === ORDER_STATUS_MAP.nopaid) {
                return '待付定金';
            }

            return ORDER_STATUS_SHOW[obj.status]?.name || 'Unknow';
        })();
        const payAmount = (function() {
            if (obj.isPresale && obj.status === ORDER_STATUS_MAP.nopaid) {
                return obj.depositAmount;
            }

            let price = obj.payAmount;
            if (obj.payInfo) {
                const payMoney = obj.payInfo.filter(r => !!r.successTime).reduce((p, value) => {
                    return p + value.payMoney;
                }, 0);
                price = payMoney > 0 ? payMoney : price;
            }
            return parseFloat(price.toFixed(2));
        })();

        const chatData = {
            cardId: `card-${obj.bigOrderNo}`,
            cardStyle: 1,
            cardType: 0,
            cardLink: `${process.env.ECHAT_VISITOR}/proxy?type=${ECHAT_TYPE.ORDER_DETAIL}&orderNo=${obj.bigOrderNo}`,
            customCards: [{
                customCardId: `order-${obj.bigOrderNo}`,
                customCardName: productList[0]?.title || '',
                customCardStatus: `${statusName}`,
                customCardThumbnail: imageUrl,
                customCardCount: `共${fullNum}件商品，￥${obj.payAmount}`,
                customCardCode: obj.bigOrderNo,
                customCardLink: `${process.env.ECHAT_VISITOR}/proxy?type=${ECHAT_TYPE.ORDER_DETAIL}&orderNo=${obj.bigOrderNo}`,
                customCardTime: calendar.format(obj.createTime)
            }],
            cardMenus: [{
                menuType: 2,
                menuName: '发送客服'
            }]
        };

        if (res) {
            return chatData;
        }

        return { card_info: JSON.stringify(chatData) };
    },
    // 售后详情图文
    afterSalesDetail(res) {
        const obj = res || storage.get(ECHAT_SEND_INFO);
        if (!obj) {
            return '';
        }
        storage.clear(ECHAT_SEND_INFO);

        const type = ORDER_REFUND_TYPE_PAGE[obj.type]?.name || 'Unknow';
        const status = ORDER_REFUND_STATUS_NAME[obj.status]?.name || 'Unknow';
        const imageUrl = obj.productInfo?.imageUrl || obj.productInfoList?.[0]?.imageUrl;

        const chatData = {
            cardId: `card-${obj.assCode}`,
            cardStyle: 1,
            cardType: 0,
            cardLink: `${process.env.ECHAT_VISITOR}/proxy?type=${ECHAT_TYPE.AFTER_SALES_DETAIL}&assCode=${obj.assCode}`,
            customCards: [{
                customCardId: `sale-${obj.assCode}`,
                customCardName: `${obj.assCode}`,
                customCardCount: `状态：${status}`,
                customCardDesc: `类型：售后单(${type})`,
                customCardThumbnail: imageUrl,
                customCardLink: `${process.env.ECHAT_VISITOR}/proxy?type=${ECHAT_TYPE.AFTER_SALES_DETAIL}&assCode=${obj.assCode}`,
                customCardTime: calendar.format(obj.createTime)
            }],
            cardMenus: [{
                menuType: 2,
                menuName: '发送客服'
            }]
        };

        if (res) {
            return chatData;
        }

        return { card_info: JSON.stringify(chatData) };
    }
};