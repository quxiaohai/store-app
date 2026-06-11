<template>
    <popup v-model="show" :option="option" @hide="handleHide">
        <div :class="[{ 'tab-bar': isTabBar, extend: scrollTop > 20 }]" class="coupon-sheet-model">
            <div class="close flex-center" @click="handleHide">
                <i class="iconfont icon-close"></i>
            </div>
            <div class="main-title"> 组合券包含以下优惠券</div>
            <scroll-view
                :scroll-y="true"
                :scroll-top="scrollPosTop"
                @scroll="handleScroll"
                class="coupon-box"
            >
                <div class="coupon-items">
                    <div
                        class="coupon-item"
                        :class="{ selected: selected === item.key, open: item.more, 'not-more': !item.instruction }"
                        v-for="item in couponList"
                        :key="item.key"
                        :id="'coupon_' + item.key"
                    >
                        <div class="coupon-type flex-center">{{ item.type === 3 ? '代金券' : '满减券' }}</div>
                        <div class="coupon-info flex-left">
                            <div class="price-info">
                                <div class="price oswald-bold flex-bottom">
                                    <span class="small oswald-medium">￥</span>
                                    {{ item.discountNum }}
                                </div>
                                <div class="desc">满{{ item.thresholdPrice }}元可用</div>
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
                    </div>
                </div>
            </scroll-view>
            <div class="btn-box flex-center">
                <n-button round class="sub-btn" @tap="handleHide">{{ btnText || '确认' }}</n-button>
            </div>
        </div>
    </popup>
</template>

<script>
import price from 'common/components/price';
import calendar from 'lib/util/calendar';
import scrollView from 'common/components/scroll-view';

export default {
    name: 'coupon-sheet',
    props: {
        couponList: {
            type: Array,
            default() {
                return [];
            }
        },
        // 按钮文案，只对cart和buy有效
        btnText: String,
        modelValue: {
            type: Boolean,
            default: false
        },
        // 是否导航页
        isTabBar: {
            type: Boolean,
            default: true
        }
    },
    emits: ['update:modelValue'],
    data() {
        return {
            show: this.modelValue,
            selected: null,
            scrollTop: 0,
            scrollPosTop: 0,
            option: {
                stop: true,
                pullDownHide: true,
                autoHide: true,
                zIndex: 98,
                overlay: {
                    zIndex: 97
                },
                animate: {
                    name: 'bottom'
                },
                left: '0px',
                bottom: '0px'
            },
            userCouponList: []
        };
    },
    components: {
        scrollView,
        price
    },
    watch: {
        modelValue(v) {
            this.show = v;
        },
        show(v) {
            this.$emit('update:modelValue', v);
        },
        couponList() {
            this.initCouponList();
        }
    },
    mounted() {
        this.initCouponList();
    },
    methods: {
        formatDate(v) {
            return calendar.format(v, 'yyyy.MM.dd');
        },
        formatHour(v) {
            return calendar.format(v, 'HH:mm:ss');
        },
        // 滚动
        handleScroll(ev) {
            this.scrollTop = ev.scrollTop;
        },
        initCouponList() {
            this.couponList.forEach(item => {
                item.more = false;
            });
        },
        // 显示更多
        handleMore(obj) {
            obj.more = !obj.more;
            this.$nextTick(() => {
                if (obj.more) {
                    this.scrollPosTop = this.scrollTop + 120;
                } else {
                    this.scrollPosTop = this.scrollTop;
                }
            });
        },
        handleHide() {
            this.$emit('update:modelValue', false);
            this.couponList.forEach(item => {
                item.more = false;
            });
        }
    }
};
</script>

<style lang="scss">
@import 'common/style/static';

.coupon-sheet-model {
    max-height: 85vh;
    background-color: $white;
    border-radius: 40px 40px 0 0;
    width: 100vw;
    box-sizing: border-box;
    padding: 100px 0 $safe-height;

    &:before {
        content: '';
        width: 100%;
        height: 0;
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

    .main-title {
        padding: 0px 40px 32px;
        font-weight: 600;
        font-size: 32px;
        line-height: 32px;
        color: $black;
        background-color: $white;
    }

    .coupon-box {
        max-height: calc(85vh - 304px - env(safe-area-inset-bottom));
        box-sizing: border-box;

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
                        width: 100px;

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
