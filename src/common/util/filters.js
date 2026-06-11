import calendar from 'lib/util/calendar';
import { getMediaType, getDayText, getTextWidth, getImageSize, getJSON } from 'common/util';
import clone from 'lib/json/clone';
import bridge from 'common/util/bridge';
import { APP_RESOURCE_LIST, H5_RESOURCE_LIST, DEFAULT_IMAGE } from 'common/util/constant';
import { discountInfo, presaleListMap, couponSum } from 'common/util/coupon';
import { specMapToText, specToText, specListToText } from 'common/util/spec';
import { isNumber } from 'lib/util/dataType';
import diskCache from 'common/util/disk-cache';
import { px2px } from 'lib/util/viewport';

const _toFixed = (v) => {
    if (isNumber(v) && !isNaN(v)) {
        return parseFloat(v.toFixed(2));
    }
    return undefined;
};

/*********
 * 试用列表数据过滤
 * @param list
 * @returns {*}
 */
export function filterTrialList(list) {
    return list.map((item) => {
        const now = item.nowTime || Date.now();
        let status = 5; // 5 已结束, 0 待开始, 1 去申请, 2 去试用
        let timerText = '距离报名开始';
        let time = calendar.getCompareDateTimestamp(now, item.applyStartTime);
        let end = calendar.getCompareDateTimestamp(now, item.applyEndTime);
        let over = calendar.getCompareDateTimestamp(now, item.endTime);

        if (time > 0) {
            // 报名还未开始
            status = 0;
        } else if (end > 0) {
            // 去申请
            status = 1;
            time = end;
            timerText = '距离报名结束';
        } else if (over > 0) {
            // 去试用
            time = over;
            status = 2;
            timerText = '距离活动结束';
        }

        const skuInfo = item.productSkuList?.[0];

        return {
            id: item.id,
            imageUrl: skuInfo?.skuInfo?.imageUri,
            name: item.name,
            timeRemaining: time,
            price: skuInfo?.skuInfo?.price || 0,
            afterDiscountPrice: skuInfo?.afterDiscountPrice || 0,
            prizeNum: item.prizeNum,
            applyUserNum: item.applyUserNum,
            status,
            timerText
        };
    });
}

// 数字转中文, 最高支持99
function numToCn(index) {
    const num = index + 1;
    const cn = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    const mod = num % 10;
    if (num <= 10) {
        return cn[index];
    } else if (num <= 19) {
        return '十' + cn[index - 10];
    } else if (mod === 0) {
        return cn[num / 10 - 1] + '十';
    }

    return cn[num / 10 - 1] + '十' + cn[mod - 1];
}

/***********
 * 过滤试用详情数据
 * @param obj
 * @returns {{over: boolean, serialNumber: *, orderNo, lotteryNum, timeRemaining: number, prizeNum: *, questionnaireId, mobileDetail: *, afterDiscountPrice: string, productName: *, momentsText, lotteryList: *[], ruleFileImagesUrl, applyUserNum: *, momentsCardImageUrl, attachmentList: *[], price: string, name, maxPayTime, id, skuId: *, timerText: string, shareCardImageUrl, status: number}}
 */
export function filterTrialInfo(obj) {
    const product = obj.productSkuList?.[0] || obj.productSku;
    const videos = product.videoUrl ? [product.videoUrl] : [];
    const images = product.attachmentList?.map((r) => r.url);
    const now = obj.nowTime || Date.now();

    // winnerNum null 没有报名 0 代表未中奖 > 0 代表已中奖
    // 5 已结束, 0 待开始, 1 去申请, 2 去试用, 3: 报名结果已公布 4: 距离第N轮中奖结果公布 6: 距离拍付 7: 拍付超时
    let status = 5;
    let timerText = '活动已结束';
    let time = null;
    let start = calendar.getCompareDateTimestamp(now, obj.applyStartTime);
    let end = calendar.getCompareDateTimestamp(now, obj.applyEndTime);
    let over = calendar.getCompareDateTimestamp(now, obj.endTime);
    if (start > 0) {
        // 报名还未开始
        status = 0;
        time = start;
        timerText = '距离报名开始';
    } else if (end > 0) {
        // 去申请
        status = 1;
        time = end;
        timerText = '距离报名结束';
    } else if (end <= 0 && over > 0) {
        // 去试用
        status = 2;
        time = null;
        timerText = '报名已结束';
    }

    let lotteryList = [];
    if (status === 2 || obj.winnerNum !== null) {
        // 试用期间，公布中奖结果
        const lotteryTimes = obj.lotteryTime.split(',');
        const len = lotteryTimes.length;
        for (let i = 0; i < len; i++) {
            const date = lotteryTimes[i];
            const current = calendar.getCompareDateTimestamp(date, now);
            if (current >= 0) {
                // 已经结束
                lotteryList.push({
                    label: `第${ numToCn(i) }轮申请成功名单`,
                    list: obj.winnerInfo?.[i + 1] || []
                });
                status = 3;
                time = null;
                timerText = '申请结果已公布';
            } else {
                time = Math.abs(current);
                timerText = `距${ numToCn(i) }轮体验名单公布`;
                status = 4;
                break;
            }
        }

        // 判断是否已经拍付或者是否报名
        if (obj.orderNo) {
            time = over;
            timerText = '距离活动结束';
        } else if (obj.winnerNum > 0) {
            // 判断是否中奖
            const date = calendar.getOffsetHour(lotteryTimes[obj.winnerNum - 1], obj.maxPayTime);
            const current = calendar.getCompareDateTimestamp(now, date);
            if (current > 0) {
                time = current;
                timerText = '距离拍付结束';
                status = 6;
            } else {
                // 超时未拍付
                time = null;
                timerText = '超时未拍付';
                status = 7;
            }
        }

        // 如果其它逻辑没有走到, 直判断是否活动结束
        if (status === 5 && over > 0) {
            time = over;
            timerText = '距离活动结束';
        }

        if (over <= 0) {
            status = 5;
            timerText = '活动已结束';
        }
    }

    // 是否在上传时间内
    const canUpload = calendar.getCompareDateTimestamp(now, obj.uploadReportEndTime) > 0;

    return {
        id: obj.id,
        nowTime: obj.nowTime,
        endTime: obj.endTime,
        over: obj.timeRemaining < 1000,
        timeRemaining: time,
        isSubscribe: obj.isSubscribe,
        applyUserNum: obj.applyUserNum,
        price: (product.skuInfo?.underlinePrice || product.skuInfo?.price || 0).toFixed(2),
        afterDiscountPrice: product.afterDiscountPrice?.toFixed(2) || 0,
        name: obj.name,
        prizeNum: obj.prizeNum,
        maxPayTime: obj.maxPayTime,
        lotteryNum: obj.lotteryNum,
        productName: product.productName,
        mobileDetail: product.productDetail || product.mobileDetail,
        serialNumber: product.productSerialNumber,
        attachmentList: videos.concat(images),
        thumbnail: product.skuInfo?.imageUri,
        skuId: obj.skuId || product.skuId,
        buySerialNumber: obj.buySerialNumber,
        shareCardImageUrl: obj.shareCardImageUrl,
        momentsCardImageUrl: obj.momentsCardImageUrl,
        momentsText: obj.momentsText,
        ruleFileImagesUrl: obj.ruleFileImagesUrl,
        orderNo: obj.orderNo,
        questionnaireId: obj.questionnaireId,
        winnerNum: obj.winnerNum,
        reportNum: obj.reportNum,
        orderStatus: obj.orderStatus,
        detail: obj.detail,
        displayAr: obj.displayAr,
        arResourceId: obj.arResourceId,
        recycleType: obj.recycleType,
        recycleButtonWords: obj.recycleButtonWords,
        shareCardWords: obj.shareCardWords,
        status,
        timerText,
        lotteryList,
        canUpload
    };
}

/***********
 * 过滤试用报告列表
 * @param list
 * @returns {*|*[]}
 */
export function filterTrialReportList(list) {
    return (
        list?.map((item) => {
            return {
                title: item.title,
                content: item.content,
                userName: item.userName,
                userIcon: item.userIcon,
                pictureUrls: item.pictureUrls.filter((url) => getMediaType(url) === 'image').slice(0, 3),
                status: item.status, // -1-已删除，0-待审核，1-审核通过，2-审核不通过 ,
                imageCount: item.pictureUrls.length,
                id: item.id
            };
        }) || []
    );
}

/***********
 * 过滤试用报告列表 瀑布流
 * @param list
 * @param option
 * @returns {*|*[]}
 */
export function filterTrialFallsReportList(list, { key, extra, clear }) {
    if (clear) {
        diskCache.clear(key, 'fall');
    }
    const map = diskCache.get(key, 'fall') || {};
    const fallsList = [
        { max: map.col1 || 0, list: [] },
        { max: map.col2 || 0, list: [] }
    ];

    // 文字宽度
    const width = px2px(284);
    // 展示图片宽度
    const imgW = px2px(324);
    // 默认图片高度
    const imgH = px2px(420);
    // 字体大小
    const font = px2px(28);
    // 一行文字高度
    const textH = px2px(42);
    // 内容高度
    const content = px2px(160);
    const height = (url) => {
        const size = getImageSize(url);
        if (size) {
            return (imgW / size.width) * size.height;
        }
        return imgH;
    };

    const rowHeight = (text) => {
        // 显示2行
        if (getTextWidth(text, font) > width) {
            return content;
        }
        return content - textH;
    };

    const getViewNum = (num) => {
        if (num < 10000) {
            return num;
        }
        return `${ Math.floor(num / 10000) }万+`;
    };

    const isShowTag = !!extra?.tag;
    const tagHeight = (tagList) => {
        if (isShowTag) {
            return tagList?.[0] ? 20 : 0;
        }
        return 0;
    };

    list?.forEach((item) => {
        let index = 0;
        if (fallsList[0].max > fallsList[1].max) {
            index = 1;
        }

        const imgUrl = item.pictureUrls?.filter((url) => getMediaType(url) === 'image')?.[0] || DEFAULT_IMAGE;
        const imgHeight = height(imgUrl);
        fallsList[index].max += imgHeight + rowHeight(item.title) + tagHeight(item.tagList);
        fallsList[index].list.push({
            title: item.title,
            content: item.content,
            userName: item.userName,
            userIcon: item.userIcon,
            tagInfo: isShowTag ? item.tagList?.[0] : undefined,
            viewNum: getViewNum(item.viewNum),
            imgUrl,
            imgHeight,
            status: item.status, // -1-已删除，0-待审核，1-审核通过，2-审核不通过 ,
            id: item.id,
            col: index
        });
    });

    diskCache.set(key, 'fall', {
        col1: fallsList[0].max,
        col2: fallsList[1].max
    });
    return [...fallsList[0].list, ...fallsList[1].list];
}

/**********
 * 过滤评论数据
 */
export const filterCommentList = function (list) {
    return (
        list?.map((item) => {
            return {
                id: item.id,
                content: item.content,
                title: item.productName,
                adminContent: item.adminContent,
                productStar: item.productStar,
                images: item.imagesUrl?.split(',')?.filter((r) => !!r) || [],
                createTime: getDayText(item.createTime),
                userIcon: item.userIcon,
                userName: item.userName,
                size: specMapToText(item.specValueMap)
            };
        }) || []
    );
};

/*********
 * 过滤预售数据
 * @param obj
 * @returns {*|{activityId, balanceEndTime: *, depositEndTime, isSpotsale, depositPrice, balanceStartTime: *, endTimestamp: number, afterDiscountPrice: *, balancePrice, nowTime: *}}
 */
export const filterPresale = function (obj) {
    if (!obj) {
        return obj;
    }

    const now = obj.nowTime || Date.now();

    return {
        nowTime: obj.nowTime,
        depositEndTime: obj.depositEndTime,
        endTimestamp: calendar.getCompareDateTimestamp(now, obj.depositEndTime),
        balanceStartTime: calendar.format(obj.balanceStartTime, 'M月d日 HH:mm'),
        balanceEndTime: calendar.format(obj.balanceEndTime, 'M月d日 HH:mm'),
        isSpotsale: obj.isSpotsale,
        afterDiscountPrice: obj.afterDiscountPrice,
        depositPrice: obj.depositPrice,
        balancePrice: obj.balancePrice,
        activityId: obj.activityId,
        arResourceId: obj.arResourceId,
        displayAr: obj.displayAr
    };
};

/***********
 * 过滤商品列表数据
 */
export const filterProductList = function (list, couponList, discountList, presaleList) {
    const presaleMap = presaleListMap(presaleList);
    const map = discountInfo(discountList).discountMap;

    return list?.map((item) => {
        const skuList = item.skuList?.filter((c) => c.status === 1) || [];
        item.num = 1;
        item.skuId = skuList[0]?.id;
        const presaleInfo = presaleMap[item.serialNumber + '-' + item.skuId];
        const disMap = map[item.skuId];
        const underlinePrice = skuList[0]?.underlinePrice;
        const price = skuList[0]?.price || 0;
        let state = 1; // 默认普通商品，2 限时折扣商品，3 优惠券商品，4 叠加, 5 限时折扣
        let discountPrice = price;
        let saleText = null;

        // if (underlinePrice) {
        //     saleText = `立减${Math.max(0, underlinePrice - price).toFixed(2)}`;
        // }

        // 有预售
        if (presaleInfo) {
            state = 5;
            discountPrice = presaleInfo.afterDiscountPrice;
            saleText = `预售立减${ Math.max(0, price - discountPrice).toFixed(2) }`;
        } else {
            const couponInfo = couponSum([item], couponList, map);
            if (couponInfo.total === 0 && disMap) {
                // 只有现时折扣
                state = 2;
                discountPrice = disMap.discountedPrice;
                saleText = `限时立减${ Math.max(0, price - discountPrice).toFixed(2) }`;
            } else if (couponInfo.total > 0 && !disMap) {
                // 只有优惠
                state = 3;
                discountPrice = price - couponInfo.total;
                saleText = `券后立减${ couponInfo.total.toFixed(2) }`;
            } else if (couponInfo.total > 0 && disMap) {
                // 现时折扣和优惠都有
                state = 4;
                discountPrice = disMap.discountedPrice - couponInfo.total;
                saleText = `优惠立减${ Math.max(0, price - discountPrice).toFixed(2) }`;
            } else if (couponInfo.total > 0 && !disMap) {
                // 只有优惠
                state = 3;
                discountPrice = price - couponInfo.total;
            } else if (couponInfo.total > 0 && disMap) {
                // 现时折扣和优惠都有
                state = 4;
                discountPrice = disMap.discountedPrice - couponInfo.total;
            }
        }

        return {
            imageUrl: item.thumbnailUrl || '',
            serialNumber: item.serialNumber,
            title: item.internalName,
            fullName: item.title,
            salesLimitNum: item.salesLimitNum,
            stock: item.stock,
            salesStatus: item.salesStatus,
            price: _toFixed(discountPrice), // 优惠总价
            state,
            saleText,
            underlinePrice: _toFixed(disMap ? price : underlinePrice),
            type: item.type,
            skuList: skuList.map((c) => {
                return {
                    id: c.id,
                    price: _toFixed(c.price),
                    underlinePrice: _toFixed(map[c.id] ? c.price : c.underlinePrice),
                    discountPrice: _toFixed(map[c.id]?.discountedPrice || c.price),
                    imageUri: c.imageUri,
                    stockNum: c.stockNum,
                    size: specToText(c),
                    status: c.status
                };
            })
        };
    });
};

/***********
 * 过滤商品列表数据
 */
export const filterProductBannerList = function (list, couponList, discountList, presaleList) {
    const presaleMap = presaleListMap(presaleList);
    const map = discountInfo(discountList).discountMap;

    return list?.map((item) => {
        const skuList = item.skuList?.filter((c) => c.status === 1) || [];
        item.num = 1;
        item.skuId = skuList[0]?.id;
        const presaleInfo = presaleMap[item.serialNumber + '-' + item.skuId];
        const disMap = map[item.skuId];
        const underlinePrice = skuList[0]?.underlinePrice;
        const price = skuList[0]?.price || 0;
        let state = 1; // 默认普通商品，2 限时折扣商品，3 优惠券商品，4 叠加, 5 限时折扣
        let discountPrice = price;
        let saleText = null;
        let couponTotal = 0;

        // if (underlinePrice) {
        //     saleText = `立减${Math.max(0, underlinePrice - price).toFixed(2)}`;
        // }

        // 有预售
        if (presaleInfo) {
            state = 5;
            discountPrice = presaleInfo.afterDiscountPrice;
            saleText = `预售立减${ Math.max(0, price - discountPrice).toFixed(2) }`;
        } else {
            const couponInfo = couponSum([item], couponList, map);
            if (couponInfo.total === 0 && disMap) {
                // 只有现时折扣
                state = 2;
                discountPrice = disMap.discountedPrice;
                saleText = `限时立减${ Math.max(0, price - discountPrice).toFixed(2) }`;
            } else if (couponInfo.total > 0 && !disMap) {
                // 只有优惠
                state = 3;
                discountPrice = price - couponInfo.total;
                saleText = `券后立减${ couponInfo.total.toFixed(2) }`;
            } else if (couponInfo.total > 0 && disMap) {
                // 现时折扣和优惠都有
                state = 4;
                discountPrice = disMap.discountedPrice - couponInfo.total;
                saleText = `优惠立减${ Math.max(0, price - discountPrice).toFixed(2) }`;
            } else if (couponInfo.total > 0 && !disMap) {
                // 只有优惠
                state = 3;
                discountPrice = price - couponInfo.total;
            } else if (couponInfo.total > 0 && disMap) {
                // 现时折扣和优惠都有
                state = 4;
                discountPrice = disMap.discountedPrice - couponInfo.total;
            }
            couponTotal = Math.max(0, couponInfo.total);
        }

        return {
            imageUrl: item.thumbnailUrl || '',
            serialNumber: item.serialNumber,
            title: item.internalName,
            fullName: item.title,
            salesLimitNum: item.salesLimitNum,
            stock: item.stock,
            salesStatus: item.salesStatus,
            price: _toFixed(discountPrice), // 优惠总价
            state,
            saleText,
            underlinePrice: _toFixed(disMap ? price : underlinePrice),
            type: item.type,
            couponTotal: couponTotal,
            skuList: skuList.map((c) => {
                return {
                    id: c.id,
                    price: _toFixed(c.price),
                    underlinePrice: _toFixed(map[c.id] ? c.price : c.underlinePrice),
                    discountPrice: _toFixed(map[c.id]?.discountedPrice || c.price),
                    imageUri: c.imageUri,
                    stockNum: c.stockNum,
                    size: specToText(c),
                    status: c.status
                };
            })
        };
    });
};

/*************
 * 过滤商品数据
 */
export const filterProduct = function (obj, discountList, presaleList) {
    const skuList = obj.skuList.filter((c) => c.status === 1);
    const videos = obj.videoUrl ? [obj.videoUrl] : [];
    const images = obj.attachmentList?.map((r) => r.url);

    const map = discountInfo(discountList).discountMap;
    const presaleMap = presaleListMap(presaleList);

    return {
        num: 1,
        title: obj.title,
        shareWords: obj.shareWords,
        shareImg: images?.[0] || '',
        parameter: obj.parameter,
        salesLimitNum: obj.salesLimitNum,
        mobileDetail: obj.productDetail || obj.mobileDetail,
        serviceList: obj.serviceList,
        serialNumber: obj.serialNumber,
        salesStatus: obj.salesStatus,
        isActivityProduct: obj.isActivityProduct,
        attachmentList: videos.concat(images),
        expandPictureUrl: obj.expandPictureUrl,
        expandWebSite: obj.expandWebSite,
        activityContentShowUrl: obj.activityContentShowUrl,
        buyersShowFlag: obj.buyersShowFlag,
        commentShowFlag: obj.commentShowFlag,
        summary: obj.summary,
        type: obj.type,
        state: 1, // 默认普通商品，2 限时折扣商品，3 优惠券商品，4 叠加
        arDisplay: obj.arDisplay, // 是否展示AR模型
        arModelCategory: obj.arModelCategory,
        themeType: obj.themeType, // 主题：1 默认 2 暗金
        darkThemeProductName: obj.darkThemeProductName, // 暗金主题商品名称
        skuList: skuList.map((c) => {
            return {
                id: c.id,
                price: c.price,
                productId: c.productId,
                underlinePrice: map[c.id] ? c.price : c.underlinePrice,
                discountPrice: map[c.id]?.discountedPrice || c.price,
                imageUri: c.imageUri,
                stockNum: c.stockNum,
                size: specToText(c),
                status: c.status,
                presaleInfo: filterPresale(presaleMap[obj.serialNumber + '-' + c.id])
            };
        }),
        productComment: filterCommentList(obj.productComment)
    };
};

/****************
 * 过滤优惠券数据
 * @param list
 * @param notFilter
 * @returns {*}
 */
export function filterCouponList(list, notFilter) {
    return list
        ?.filter((item) => {
            if ((item.takeType === 1 && !isNumber(item.useStatus)) || item.status === 0 || item.type === 3) {
                return false;
            } else if (!notFilter && item.validityTimeType === 1) {
                const now = item.currentTimeStamp || Date.now();
                return calendar.getCompareDateTimestamp(item.startTime, now) >= 0;
            }
            return true;
        })
        ?.map((item) => {
            return {
                id: item.id,
                name: item.name,
                type: item.type,
                remark: item.remark,
                thresholdPrice: item.thresholdPrice,
                discountNum: item.discountNum,
                startTime: item.startTime,
                endTime: item.endTime,
                takeTime: item.takeTime,
                validityTimeType: item.validityTimeType,
                validityDays: item.validityDays,
                superposition: item.superposition,
                instruction: item.instruction,
                serialNumber: item.serialNumber,
                isApplicableAll: item.isApplicableAll,
                applicableProductSerialNumberSet: item.applicableProductSerialNumberSet,
                applicableProductSkuIdSet: item.applicableProductSkuIdSet,
                useStatus: item.useStatus,
                shareFlag: item.shareFlag,
                takeType: item.takeType,
                status: item.status
            };
        });
}

/****************
 * 过滤优惠券数据
 */
export const filterAllCouponList = function (list) {
    return list
        ?.filter((item) => {
            if ((item.takeType === 1 && item.useStatus === null) || (item.status === 0 && item.useStatus === null)) {
                return false;
            } else if (item.validityTimeType === 1) {
                const now = item.currentTimeStamp || Date.now();
                return calendar.getCompareDateTimestamp(item.startTime, now) >= 0;
            }
            return true;
        })
        ?.map((item) => {
            return {
                id: item.id,
                name: item.name,
                type: item.type,
                remark: item.remark,
                thresholdPrice: item.thresholdPrice,
                discountNum: item.discountNum,
                startTime: item.startTime,
                endTime: item.endTime,
                takeTime: item.takeTime,
                validityTimeType: item.validityTimeType,
                validityDays: item.validityDays,
                superposition: item.superposition,
                instruction: item.instruction,
                serialNumber: item.serialNumber,
                isApplicableAll: item.isApplicableAll,
                applicableProductSerialNumberSet: item.applicableProductSerialNumberSet,
                applicableProductSkuIdSet: item.applicableProductSkuIdSet,
                useStatus: item.useStatus,
                shareFlag: item.shareFlag,
                takeType: item.takeType,
                status: item.status
            };
        });
};

/************
 * 过滤我的试用列表
 * @param list
 */
export function filterMyTrialList(list) {
    return (
        clone(list)?.map((item) => {
            const now = item.nowTime || Date.now();
            const payTime = calendar.getCompareDateTimestamp(now, item.maxPayTime);
            const uploadEndTime = calendar.getCompareDateTimestamp(now, item.maxUploadTime);
            // 显示上传按钮，已发货，且在上传时间范围内
            // 显示查看报告 已发货，上传时间截止，或者已完成三篇上传了

            return {
                activityId: item.activityId,
                activityName: item.activityName,
                bigOrderNo: item.bigOrderNo,
                id: item.id,
                maxPayTime: item.maxPayTime,
                maxUploadTime: item.maxUploadTime,
                orderStatus: item.orderStatus,
                productImage: item.productImage,
                reportNum: item.reportNum,
                serialNumber: item.serialNumber,
                skuId: item.skuId,
                status: item.status,
                showPay: payTime > 0,
                showUploadReport: uploadEndTime > 0,
                winnerNum: 1
            };
        }) || []
    );
}

/**
 * 过滤 资源位在对应渠道(小程序/h5)展示
 * @param {*} list
 * @returns
 */
export const filterResourcePosition = function (list = []) {
    try {
        const resourcePositionList = bridge.isWeApp() ? APP_RESOURCE_LIST : H5_RESOURCE_LIST;
        return list.filter((item) => resourcePositionList.includes(item.displayPosition));
    } catch (error) {
        return [];
    }
};

/******************
 * 去除重复数据
 */
export const filterReport = function (list, key) {
    const set = {};
    const result = [];
    list?.forEach((item) => {
        if (!set[item[key]]) {
            result.push(item);
            set[item[key]] = true;
        }
    });

    return result;
};

/***********
 * 购物车数据
 */
export const filterShoppingList = function (list, discountList) {
    const arr1 = [],
        arr2 = [];

    const map = discountInfo(discountList).discountMap;

    list?.forEach((item) => {
        const skuList = item.skuList.filter((c) => c.status === 1);
        let obj = skuList.find((c) => c.id === item.skuId);

        if (!obj) {
            // 如何规格不存在,默认取第一个
            obj = skuList[0] || {};
            item.skuId = obj.id;
        }

        const res = {
            currentPrice: item.currentPrice,
            price: item.currentPrice,
            discountPrice: _toFixed(map[item.skuId]?.discountedPrice || item.currentPrice),
            underlinePrice: _toFixed(map[item.skuId] ? item.underlinePrice || item.currentPrice : item.underlinePrice),
            checked: !!item.checked,
            size: specListToText(skuList, item.skuId),
            max: Math.min(item.salesLimitNum || 99, Math.min(item.stock, 99)),
            imageUrl: obj?.imageUri || item.imageUrl,
            productSerialNumber: item.productSerialNumber,
            isActivityProduct: item.isActivityProduct,
            productId: obj?.productId,
            id: item.id,
            skuId: item.skuId,
            salesLimitNum: item.salesLimitNum,
            stock: item.stock,
            num: item.num,
            title: item.title,
            type: item.productType,
            salesStatus: item.isActivityProduct === 1 ? -4 : item.salesStatus, // -4为不可售卖
            skuList: skuList.map((c) => {
                return {
                    id: c.id,
                    price: c.price,
                    discountPrice: _toFixed(map[c.id]?.discountedPrice || c.price),
                    underlinePrice: _toFixed(map[c.id] ? c.price : c.underlinePrice),
                    imageUri: c.imageUri,
                    productId: c.productId,
                    stockNum: c.stockNum,
                    size: specToText(c),
                    status: c.status
                };
            })
        };
        if (item.salesStatus === 1) {
            arr1.push(res);
        } else {
            arr2.push(res);
        }
    });

    return arr1.concat(arr2);
};

/************
 * 过滤以旧焕新-未登录，未验证，活动未开始
 */
export const filterRenewBefore = function (trade) {
    const obj = trade.tradeIn;
    const record = trade.tradeInRecord;
    const now = obj.serverTimeStamp || Date.now();
    const start = obj.startTime;
    const end = obj.endTime;
    let type = 0; // 0 未开始 1 已开始 2 已绑定-未参与 3 已参与 4 已结束
    // 判断活动是否已开始
    const startDay = calendar.getCompareDateTimestamp(now, start);
    const endDay = calendar.getCompareDateTimestamp(now, end);

    if (startDay > 0) {
        // 活动未开始
        type = 0;
    } else if (startDay <= 0 && endDay > 0) {
        // 活动进行中
        type = 1;
        if (trade.snBindRecord) {
            type = trade.tradeInRecord && trade.tradeInRecord.oldRobotWaterType !== null ? 3 : 2;
        }
    } else {
        // 活动已结束
        type = 4;
    }

    return {
        id: obj.id,
        type,
        // 是否有参与资格
        qualification: obj.tradeSkuList?.filter((item) => item.skuInfo?.price - item.discountAmount > 0).length > 0,
        timestamp: type === 0 ? startDay : endDay,
        isBind: !!trade.snBindRecord,
        name: obj.name,
        status: obj.status,
        canManualBind: obj.canManualBind,
        ruleImageList: obj.ruleImage.split(',').filter((r) => !!r),
        endImage: obj.endImage,
        reserveTime: record?.reserveThisTime,
        reserveNextTime: record?.reserveNextTime,
        record: record,
        recycleType: record?.recycleType, // 旧机回收方式, 1回收旧机 3旧机免收 4人工免回收
        isRecycled: !!trade.tradeInRecycleRecord, // 是否预约过
        manuallyRecycled: trade.tradeInRecycleRecord?.registerType === 2, // 人工补录单号
        isSubmittedOrder: trade.isSubmittedOrder,
        // 已经完成选购新机
        paidNewMachine:
            trade?.tradeInFlowShowList?.[0]?.flowNodeVOList?.find((item) => item.nodeType === 2)?.progress === 3,
        isShipped: trade?.tradeInFlowShowList?.[0]?.flowNodeVOList?.find((item) => item.nodeType === 4)?.progress === 3 // 新机已发货
    };
};

/************
 * 过滤以旧焕新 - 已绑定SN数据
 */
export const filterRenewAfter = function (act, couponList) {
    const obj = act.tradeIn;
    const record = act.tradeInRecord;
    const now = obj.serverTimeStamp;
    const start = obj.startTime;
    const end = obj.endTime;
    let type = 3; // 0 未开始 3 已绑定 4 已结束
    // 判断活动是否已开始
    const startDay = calendar.getCompareDateTimestamp(now, start);
    const time = calendar.getCompareDateTimestamp(now, end);
    const bindOtherNotSpecified =
        record?.thirdBrand !== '云鲸' &&
        (record?.thirdBrand?.includes('其他') || record?.deviceModel?.includes('其他'));
    const bindOtherSpecified =
        record?.thirdBrand !== '云鲸' &&
        !(record?.thirdBrand?.includes('其他') || record?.deviceModel?.includes('其他'));

    //  未开始/未绑定/已绑定未参与
    if (startDay > 0) {
        // 活动未开始
        type = 0;
    } else if (time <= 0) {
        // 活动已结束
        type = 4;
    } else if (!act.snBindRecord) {
        // 活动未绑定
        type = 1;
    } else if (act.snBindRecord && (!record || record.oldRobotWaterType === null)) {
        // 已绑定-未参与
        type = 2;
    }

    const productMap = {};
    obj.tradeSkuList?.forEach((item, i) => {
        if (!productMap[item.productSerialNumber]) {
            productMap[item.productSerialNumber] = {
                sort: i,
                selected: 0,
                num: 1,
                serialNumber: item.productSerialNumber,
                skuList: []
            };
        }

        const obj = item.skuInfo || {};
        productMap[item.productSerialNumber].skuList.push({
            id: obj.id,
            name: item.productName,
            price: obj.price,
            buttonPageUrl: item.buttonPageUrl,
            buttonStatus: item.buttonStatus,
            buttonWords: item.buttonWords,
            serialNumber: item.productSerialNumber,
            discountAmount: item.discountAmount,
            //discountPrice: bindOtherSpecified ? obj.price : parseFloat((obj.price - item.discountAmount).toFixed(2)),
            discountPrice: parseFloat((obj.price - item.discountAmount).toFixed(2)),
            imageUri: obj.imageUri,
            size: specToText(obj),
            realDiscountPrice: parseFloat((obj.price - item.discountAmount).toFixed(2)) // 真实的换新价格（包括绑定其他品牌原价购买后退款的）
        });
    });

    // 未结束进行中， 无权益
    if (
        time > 0 &&
        type === 3 &&
        obj.tradeSkuList?.filter((item) => item.discountAmount > 0 && item.skuInfo?.price - item.discountAmount > 0)
            .length === 0
    ) {
        type = 5;
    }

    const productList = Object.values(productMap).sort((a, b) => a.sort - b.sort);
    productList.forEach((item) => {
        item.skuList = item.skuList.filter((item) => item.realDiscountPrice > 0 && item.discountAmount > 0);
    });

    // 计算满减
    const list = productList.filter((item) => item.skuList.length > 0);
    list.forEach((item) => {
        item.skuList.forEach((sku) => {
            const product = {
                skuId: sku.id,
                skuList: [
                    {
                        id: sku.id,
                        price: sku.discountPrice
                    }
                ],
                num: 1
            };
            const couponInfo = couponSum([product], couponList || [], {}, 'shop');
            // sku.discountPrice = bindOtherSpecified
            //     ? Math.max(0, sku.discountPrice)
            //     : _toFixed(Math.max(0, sku.discountPrice - couponInfo.total));
            sku.discountPrice = _toFixed(Math.max(0, sku.discountPrice - couponInfo.total));
        });
    });

    // nodeName (string, optional): 流程节点名称 ,
    // nodeType (integer, optional): 流程节点类型(1, 旧机确认), (2, 选购新机), (3, 旧机回收), (4, 新机发货) ,
    // progress (integer, optional): 流程节点状态 (1, 未到达), (2, 进行中),(3, 已完成) ,
    // status (integer, optional): 旧机回收类型使用 (1:待预约，2：待揽收 3：已妥投)

    return {
        id: obj.id,
        type,
        timestamp: time,
        name: obj.name,
        status: obj.status,
        endImage: obj.endImage,
        recycleType: record?.recycleType, // 旧机回收方式, 1回收旧机 3旧机免收 4人工免回收
        isSubmittedOrder: act.isSubmittedOrder,
        record,
        productList: list,
        tradeInFlowShowList: act.tradeInFlowShowList,
        bindSn: act.snBindRecord,
        // 绑定的为第三方机器，云鲸机器是：tradeInRecord为空或者tradeInRecord为云鲸）
        bindOtherBrand: record?.thirdBrand && record?.thirdBrand !== '云鲸',
        bindOtherNotSpecified,
        bindOtherSpecified,
        canPurchase: act.canPurchase,
        tradeInRecycleRecord: act.tradeInRecycleRecord, // 预约记录
        // 已经完成选购新机
        paidNewMachine:
            act?.tradeInFlowShowList?.[0]?.flowNodeVOList?.find((item) => item.nodeType === 2)?.progress === 3,
        manuallyRecycled: act.tradeInRecycleRecord?.registerType === 2 // 人工补录单号
    };
};

/****************
 * 过滤多买多返数据
 * @param obj
 */
export function filterBuyReturnInfo(obj) {
    const now = obj.currentTimestamp || Date.now();
    const act = obj.activity || {};
    const start = calendar.getCompareDateTimestamp(now, act.startTime);
    const end = calendar.getCompareDateTimestamp(now, act.endTime);
    const list = act?.rewardConditionList;
    if (!list && list?.length <= 0) {
        return {
            status: 0
        };
    }
    const min = list[0].thresholdAmount;
    const max = list[list.length - 1].thresholdAmount;
    const current = obj.totalAmount;
    const total = min + max;
    let progress = 0;
    let progressText = current;
    if (list.length === 2) {
        // 分三段 0.3,0.4,0.3
        if (current < min) {
            progress = ((current / min) * 0.3).toFixed(2) * 100 + '%';
        } else if (current < max) {
            progress = (((current - min) / (max - min)) * 0.4 + 0.3).toFixed(2) * 100 + '%';
        } else if (current <= total) {
            progress = (((current - max) / min) * 0.3 + 0.7).toFixed(2) * 100 + '%';
        } else {
            progress = '100%';
            progressText = `${ total }+`;
        }
    } else if (list.length === 3) {
        // 分四段0.217 0.283 0.283 0.217
        const step2 = list[1].thresholdAmount;
        if (current < min) {
            progress = ((current / min) * 0.217).toFixed(2) * 100 + '%';
        } else if (current < step2) {
            progress = (((current - min) / (step2 - min)) * 0.283 + 0.217).toFixed(2) * 100 + '%';
        } else if (current <= max) {
            progress = (((current - step2) / (max - step2)) * 0.283 + 0.5).toFixed(2) * 100 + '%';
        } else if (current <= total) {
            progress = (((current - max) / min) * 0.217 + 0.717).toFixed(2) * 100 + '%';
        } else {
            progress = '100%';
            progressText = `${ total }+`;
        }
    }

    if (total === 10000) {
        progressText = '1W';
    } else if (total > 10000) {
        progressText = '1W+';
    }

    if (list.find((r) => r.thresholdAmount === current)) {
        progressText = null;
    }

    // 活动还未开始
    let status = 2,
        time = start;
    if (start <= 0) {
        // 活动已开始
        status = end > 0 ? 3 : 4;
        time = end;
    }
    return {
        id: act.id,
        progress,
        progressText,
        totalAmount: obj.totalAmount,
        ruleImgUrl: act.ruleImgUrl,
        guideUrl: act.guideUrl,
        status,
        rewardConditionList: list,
        rewardAfterDay: act.rewardAfterDay,
        time
    };
}

/**************
 * 过滤三八女王节活动数据
 */
export const filterIwdInfo = function (obj) {
    const map = {};
    obj.activitySpecificImageList?.forEach((item) => {
        map[`${ item.activityId }-${ item.size }`] = item.imageUrl;
    });

    return {
        activityMainImageUrl: obj.activityMainImageUrl,
        activityBottomImageUrl: obj.activityBottomImageUrl,
        detail: getJSON(obj.richText, []),
        id: obj.id,
        title: obj.title,
        button: getJSON(obj.buttonJson, {
            buttonBgColor: '#FF5128',
            buttonColor: '#FFFFFF'
        }),
        couponList:
            obj.couponList
                ?.filter((r) => {
                    if (r.status === 1) {
                        // 判断是否过期
                        if (
                            r.validityTimeType === 2 ||
                            calendar.getCompareDateTimestamp(r.endTime, r.currentTimeStamp) < 0
                        ) {
                            return true;
                        }
                    }

                    return false;
                })
                .map((r) => {
                    return {
                        serialNumber: r.serialNumber,
                        id: r.id,
                        image0: map[`${ r.id }-0`] || null,
                        image1: map[`${ r.id }-1`] || null,
                        image2: map[`${ r.id }-2`] || null,
                        thresholdPrice: r.thresholdPrice,
                        discountNum: r.discountNum
                    };
                }) || []
    };
};

/**************
 * 过滤narwal day数据
 * @param obj
 * @returns
 */
export const filterNarwowInfo = function (obj) {
    const narwowUser = obj?.narwowUser || {};
    const narwow = obj?.narwow || {};

    return {
        narwowId: narwow.id,
        narwowUserId: narwowUser.id,
        bindSn: narwowUser.bindSn,
        bindType: narwowUser.bindType,
        orderNo: narwowUser.orderNo,
        acceptNotice: narwowUser.acceptNotice,
        needNotify: narwowUser.needNotify,
        isDevice: narwowUser?.deviceList?.length > 0,
        isOver: narwow.takeEndTime
            ? calendar.getCompareDateTimestamp(narwow.takeEndTime, calendar.now()) > 0 ||
            calendar.getCompareDateTimestamp(narwow.takeStartTime, calendar.now()) < 0
            : false,
        isStart: narwow.takeStartTime
            ? calendar.getCompareDateTimestamp(narwow.takeStartTime, calendar.now()) > 0
            : false,
        qrCodeUri: narwow.qrCodeUri,
        narwowAddressId: narwowUser.addrId
    };
};

/*************
 * 过滤活动聚合页数据
 * @param obj
 */
export const filterLandingInfo = function (obj) {
    const now = obj.serverTimeStamp || Date.now();
    const start = obj.startTime;
    const end = obj.endTime;
    let status = 1; // 0 未开始 1 进行 2 已结束
    // 判断活动是否已开始
    const startDay = calendar.getCompareDateTimestamp(now, start);
    const time = calendar.getCompareDateTimestamp(now, end);

    let timestamp = time;
    if (startDay > 0) {
        // 活动未开始
        status = 0;
        timestamp = startDay;
    } else if (time <= 0) {
        // 活动已结束
        status = 2;
        timestamp = 0;
    }

    const positionMap = {};
    obj.positionList?.forEach((item) => {
        item.imageList.forEach((c) => {
            c.jsonData = getJSON(c.jsonData, {});
        });
        positionMap[item.resourceId] = item.imageList;
    });

    return {
        id: obj.id,
        status,
        timestamp,
        positionMap
    };
};
