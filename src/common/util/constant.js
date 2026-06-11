//存储变量
export const TOKEN = '10001';
export const USER = '10002'; // 默认用户信息
export const UUID = '10003'; // 用户uuid
export const PRODUCT_ORDER = '10004'; // 商品下单信息
export const ECHAT_SEND_INFO = '10007'; // 一恰图文数据
export const LOGIN_STATE = '10008'; // 登录状态
export const PAGE_SCROLL_TOP = '10012'; // 富文本滚动位置
export const UTM = '10013'; // UTM
export const SCROLL_POS = '10014'; // 滚动位置记录
export const TRIAL_REPORT_CACHE = '10015'; // 试用报告缓存
export const TRIAL_SAVE_KEY = '100016'; // 试用报告保存KEY
export const TRIAL_PUSH_KEY = '10017'; // 试用报告发布KEY
export const QUESTIONNAIRE_KEY = '10018'; // 问卷缓存
export const LOADED_KEY = '10019'; // 加载完KEY
export const CACHE_MEDIA_RECT = '10020'; // 缓存媒体信息
export const MESSAGE = '10021'; // 发送信息
export const DEVICE_TYPE = '10022'; // 设备类型
export const CACHE_PATH_INFO = '10023'; // 缓存页面路径数据
export const INVITE_REPORT_CACHE = '10024'; // 晒单报告缓存
export const INVITE_SAVE_KEY = '10025'; // 晒单报告保存KEY
export const INVITE_PUSH_KEY = '10026'; // 晒单报告发布KEY
export const INVITE_PURCHASE_CACHE = '10027'; // 购机礼填写报告缓存
export const POSTING_ERROR_ARTICLE_ID = '10028'; // 晒机礼提交错误后articleId
export const PRODUCT_SPEC_LIST = '10029'; // 商品规格列表
export const PRODUCT_TYPE_ID = '10030'; // 商品类型ID
export const CACHE_TAG_STATE = '10031'; // 缓存红点标签状态
export const CACHE_SELECT_ADDRESS = '10032'; // 缓存选中的地址
export const CACHE_SELECT_COUPON = '10033'; // 缓存选中的优惠券
export const CACHE_SELECT_VOUCHER = '10034'; // 缓存选中的代金券
export const CACHE_SELECT_COUPON_LIST = '10035'; // 缓存优惠列表
export const CACHE_WECHAT_OPENID = '10036'; // 缓存微信的openId
export const CACHE_H5_REDIRECT = '10037'; // 缓存h5微信授权单号
export const CACHE_INVOICE_INFO = '10038'; // 缓存发票提交信息
export const OUTER_PAGE_SCROLL_TOP = '10039'; // 跳出外部页面时页面滚动位置
export const RENEW_POP = '10040';// 以旧焕新是否弹框
export const LOADING_CHUNK = '10041';// loading chunk 出错记录
export const ROUTER_TRACK = '10050';// 路由轨迹
export const CX_QUESTIONNAIRE_KEY = '10051'; // CX系列问卷缓存
export const CX_OUTER_PAGE_SCROLL_TOP = '10052'; // CX问卷页面缓存
export const SHOW_OPEN_APPLET = '10053';// 是否显示打开小程序
export const PROTECTION_ERROR_ARTICLE_ID = '10056'; // 退差提交错误后articleId

// 默认传输的区号
export const SMS_AREA_CODE = '86';
// 小程序appid
export const WX_APPID = 'wx831ebed34a9db052';
// 微信网页支付appid
export const WX_PAY_APPID = 'wxa995989c1212977e';
// 设备类型
export const DEVICE_MAP = {
    APPLET: {
        TYPE: 'applet',
        VALUE: 4
    },
    APP: {
        TYPE: 'app',
        VALUE: 3
    },
    H5: {
        TYPE: 'h5',
        VALUE: 2
    }
};


// 验证码类型：0=注册，1=登录，2=忘记密码，3=绑定手机，4=修改密码，5=验证旧手机号码，6=修改新手机号码（修改手机号码先发5，后发6）
export const SMS_CODE_TYPE = {
    register: 0,
    login: 1,
    forgotPwd: 2,
    bindPhone: 3,
    resetPwd: 4,
    changCheck: 5,
    change: 6
};


/***************************** 商品相关 *****************************/
export const PRODUCT_TYPE_COUPON = 2;

/***************************** Event事件名称中心 *****************************/
export const EVENTS = {
    MEMBER_ORDER_UPDATE: 'member.order.update',
    PRODUCT_COUPON_TAKE: 'product.coupon.take',
    REFRESH_RENDER_DATA: 'refresh.render.data',// 刷新数据
    REQUEST_DONE: 'request.done',// 请求结束
    IMAGE_DONE: 'image.done',// 图片加载结束
    VIDEO_MUTED: 'video.muted',// 视频静音
    REFRESH_PAGE: 'refresh.page',// 刷新页面
    CLEAR_CACHE: 'clear.cache',// 清除缓存
    MESSAGE: 'event.message'// 发送数据
};

/***************************** 原因相关 *****************************/
// 理由类型1-退货原因2-换货原因3-补发原因4-赠送原因5-用户取消售后单原因6-维修原因7-取消订单
export const REASON_TYPE = {returns: 1, exchange: 2, repair: 3, reissue: 4, gifts: 5, cancelOrder: 7};


// 底部导航栏配置信息
export const CUSTOM_TAB_BAR_LIST = [
    {
        pagePath: '/index',
        iconPath: 'iconfont icon-home',
        text: '首页'
    },
    {
        pagePath: '/product',
        iconPath: 'iconfont icon-good',
        text: '全部商品'
    },
    {
        pagePath: '/shopping-cart',
        iconPath: 'iconfont icon-shopping-cart',
        text: '购物车'
    },
    {
        pagePath: '/member',
        iconPath: 'iconfont icon-user',
        text: '我的'
    }
];


// 用户登录-当前平台 4,商城
export const SYSTEM_USER_PLATFORM = 4;

// 用户登录-当前平台 版本
export const SYSTEM_USER_PLATFORM_VERSION = '1.0.0';

/**************************** E-CHAT 类型 *********************************/

export const ECHAT_TYPE = {
    TRIAL: 'trial', // 新品试用
    PRODUCT: 'product', // 商品
    TRADE: 'trade', // 以旧换新
    DETAIL: 'detail', // 商品详情
    COUPON: 'coupon', // 优惠券
    APPLET: 'applet', // 其它小程序
    INNER: 'inner', // 站内路径
    WEBSITE: 'website',// 站外网址
    CUSTOM: 'custom', // 自定义页面
    CLASSIFY: 'classify', // 商品分类
    PREVIEW: 'preview', // 媒体预览
    CART: 'cart',
    ORDER: 'order',
    SALES: 'sales',
    ORDER_DETAIL: 'order_detail',
    AFTER_SALES_DETAIL: 'after_sales_detail',
    ACT: 'act',
    QUESTIONNAIRE: 'questionnaire'
};

/**************************** 小程序APPID *************************************/
export const APPLET_ID_MAP = {
    care: 'wx14f3c114cc5f0bd1', // 云鲸进度追踪
    make: 'wxc33fe7af2446ebd8', // 云鲸服务预约
    db: 'wxa1ebeeb0ed47f0b2', // 德邦快递
    jd: 'wx73247c7819d61796', // 京东快递
    sf: 'wxd4185d00bf7e08ac' // 顺丰速运
};

/*******
 * 活动集合
 * @type {{}}
 */
export const ACTIVITY_MAP = {
    REFERRAL: 'Referral',
    NARWAL_DAY: 'NarwalDay',
    TRADE: 'Trade',
    TRIAL: 'Trial',
    INVITE: 'Invite',
    LAND: 'landing'
};

// ar版本最低要求
export const AR_VERSION_MAP = {
    'j4_ar_material': '2.4.00',
    '1300_ar_material': '2.2.35'
};

/***********
 * 设置BODY背景颜色
 * @type {{GRAY: string}}
 */
export const BODY_COLOR = {
    GRAY: 'gray',
    BLACK: 'black'
};

/// 默认图片
export const DEFAULT_IMAGE = 'https://image-www.narwal.com/applet/images/common/default.png?size=314-294';

// 默认视频封面
export const DEFAULT_VIDEO_COVER = 'https://image-www.narwal.com/applet/images/common/video-cover.png';
// 默认用户头像
export const DEFAULT_USER_PHOTO = 'https://image-www.narwal.com/applet/images/member/custom_selected.png';

/**
 * 隐私协议Key
 */
export const PRIVACY_MAP = {
    userResearch: 'trial-questionnaire', // 用研问卷隐私协议
    trialUserAgreement: 'trial-user-agreement', // 试用问卷用户协议
    trialPrivacyRules: 'trial-privacy-rules' // 试用问卷活动规则
};

/**
 * 隐私协议对应document.title
 */
export const PRIVACY_TITLE_MAP = {
    'trial-questionnaire': '用户隐私政策', // 用研问卷隐私协议
    'trial-user-agreement': '用户协议', // 试用问卷用户用户协议
    'trial-privacy-rules': '活动规则' // 试用问卷活动规则
};

/***************************** 优惠券领取类型 *****************************/
export const COUPON_TAKE_TYPE_FEE = 1; // 付费购买

/***************************** 优惠券时间 *****************************/
// validityTimeType (integer, optional): 优惠券使用时间类型 1指定优惠券开始结束时间 2指定一个领券后有效期
export const COUPON_VALIDITYTIME_TYPE = {
    normal: 1,
    after: 2
};

// 优惠券类型 1-优惠券 2-限时折扣 3-代金券
export const COUPON_SUBMIT_TYPE = {coupon: 1, discount: 2, voucher: 3};
// 订单优惠类型 1-优惠券 2-限时折扣 3-以旧换新 5-代金券 9-换购 10 - 推荐有礼
export const COUPON_TYPE = {coupon: 1, discount: 2, trade: 3, voucher: 5, rebuy: 9, referral: 10};
// 订单优惠类型 1-优惠券 2-限时折扣 3-以旧换新 5-代金券 9-换购

// 活动状态 -1: 已删除, 0: 已禁用, 1: 已启用, 2: 未开始, 3: 进行中, 4: 已结束
export const ACTIVITY_STATUS_MAP = {
    delete: -1,
    disable: 0,
    enabled: 1,
    scheduled: 2,
    active: 3,
    expired: 4
};

// 不能参与活动提示
export const ACTIVITY_STATUS_TEXT_MAP = {
    '-1': '你来晚了，活动已下线',
    0: '你来晚了，活动已下线',
    2: '活动未开始',
    4: '你来晚了，活动已下线'
};

// 小程序显示的资源位类型
export const APP_RESOURCE_LIST = ['all', 'web'];
// h5显示的资源位类型
export const H5_RESOURCE_LIST = ['all', 'h5'];
// 新人礼可选店铺配置项
export const INVITE_CONFIG_TYPE = 31;
// 退差获取产品型号配置项
export const PROTECTION_CONFIG_TYPE = 30;

//  @订单来源1 1-官网PC 2-官网H5 , 3-App, 4-小程序
export const ORDER_SOURCE_PLATFORM = {pc: 1, h5: 2, app: 3, applet: 4};

// 优惠券是否适用于全部商品
export const COUPON_APPLICABLE = {no: 0, all: 1};

// 优惠券是否能与限时折扣叠加
export const COUPON_SUPERPOSITIOIN = {no: 1, yes: 2};
// 选择卡券类型
export const SELECT_COUPON_MODE = {coupon: 'coupon', voucher: 'voucher'};

/***************************** 订单相关 *****************************/
/// 支付方式
export const ORDER_PAYTYPE_MAP = {zfb: 1, wx: 2, hb: 3};

// 提交订单入口：1-从购物车购买，2-商品立即购买
export const ORDER_SUBMIT_TYPE = {shoppingCart: 1, buyNow: 2};

// 订单类型 订单类型 1-实物订单 4-虚拟订单 ,
export const ORDER_TYPE = {normal: 1, virtual: 4};

// 订单类别，1-普通订单，2-企业购，3-以旧换新，4-鲸喜订单，6-试用订单 7- 预售订单
export const ORDER_CATEGORY = {normal: 1, corp: 2, trade: 3, surprise: 4, trial: 6, presale: 7};

// 支付类型，1-pc,2-h5,3-miniapp, 4-APP
export const ORDER_PAY_SUBMITDEVICE = {pc: 1, h5: 2, applet: 3, app: 4};
export const ORDER_SOURCE_PLATFORM_MAP = {1: 'pc', 2: 'h5', 3: 'app', 4: 'applet'};

// 支付方式，支付方式1-支付宝2-微信
export const ORDER_PAY_TYPE = {alipay: 1, wxpay: 2};

// 订单状态: -1-删除 0-已取消 1-待付款 2-待发货 3-已发货 4-已完成 9-已审核 10-取消中 11-部分发货 12-待确认收款 14-待付尾款 15-超时未付尾款
export const ORDER_STATUS_MAP = {
    cancel: 0,
    nopaid: 1,
    noshipping: 2,
    shippinged: 3,
    complete: 4,
    canceling: 10,
    shippingedpart: 11,
    checked: 9,
    noconfirmpaid: 12,
    commented: 13,
    presalepay: 14,
    pretimeout: 15
};

// 订单状态显示相关
export const ORDER_STATUS_SHOW = {
    [ORDER_STATUS_MAP.cancel]: {
        name: '交易关闭',
        label: '交易关闭'
    },
    [ORDER_STATUS_MAP.nopaid]: {
        name: '待付款',
        label: '等待买家付款'
    },
    [ORDER_STATUS_MAP.noshipping]: {
        name: '待发货',
        label: '等待商家发货'
    },
    [ORDER_STATUS_MAP.shippinged]: {
        name: '待收货',
        label: '等待买家收货'
    },
    [ORDER_STATUS_MAP.complete]: {
        name: '待评价',
        label: '交易完成，享受自由生活吧'
    },
    [ORDER_STATUS_MAP.checked]: {
        name: '已审核',
        label: '等待商家发货'
    },
    [ORDER_STATUS_MAP.canceling]: {
        name: '取消中',
        label: '交易关闭中'
    },
    [ORDER_STATUS_MAP.shippingedpart]: {
        name: '待收货',
        label: '等待买家收货'
    },
    [ORDER_STATUS_MAP.noconfirmpaid]: {
        name: '待确认收款',
        label: '待确认收款'
    },
    [ORDER_STATUS_MAP.commented]: {
        name: '已完成',
        label: '交易完成，享受自由生活吧'
    },
    [ORDER_STATUS_MAP.presalepay]: {
        name: '待付尾款',
        label: '待付尾款'
    },
    [ORDER_STATUS_MAP.pretimeout]: {
        name: '超时未付尾款',
        label: '超时未付尾款'
    }
};

// 订单支付状态: -1无效数据 0未支付 1已支付 2支付中(PROCESSING) 3支付失败 4退款中 5退款成功 6退款失败 7已取消 8支付审核中(REVIEW) 9支付审核失败（风控审核失败）
export const ORDER_PAY_STATUS_MAP = {nopaid: 0, paid: 1, paying: 2, payfail: 3};

/***************************** 售后相关 *****************************/

// 原因类型1--未发货退款 2-已发货仅退款 3-退货退款 4-换货 ,
export const ORDER_REFUND_TYPE = {refund1: 1, refund2: 2, refund3: 3, refund4: 4};

// 售后状态 数据状态:-1删除 0-待商家审核 1-审核不通过 2-待买家退货 3-待商家收货 4-商家确认收货 5-商家发货 6-售后完成 7-售后关闭 8-商家拒绝退款 9-商家拒绝换货 -99-修改物流单号
export const ORDER_REFUND_STATUS = {
    del: -1,
    checkNo: 0,
    checkReject: 1,
    waitUserSend: 2,
    waitReceipt: 3,
    waitConfirm: 4,
    watiUsSend: 5,
    complete: 6,
    close: 7,
    refundReject: 8,
    echangeReject: 9,
    updateExpress: -99
};

// 支付类型
export const ORDER_PAY_TYPE_MAP = {
    1: '支付宝',
    2: '微信支付',
    3: '花呗'
};

// 售后物流类型 1-买家寄回 2-卖家寄出
export const ORDER_REFUND_EXPRESS_TYPE = {buyer: 1, shop: 2};

// 原因类型页面标题等信息
export const ORDER_REFUND_TYPE_PAGE = {
    [ORDER_REFUND_TYPE.refund1]: {
        name: '退款',
        applyTitle: '申请退款',
        applyProduct: '退款商品',
        applyInfomation: '退款信息',
        detailTitle: '退款详情',
        applyReasonLabel: '退款原因'
    },
    [ORDER_REFUND_TYPE.refund2]: {
        name: '退款',
        applyTitle: '申请退款',
        applyProduct: '退款商品',
        applyInfomation: '退款信息',
        detailTitle: '退款详情',
        applyReasonLabel: '退款原因'
    },
    [ORDER_REFUND_TYPE.refund3]: {
        name: '退货退款',
        applyTitle: '申请退货退款',
        applyProduct: '退货退款商品',
        applyInfomation: '退货退款信息',
        detailTitle: '退货退款详情',
        applyReasonLabel: '退款原因'
    },
    [ORDER_REFUND_TYPE.refund4]: {
        name: '换货',
        applyTitle: '申请换货',
        applyProduct: '换货商品',
        applyInfomation: '换货信息',
        detailTitle: '换货详情',
        applyReasonLabel: '换货原因'
    }
};

// 售后状态显示MAP
export const ORDER_REFUND_STATUS_NAME = {
    [ORDER_REFUND_STATUS.checkNo]: {
        name: '待商家审核',
        operate: '用户发起申请',
        operateOthter: '用户修改申请'
    },
    [ORDER_REFUND_STATUS.checkReject]: {
        name: '商家拒绝售后',
        operate: '商家拒绝申请'
    },
    [ORDER_REFUND_STATUS.waitUserSend]: {
        name: '待买家退货',
        operate: '商家同意申请'
    },
    [ORDER_REFUND_STATUS.waitReceipt]: {
        name: '待商家收货',
        operate: '买家已寄回',
        operateOthter: '商家同意用户拒签'
    },
    [ORDER_REFUND_STATUS.waitConfirm]: {
        name: '商家确认收货',
        operate: '商家已收货'
    },
    [ORDER_REFUND_STATUS.watiUsSend]: {
        name: '商家发货',
        operate: '商家已补发'
    },
    [ORDER_REFUND_STATUS.complete]: {
        name: '售后完成',
        operate: '售后完成'
    },
    [ORDER_REFUND_STATUS.close]: {
        name: '售后关闭',
        operate: '售后关闭'
    },
    [ORDER_REFUND_STATUS.refundReject]: {
        name: '商家拒绝退款',
        operate: '商家拒绝退款'
    },
    [ORDER_REFUND_STATUS.echangeReject]: {
        name: '商家拒绝换货',
        operate: '商家拒绝换货'
    },
    [ORDER_REFUND_STATUS.updateExpress]: {
        name: '修改物流单号',
        operate: '修改物流单号'
    }
};

// 售后状态显示详细列表
export const ORDER_REFUND_STATUS_TITLES = {
    /// 仅退款
    [ORDER_REFUND_TYPE.refund1]: {
        [ORDER_REFUND_STATUS.checkNo]: {
            title: '请等待商家处理',
            countDown: '还剩dd天hh时mm分ss秒，超期未处理自动同意',
            orderTitle: '退款进度：请等待商家处理',
            tipsTitle: '您已成功发起退款申请，请耐心等待商家处理',
            tipsContent:
                '商家同意或者超时未处理，系统将退款给您。如果商家拒绝，您可以修改申请后再次发起，商家会重新处理'
        },
        [ORDER_REFUND_STATUS.checkReject]: {
            title: '商家拒绝了您的退款申请',
            countDown: '请在dd天hh时mm分ss秒处理，超期未处理自动关闭申请',
            orderTitle: '退款进度：商家拒绝了您的退款申请',
            tipsTitle: '您的退款申请已被拒绝，请及时处理',
            tipsContent:
                '商家拒绝了您的退款申请，拒绝原因：{reason}。您可以撤销申请或者修改申请后再次发起，商家会重新处理'
        },
        [ORDER_REFUND_STATUS.complete]: {
            title: '退款完成',
            orderTitle: '退款进度：退款完成',
            tipsTitle: '退款完成',
            tipsContent: '钱款已退还至您的原支付账户，请注意查收，如有疑问，请联系官方客服'
        },
        [ORDER_REFUND_STATUS.close]: {
            title: '退款申请关闭',
            orderTitle: '退款进度：退款申请关闭',
            tipsTitle: '您的退款申请已关闭',
            tipsContent: '您的售后申请已关闭，您可以再次发起，商家会重新处理'
        },
        [ORDER_REFUND_STATUS.refundReject]: {
            title: '商家拒绝退款',
            countDown: '请在dd天hh时mm分ss秒处理，超期未处理自动关闭申请',
            orderTitle: '售后进度：商家拒绝退款',
            tipsTitle: '商家拒绝退款',
            tipsContent: '商家拒绝退款，拒绝原因：{reason}，请撤销申请后再次发起申请，商家会重新处理'
        }
    },
    /// 已发货仅退款
    [ORDER_REFUND_TYPE.refund2]: {
        [ORDER_REFUND_STATUS.checkNo]: {
            title: '请等待商家处理',
            countDown: '还剩dd天hh时mm分ss秒，超期未处理自动同意',
            orderTitle: '售后进度：请等待商家处理',
            tipsTitle: '您已成功发起售后申请，请耐心等待商家处理',
            tipsContent:
                '商家同意或者超时未处理，系统将退款给您。如果商家拒绝，您可以修改申请后再次发起，商家会重新处理'
        },
        [ORDER_REFUND_STATUS.waitReceipt]: {
            title: '您的申请已通过，请等待商家收货后退款',
            countDown: '还剩dd天hh时mm分ss秒，超期未处理自动退款',
            orderTitle: '售后进度：您的申请已通过，请等待商家收货后退款',
            tipsTitle: '商家已同意您的售后申请，请等待商家确认收货后退款',
            tipsContent: '商家同意或者超时未处理，系统将退款给您'
        },
        [ORDER_REFUND_STATUS.checkReject]: {
            title: '商家拒绝了您的售后申请',
            countDown: '请在dd天hh时mm分ss秒处理，超期未处理自动关闭申请',
            orderTitle: '售后进度：商家拒绝了您的售后申请',
            tipsTitle: '您的退款申请已被拒绝，请及时处理',
            tipsContent:
                '商家拒绝了您的退款申请，拒绝原因：{reason}。您可以撤销申请或者修改申请后再次发起，商家会重新处理'
        },
        [ORDER_REFUND_STATUS.complete]: {
            title: '退款完成',
            orderTitle: '售后进度：退款完成',
            tipsTitle: '您的售后已完成',
            tipsContent: '钱款已退还至您的原支付账户，请注意查收，如有疑问，请联系官方客服'
        },
        [ORDER_REFUND_STATUS.close]: {
            title: '售后申请已关闭',
            orderTitle: '售后进度：售后申请已关闭',
            tipsTitle: '您的退款申请已关闭',
            tipsContent: '您的售后申请已关闭，您可以再次发起，商家会重新处理'
        },
        [ORDER_REFUND_STATUS.refundReject]: {
            title: '商家拒绝退款',
            countDown: '请在dd天hh时mm分ss秒处理，超期未处理自动关闭申请',
            orderTitle: '售后进度：商家拒绝退款',
            tipsTitle: '商家拒绝退款',
            tipsContent: '商家拒绝退款，拒绝原因：{reason}，请撤销申请后再次发起申请，商家会重新处理'
        }
    },
    /// 退货退款
    [ORDER_REFUND_TYPE.refund3]: {
        [ORDER_REFUND_STATUS.checkNo]: {
            title: '请等待商家处理',
            countDown: '还剩dd天hh时mm分ss秒，超期未处理自动同意',
            orderTitle: '售后进度：请等待商家处理',
            tipsTitle: '您已成功发起售后申请，请耐心等待商家处理',
            tipsContent:
                '商家同意或者超时未处理，系统将同意申请。如果商家拒绝，您可以修改申请后再次发起，商家会重新处理'
        },
        [ORDER_REFUND_STATUS.checkReject]: {
            title: '商家拒绝了您的售后申请',
            countDown: '请在dd天hh时mm分ss秒处理，超期未处理自动关闭申请',
            orderTitle: '售后进度：商家拒绝了您的售后申请',
            tipsTitle: '您的售后申请已被拒绝，请及时处理',
            tipsContent:
                '商家拒绝了您的退货退款申请，拒绝原因：{reason}。您可以撤销申请或者修改申请后再次发起，商家会重新处理'
        },
        [ORDER_REFUND_STATUS.waitUserSend]: {
            title: '待买家退货',
            countDown: '请在dd天hh时mm分ss秒处理，超期未处理自动关闭申请',
            orderTitle: '售后进度：待买家退货',
            tipsTitle: '商家已同意您的售后申请，请及时寄回商品',
            tipsContent: '商家已同意您的退货退款申请，请将商品寄回至商家提供的地址，超期未处理将自动关闭售后申请'
        },
        [ORDER_REFUND_STATUS.waitReceipt]: {
            title: '待商家收货',
            countDown: '还剩dd天hh时mm分ss秒，超期未处理自动退款',
            orderTitle: '售后进度：待商家收货',
            tipsTitle: '退货商品已寄回，请等待商家处理',
            tipsContent: '您的商品已寄回，请耐心等待商家处理，商家超时未处理将自动退款'
        },
        [ORDER_REFUND_STATUS.waitConfirm]: {
            title: '商家确认收货',
            orderTitle: '售后进度：商家确认收货',
            tipsTitle: '商家已确认收货，请等待商家退款处理',
            tipsContent: '您的商品商家已确认收货，请耐心等待商家处理，商家超时未处理将自动退款'
        },
        [ORDER_REFUND_STATUS.refundReject]: {
            title: '商家拒绝退款',
            countDown: '请在dd天hh时mm分ss秒处理，超期未处理自动关闭申请',
            orderTitle: '售后进度：商家拒绝退款',
            tipsTitle: '商家拒绝退款',
            tipsContent: '商家拒绝退款，拒绝原因：{reason}，请撤销申请后再次发起申请，商家会重新处理'
        },
        [ORDER_REFUND_STATUS.complete]: {
            title: '售后完成',
            orderTitle: '售后进度：售后完成',
            tipsTitle: '您的售后已完成',
            tipsContent: '钱款已退还至您的原支付账户，请注意查收，如有疑问，请联系官方客服'
        },
        [ORDER_REFUND_STATUS.close]: {
            title: '售后申请已关闭',
            orderTitle: '售后进度：售后申请已关闭',
            tipsTitle: '您的售后申请已关闭',
            tipsContent: '您的售后申请已关闭，您可以再次发起，商家会重新处理'
        }
    },
    /// 换货
    [ORDER_REFUND_TYPE.refund4]: {
        [ORDER_REFUND_STATUS.checkNo]: {
            title: '请等待商家处理',
            countDown: '还剩dd天hh时mm分ss秒，超期未处理自动同意',
            orderTitle: '售后进度：请等待商家处理',
            tipsTitle: '您已成功发起售后申请，请耐心等待商家处理',
            tipsContent:
                '商家同意或者超时未处理，系统将同意申请。如果商家拒绝，您可以修改申请后再次发起，商家会重新处理'
        },
        [ORDER_REFUND_STATUS.checkReject]: {
            title: '商家拒绝了您的售后申请',
            countDown: '请在dd天hh时mm分ss秒处理，超期未处理自动关闭申请',
            orderTitle: '售后进度：商家拒绝了您的售后申请',
            tipsTitle: '您的售后申请已被拒绝，请及时处理',
            tipsContent:
                '商家拒绝了您的换货申请，拒绝原因：{reason}。您可以撤销申请或者修改申请后再次发起，商家会重新处理'
        },
        [ORDER_REFUND_STATUS.waitUserSend]: {
            title: '待买家退货',
            countDown: '请在dd天hh时mm分ss秒处理，超期未处理自动关闭申请',
            orderTitle: '售后进度：待买家退货',
            tipsTitle: '商家已同意您的售后申请，请及时寄回商品',
            tipsContent: '商家已同意您的换货申请，请将商品寄回至商家提供的地址，超期未处理将自动关闭售后申请'
        },
        [ORDER_REFUND_STATUS.waitReceipt]: {
            title: '待商家收货',
            countDown: '还剩dd天hh时mm分ss秒，请耐心等待',
            orderTitle: '售后进度：待商家收货',
            tipsTitle: '换货商品已寄回，请等待商家处理',
            tipsContent: '您的商品已寄回，请耐心等待商家处理，商家超时未处理将自动退款'
        },
        [ORDER_REFUND_STATUS.waitConfirm]: {
            title: '换货/补寄，待商家发货',
            orderTitle: '售后进度：换货/补寄，待商家发货',
            tipsTitle: '商家已确认收货，请等待商家补发商品',
            tipsContent: '商家正在加紧安排换货补发，请您耐心等待'
        },
        [ORDER_REFUND_STATUS.watiUsSend]: {
            title: '换货/补寄，待买家收货',
            countDown: '还剩dd天hh时mm分ss秒，换货/补寄，待买家收货',
            orderTitle: '售后进度：待商家收货',
            tipsTitle: '换货补发商品已发出',
            tipsContent: '您的换货商品已发出，物流信息如下'
        },
        [ORDER_REFUND_STATUS.echangeReject]: {
            title: '商家拒绝换货',
            countDown: '请在dd天hh时mm分ss秒处理，超期未处理自动关闭申请',
            orderTitle: '售后进度：商家拒绝换货',
            tipsTitle: '商家拒绝换货',
            tipsContent: '商家拒绝换货，拒绝原因：{reason}，请撤销申请后再次发起申请，商家会重新处理'
        },
        [ORDER_REFUND_STATUS.complete]: {
            title: '售后完成',
            orderTitle: '售后进度：售后完成',
            tipsTitle: '您的售后已完成',
            tipsContent: '您的换货申请已完成，如有问题可联系官方客服'
        },
        [ORDER_REFUND_STATUS.close]: {
            title: '售后申请已关闭',
            orderTitle: '售后进度：售后申请已关闭',
            tipsTitle: '您的售后申请已关闭',
            tipsContent: '您的售后申请已关闭，您可以再次发起，商家会重新处理'
        }
    }
};

// 快递数据
export const EXPRESS_LIST = [
    {label: '圆通速递', value: 'YTO'},
    {label: '德邦快递', value: 'DBKD'},
    {label: '京东快递', value: 'JDKD'},
    {label: '申通快运', value: 'STLL'},
    {label: '顺丰标准快递', value: 'SF'},
    {label: '中通快递', value: 'ZTO'},
    {label: '邮政小包', value: 'YZXB'},
    {label: '韵达快递', value: 'YUNDA'},
    {label: '其他', value: 'OTHER'}
];

// 购物车商品状态
export const PRODUCT_STATUS_MAP = {
    '-1': '预约商品',
    '-2': '已下架',
    '-3': '无效商品',
    '-4': '不可售卖',
    0: '暂时无货'
};

/***************************** 开票相关 *****************************/
export const INVOICE_HEADER_TYPE = {
    singer: 1,
    company: 2
};
/***************************** 订阅通知ID *****************************/
export const SUBSCRIBE_IDS = {
    // 优惠券通知
    sendCoupon: 'F6cS0u61WMZj8PXZ67zTwxWLjN6BOgBqxfhNqpJqOWg',
    // 发货通知
    sendProduct: 'Q_sJTuLe13SPvIBix1fvxnYHNAv5qonz7V7PFoDFvpo',
    // 活动开始提醒
    sendActivityStart: 'f4Dpdh1baSu7RmlVMqHTmYZ8Jmcz63KZAzPuB1vnvf0',
    // 审核结果通知
    sendCheckResult: 'MzBQOnoL7Pd749qb6zxfifkg67sOhWmohSn5ALB590A',
    // 待付款提醒
    sendPayNotice: '5LHLfalmmJ-2nt0-cdsIIz-oeLQE4pJVDoe9TySvEFU',
    // 代金券发放通知
    sendCouponVoucher: 'F6cS0u61WMZj8PXZ67zTwxWLjN6BOgBqxfhNqpJqOWg',
    // 定金支付通知
    depositPay: '5LHLfalmmJ-2nt0-cdsII5lskigOZ9CDfgoe1CujG8M',
    // 以旧焕新通知
    renewNotice: 'l19wpkAOn3mMG6NGbZSp3E6Wv_FCgiOyidpwPO6a-Fw'
};

/**
 * SN对应的老用户关怀券
 */
export const SN_TAG_TYPE_MAP = {
    17: '您的300元老用户周年券已发放至卡包~',
    18: '您的200元老用户周年券已发放至卡包~',
    19: '您的100元老用户周年券已发放至卡包~'
};
/*********
 * 产品分类
 * 1:实物商品 2:付款优惠券 3:服务商品
 */
export const PRODUCT_CLASSIFY_MAP = {
    physicalGoods: 1,
    paymentCoupon: 2,
    serviceGoods: 3
};

/**
 * 不上报的接口及接口对应code
 * 注意：key必须和/api/index.js内的url值保持一致
 */
export const HTTP_NOT_REPORT_MAP = {
    '/cactivity/narwow/web/getNarwowAndUserInfo': [9002, 9016],
    '/cactivity/narwow/web/take': [9001, 9013],
    '/cactivity/narwow/web/addOrUpdate': [9001, 9013]
};


/**
 * 晒单礼详情状态 0-待审核 1-晒单成功 2-晒单失败
 */
export const POSTING_GIFTS_STATUS = {
    reviewing: 0,
    success: 1,
    failed: 2
};

/**
 * 晒单奖励状态(详情页) 1-查看奖励，2-查看详情，3-完善收货信息，4-去抽奖
 * 晒单奖励状态(列表页，列表页只有三个状态，后台未抽奖/未获取资格都返回2) 1-查看奖励，2-查看详情，3-完善收货信息
 */
export const POSTING_GIFTS_ACTION_STATUS = {
    lookReward: 1,
    lookDetail: 2,
    improveOrder: 3,
    notGoLottery: 4
};

/**
 * 购机礼详情状态 0-失败, 1-待审核, 2-成功
 */
export const PURCHASE_GIFTS_STATUS = {
    failed: 0,
    reviewing: 1,
    success: 2
};

/**
 * 协议类型 1:用户协议，2:隐私协议
 */
export const POLICY_MAP = {
    service: 1,
    privacy: 2
};

/**
 * 退差详情状态 0-审核失败 1-待审核 2-审核成功 3-已发放奖励
 */
export const PROTECTION_STATUS = {
    failed: 0,
    reviewing: 1,
    success: 2,
    sended: 3
};

/**
 * 问卷类型
 */
export const QUESTIONNAIRE_TYPE = {
    trial: 1,
    common: 2,
    tradein: 3
};

/**
 * 不区分水箱/上下水版的机器类型
 */
export const NO_WATER_MACHINE_LIST = ['J1', 'S1', 'S1系列', 'S1 MAX', 'S1 Pro'];

/**
 * 发票类型 -1-不展示 0-开票中 1-开票成功 2-开票失败 3-冲红成功 4-冲红中 5-冲红失败
 */
export const INVOICE_STATUS = {
    invoicing: 0,
    success: 1,
    failed: 2,
    redSuccess: 3,
    redOpen: 4,
    redFailed: 5
};

/**
 * 发票类型 开票中:0 开票成功:1 开票失败:2
 */
export const INVOICE_STATUS_TEXT = {
    [INVOICE_STATUS.invoicing]: {
        label: '开票中',
        desc: '预计10天内完成开票，请留意邮箱通知~'
    },
    [INVOICE_STATUS.success]: {
        label: '开票成功',
        desc: '您的发票已发送至您的电子邮箱，请注意查收~'
    },
    [INVOICE_STATUS.failed]: {
        label: '开票失败',
        desc: '请尝试重新开票，或反馈客服处理~'
    },
    [INVOICE_STATUS.redSuccess]: {
        label: '开票成功',
        desc: '您的发票已发送至您的电子邮箱，请注意查收~'
    },
    [INVOICE_STATUS.redOpen]: {
        label: '开票成功',
        desc: '您的发票已发送至您的电子邮箱，请注意查收~'
    },
    [INVOICE_STATUS.redFailed]: {
        label: '开票成功',
        desc: '您的发票已发送至您的电子邮箱，请注意查收~'
    }
};

/**
 * 操作类型 1-申请开票、2-重新开票、3-换开发票 4-冲红 5-修改发票信息
 */
export const INVOICE_OPERATE_TYPE = {
    apply: 1,
    reApply: 2,
    reChange: 3,
    red: 4,
    edit: 5
};