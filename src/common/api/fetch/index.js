import {
    filterCouponList,
    filterMyTrialList,
    filterProduct,
    filterTrialInfo,
    filterTrialList,
    filterTrialReportList,
    filterNarwowInfo
} from 'common/util/filters';
import {$http, $api} from 'common/util/global-properties';
import qrcodeBase64 from 'common/util/qrcode-base64';
import {dataURLtoFile, getJSON, toHome} from 'common/util';
import {isObject, isUndefined} from 'lib/util/dataType';
import {PRODUCT_TYPE_COUPON, POSTING_GIFTS_ACTION_STATUS} from 'common/util/constant';
import {couponProduct} from 'common/util/coupon';

/*********
 * 富文本请求
 * @param route
 * @returns {Promise<{}|{html: *, title: (*|string)}>}
 * @constructor
 */
export async function RICH({$route}) {
    const query = $route.query;
    let url = $api.customPage;
    let params = {id: query.pageId};

    if (query.pageKeyword) {
        url = $api.customPageByKey;
        params = {pageKeyword: query.pageKeyword};
    }

    const [res, err] = await $http.awaitTo(
        $http.get(url, {
            alert: false,
            params
        })
    );

    if (err) {
        return {
            richInfo: {
                html: '',
                title: '云鲸智能',
                appToolStatus: 1,
                btnJson: null,
                status: 0
            }
        };
    }

    const obj = res.data || {};
    const btnJson = getJSON(obj.buttonJson);

    return {
        richInfo: {
            html: obj.richText?.replaceAll(
                '#/views',
                `${process.env.STORE_URL}redirect#/views`
            ),
            title: obj.seoTitle || obj.title || '云鲸智能',
            appToolStatus: obj.appToolStatus,
            btnJson: btnJson?.status === 1 ? btnJson : null,
            status: !!obj.richText ? 1 : 0
        }
    };
}

/*************
 * 获取token
 * @param params
 * @returns {Promise<*|null>}
 * @constructor
 */
export async function GET_TOKEN({params}) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.getToken, {
            params
        })
    );

    if (err) {
        return null;
    }

    return res.data;
}

/***********
 * 获取试用列表
 * @returns {Promise<{trialList: (*|*[])}|{trialList: *[]}>}
 * @constructor
 */
export async function TRIAL_LIST() {
    const [res, err] = await $http.awaitTo($http.get($api.trialList));

    if (err) {
        return {
            trialList: []
        };
    }

    return {
        trialList: filterTrialList(res.data?.list || [])
    };
}

/**************
 * 获取我的试用列表
 * @param params
 * @returns {Promise<{trialList: (*|*[])}|{trialList: *[]}>}
 * @constructor
 */
export async function MY_TRIAL_LIST({params}) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.myTrialList, {
            params: params || {
                pageNo: 1,
                pageSize: 100
            }
        })
    );

    if (err) {
        return {
            trialList: []
        };
    }

    return {
        trialList: filterMyTrialList(res.data?.list || [])
    };
}

/**************
 * 获取新品试用详情
 * @param $route
 * @param isNotFilter 默认过滤
 * @returns {Promise<{trialList: {}}|{trialInfo: {}}>}
 * @constructor
 */
export async function TRIAL_INFO({$route}, isNotFilter) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.trialInfo, {
            params: {
                id: $route.params.id
            }
        })
    );

    if (err) {
        return {
            trialInfo: {
                status: -1
            }
        };
    } else if (!res.data?.productSku) {
        return {
            trialInfo: {
                status: -2
            }
        };
    }

    const obj = res.data || {};

    return {
        trialInfo: isNotFilter ? obj : filterTrialInfo(obj)
    };
}

/**************
 * 获取试用报告列表
 * @param params
 * @param extraData
 * @returns {Promise<{reportList: (*|*[]), type: string}|{reportList: *[], type: string}>}
 * @constructor
 */
export async function TRIAL_REPORT_LIST({params, extraData}) {
    params = Object.assign(params || {}, extraData || {});
    const [res, err] = await $http.awaitTo(
        $http.get($api.trialReportList, {
            params
        })
    );

    if (err) {
        return {
            reportList: []
        };
    }

    return {
        reportList: filterTrialReportList(res.data?.list || [])
    };
}

export async function TRIAL_REPORT_DETAIL({$route}) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.trialReportInfo, {
            params: {
                id: $route.params.id
            }
        })
    );

    if (err) {
        return {
            reportInfo: {}
        };
    }

    const obj = res.data;
    return {
        reportInfo: {
            title: obj.title,
            content: obj.content,
            fileList: obj.pictureUrls
        }
    };
}

/***********
 * 获取Ecaht信息
 * @returns {Promise<*|null>}
 * @constructor
 */
export async function ECHAT_INFO() {
    const [res, err] = await $http.awaitTo($http.wait.get($api.echatInfo));

    if (err) {
        return null;
    }

    return res.data;
}

/****************
 * 创建小程序码-返回base64
 * @param url
 * @param wait
 * @param full 是否完整链接
 * @returns {Promise<*>}
 * @constructor
 */
export async function CREATE_APPLET_CODE({url, wait, full}) {
    if (process.env.EXEC_ENV !== 'prod') {
        const shareUrl = full
            ? url.replace('/index', '/index.html')
            : `views/act/index.html?path=${encodeURIComponent(url)}`;
        return qrcodeBase64.draw({
            margin: 0,
            content: `https://open.weixin.qq.com/sns/getexpappinfo?appid=wx831ebed34a9db052&path=${encodeURIComponent(
                shareUrl
            )}`
        });
    }

    const [res, err] = await $http.awaitTo(
        $http.get($api.getWxBase64, {
            wait,
            params: {
                shareUrl: full ? url : `views/act/index?path=${encodeURIComponent(url)}`
            }
        })
    );

    if (err) {
        return false;
    }

    return res.data?.base64AppletsCode;
}

/*************
 * 上传base64
 * @param base64
 * @param wait
 * @returns {Promise<unknown>}
 */
export async function UPLOAD_BASE64({base64, wait}) {
    const formData = new FormData();
    formData.append('file', dataURLtoFile(base64, 'image.jpg'));

    const [res, err] = await $http.awaitTo(
        $http.post($api.uploadImage, formData, {
            timeout: 30000,
            wait
        })
    );

    if (err) {
        return null;
    }

    return res.data;
}

/**************
 * 上传文件
 * @param file
 * @param wait
 * @param type
 * @param extraData
 * @returns {Promise<void>}
 * @constructor
 */
export async function UPLOAD_FILE({file, wait, url, extraData}) {
    const formData = new FormData();
    formData.append('file', file);

    if (isObject(extraData)) {
        Object.keys(extraData).forEach((key) => {
            formData.append(key, extraData[key]);
        });
    }

    const [res, err] = await $http.awaitTo(
        $http.post(url || $api.uploadImage, formData, {
            timeout: 300000,
            alert: false,
            wait
        })
    );

    if (err) {
        return {type: 'err', data: err};
    }

    return {type: 'suc', data: res.data};
}

/**************
 * 获取问卷列表
 * @param $route
 * @returns {Promise<{questionnaireList: []}|{questionnaireList: []}>}
 * @constructor
 */
export async function QUESTIONNAIRE_LIST({params, fetchApi}) {
    const [res, err] = await $http.awaitTo(
        $http.get(fetchApi, {
            params
        })
    );

    if (err) {
        return {
            questionnaireList: []
        };
    }

    return {
        questionnaireList: res?.data || []
    };
}

/**************
 * 获取活动聚合页数据
 * @param $route
 * @returns {Promise<{postingList: []}|{postingList: []}>}
 * @constructor
 */
export async function ACTIVITY_LIST({params}) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.activityList, {
            params
        })
    );

    if (err) {
        return {
            list: []
        };
    }

    return {
        list: res?.data || []
    };
}

/**************
 * 根据活动ID查询晒单礼活动信息详情
 * @param $route
 * @returns {Promise<{postingList: []}|{postingList: []}>}
 * @constructor
 */
export async function POSTING_ACTIVITY_DETAIL({params}) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.getDetailByActivityId, {
            params
        })
    );

    if (err) {
        return {};
    }

    return {
        ...(res?.data || {})
    };
}

/**************
 * 获取晒单列表
 * @param $route
 * @returns {Promise<{postingList: []}|{postingList: []}>}
 * @constructor
 */
export async function POSTING_GIFTS_LIST({params}) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.postingGiftsList, {
            params
        })
    );

    if (err) {
        return {
            postingList: []
        };
    }

    return {
        postingList: res?.data?.list || []
    };
}

/**************
 * 获取晒单详情
 * @param $route
 * @constructor
 */
export async function POSTING_DETAIL_INFO({$route}) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.postingDetailInfo, {
            params: {
                id: $route.params.id
            }
        })
    );

    if (err) {
        return {
            reportInfo: {}
        };
    }

    const obj = res.data;
    const coupon = obj.coupon;
    const couponList = obj.couponList || [obj.coupon];
    const product = {
        name: obj.record?.prizeName,
        thumbnailUrl: obj.record?.thumbnailUrl,
        action: obj.action,
        bigOrderNo: obj.record?.bigOrderNo,
        prizeNum: obj.record?.prizeNum
    };

    const notGoLottery = obj.action === POSTING_GIFTS_ACTION_STATUS.notGoLottery;

    return {
        reportInfo: {
            activityId: obj.tableId,
            status: obj.status, // 1成功 2失败
            title: obj.title,
            content: obj.content,
            fileList: [...(obj.pictureUrls || []), ...(obj.screenshotUrls || [])],
            prizeType: obj.record?.prizeType, // 奖品类型 1-优惠券，2-实物商品
            record: obj.record,
            coupon: coupon,
            couponList: couponList,
            product: product,
            platform: obj.platform,
            platformNo: obj.platformNo,
            bindSn: obj.bindSn,
            notGoLottery,
            action: obj.action,
            bigOrderNo: obj.bigOrderNo || obj.record?.bigOrderNo, // 实物奖品已下单订单号
            otherPlatform: obj.otherPlatform,
            otherPlatformUrl: obj.otherPlatformUrl
        }
    };
}

/**************
 * 根据活动ID查询退差信息详情
 * @param $route
 * @returns {Promise<{postingList: []}|{postingList: []}>}
 * @constructor
 */
export async function PROTECTION_ACTIVITY_DETAIL({params}) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.getProtectionDetailById, {
            params
        })
    );

    if (err) {
        return {};
    }

    return {
        ...(res?.data || {})
    };
}

/**************
 * 获取退差方案模板列表
 * @param $route
 * @constructor
 */
export async function PROTECTION_TEMPLATE_LIST({params}) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.getProtectionTemplateList, {
            params
        })
    );

    if (err) {
        return {
            options: []
        };
    }

    const options = (res?.data || []).map((item) => ({
        label: item.rewardTemplateName,
        value: item.rewardTemplateId,
        type: item.rewardType,
        activityProductId: item.activityProductId
    }));

    return {
        options
    };
}

/**************
 * 获取新人礼店铺配置
 * @param $route
 * @constructor
 */
export async function INVITE_CONF({params}) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.getConf, {
            params
        })
    );

    if (err) {
        return {
            options: []
        };
    }

    const options = (res?.data || []).map((item) => ({
        label: item.value,
        value: item.code
    }));

    return {
        options
    };
}

/**************
 * 获取配置V2
 * @param $route
 * @constructor
 */
export async function GET_CONF_V2({ params }) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.getConfV2, {
            params
        })
    );

    if (err) {
        return [];
    }

    return res?.data || [];
}

/**************
 * 根据活动ID查询购机礼活动信息详情
 * @param $route
 * @returns {Promise<{postingList: []}|{postingList: []}>}
 * @constructor
 */
export async function PURCHASE_ACTIVITY_DETAIL({params}) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.getBuyRobotActivity, {
            params
        })
    );

    if (err) {
        return {};
    }

    return {
        ...(res?.data || {})
    };
}

/**
 * 购机记录详情
 * @param {*} param0
 * @returns
 */
export async function PURCHASE_RECORD_DETAIL({params}) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.purchaseMyPrize, {
            params
        })
    );

    if (err) {
        return {
            detailInfo: {
                status: 3,
                error: -1
            }
        };
    }

    const status = !res?.data ? 3 : res.data?.status;
    const detailInfo = {
        ...(res?.data || {}),
        status
    };

    return {
        detailInfo
    };
}

/************
 * 商品详情
 * @param $route
 * @param $store
 * @returns {Promise<{tagList: string[], discountList: ([]|*[]), product: {summary: *, serialNumber: *, skuList: *, num: number, title: *, mobileDetail, type: *, shareImg, shareWords: *, salesLimitNum: *, attachmentList: *[], parameter: *, serviceList: *, salesStatus: *, state: number, isActivityProduct: *, productComment: *}, maxCoupon: T, discountInfo: *, userCouponList: *[], saleInfo: *, couponList: *, isTake: boolean, finalPrice: (number|number)}|void>}
 * @constructor
 */
export async function PRODUCT_DETAIL({$route, $store}) {
    let url = $api.productInfo;
    let params = {};
    const query = $route.query;
    if (query.serialNumber) {
        params.serialNumber = query.serialNumber;
    } else {
        params = query;
        url = $api.getConsumableProduct;
    }

    const productRequest = $http.awaitTo(
        $http.get(url, {
            params,
            wait: false
        })
    );

    let result;

    if ($store.state.token) {
        // 已登录
        result = await Promise.all([
            productRequest,
            $http.awaitTo(
                $http.get($api.userCouponList, {
                    params: {
                        type: 1,
                        pageSize: 10000,
                        pageNo: 1
                    },
                    alert: false,
                    wait: false
                })
            )
        ]);
    } else {
        // 未登录
        result = [await productRequest];
    }

    const [res, err] = result[0];

    if (err || !res.data) {
        return toHome();
    }

    const data = res.data;
    const product = filterProduct(data.product, data.discountList, data.presaleList);
    if (query.skuId) {
        const skuId = Number(query.skuId);
        product.selected = Math.max(
            0,
            product.skuList.findIndex((r) => r.id === skuId)
        );
    } else {
        product.selected = 0;
    }

    product.skuId = product.skuList[product.selected].id;
    product.referral = !!query.oldUserUuid;

    /// 当商品类型位付款优惠券时，删除优惠券、限时折扣列表
    if (product.type === PRODUCT_TYPE_COUPON) {
        data.couponList = [];
        data.discountList = [];
    }

    const couponList = filterCouponList(data.couponList || []);
    const discountList = data.discountList || [];

    let userCouponList = [];
    if (result[1] && result[1][0]) {
        userCouponList = filterCouponList(result[1][0].data?.list || []);
    }

    const sumInfo = couponProduct([product], discountList, couponList, userCouponList);
    // 标签列表
    const tagList = sumInfo.couponInfo.list
        .map((r) => {
            return `满${r.thresholdPrice}减${r.discountNum}`;
        })
        .concat(
            sumInfo.couponInfo?.addOnCouponList?.map((r) => {
                return `满${r.thresholdPrice}减${r.discountNum}`;
            }) || []
        );
    const finalPrice = sumInfo.discountPrice || 0;

    // 是否显示可领券
    const saleInfo = sumInfo.discountInfo.discountSale[product.skuId];
    const discountInfo = sumInfo.discountInfo.discountMap[product.skuId];

    if (sumInfo.couponInfo.total > 0 && !discountInfo) {
        // 只有优惠
        product.state = 3;
    } else if (sumInfo.couponInfo.total === 0 && discountInfo) {
        // 只有折扣
        product.state = 2;
    } else if (sumInfo.couponInfo.total > 0 && discountInfo) {
        // 优惠,折扣都有
        product.state = 4;
    } else {
        product.state = 1; // 无任何折扣
    }

    // 记录未领取券serialNumber
    const useCoupon = sumInfo.couponInfo?.list?.filter((item) => item.useStatus === -1) || [];
    const addOnCoupon = sumInfo.couponInfo?.addOnCouponList?.filter((item) => item.useStatus === -1) || [];
    const unCouponList = useCoupon.concat(addOnCoupon);

    return {
        product,
        finalPrice,
        couponList,
        discountList,
        userCouponList,
        discountInfo,
        unCouponList,
        saleInfo,
        tagList
    };
}

/**
 * 商详评价标签
 * @param {*} param0
 * @returns
 */
export async function PRODUCT_COMMENT_TAGS({params, extraData}) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.commentInfo, {
            params: Object.assign(params || {}, extraData || {})
        })
    );

    if (err) {
        return {
            commentSum: 0,
            tagList: []
        };
    }

    return {
        commentSum: res.data?.sum || 0,
        tagList:
            res.data?.tagList.map((item) => {
                return {
                    value: item.tagId,
                    label: item.tagName,
                    num: item.tagNum
                };
            }) || []
    };
}

/******************
 * 标签列表
 * @returns {Promise<{tagList}|{tagList: *[]}>}
 * @constructor
 */
export async function TAG_LIST({extraData, type}) {
    const {api} = extraData || {};
    let url = $api.tagList;
    if (api === 'info') {
        url = $api.tagInfo;
    } else if (api === 'act') {
        url = $api.queryActTag;
    }

    const params = Object.assign({}, extraData || {}, {type: type || 1});
    delete params.api;

    const [res, err] = await $http.awaitTo(
        $http.get(url, {
            params
        })
    );

    if (err) {
        return {
            tagList: []
        };
    }

    return {
        tagList: !api
            ? res.data
            : api === 'info'
                ? [res.data].filter((r) => !!r)
                : res.data.filter((item) => item.isShowInTrial === 1)
    };
}

/*****************
 * 首页数据
 * @returns {Promise<{bannerList: *[], templateName: string, templateMap: {}, tileList: *[]}>}
 * @constructor
 */
export async function MALL_INDEX() {
    const [res, err] = await $http.awaitTo($http.get($api.getIndexPage));

    let bannerList = [];
    let tileList = [];
    let templateMap = {};
    let templateName = 'appTemplate2';

    if (err) {
        return {
            bannerList,
            tileList,
            templateMap,
            templateName
        };
    }

    const obj = res.data || {};

    if (obj.templateName === 'index_0') {
        bannerList = obj.positionList?.find((r) => r.resourceId === '1')?.imageList || [];
        tileList = obj.positionList?.find((r) => r.resourceId === '2')?.imageList || [];
        templateName = 'appTemplate1';
    } else if (obj.templateName === 'index_1') {
        const map = {};
        obj.positionList?.forEach((item) => {
            map[item.resourceId] = item.imageList;
        });

        bannerList = map['index_1_1'] || [];
        templateMap = map;
        templateName = 'appTemplate2';
    }

    return {
        bannerList,
        tileList,
        templateMap,
        templateName
    };
}

/***************
 * 云鲸鲸喜
 * @param option
 * @returns {Promise<{orderNo, qrCodeUri, isOver: (boolean|boolean), acceptNotice, narwowId, narwowUserId, bindSn: (string|*), needNotify}|{}>}
 * @constructor
 */
export async function NARWAL_DAY(option) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.getNarwowAndUserInfo, {
            wait: option?.type !== 'replace' ? (isUndefined(option?.wait) ? '查询中' : option.wait) : false
        })
    );

    if (err) {
        return {};
    }

    return filterNarwowInfo(res.data);
}

/***********
 * 获取服务商品可预约时间
 * @returns {Promise<{trialList: (*|*[])}|{trialList: *[]}>}
 * @constructor
 */
export async function GET_SERVICE_RESERVE_TIME() {
    const [res, err] = await $http.awaitTo($http.get($api.getServiceReserveTime));

    if (err) {
        return {
            startTime: '',
            endTime: '',
            disabledDateList: []
        };
    }

    const {startTime = '', endTime = '', disabledDateList} = res.data || {};

    return {
        startTime,
        endTime,
        disabledDateList: disabledDateList || []
    };
}

/********
 * 领取优惠券
 * @param list
 * @param page 获取页面:1:商品详情页2:购物车3:活动专区页4:优惠券领取页5:/
 * @param source
 * @param wait
 * @param loading
 * @returns {Promise<*|null>}
 * @constructor
 */
export async function COUPON_TAKE({list, page, source, wait, loading}) {
    const sourceMap = {2: 'h5', 3: 'app', 4: '小程序'};
    const [res, err] = await $http.awaitTo(
        $http.post(
            $api.couponTakeAll,
            {
                couponSerialNumberList: list,
                obtainPage: page,
                obtainSource: sourceMap[source] || '/'
            },
            {
                loading,
                wait: wait || '领取中...'
            }
        )
    );

    if (err) {
        return null;
    }

    return res.data;
}

/************
 * 获取文件配置信息
 */
export async function FILES_PACKAGE() {
    const [res, err] = await $http.awaitTo($http.get($api.getRealSiteConf));

    if (err) {
        return null;
    }

    const siteInfo = getJSON(res.data, null);
    return getJSON(siteInfo.extend, null);
}

/*********
 * 获取页面配置
 * @returns {Promise<void>}
 * @constructor
 */
export async function PAGES_CONFIG({$route}) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.getActivityGroupPage, {
            alert: false,
            params: {
                pagePlace: 'activity_group_page_3',
                pageKey: $route.params.key
            }
        })
    );

    if (err) {
        return {
            title: '云鲸智能',
            sections: [],
            now: 0,
            status: 0
        };
    }

    const sections = getJSON(res.data?.pageContent, []) || [];
    return {
        title: res.data?.pageName || '云鲸智能',
        sections: sections.filter(item => !item.disabled),
        now: res.data?.serverTimeStamp,
        status: sections.length > 0 ? 1 : 0
    };
}

/*********
 * 获取以旧换新活动页面配置
 * @returns {Promise<void>}
 * @constructor
 */
export async function RENEW_PAGES_CONFIG({$route}) {
    const id = $route.params.id || $route.query.id;
    if (!id || isNaN(id) || id === 'undefined') {
        return {
            title: '云鲸智能以旧换新',
            sections: [],
            now: 0,
            status: 0
        };
    }
    const [res, err] = await $http.awaitTo(
        $http.get($api.getActivityGroupPage, {
            alert: false,
            params: {
                pagePlace: 'activity_group_page_3',
                pageKey: `trade_in_${id}`
            }
        })
    );

    if (err) {
        return {
            title: '云鲸智能以旧换新',
            sections: [],
            now: 0,
            status: 0
        };
    }

    const sections = getJSON(res.data?.pageContent, []) || [];
    return {
        title: res.data?.pageName || '云鲸智能',
        sections: sections.filter(item => !item.disabled),
        now: res.data?.serverTimeStamp,
        status: sections.length > 0 ? 1 : 0
    };
}

/**************
 * 获取晒单详情-无需登录
 * @param $route
 * @constructor
 */
export async function POSTING_INFO_NO_LOGIN({$route}) {
    const [res, err] = await $http.awaitTo(
        $http.get($api.postingInfoNoLogin, {
            params: {
                id: $route.params.id
            }
        })
    );

    if (err) {
        return {
            postingInfo: {}
        };
    }

    const obj = res.data || {};

    return {
        postingInfo: {
            title: obj.title,
            content: obj.content,
            fileList: obj.pictureUrls
        }
    };
}
