<template>
    <popup v-model="show" :option="option">
        <div :class="[type, { 'tab-bar': isTabBar, extend: scrollTop > 20 }]" class="collect-coupon-model">
            <div class="close flex-center" @click="handleHide">
                <i class="iconfont icon-close"></i>
            </div>
            <scroll-view
                :scroll-y="true"
                :scroll-with-animation="true"
                :scroll-top="scrollPosTop"
                @scroll="handleScroll"
                class="coupon-box">
                <template v-if="type === 'shop' && couponInfo.list.length">
                    <div class="final-price">
                        <price class="price" size="big">{{ totalPrice }}</price>
                        <div class="name">预估到手价</div>
                    </div>
                    <div class="final-info">
                        <img
                            alt=""
                            src="https://image-www.narwal.com/applet/images/common/coupon-sum-bg.jpg"
                            class="image"/>
                        <div class="final-panel flex-center">
                            <div class="module">
                                <price class="price" size="medium">{{ couponInfo.price }}</price>
                                <div class="name">商品售价</div>
                            </div>
                            <template v-if="discountInfo.total > 0">
                                <div class="line"></div>
                                <div class="module">
                                    <price class="price" size="medium">{{ formatNum(discountInfo.total) }}</price>
                                    <div class="name">限时折扣</div>
                                    <img
                                        alt=""
                                        src="https://image-www.narwal.com/applet/images/common/coupon-circle.png"
                                        class="border"/>
                                </div>
                            </template>
                            <template v-if="couponPrice > 0">
                                <div class="line"></div>
                                <div class="module">
                                    <price class="price" size="medium">{{ formatNum(couponPrice) }}</price>
                                    <div class="name">优惠券</div>
                                    <img
                                        alt=""
                                        src="https://image-www.narwal.com/applet/images/common/coupon-circle.png"
                                        class="border"/>
                                </div>
                            </template>
                        </div>
                    </div>
                </template>
                <div
                    class="coupon-tips flex-left"
                    v-if="type === 'cart' || (couponPrice > 0 && type === 'shop')">
                    <div class="title">领券更优惠</div>
                    <div class="desc" v-if="type === 'cart'">(领券后可用于购物车商品)</div>
                    <div class="desc" v-else>(每个订单只使用一张券)</div>
                </div>
                <ul class="coupon-items">
                    <li
                        class="coupon-item"
                        :class="{ selected: selected === item.id, open: item.more, 'not-more': !item.instruction }"
                        @click="handleSelectCoupon(item)"
                        v-for="item in couponInfo.list"
                        :key="item.id"
                        :id="'coupon_' + item.id">
                        <div class="coupon-type flex-center">{{ item.type === 3 ? '代金券' : '满减券' }}</div>
                        <img
                            alt=""
                            v-if="item.instruction"
                            src="https://image-www.narwal.com/applet/images/common/coupon-select-opacity.png"
                            class="coupon-selected"/>
                        <div class="coupon-info flex-left">
                            <div class="price-info">
                                <div class="price oswald-bold flex-bottom">
                                    <span class="small oswald-medium">￥</span>
                                    {{ item.discountNum }}
                                </div>
                                <div class="desc" v-if="item.thresholdPrice > 0">
                                    满{{ item.thresholdPrice }}元可用
                                </div>
                                <div class="desc" v-else>无门槛</div>
                            </div>
                            <div class="content-info">
                                <div class="title">{{ item.name }}</div>
                                <div class="use-date" v-if="item.validityTimeType === 1">
                                    <div class="flex-left">
                                        <span class="date">有效期：</span>
                                        <span class="year">
                                            {{ formatDate(item.startTime) }}
                                        </span>
                                        <span class="hour">
                                            {{ formatHour(item.startTime) }}
                                        </span>
                                    </div>
                                    <div class="flex-left">
                                        <span class="date right">至</span>
                                        <span class="year">
                                            {{ formatDate(item.endTime) }}
                                        </span>
                                        <span class="hour">
                                            {{ formatHour(item.endTime) }}
                                        </span>
                                    </div>
                                </div>
                                <div class="use-date" v-else> 领券后{{ item.validityDays }}天有效</div>
                            </div>
                            <template v-if="item.useStatus === 0">
                                <div class="state gray flex-center" v-if="type === 'shop'">已领取</div>
                                <div
                                    v-else
                                    @click.stop.prevent="handleAvailable(item)"
                                    class="state flex-center">
                                    可用商品
                                </div>
                            </template>
                            <div class="state flex-center" v-else @click.stop="handleTake($event, item)"> 领取</div>
                        </div>
                        <template v-if="item.instruction">
                            <div class="more flex-right">
                                <div class="flex-center bulge-box" @click.stop.prevent="handleMore(item)">
                                    <span class="iconfont bulge icon-bulge-solid"></span>
                                    <span :class="{ on: item.more }" class="iconfont arrow icon-arrow-down"></span>
                                </div>
                            </div>
                            <div class="detail" v-show="item.more">
                                {{ item.instruction || '暂无~' }}
                            </div>
                        </template>
                    </li>
                </ul>
                <template v-if="type === 'shop' && couponInfo.addOnCouponList.length > 0">
                    <div
                        class="coupon-tips flex-left">
                        <div class="title">凑单可用优惠券</div>
                    </div>
                    <ul class="coupon-items">
                        <li
                            class="coupon-item"
                            :class="{ open: item.more, 'not-more': !item.instruction }"
                            v-for="item in couponInfo.addOnCouponList"
                            :key="item.id"
                            :id="'coupon_' + item.id"
                        >
                            <div class="coupon-type flex-center">{{ item.type === 3 ? '代金券' : '满减券' }}</div>
                            <div class="coupon-info flex-left">
                                <div class="price-info">
                                    <div class="price oswald-bold flex-bottom">
                                        <span class="small oswald-medium">￥</span>
                                        {{ item.discountNum }}
                                    </div>
                                    <div class="desc" v-if="item.thresholdPrice > 0">满{{
                                            item.thresholdPrice
                                        }}元可用
                                    </div>
                                    <div class="desc" v-else>无门槛</div>
                                </div>
                                <div class="content-info">
                                    <div class="title">{{ item.name }}</div>
                                    <div class="use-date" v-if="item.validityTimeType === 1">
                                        <div class="flex-left">
                                            <span class="date">有效期：</span>
                                            <span class="year">
                                                {{ formatDate(item.startTime) }}
                                            </span>
                                            <span class="hour">
                                                {{ formatHour(item.startTime) }}
                                            </span>
                                        </div>
                                        <div class="flex-left">
                                            <span class="date right">至</span>
                                            <span class="year">
                                                {{ formatDate(item.endTime) }}
                                            </span>
                                            <span class="hour">
                                                {{ formatHour(item.endTime) }}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="use-date" v-else> 领券后{{ item.validityDays }}天有效</div>
                                </div>
                                <template v-if="item.useStatus === 0">
                                    <div class="state gray flex-center" v-if="type === 'shop'">已领取</div>
                                    <div
                                        v-else
                                        @click.stop.prevent="handleAvailable(item)"
                                        class="state flex-center">
                                        可用商品
                                    </div>
                                </template>
                                <div class="state flex-center" v-else @click.stop="handleTake($event, item)">领取</div>
                            </div>
                            <template v-if="item.instruction">
                                <div class="more flex-right">
                                    <div class="flex-center bulge-box" @click.stop.prevent="handleMore(item)">
                                        <i class="iconfont bulge icon-bulge-solid"></i>
                                        <i :class="{ on: item.more }" class="iconfont arrow icon-arrow-down"></i>
                                    </div>
                                </div>
                                <div class="detail" v-show="item.more">
                                    {{ item.instruction || '暂无~' }}
                                </div>
                            </template>
                        </li>
                    </ul>
                </template>
            </scroll-view>
            <div class="remark-text flex-left">
                以上优惠仅为初步评估，以下单结算为准。点击查看
                <router-link to="/rich?pageKeyword=couponRule" class="link">优惠规则</router-link>
            </div>
            <div class="btn-box flex-center">
                <n-button
                    round
                    class="sub-btn"
                    v-if="canTakeCouponList.length === 0"
                    @tap="handleHide">{{ btnText || '确认' }}
                </n-button>
                <n-button
                    round
                    class="sub-btn"
                    v-else
                    @tap="handleTakeAll">
                    一键领取
                </n-button>
            </div>
        </div>
    </popup>
</template>

<script>
import scrollView from 'common/components/scroll-view';
import price from 'common/components/price';
import calendar from 'lib/util/calendar';
import clone from 'lib/json/clone';
import { couponSum, discountSum } from 'common/util/coupon';
import { getRandom } from 'lib/util/digit';
import { EVENTS } from 'common/util/constant';
import { filterCouponList } from 'common/util/filters';
import { isArray, isObject } from 'lib/util/dataType';
import { COUPON_TAKE } from 'common/api/fetch';

export default {
    name: 'collect-coupon',
    props: {
        couponList: {
            type: Array,
            default() {
                return [];
            }
        },
        discountList: {
            type: Array,
            default() {
                return [];
            }
        },
        makeCouponList: {
            type: Array,
            default() {
                return [];
            }
        },
        type: {
            type: String,
            default: 'shop' // cart|shop
        },
        // 按钮文案，只对cart和buy有效
        btnText: String,
        visible: {
            type: Boolean,
            default: false
        },
        // 是否导航页
        isTabBar: {
            type: Boolean,
            default: true
        },
        // 加载用户优惠券
        isLoadUserCoupon: {
            type: Boolean,
            default: true
        },
        modelValue: {
            type: Boolean,
            default: false
        },
        product: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    emits: ['update:modelValue', 'select'],
    data() {
        return {
            show: this.modelValue,
            selected: null,
            scrollTop: 0,
            scrollPosTop: 0,
            option: {
                autoHide: true,
                zIndex: 98,
                overlay: {
                    zIndex: 97
                },
                animate: {
                    name: 'bottom'
                },
                left: 0,
                bottom: 0

            },
            productList: [clone(this.product)],
            productCouponList: [],
            userCouponList: this.getFormatCount(this.makeCouponList)
        };
    },
    components: {
        scrollView,
        price
    },
    computed: {
        discountInfo() {
            return discountSum(this.productList, this.discountList);
        },
        couponInfo() {
            const result = couponSum(
                this.productList,
                [...this.productCouponList, ...this.userCouponList],
                this.discountInfo.discountMap,
                this.type
            );

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
            let addOnCouponList = [];
            if (this.type === 'shop') {
                const addUseMap = userCouponMap(result.addOnUseCouponList);
                addOnCouponList = result.addOnTakeCouponList.filter(item => !addUseMap[item.serialNumber]).concat(result.addOnUseCouponList);
            } else if (this.type === 'cart') {// 购物车时，只计算已领取的
                total = result.useCouponList[0]?.discountNum || 0;
            }

            const showList = list.sort((v1, v2) => v2.discountNum - v1.discountNum);
            [...showList, ...addOnCouponList].forEach(item => {
                if (item.useStatus === 0) {// 已领取的，需要显示完整时间
                    if (item.validityTimeType !== 1) {
                        item.startTime = item.takeTime;
                        item.endTime = calendar.getOffsetDate(item.takeTime, item.validityDays);
                        item.validityTimeType = 1;
                    }
                }
            });

            return {
                total: total,
                productList: result.productList,
                addOnCouponList: addOnCouponList.sort((v1, v2) => v2.discountNum - v1.discountNum),
                list: showList,
                price
            };
        },
        // 是否可一键领券
        canTakeCouponList() {
            if (this.type === 'shop') {
                return this.couponInfo.list.concat(this.couponInfo.addOnCouponList).filter(item => item.useStatus !== 0) || [];
            }
            return [];
        },
        // 实际优惠价格
        couponPrice() {
            if (this.selected === null) {
                return this.couponInfo.total;
            }
            return this.couponInfo.list.find(item => item.id === this.selected)?.discountNum || 0;
        },
        // 总金额
        totalPrice() {
            let sum = 0;
            let price = 0;

            if (this.type === 'shop') {
                // 类型为商品
                sum = this.couponInfo.productList[0]?.price || 0;
                price = sum - this.couponPrice - this.discountInfo.oneTotal;
            } else if (this.type === 'cart') {
                // 类型为购物车
                sum = this.couponInfo.productList.reduce((total, obj) => {
                    return total + obj.price;
                }, 0);
                price = sum - this.couponPrice - this.discountInfo.total;
            }

            return parseFloat(price.toFixed(2));
        }
    },
    watch: {
        totalPrice() {
            this.onPushData();
        },
        discountInfo() {
            this.onPushData();
        },
        couponInfo(v) {
            this.onPushData();
            // 商品时,可以选择优惠券
            if (this.type === 'shop') {
                this.selected = v?.list?.find((item) => item.discountNum === v.total)?.id || null;
            }
        },
        modelValue(v) {
            this.show = v;
        },
        show(v) {
            this.$emit('update:modelValue', v);
        },
        couponList() {
            this.initCouponList();
        },
        makeCouponList(v) {
            if (v?.length > 0) {
                this.userCouponList = this.getFormatCount(v);
            }
        }
    },
    mounted() {
        this.initCouponList();
        this.isLoadUserCoupon && this.loadUserCoupon();
        this.$event.on(EVENTS.PRODUCT_COUPON_TAKE, this.updateCouponTake);
    },
    unmounted() {
        this.$event.off(EVENTS.PRODUCT_COUPON_TAKE, this.updateCouponTake);
    },
    methods: {
        // 初始化商品
        initProductList(list) {
            this.productList = [].concat(clone(list));
        },
        formatDate(v) {
            return calendar.format(v, 'yyyy.MM.dd');
        },
        formatHour(v) {
            return calendar.format(v, 'HH:mm:ss');
        },
        formatNum(v) {
            return parseFloat(v.toFixed(2));
        },
        // 选择优惠券
        handleSelectCoupon(item) {
            if (this.type === 'shop') {
                this.selected = item.id;
                this.onPushData();
            }
        },
        // 滚动
        handleScroll(ev) {
            this.scrollTop = ev.scrollTop;
        },
        // 派发事件
        onPushData() {
            clearTimeout(this._timer);
            this._timer = setTimeout(() => {
                this.$emit('select', clone({
                    discountPrice: this.totalPrice,
                    discountInfo: this.discountInfo,
                    couponInfo: {
                        ...this.couponInfo,
                        total: this.couponPrice
                    }
                }));
            }, 20);
        },
        initCouponList() {
            const list = clone(this.couponList);
            list.forEach((item) => {
                item.more = false;
                item.useStatus = -1;
                item.reportId = item.id;
                item.id = getRandom(16);
            });

            this.productCouponList = list;
        },
        // 显示更多
        handleMore(obj) {
            obj.more = !obj.more;
            setTimeout(() => {
                if (obj.more) {
                    this.scrollPosTop = this.scrollTop + 120;
                } else {
                    this.scrollPosTop = this.scrollTop;
                }
            }, 100);
        },
        handleHide() {
            this.$emit('update:modelValue', false);
        },
        // 领取全部
        async handleTakeAll({ loading }) {
            // 表示未领取
            const result = await COUPON_TAKE({
                list: this.canTakeCouponList.map(item => item.serialNumber),
                page: 1,
                source: this.$store.state.deviceType,
                loading
            });

            if (result) {
                this.$layer.success('领取成功');
                this.updateCouponTake(this.canTakeCouponList);
            }

        },
        // 领取优惠券
        async handleTake({ loading }, obj) {
            const sourceMap = { 2: 'h5', 3: 'app', 4: '小程序' };
            const [res, err] = await this.$http.awaitTo(
                this.$http.post(
                    this.$api.couponTake,
                    {
                        couponSerialNumber: obj.serialNumber,
                        obtainPage: 1,
                        obtainSource: sourceMap[this.$store.state.deviceType] || '/'
                    },
                    {
                        loading
                    }
                )
            );

            // 800 系统已存在
            if (res || err?.code === 800) {
                this.updateCouponTake(obj);
            }

            if (res) {
                this.$layer.success('领取成功');
            }
        },
        /// 更新优惠券领取
        updateCouponTake(obj) {
            if (isArray(obj)) {
                obj.forEach(item => {
                    this.updateCouponTake(item);
                });
            } else if (isObject(obj)) {
                const coupon = clone(obj);
                coupon.useStatus = 0;
                coupon.takeTime = Date.now();
                coupon.reportId = coupon.id;
                coupon.id = getRandom(16);
                this.userCouponList.push(coupon);
            }
        },
        getFormatCount(list) {
            return clone(list).map(item => {
                item.more = false;
                item.reportId = item.id;
                item.id = getRandom(16);
                return item;
            });
        },
        /// 格式优惠券
        onFormatCoupon(list) {
            list.forEach((item) => {
                item.more = false;
                item.reportId = item.id;
                item.id = getRandom(16);
            });

            this.userCouponList = list;
        },
        // 获取用户优惠券
        async loadUserCoupon(list) {
            if (isArray(list)) {
                return this.onFormatCoupon(list);
            }

            if (!this.$store.state.userInfo) {
                return false;
            }
            const [res, err] = await this.$http.awaitTo(
                this.$http.get(this.$api.userCouponList, {
                    params: {
                        type: 1,
                        pageSize: 10000,
                        pageNo: 1
                    },
                    wait: false
                })
            );

            if (err) {
                return false;
            }

            this.onFormatCoupon(filterCouponList(res.data.list));
        },
        // 可用商品
        handleAvailable(obj) {
            this.handleHide();
            if (obj.isApplicableAll === 0) {// 部分可用
                if (obj.applicableProductSerialNumberSet?.length === 1) {
                    return this.$router.push({
                        path: '/product/detail',
                        query: {
                            serialNumber: obj.applicableProductSerialNumberSet[0],
                            skuId: obj.applicableProductSkuIdSet[0]
                        }
                    });
                }
            }

            this.$router.push({
                path: '/product/available',
                query: {
                    serialNumber: obj.applicableProductSerialNumberSet?.join(',') || '',
                    skuList: obj.applicableProductSkuIdSet?.join(',') || '',
                    isApplicableAll: obj.isApplicableAll
                }
            });
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.collect-coupon-model {
    max-height: 85vh;
    background-color: $white;
    border-radius: 40px 40px 0 0;
    width: 100vw;
    box-sizing: border-box;
    padding: 72px 0 $safe-height;

    &:before {
        content: '';
        width: 100%;
        height: 60px;
        background-color: $white;
        top: 60px;
        left: 0;
        position: absolute;
        z-index: 5;
        opacity: 0;
        @include transition(opacity 0.2s);
    }

    &.extend {
        &:before {
            opacity: 1;
        }
    }

    &.tab-bar {
        padding-bottom: $tab-bar-height;

        .coupon-box {
            max-height: calc(85vh - 424px - env(safe-area-inset-bottom));
        }
    }

    .close {
        width: 128px;
        height: 128px;
        position: absolute;
        right: 0;
        top: 0;
        padding: 40px;
        box-sizing: border-box;
        z-index: 6;

        .iconfont {
            font-size: $fs48;
            color: $gray-light;
        }
    }

    .coupon-tips {
        height: 80px;
        padding-left: 40px;

        .title {
            font-size: $fs28;
            font-weight: 600;
        }

        .desc {
            font-size: $fs24;
            font-weight: 300;
            color: rgba($black, 0.7);
            text-align: center;
            padding-left: 40px;
        }
    }

    .final-info {
        padding: 0 40px;
        height: 260px;
        box-sizing: border-box;
        @include gradient-vertical($white-light, $white);
        position: relative;

        .image {
            width: 670px;
            height: 220px;
        }

        .final-panel {
            width: 670px;
            height: 220px;
            position: absolute;
            top: 0;
            left: 40px;

            .module {
                width: 200px;
                height: 162px;
                text-align: center;
                position: relative;
                box-sizing: border-box;
                padding-top: 66px;
            }

            .border {
                width: 167px;
                height: 121px;
                position: absolute;
                left: 12px;
                top: 42px;
            }

            .price {
                color: $black;
                justify-content: center;
            }

            .name {
                font-size: $fs24;
                color: $black;
                padding-top: 8px;
            }

            .line {
                width: 36px;
                height: 6px;
                background-color: $black;
                margin-top: 4px;
            }
        }
    }

    .coupon-box {
        max-height: calc(85vh - 304px - env(safe-area-inset-bottom));
        box-sizing: border-box;

        .final-price {
            padding: 20px 0 40px 40px;

            .price {
                color: $purple;
            }

            .name {
                font-weight: 600;
                font-size: $fs30;
                color: $black;
                padding-top: 10px;
            }
        }

        .coupon-items {
            padding: 0 40px;
        }

        .coupon-item {
            width: 100%;
            border-radius: 32px;
            box-sizing: border-box;
            position: relative;

            .coupon-type {
                position: absolute;
                left: 0;
                top: 0;
                width: 96px;
                height: 40px;
                font-size: $fs16;
                font-weight: 500;
                color: $purple;
                background-color: rgba($purple, 0.1);
                border-radius: 32px 0 32px 0;
                z-index: 4;
            }

            .coupon-selected {
                width: 685px;
                height: 247px;
                position: absolute;
                z-index: 1;
                right: 0;
                top: 0;
                display: none;
            }

            &.open {
                margin-bottom: 24px;
            }

            &.not-more {
                margin-bottom: 50px;
            }

            &.selected {
                .coupon-info {
                    background-color: transparent;
                    box-shadow: none;

                    .state {
                        &.gray {
                            background: none;
                        }
                    }
                }

                .more {
                    .bulge {
                        color: transparent;
                        text-shadow: none;
                    }
                }

                &.not-more {
                    .state {
                        &.gray {
                            background-color: rgba($purple, 0.45);
                        }
                    }

                    .coupon-info {
                        background-color: $white;
                        box-shadow: inset 0 0 0 2px rgba($purple, 0.5);
                    }
                }

                .coupon-selected {
                    display: block;
                }
            }

            .coupon-info {
                height: 196px;
                border-radius: 32px;
                box-shadow: 0 8px 20px 2px rgba(104, 61, 245, 0.06);
                position: relative;
                z-index: 3;
                background-color: $white;

                .state {
                    height: 100%;
                    width: 96px;
                    border-radius: 0 32px 32px 0;
                    background-color: $purple;
                    font-size: $fs28;
                    color: $white;
                    font-weight: bold;
                    box-sizing: border-box;
                    padding: 0 34px;
                    line-height: 40px;

                    &.gray {
                        background-color: rgba($purple, 0.45);
                    }
                }
            }

            .price-info {
                width: 216px;
                color: $orange;
                text-align: center;

                .price {
                    font-size: 64px;
                    line-height: 64px;
                    font-weight: bold;
                    justify-content: center;
                }

                .small {
                    font-size: $fs28;
                    line-height: 32px;
                    font-weight: 500;
                }

                .desc {
                    font-size: $fs20;
                    line-height: 24px;
                    padding-top: 10px;
                }
            }

            .content-info {
                flex: 1;
                padding-left: 40px;

                .title {
                    font-size: $fs28;
                    font-weight: bold;
                    padding-bottom: 12px;
                    color: $black;
                    @extend %ellipsis-basic;
                }

                .use-date {
                    font-size: $fs20;
                    font-weight: 300;
                    color: rgba($black, 0.5);

                    .date {
                        width: 94px;

                        &.right {
                            text-indent: 40px;
                        }
                    }

                    .year {
                        width: 122px;
                    }
                }
            }

            .more {
                margin-top: -2px;
                position: relative;
                z-index: 4;

                .bulge-box {
                    margin-right: 190px;
                    position: relative;
                    width: 100px;

                    &:before {
                        content: '';
                        width: 100px;
                        height: 34px;
                        background-color: $white;
                        position: absolute;
                        top: -36px;
                        left: -10px;
                    }
                }

                .bulge {
                    font-size: 84px;
                    color: $white;
                    line-height: 84px;
                    text-shadow: 0 8px 20px rgba(104, 61, 245, 0.06);
                    margin-top: -26px;
                }

                .arrow {
                    width: 28px;
                    text-align: center;
                    font-size: $fs28;
                    transition: all 0.3s;
                    position: absolute;
                    top: -6px;
                    left: 36px;
                    color: $purple-light;
                    z-index: 2;

                    &.on {
                        @include rotate(180deg);
                    }
                }
            }

            .detail {
                font-size: $fs20;
                color: rgba($black, 0.4);
                font-weight: 300;
                word-break: break-word;
                line-height: 28px;
                padding: 72px 40px 24px;
                margin-top: -84px;
                background-color: $input-disabled;
                border-radius: 0 0 32px 32px;
            }
        }
    }

    .remark-text {
        font-size: $fs20;
        color: $gray-light;
        padding: 34px 40px;

        .link {
            color: $purple;
            font-weight: 400;
        }
    }

    .btn-box {
        padding: 18px 0;

        .sub-btn {
            width: 654px;
            height: 96px;

            .nl-button-text {
                font-size: $fs32;
                font-weight: 600;
            }
        }
    }
}
</style>
