const _mall_exclusive_path = [
    // 以旧换新-获取资格
    'product/scan-sn',
    // 一洽 - 购物车列表
    'echat/shopping-cart',
    // 一洽 - 订单列表
    'echat/order',
    // 一洽 - 售后单列表
    'echat/after-sales',
    // 跳转其它小程序
    'navigate-applet',
    // 云鲸鲸喜
    'member/narwal-day',
    // 云鲸鲸喜管理页
    'member/surprise',
    // 云鲸鲸喜订单
    'member/surprise/progress-query',
    // 云鲸福利管理
    'member/surprise/benefit-manage',
    // 赠品地址信息完善
    'member/surprise/benefit-manage/add',
    // 选择地址
    'member/surprise/benefit-manage/list',
    // 设备绑定
    'member/device/bind',
    // 云鲸机器SN码获取
    'member/device/remark',
    // 设备选择
    'member/device/list',
    // 设备列表
    'product/robot-list',
    // narwow
    'narwow',
    // 老带新入口
    'activities/referral',
    // 老带新分享入口
    'activities',
    // 媒体预览
    'preview',
    // 小程序分享
    'share'
];
export default {
    contain: (path) => {
        let isContain = false;
        for (let str in _mall_exclusive_path) {
            if (path.includes(str)) {
                isContain = true;
                break;
            }
        }

        return isContain;
    }
};