<template>
    <div v-if="list.length > 0">
        <div class="product-box-items flex-center">
            <div
                class="list flex-left"
                v-for="item in list"
                @click="handleProductInfo(item)"
                :id="'report_' + item.serialNumber"
                :key="item.serialNumber">
                <div class="cover">
                    <media-show
                        :level="3"
                        mode="aspectFit"
                        class="img"
                        :url="item.imageUrl"/>
                </div>
                <div class="info">
                    <div class="name">{{ item.fullName }}</div>
                    <div class="price-box flex-bottom">
                        <span class="text" v-if="item.state === 5">预售价</span>
                        <span class="text" v-else-if="item.state > 1">
                            {{ item.state === 2 ? '到手价' : '券后价' }}
                        </span>
                        <div class="price-info flex-bottom">
                            <price>{{ item.price }}</price>
                            <div
                                class="original oswald-light"
                                v-if="item.state === 1 && item.underlinePrice">
                                <text class="sub">￥</text>
                                {{ item.underlinePrice }}
                            </div>
                        </div>
                        <text class="text" v-if="item.state === 3">起</text>
                    </div>
                </div>
                <div class="buy-now" v-if="item.state === 5">
                    <n-button size="small" round>去抢购</n-button>
                </div>
                <div
                    v-else
                    @click.stop.prevent="handleAddCart(item)"
                    class="shopping-cart flex-right">
                    <i class="iconfont icon-shopping-cart"></i>
                </div>
            </div>
        </div>
        <select-spec @cart="handleCartSuc" :is-tab-bar="false" ref="spec"/>
        <div class="product-footer-bar flex-between">
            <div class="cart-count flex-center" @click="handleToCart">
                <i class="iconfont icon-shopping-cart"></i>
                <span class="name">购物车</span>
                <span class="num oswald-medium">{{ cartCount }}</span>
            </div>
            <n-button @tap="handleToCart" round>去购物车</n-button>
        </div>
    </div>
    <div v-else>
        <slot/>
    </div>
</template>

<script>
import mediaShow from 'common/components/media-show';
import price from 'common/components/price';
import selectSpec from 'common/components/select-spec';

export default {
    name: 'product-items',
    props: {
        list: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    components: {
        mediaShow,
        price,
        selectSpec
    },
    data() {
        return {
            cartCount: 0,
            skuList: []
        };
    },
    mounted() {
        this.loadShoppingCartNum();
    },
    methods: {
        // 加入购物车成功
        handleCartSuc(obj) {
            this.cartCount += obj.num;
            this.skuList.push(obj.skuId);
        },
        // 加入购物车
        handleAddCart(item) {
            this.$refs.spec.onShow(item, 'cart');
        },
        async loadShoppingCartNum() {
            if (!this.$store.state.userInfo) {
                return false;
            }
            const [res, err] = await this.$http.awaitTo(
                this.$http.get(this.$api.totalProductNum)
            );

            if (err) {
                return false;
            }

            this.cartCount = res.data;
        },
        // 跳转详情
        handleProductInfo(obj) {
            this.$router.push({
                path: '/product/detail',
                query: {
                    serialNumber: obj.serialNumber,
                    skuId: obj.skuList[0]?.id
                }
            });
        },
        // 去购物车
        handleToCart() {
            this.$store.state.shoppingCart.checkSkuList = this.skuList;
            this.$router.push('/shopping-cart');
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.product-box-items {
    flex-direction: column;

    .list {
        background-color: $white;
        border-radius: 12px;
        width: 668px;
        height: 220px;
        padding: 30px 40px 30px 20px;
        box-sizing: border-box;
        margin-bottom: 20px;
        position: relative;

        .shopping-cart {
            position: absolute;
            right: 0;
            bottom: 0;
            padding: 0 40px 42px 40px;

            .iconfont {
                font-size: $fs48;
            }
        }

        .buy-now {
            position: absolute;
            right: 40px;
            bottom: 40px;

            .nl-button {
                height: 56px;
                width: 144px;

                .nl-button-text {
                    font-size: $fs20;
                }
            }
        }

        .cover {
            width: 160px;
            height: 160px;
            box-sizing: border-box;
        }

        .img {
            width: 100%;
            height: 100%;
        }

        .info {
            padding-left: 20px;
        }

        .name {
            font-size: $fs24;
            color: $black;
            font-weight: 400;
            @include line-clamp(2);
            line-height: 36px;
            max-height: 72px;
            word-break: break-word;
            max-width: 428px;
        }

        .price-box {
            color: $black;
            padding-top: 18px;

            .text {
                font-size: $fs24;
                line-height: 26px;
            }
        }

        .price-info {
            color: $black;
            padding: 0 12px;

            .original {
                font-size: $fs20;
                line-height: 22px;
                font-weight: 300;
                text-decoration: line-through;
                color: rgba($black, 0.4);
                padding-left: 12px;
                transform: translateY(2px);

                .sub {
                    font-size: $fs16;
                    padding-right: 4px;
                    text-decoration: none;
                    display: inline-block;
                }
            }
        }
    }
}

.product-footer-bar {
    position: fixed;
    min-height: 132px;
    width: 100vw;
    bottom: 0;
    background-color: $white;
    left: 0;
    border-radius: 30px 30px 0 0;
    box-shadow: 0px -16px 16px 2px rgba($black, 0.02);
    z-index: 9;
    padding-bottom: $safe-height;
    box-sizing: content-box;

    .nl-button {
        margin-right: 40px;
        width: 222px;
        height: 76px;
    }

    .cart-count {
        margin-left: 56px;
        position: relative;
        flex-direction: column;

        .iconfont {
            color: $black;
            font-size: $fs48;
        }

        .name {
            line-height: 28px;
            font-size: $fs20;
            color: $black;
        }

        .num {
            font-size: $fs20;
            line-height: 34px;
            padding: 0 12px;
            border-radius: 32px;
            position: absolute;
            right: -12px;
            top: -12px;
            color: $white;
            background-color: $red;
        }

    }
}
</style>
