import {
    COUPON_APPLICABLE,
    COUPON_SUBMIT_TYPE,
    COUPON_SUPERPOSITIOIN,
    COUPON_VALIDITYTIME_TYPE
} from 'common/util/constant';
import calendar from 'lib/util/calendar';
import { isNumber } from 'lib/util/dataType';
import clone from 'lib/json/clone';

/**************
 * 计算最优优惠券
 * @param productList
 * @param couponList
 * @param discountMap 折扣集合
 * @param type 类型
 */
export const couponSum = function(productList, couponList, discountMap, type) {
    // 商品总价
    let productTotalPrice = 0;
    // 未使用折扣券总价
    let unUsedDiscountPrice = 0;
    let productSkuList = [];
    productList.forEach(item => {
        // 当为商品详情时，只计算单个商品
        const num = type === 'shop' ? 1 : item.num;

        const price = (item.skuList.find(c => c.id === item.skuId)?.price || 0) * num;
        const disPrice = discountMap[item.skuId]?.discountedPrice * num;

        productSkuList.push({
            skuId: item.skuId,
            price: price,
            num: num
        });
        productTotalPrice += disPrice || price;
        // 记录未使用折扣券的商品总价
        if (!discountMap[item.skuId]) {
            unUsedDiscountPrice += price;
        }
    });

    // 可领取的
    let takeCouponList = [];
    // 已领取的
    let useCouponList = [];
    // 可凑单可领取的
    let addOnTakeCouponList = [];
    // 可凑单已领取的
    let addOnUseCouponList = [];
    // 筛选符合的券, 如果有折扣,则需要能叠加的券,才能参与
    clone(couponList).forEach(item => {
        if (item.isApplicableAll === COUPON_APPLICABLE.all) {
            // 全部商品可用
            // 不支持叠加使用,需要排除用了折扣券的商品
            let total = item.superposition === COUPON_SUPERPOSITIOIN.no ? unUsedDiscountPrice : productTotalPrice;
            // 满足要求
            if (item.thresholdPrice <= total) {
                if (item.useStatus === 0) {
                    useCouponList.push(item);
                } else {
                    takeCouponList.push(item);
                }
            } else if (total > 0) {// 有券符合要求，但是不满足使用要求
                if (item.useStatus === 0) {
                    addOnUseCouponList.push(item);
                } else {
                    addOnTakeCouponList.push(item);
                }
            }
        } else if (item.isApplicableAll === COUPON_APPLICABLE.no) {
            // 部分商品可用
            let total = 0;
            // 不支持叠加使用,需要排除用了折扣券的商品
            if (item.superposition === COUPON_SUPERPOSITIOIN.no) {
                total = productSkuList
                    .filter(r => !discountMap[r.skuId] && item.applicableProductSkuIdSet.includes(r.skuId))
                    .reduce((total, obj) => {
                        const disPrice = discountMap[obj.skuId]?.discountedPrice || null;
                        return total + (!!disPrice ? disPrice * obj.num : obj.price);
                    }, 0);
            } else {
                total = productSkuList
                    .filter(r => item.applicableProductSkuIdSet.includes(r.skuId))
                    .reduce((total, obj) => {
                        const disPrice = discountMap[obj.skuId]?.discountedPrice || null;
                        return total + (!!disPrice ? disPrice * obj.num : obj.price);
                    }, 0);
            }

            // 满足要求
            if (item.thresholdPrice <= total) {
                if (item.useStatus === 0) {
                    useCouponList.push(item);
                } else {
                    takeCouponList.push(item);
                }
            } else if (total > 0) {// 有券符合要求，但是不满足使用要求
                if (item.useStatus === 0) {
                    addOnUseCouponList.push(item);
                } else {
                    addOnTakeCouponList.push(item);
                }
            }
        }
    });

    takeCouponList = takeCouponList.sort((v1, v2) => v2.discountNum - v1.discountNum);
    useCouponList = useCouponList.sort((v1, v2) => v2.discountNum - v1.discountNum);
    const arr = [...takeCouponList, ...useCouponList];
    let discountTotal = arr.length > 0 ? Math.max(...arr.map(r => r.discountNum)) : 0;

    return {
        total: discountTotal,
        takeCouponList,
        useCouponList,
        addOnUseCouponList,
        addOnTakeCouponList,
        productList: productSkuList
    };
};

/// 计算购物车内的优惠券列表数据
export const couponShoppingCart = function(productList, couponList, discountMap) {
    // 商品总价
    let productTotalPrice = 0;
    // 未使用折扣券总价
    let unUsedDiscountPrice = 0;
    let productSkuList = [];
    productList.forEach(item => {
        const num = item.num;
        const price = (item.skuList.find(c => c.id === item.skuId)?.price || 0) * num;
        const disPrice = discountMap[item.skuId]?.discountedPrice * num;

        productSkuList.push({
            skuId: item.skuId,
            price: price,
            disPrice: (disPrice || price),
            num: num
        });
        productTotalPrice += (disPrice || price);
        // 记录未使用折扣券的商品总价
        if (!discountMap[item.skuId]) {
            unUsedDiscountPrice += price;
        }
    });

    // 可领取的
    let takeCouponList = [];
    // 已领取的
    let useCouponList = [];
    // 已领取的代金券
    let useVoucherList = [];
    // 筛选符合的券, 如果有折扣,则需要能叠加的券,才能参与
    clone(couponList).forEach(item => {
        if (item.isApplicableAll === COUPON_APPLICABLE.all) {
            // 全部商品可用
            // 支持叠加使用,需要用了折扣券的商品
            const isSuperposition = item.superposition === COUPON_SUPERPOSITIOIN.yes; // 是否可叠加
            let total = isSuperposition ? productTotalPrice : unUsedDiscountPrice;
            // 满足要求
            if (item.thresholdPrice <= total) {
                const skuMap = {};
                const len = productSkuList.length - 1;
                let sumTotal = 0;
                productSkuList.forEach((p, i) => {
                    const productPrice = isSuperposition ? p.disPrice : p.price;
                    if (i < len) {
                        const price = parseFloat(((productPrice / total) * item.discountNum).toFixed(5));
                        sumTotal += price;
                        skuMap[p.skuId] = price;
                    } else {
                        skuMap[p.skuId] = item.discountNum - sumTotal;
                    }
                });

                item.skuMap = skuMap;

                if (item.useStatus === 0) {
                    if (item.type === 3) {
                        item.TOTAL_AMOUNT = total;
                        useVoucherList.push(item);
                    } else {
                        useCouponList.push(item);
                    }
                } else {
                    takeCouponList.push(item);
                }
            }
        } else if (item.isApplicableAll === COUPON_APPLICABLE.no) {
            // 部分商品可用
            let total = 0;
            let allList = [];// 所有适用商品
            // 不支持叠加使用,需要排除用了折扣券的商品
            if (item.superposition === COUPON_SUPERPOSITIOIN.no) {
                total = productSkuList
                    .filter(r => !discountMap[r.skuId] && item.applicableProductSkuIdSet.includes(r.skuId))
                    .reduce((total, obj) => {
                        const disPrice = discountMap[obj.skuId]?.discountedPrice || null;
                        const price = (!!disPrice ? disPrice * obj.num : obj.price);
                        allList.push({
                            skuId: obj.skuId,
                            price
                        });
                        return total + price;
                    }, 0);
            } else {
                total = productSkuList
                    .filter(r => item.applicableProductSkuIdSet.includes(r.skuId))
                    .reduce((total, obj) => {
                        const disPrice = discountMap[obj.skuId]?.discountedPrice || null;
                        const price = (!!disPrice ? disPrice * obj.num : obj.price);
                        allList.push({
                            skuId: obj.skuId,
                            price
                        });
                        return total + price;
                    }, 0);
            }

            // 满足要求
            if (item.thresholdPrice <= total) {
                const skuMap = {};
                const len = allList.length - 1;
                let sumTotal = 0;
                allList.forEach((p, i) => {
                    if (i < len) {
                        const price = parseFloat(((p.price / total) * item.discountNum).toFixed(5));
                        sumTotal += price;
                        skuMap[p.skuId] = price;
                    } else {
                        skuMap[p.skuId] = item.discountNum - sumTotal;
                    }
                });

                item.skuMap = skuMap;

                if (item.useStatus === 0) {
                    if (item.type === 3) {
                        item.TOTAL_AMOUNT = total;
                        useVoucherList.push(item);
                    } else {
                        useCouponList.push(item);
                    }
                } else {
                    takeCouponList.push(item);
                }
            }
        }
    });

    takeCouponList = takeCouponList.sort((v1, v2) => v2.discountNum - v1.discountNum);
    useCouponList = useCouponList.sort((v1, v2) => v2.discountNum - v1.discountNum);
    useVoucherList = useVoucherList.sort((v1, v2) => v2.discountNum - v1.discountNum);
    const coupon = useCouponList[0] || {};
    let discountTotal = useCouponList.length > 0 ? useCouponList[0].discountNum : 0;

    const ableVoucherList = [];

    const getAmountFormat = function(amount) {
        if (isNumber(amount)) {
            return Number(amount.toFixed(2));
        } else {
            return 0;
        }
    };

    useVoucherList.forEach(item => {
        // 全部可用
        let couponTotal = 0;
        if (item.isApplicableAll === COUPON_APPLICABLE.all) {
            couponTotal = coupon.discountNum || 0;
        } else {
            item.applicableProductSkuIdSet?.forEach(key => {
                couponTotal += (coupon.skuMap?.[key] || 0);
            });
        }

        const total = getAmountFormat(item.TOTAL_AMOUNT - couponTotal);
        if (total >= item.thresholdPrice || item.thresholdPrice === 0) {
            item.minDiscountNum = Math.min(total, item.discountNum);
            ableVoucherList.push(item);
        }
    });

    return {
        total: discountTotal,
        voucherTotal: ableVoucherList[0]?.minDiscountNum || 0,
        takeCouponList,
        useCouponList,
        useVoucherList: ableVoucherList,
        productList: productSkuList
    };
};

/// 计算订单内的优惠券列表数据
export const couponOrder = function(couponList, productList, discountMap) {
    let productMap = {};
    let ableList = []; // 可用优惠券列表
    let enableList = []; // 不可用优惠券列表
    let ableVoucherList = []; // 可用代金券列表
    let enableVoucherList = []; // 不可用代金券列表
    productList.forEach(product => (productMap[product.skuId] = product)); // 遍历得到商品map
    // 遍历优惠券列表，得到可用和不可用的优惠券
    clone(couponList).forEach(coupon => {
        try {
            const isSuperposition = coupon.superposition === COUPON_SUPERPOSITIOIN.yes; // 是否可叠加
            const currentTime = coupon.currentTimeStamp;
            const startTime = calendar.now(coupon.startTime);
            const endTime = calendar.now(coupon.endTime);
            /// 判断是否在有效期内
            if (
                coupon.validityTimeType === COUPON_VALIDITYTIME_TYPE.after ||
                (currentTime >= startTime && currentTime <= endTime)
            ) {
                let total = 0; // 商品总价
                let allList = [];// 所有适用商品
                // 是否适用所有商品，获取商品总价
                if (coupon.isApplicableAll === COUPON_APPLICABLE.all) {
                    total = productList.reduce((p, product) => {
                        const discount = discountMap[product.skuId];
                        const use = !discount || isSuperposition;
                        // 所用价格，若叠加了限时折扣，使用折扣后价格
                        const price = isSuperposition && !!discount ? discount.discountedPrice : product.price;
                        allList.push({
                            id: product.skuId,
                            price: use ? price * product.num : 0
                        });
                        return use ? p + price * product.num : p;
                    }, 0);
                } else {
                    total = coupon.applicableProductSkuIdSet.reduce((p, skuId) => {
                        const product = productMap[skuId];
                        if (!product) return p;
                        const discount = discountMap[product.skuId];
                        const use = product && (!discount || isSuperposition);
                        // 所用价格，若叠加了限时折扣，使用折扣后价格
                        const price = isSuperposition && !!discount ? discount.discountedPrice : product.price;
                        allList.push({
                            id: product.skuId,
                            price: use ? price * product.num : 0
                        });
                        return use ? p + price * product.num : p;
                    }, 0);
                }
                if (!!total && total >= coupon.thresholdPrice) {
                    // 满足要求的优惠券 代金券
                    if (coupon.type === COUPON_SUBMIT_TYPE.voucher) {
                        coupon.TOTAL_AMOUNT = total;
                        ableVoucherList.push(coupon);
                    } else {
                        const skuMap = {};
                        const len = allList.length - 1;
                        let sumTotal = 0;
                        allList.forEach((item, i) => {
                            if (i < len) {
                                const price = parseFloat(((item.price / total) * coupon.discountNum).toFixed(5));
                                sumTotal += price;
                                skuMap[item.id] = price;
                            } else {
                                skuMap[item.id] = coupon.discountNum - sumTotal;
                            }
                        });

                        coupon.skuMap = skuMap;
                        ableList.push(coupon);
                    }
                } else {
                    coupon.enableReason = total > 0 ? '未达到优惠券使用门槛' : '当前订单无适用商品';
                    if (coupon.type === COUPON_SUBMIT_TYPE.voucher) {
                        enableVoucherList.push(coupon);
                    } else {
                        enableList.push(coupon); // 未满足要求的优惠券
                    }
                }
            } else {
                coupon.enableReason = '不在有效期内';
                if (coupon.type === COUPON_SUBMIT_TYPE.voucher) {
                    enableVoucherList.push(coupon);
                } else {
                    enableList.push(coupon); // 未满足要求的优惠券
                }
            }
        } catch (e) {
            console.error(e);
        }
    });

    ableList = ableList.sort((a, b) => (a.discountNum - b.discountNum > 0 ? -1 : 1));
    ableVoucherList = ableVoucherList.sort((a, b) => (a.discountNum - b.discountNum > 0 ? -1 : 1));
    return { ableList, enableList, ableVoucherList, enableVoucherList };
};

// 预售信息处理
export const presaleListMap = function(presaleList) {
    const map = {};
    presaleList?.forEach(item => {
        const now = item.nowTime || Date.now();
        const end = calendar.getCompareDateTimestamp(now, item.depositEndTime);
        if (end >= 1000) {
            map[item.productSerialNumber + '-' + item.skuId] = item;
        }
    });

    return map;
};

// 订算现实折扣
export const discountInfo = function(discountList) {
    // 折扣集合
    let discountMap = {};
    let discountSale = {};
    let sales = {};
    discountList?.forEach(obj => {
        // 活动预告
        let startTimestamp = 0;
        let status = 1; // 1 显示活动，2 显示预告, 0 不显示
        if (obj.needAdvance > 0) {
            const start = calendar.now(obj.startTime);
            if (obj.needAdvance === 1) {
                // 立即预告
                startTimestamp = start - obj.nowTimestamp;
                status = startTimestamp > 0 ? 2 : 1;
            } else if (obj.needAdvance === 2) {
                // 指定多少小时内预告
                const hour = obj.advanceNoticeTime * 60 * 60 * 1000;
                if (obj.nowTimestamp + hour >= start) {
                    startTimestamp = start - obj.nowTimestamp;
                    status = startTimestamp > 0 ? 2 : 1;
                } else {
                    status = 0;
                }
            }
        }

        // 有没有预售量
        const list = obj.flashSale?.split('\n').map(r => r.trim())?.filter(r => !!r) || [];
        const dates = [];
        let total = 0, current = 0;
        list.forEach(str => {
            const arr = str.split('#');
            const date = calendar.now(arr[0]);
            const text = arr[1];
            dates.push({
                date,
                text
            });
        });

        let len = dates.length;
        for (let i = len - 1; i >= 0; i--) {
            if (obj.nowTimestamp >= dates[i].date) {
                current = dates[i].text;
                break;
            }
        }

        total = parseInt(dates[len - 1]?.text || 0);

        sales = {
            total,
            progress: total > 0 ? parseInt(current) * 100 / total : 0,
            current
        };

        if (status === 1) {
            discountMap[obj.skuId] = {
                ...obj,
                status,
                sales
            };
        } else if (status === 2) {
            discountSale[obj.skuId] = {
                title: obj.title,
                id: obj.id,
                sales,
                startTimestamp,
                status
            };
        }

        if (!discountMap[obj.skuId]) {
            discountMap[obj.skuId] = null;
        }

        if (!discountSale[obj.skuId]) {
            discountSale[obj.skuId] = null;
        }
    });

    return {
        discountMap,
        discountSale
    };
};

/// 计算折扣券信息
export const discountSum = function(productList, discountList) {
    const map = discountInfo(discountList);
    // 折扣金额
    let total = 0;
    // 单个商品总金额
    let oneTotal = 0;
    // 折扣集合
    let discountMap = map.discountMap;
    let discountSale = map.discountSale;
    productList.forEach(item => {
        const discount = discountMap[item.skuId];
        if (discount) {
            // 现实折扣
            const price = item.skuList.find(c => c.id === item.skuId)?.price || 0;
            const disPrice = price - discount.discountedPrice;
            total += disPrice * item.num;
            oneTotal += disPrice;
        }
    });

    return {
        oneTotal: oneTotal,
        total: total,
        discountMap,
        discountSale
    };
};

// 计算商品券优惠
export const couponProduct = function(productList, discountList, productCouponList, userCouponList) {
    const discountInfo = discountSum(productList, discountList);
    const result = couponSum(productList, [...productCouponList, ...userCouponList], discountInfo.discountMap, 'shop');

    const userCouponMap = list => {
        const map = {};
        list?.forEach(item => {
            map[item.serialNumber] = true;
        });

        return map;
    };

    const useMap = userCouponMap(result.useCouponList);

    let total = result.total;
    let list = result.takeCouponList.filter(item => !useMap[item.serialNumber]).concat(result.useCouponList);
    const obj = result.productList[0];
    const price = parseFloat(((obj?.price || 0) / (obj?.num || 1)).toFixed(2));

    // 如果有凑单券，直接显示领券
    const addUseMap = userCouponMap(result.addOnUseCouponList);
    let addOnCouponList = result.addOnTakeCouponList.filter(item => !addUseMap[item.serialNumber]).concat(result.addOnUseCouponList);

    // 已购买的不显示
    const couponInfo = {
        total,
        price,
        productList: result.productList,
        addOnCouponList: addOnCouponList.sort((v1, v2) => v2.discountNum - v1.discountNum),
        list: list.sort((v1, v2) => v2.discountNum - v1.discountNum)
    };

    const totalPrice = function() {
        let sum = 0;
        let price = 0;
        // 类型为商品
        sum = couponInfo.productList[0]?.price || 0;
        price = sum - total - discountInfo.oneTotal;
        return parseFloat(price.toFixed(2));
    };

    return {
        discountInfo,
        couponInfo,
        discountPrice: totalPrice()
    };
};
