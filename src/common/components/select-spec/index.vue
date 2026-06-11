<template>
    <popup :option="option" v-model="show">
        <div class="select-spec-model" :class="[type, { 'tab-bar': isTabBar }]" v-if="product.skuList">
            <div class="close flex-center" @click="handleHide">
                <i class="iconfont icon-close"></i>
            </div>
            <div class="product-info flex-top">
                <div class="cover">
                    <media-show :level="4" :url="product.skuList[selected].imageUri" class="image" />
                </div>
                <div class="info">
                    <div class="price flex-bottom" v-if="presaleInfo">
                        <price size="large" class="discount" :style="{ color: discountColor }">
                            {{ presaleInfo.afterDiscountPrice }}
                        </price>
                        <span class="state">预售价</span>
                    </div>
                    <div class="price flex-bottom" v-else>
                        <price size="large" class="discount" :style="{ color: discountColor }">
                            {{ product.skuList[selected].discountPrice }}
                        </price>
                        <span class="original oswald-light" v-if="product.skuList[selected].underlinePrice">
                            ￥{{ product.skuList[selected].underlinePrice }}
                        </span>
                    </div>
                    <div class="name">
                        {{ product.title }}
                    </div>
                </div>
            </div>
            <scroll-view :scroll-y="true" class="spec-info">
                <div class="spec-size" v-if="showSpec">
                    <div class="title">型号</div>
                    <div class="flex-left spec-items">
                        <div
                            v-for="(item, i) in product.skuList"
                            :key="item.id"
                            :class="{ selected: selected === i }"
                            @click="handleSelect(i)"
                            class="spec-item"
                        >
                            <lazy-image :src="item.imageUri" class="image" mode="aspectFill" />
                            <div class="name">{{ item.size }}</div>
                        </div>
                    </div>
                </div>
                <div class="num-box flex-between" v-if="type !== 'spec' && type !== 'trade'">
                    <text class="name">数量</text>
                    <counter
                        :disabled="product.salesStatus !== 1 || isBuyCoupon"
                        :max="getMax"
                        v-model="num"
                        size="large"
                    />
                </div>
            </scroll-view>
            <div class="btn-box flex-center" v-if="product.isActivityProduct === 1 && type !== 'spec'">
                <n-button round :disabled="true" class="sub-btn">暂不可售</n-button>
            </div>
            <template v-else-if="product.salesStatus === 1">
                <div class="btn-box-presale flex-center" v-if="presaleInfo">
                    <n-button
                        round
                        class="small-btn"
                        type="plain"
                        @tap="handleBuyNow"
                        v-if="presaleInfo.isSpotsale === 1"
                    >
                        <span>{{ state === 1 ? '立即购买' : state === 2 ? '立即抢购' : '领券购买' }}</span>
                        <span v-if="state === 1">￥{{ product.skuList[selected].discountPrice }}</span>
                        <span v-else>￥{{ finalPrice }}</span>
                    </n-button>
                    <n-button
                        round
                        :class="{ 'small-btn': presaleInfo.isSpotsale === 1 }"
                        class="sub-btn"
                        @tap="handlePresaleBuy"
                    >
                        支付定金 ￥{{ presaleInfo.depositPrice }}
                    </n-button>
                </div>
                <span class="btn-box flex-center" v-else-if="type === 'trade'">
                    <n-button round class="sub-btn" @tap="handleBuyNow" id="report-YJHX2022091006" report-id="report-YJHX2022091006">立即换新</n-button>
                </span>
                <span class="btn-box flex-center" v-else-if="type === 'buy'">
                    <n-button round class="sub-btn" @tap="handleBuyNow">
                        {{ isReceiveCoupon ? '领券购买' : '立即购买' }}
                    </n-button>
                </span>
                <span class="btn-box flex-center" v-else-if="type === 'cart'">
                    <n-button round class="sub-btn" @tap="handleCart">加入购物车</n-button>
                </span>
                <span class="btn-shop-box flex-center" v-else-if="type === 'shop'">
                    <n-button round type="plain" class="sub-btn" @tap="handleCart">加入购物车</n-button>
                    <n-button round class="sub-btn" @tap="handleBuyNow">
                        {{ isReceiveCoupon ? '领券购买' : '立即购买' }}
                    </n-button>
                </span>
                <span class="btn-box flex-center" v-else-if="type === 'product-banner'">
                    <n-button round class="sub-btn" @tap="handleBuyOne" :style="btnStyle">立即购买</n-button>
                </span>
            </template>
            <div class="btn-box flex-center" v-else-if="type !== 'spec'">
                <n-button round class="sub-btn" :disabled="true">已下架</n-button>
            </div>
        </div>
    </popup>
</template>

<script>
import counter from 'common/components/counter';
import scrollView from 'common/components/scroll-view';
import { isObject } from 'lib/util/dataType';
import clone from 'lib/json/clone';
import { specToText } from 'common/util/spec';
import price from 'common/components/price';
import mediaShow from 'common/components/media-show';
import { toLogin } from 'common/util';
import { EVENTS, PRODUCT_TYPE_COUPON } from 'common/util/constant';
import { COUPON_TAKE } from 'common/api/fetch';

/**********
 * 通过定义data-spec来触发
 */

export default {
    name: 'select-spec',
    props: {
        // 是否导航页
        isTabBar: {
            type: Boolean,
            default: true
        },
        finalPrice: {
            type: Number,
            default: 0
        },
        //  1 默认普通商品，2 限时折扣商品，3 优惠券商品，4 叠加
        state: {
            type: Number,
            default: 1
        },
        // 未领取的券
        unCouponList: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    emits: ['select', 'cart', 'buy'],
    data() {
        return {
            show: false,
            selected: 0,
            num: 1,
            product: {},
            type: 'spec', // spec|cart|buy|shop
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
            btnStyle: {}, // 购买按钮样式
            discountColor: '' // 价格颜色
        };
    },
    components: {
        mediaShow,
        scrollView,
        counter,
        price
    },
    computed: {
        // 是否显示规格
        showSpec() {
            if (this.product.skuList.length > 1) {
                return true;
            } else if (this.product.skuList.length === 1) {
                return !!this.product.skuList[0].size;
            }
            return false;
        },
        // 是否领券购买
        isReceiveCoupon() {
            return this.unCouponList?.length > 0;
        },
        // 预售信息
        presaleInfo() {
            return this.product?.skuList[this.selected]?.presaleInfo;
        },
        // 最大数量值
        getMax() {
            // 专享价，最多一台
            if (this.product.referral) {
                return 1;
            }

            const stockNum = this.product?.skuList[this.selected]?.stockNum;
            const stock = this.product?.stock;
            return Math.min(this.product?.salesLimitNum || 99, Math.min(stockNum || stock || 99, 99));
        },
        // 是否是购买优惠券
        isBuyCoupon() {
            return this.product?.type === PRODUCT_TYPE_COUPON;
        }
    },
    watch: {
        num(v) {
            // 购物选择模式
            if (this.type === 'shop') {
                this.$emit('select', {
                    num: v,
                    selected: this.selected
                });
            }
        }
    },
    methods: {
        onShow(product, type, btnStyle, discountColor) {
            if (isObject(product) && product.skuList?.length) {
                this.product = clone(product);
                this.type = type;
                this.selected = this.product.selected || 0;
                this.product.skuList.forEach((item, i) => {
                    item.size = item.size || specToText(item);
                    if (this.product.skuId === item.id) {
                        this.selected = i;
                    }
                    delete item.skuSpecList;
                });

                this.num = this.product.num || 1;
                this.$nextTick(() => {
                    this.show = true;
                });
                if (btnStyle) {
                    this.btnStyle = btnStyle;
                }
                if (discountColor) {
                    this.discountColor = discountColor;
                }
            }
        },
        async handleSelect(i) {
            // 更改规格
            if (this.type === 'spec') {
                // 如果规格没变，直接关闭
                if (i === this.selected) {
                    return this.handleHide();
                }

                const oldSelect = this.selected;
                this.selected = i;

                const obj = {
                    productSerialNumber: this.product.productSerialNumber,
                    type: 2,
                    skuId: this.product.skuList[i].id,
                    deleteId: this.product.id,
                    num: this.product.num
                };

                // 如果当前规格已存在,则直接累计
                const cur = this.$store.state.shoppingCart.shopList.find((r) => r.skuId === obj.skuId);
                if (cur) {
                    obj.num += cur.num;
                }

                const result = await this.$store.dispatch('PUSH_SHOP_CART', obj);
                // 更改成功
                if (result) {
                    this.$store.commit('CHANGE_SHOP_CART', {
                        skuId: this.product.skuId,
                        result
                    });

                    this.handleHide();
                } else {
                    this.selected = oldSelect;
                }
            } else if (this.type === 'shop') {
                // 如果规格没变，直接关闭
                if (i === this.selected) {
                    return this.handleHide();
                }

                this.selected = i;
            } else {
                this.selected = i;
            }

            this.$emit('select', {
                num: this.num,
                selected: i
            });
        },
        handleHide() {
            this.show = false;
        },
        // 加入购物车
        async handleCart() {
            if (!this.$store.state.token) {
                // 先去登录
                return toLogin();
            }
            const data = {
                productSerialNumber: this.product.serialNumber,
                type: 1,
                skuId: this.product.skuList[this.selected].id,
                num: this.num
            };

            const bool = await this.$store.dispatch('PUSH_SHOP_CART', data);

            if (bool) {
                this.$emit('cart', data);
                this.handleHide();
            }
        },
        // 预售下单
        handlePresaleBuy({ loading }) {
            if (this.num > 1) {
                return this.$layer.toast('每笔预售订单最多可购买一件');
            }
            const product = clone(this.product);
            product.skuId = this.product?.skuList[this.selected]?.id;
            product.num = 1;
            product.presaleInfo = this.presaleInfo;
            this.$emit('buy', {
                productList: [product],
                loading,
                hide: this.handleHide
            });
        },
        // 立即购买
        async handleBuyNow({ loading }) {
            if (!this.$store.state.token) {
                // 先去登录
                return toLogin();
            }
            if (this.type === 'referral') {
                const query = this.$route.query;
                const referralId = query?.referralId;
                const oldUserUuid = query?.oldUserUuid;
                if (this.$store?.state?.userInfo?.uuid === oldUserUuid) {
                    this.$layer.toast('此商品仅限被推荐用户购买');
                    // 回退
                    return this.$router.replace(`/activities/referral-new?referralId=${referralId}`);
                }
            }

            if (this.isReceiveCoupon) {
                // 表示未领取
                await COUPON_TAKE({
                    list: this.unCouponList.map((item) => item.serialNumber),
                    page: 1,
                    source: this.$store.state.deviceType
                });
                this.$event.emit(EVENTS.PRODUCT_COUPON_TAKE, this.unCouponList);
            }

            this.product.skuId = this.product.skuList[this.selected]?.id;
            this.product.num = this.num;
            this.$emit('buy', {
                productList: [this.product],
                loading,
                hide: this.handleHide
            });
        },
        // 购买
        async handleBuyOne({ loading }) {
            if (!this.$store.state.token) {
                // 先去登录
                return toLogin();
            }
            if (this.type === 'referral') {
                const query = this.$route.query;
                const referralId = query?.referralId;
                const oldUserUuid = query?.oldUserUuid;
                if (this.$store?.state?.userInfo?.uuid === oldUserUuid) {
                    this.$layer.toast('此商品仅限被推荐用户购买');
                    // 回退
                    return this.$router.replace(`/activities/referral-new?referralId=${referralId}`);
                }
            }

            if (this.isReceiveCoupon) {
                // 表示未领取
                await COUPON_TAKE({
                    list: this.unCouponList.map((item) => item.serialNumber),
                    page: 1,
                    source: this.$store.state.deviceType
                });
                this.$event.emit(EVENTS.PRODUCT_COUPON_TAKE, this.unCouponList);
            }

            this.product.skuId = this.product.skuList[this.selected]?.id;
            this.product.num = this.num;
            
            const data = {
                productSerialNumber: this.product.serialNumber,
                type: 1,
                skuId: this.product.skuList[this.selected].id,
                num: this.num
            };
            this.$emit('buyBanner', {
                productList: [this.product],
                data,
                loading,
                hide: this.handleHide
            });
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.select-spec-model {
    max-height: 85vh;
    padding-bottom: $safe-height;
    background-color: $white;
    border-radius: 40px 40px 0 0;
    box-sizing: border-box;
    width: 100vw;

    &.tab-bar {
        padding-bottom: $tab-bar-height;

        &.shop,
        &.cart,
        &.buy {
            .spec-info {
                max-height: calc(85vh - 540px - env(safe-area-inset-bottom));
            }
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

        .iconfont {
            font-size: $fs48;
            color: $gray-light;
        }
    }

    .product-info {
        padding: 44px 40px 40px;

        .cover {
            width: 200px;
            height: 200px;
            background-color: $input-disabled;
        }

        .image {
            width: 100%;
            height: 100%;
        }

        .info {
            flex: 1;
            padding-left: 24px;
        }

        .price {
            padding: 18px 0 36px;
            min-height: 48px;

            .discount {
                color: $purple;
            }

            .original {
                font-size: $fs24;
                text-decoration: line-through;
                color: rgba($black, 0.4);
                padding-left: 8px;
            }

            .state {
                width: 96px;
                height: 36px;
                line-height: 36px;
                text-align: center;
                border-radius: 8px;
                font-size: $fs20;
                color: $purple;
                background-color: rgba($purple, 0.2);
                font-weight: 400;
                margin-left: 20px;
            }
        }

        .name {
            font-size: $fs28;
            font-weight: 500;
            min-height: 80px;
            line-height: 40px;
            @include line-clamp(2);
            max-width: 446px;
            color: $black;
        }
    }

    .spec-info {
        max-height: calc(85vh - 420px - env(safe-area-inset-bottom));
        box-sizing: border-box;
    }

    .spec-size {
        padding: 0 30px;

        .title {
            font-size: $fs28;
            line-height: 76px;
            color: $black;
            font-weight: bold;
            padding-left: 10px;
        }

        .spec-items {
            flex-wrap: wrap;
        }

        .spec-item {
            width: 210px;
            height: 266px;
            background-color: $input-disabled;
            margin: 0 10px 24px;

            .image {
                width: 100%;
                height: 210px;
            }

            &.selected {
                position: relative;

                &:before {
                    content: '';
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    left: 0;
                    top: 0;
                    background-color: rgba($black, 0.2);
                }
            }

            .name {
                line-height: 42px;
                height: 48px;
                color: $black;
                font-size: $fs24;
                text-align: center;
                @extend %ellipsis-basic;
            }
        }
    }

    .num-box {
        line-height: 104px;
        padding: 16px 40px 58px;

        .name {
            font-size: $fs28;
            color: $black;
            font-weight: bold;
        }
    }

    .btn-box,
    .btn-box-presale {
        height: 132px;
        padding: 0 40px;

        .sub-btn {
            width: 670px;
            height: 96px;

            .nl-button-text {
                font-size: $fs32;
                font-weight: 600;
            }
        }
    }

    .btn-box-presale {
        padding: 0;

        .small-btn {
            width: 320px;
            height: 76px;
            margin: 0 15px;

            .nl-button-text {
                font-size: $fs28;
            }
        }
    }

    .btn-shop-box {
        height: 132px;
        padding: 0 40px;

        .sub-btn {
            width: 320px;
            height: 76px;
            margin: 0 15px;
        }
    }
}
</style>
