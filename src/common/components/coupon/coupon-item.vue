<template>
    <div
        class="m-divs-member-coupon-item"
        :class="{ 'mt-20': !index, [extra.style]: true, useed: cantUse, invalid: !inAbleTime && !isNotStart }"
        @click="tapHandler"
    >
        <div class="coupon-box">
            <div class="info-wrap" :class="{ 'right-padding': !!extra.toUse }">
                <div class="c-left">
                    <div class="ta-c oswald-bold">
                        <span class="fz-28 oswald-medium">￥</span>
                        <span class="amount fw-700">{{ source.discountNum }}</span>
                    </div>
                    <div class="ta-c fz-24">
                        <template v-if="source.thresholdPrice > 0">满{{ source.thresholdPrice }}元可用</template>
                        <template v-else>无门槛</template>
                    </div>
                </div>
                <div class="c-right">
                    <template v-if="time.type === 'time'">
                        <div class="fz-28 fw-700 mb-20 pt-10">{{ source.name }}</div>
                        <div class="flex-row flex-as fz-20 place-color lh-32 flex-nowrap">
                            <div class="label-box flex-col">
                                <span>有效期:</span>
                                <span>
                                    <span class="white-color">截止</span>
                                    至
                                </span>
                            </div>
                            <div class="time-box flex-w0 flex-col flex-as">
                                <span>{{ time.start1 }}</span>
                                <span>{{ time.end1 }}</span>
                            </div>
                            <div class="time-box short flex-w0 flex-col flex-as">
                                <span>{{ time.start2 }}</span>
                                <span>{{ time.end2 }}</span>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="fz-28 fw-700 mb-20 pt-20">{{ source.name }}</div>
                        <div class="fz-24 place-color lh-32">{{ time.text }}</div>
                    </template>
                </div>
            </div>
            <!--        去使用        -->
            <div
                class="to-use flex-col flex-jc flex-ac"
                v-if="!!extra.toUse && ((!cantUse && inAbleTime) || cantUse)"
                @click.stop="toUse"
            >
                <div
                    class="to-use-text fw-500 fz-28 white-color ta-c"
                    v-for="(item, index) in toUseBtnText"
                    :key="index"
                >
                    {{ item }}
                </div>
            </div>
            <!--        去看看        -->
            <div
                class="to-use flex-col flex-jc flex-ac"
                v-if="isNotStart"
                @click.stop="toUse"
            >
                <div
                    class="to-use-text fw-500 fz-28 white-color ta-c"
                    v-for="(item, index) in toUseBtnText"
                    :key="index"
                >
                    {{ item }}
                </div>
            </div>
            <div class="bulge-wrap" @click.stop="toggle" v-if="!!source.instruction && showInstruction">
                <span class="icon-box iconfont icon-bulge-solid"/>
                <span class="coupon-arrow-down fz-28" :class="{ turn: collapse }"/>
            </div>
            <div class="active-bg" :class="{ nobulge: !source.instruction }"/>
            <div class="sign-type primary-color flex-row flex-ac flex-jc" v-if="showSignType">
                {{ typeName }}
            </div>
        </div>
        <div class="c-desc" v-if="collapse && showInstruction" @click.stop>
            <span class="fz-24 place-color">{{ source.instruction }}</span>
        </div>
    </div>
</template>
<script>
import {COUPON_SUBMIT_TYPE, COUPON_VALIDITYTIME_TYPE} from 'common/util/constant';
import calendar from 'lib/util/calendar';
import {toPage} from 'common/util';

export default {
    name: 'MemberCouponItem',
    props: {
        source: {
            type: Object,
            default() {
                return {};
            }
        },
        extra: Object,
        index: Number,
        showSignType: {
            type: Boolean,
            default: true
        },
        showInstruction: {
            type: Boolean,
            default: true
        },
        couponBtnText: String
    },
    data() {
        return {
            collapse: false
        };
    },
    computed: {
        // 显示时间
        time() {
            const isNormal = this.source.validityTimeType === COUPON_VALIDITYTIME_TYPE.normal;
            if (isNormal) {
                const start = this.source.startTime || '';
                const end = this.source.endTime || '';
                return {
                    type: 'time',
                    start1: start.slice(0, 10),
                    start2: start.slice(11),
                    end1: end.slice(0, 10),
                    end2: end.slice(11)
                };
            } else {
                const start = this.source.takeTime;
                const end = calendar.getOffsetDate(start, this.source.validityDays);
                return {
                    type: 'time',
                    start1: calendar.format(start, 'yyyy-MM-dd'),
                    start2: calendar.format(start, 'HH:mm:ss'),
                    end1: calendar.format(end, 'yyyy-MM-dd'),
                    end2: calendar.format(end, 'HH:mm:ss')
                };
            }
        },
        // 券未开始
        isNotStart() {
            const currentTime = this.source.currentTimeStamp;
            if (this.source.validityTimeType === COUPON_VALIDITYTIME_TYPE.normal) {
                const startTime = calendar.now(this.source.startTime);
                return currentTime < startTime;
            }
            return false
        },
        // 是否在有效期内
        inAbleTime() {
            const currentTime = this.source.currentTimeStamp;
            const takeTime = this.source.takeTime;
            if (this.source.validityTimeType === COUPON_VALIDITYTIME_TYPE.after) {
                const validityTimeEnd = calendar.getOffsetDate(takeTime, this.source.validityDays);
                return validityTimeEnd >= currentTime;
            } else {
                const startTime = calendar.now(this.source.startTime);
                const endTime = calendar.now(this.source.endTime);
                return currentTime >= startTime && currentTime <= endTime;
            }
        },
        // 类型名称
        typeName() {
            if (this.source.type === COUPON_SUBMIT_TYPE.voucher) {
                return '代金券';
            } else {
                return '满减券';
            }
        },
        toUseBtnText() {
            const text = this.couponBtnText || (this.cantUse ? '已使用' : this.inAbleTime ? '去使用' : this.isNotStart ? '去看看' : '已过期');
            return text.split('');
        },
        cantUse() {
            return this.source?.useStatus === 1 || this.extra?.cantUse;
        }
    },
    methods: {
        /// 变更折叠面板状态
        toggle() {
            this.collapse = !this.collapse;
        },
        /// 点击事件
        tapHandler() {
            if (this.cantUse || !this.inAbleTime) {
                return;
            }
            this.toUse();
        },
        // 去使用
        toUse() {
            if (this.cantUse || (!this.inAbleTime && !this.isNotStart)) {
                return;
            }
            const obj = this.source || {};
            const list = obj.applicableProductSerialNumberSet || [];
            if (list.length === 1) {
                toPage({
                    path: '/product/detail',
                    query: {serialNumber: list[0]}
                });
            } else {
                toPage({
                    path: '/product/available',
                    query: {
                        serialNumber: list?.join(',') || '',
                        skuList: obj.applicableProductSkuIdSet?.join(',') || '',
                        isApplicableAll: obj.isApplicableAll
                    }
                });
            }
        }
    }
};
</script>
<style lang="scss" scoped>
@import 'common/style/static';

$shadow1: 0px 4px 10px rgba(104, 61, 245, 0.06);
$desc-color: #f5f5f7;

.m-divs-member-coupon-item {
    margin-bottom: 40px;

    &.useed,
    &.invalid {
        opacity: 0.6;
    }

    &.invalid,
    &.used {
        .coupon-box:after {
            content: '';
            position: absolute;
            bottom: 16px;
            right: 16px;
            width: 84px;
            height: 84px;
            background-image: url('https://narwal-mall-prod-public.obs.cn-south-1.myhuaweicloud.com:443/78670a96126541379b61d6d48bd68a0734.png');
            background-size: 100% 100%;
            z-index: 12;
        }
    }

    &.used {
        .coupon-box:after {
            background-image: url('https://mallcdn.narwaltech.com/ff1862bcab40aed704c70fe2da8bf0e5153.png?size=84-84');
            background-size: 100% 100%;
        }
    }

    .coupon-box {
        position: relative;
        box-sizing: border-box;
        height: 196px;
        border-radius: 32px;
        border: 2px solid $white;
        background-color: $white;
        box-shadow: $shadow1;
        z-index: 10;

        .info-wrap {
            position: relative;
            padding: 25px 0;
            display: flex;
            z-index: 10;

            .c-left {
                width: 256px;
                color: $orange;

                .amount {
                    font-size: 64px;
                    line-height: 96px;
                }
            }

            .c-right {
                flex: 1;
            }

            &.right-padding {
                padding-right: 98px;
            }
        }

        .to-use {
            position: absolute;
            top: 0;
            right: 0;
            width: 98px;
            height: 100%;
            border-radius: 0 32px 32px 0;
            background-color: $purple;
            z-index: 12;

            .to-use-text {
                height: 40px;
            }
        }

        .bulge-wrap {
            position: absolute;
            bottom: -52px;
            right: 190px;
            width: 100px;
            height: 52px;
            overflow: hidden;
            z-index: 10;

            .icon-box {
                position: absolute;
                top: -28px;
                left: 8px;
                width: 84px;
                line-height: 84px;
                color: $white;
                font-size: 84px;
                text-shadow: $shadow1;
                z-index: 8;
            }

            .coupon-arrow-down {
                position: absolute;
                top: -6px;
                left: 36px;
                width: 28px;
                height: 28px;
                transition: transform 0.3s;
                background-image: url('https://image-www.narwal.com/applet/images/common/icon-arrow.png');
                background-size: 100% 100%;
                z-index: 10;

                &.turn {
                    transform: rotate(180deg);
                }
            }
        }

        .sign-type {
            position: absolute;
            top: 0;
            left: 0;
            width: 96px;
            height: 40px;
            background-color: rgba($purple, 0.1);
            border-bottom-right-radius: 32px;
            border-top-left-radius: 32px;
            font-size: 16px;
        }
    }

    .active-bg {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 670px;
        height: 246px;
        background-image: url('https://narwal-mall-prod-public.obs.cn-south-1.myhuaweicloud.com:443/b9e6b9505f0e4d55a79a6065d10eb2c434.png');
        background-size: 100% 100%;
        z-index: 5;

        &.nobulge {
            width: 670px;
            height: 196px;
            background-image: none;
            border: 2px solid $purple;
            border-radius: 32px;
        }
    }

    &.active {
        .active-bg {
            display: block;
        }

        .bulge-wrap .icon-box {
            display: none;
        }
    }

    .c-desc {
        position: relative;
        padding: 34px 40px 24px;
        border-radius: 0 0 32px 32px;
        background-color: $desc-color;
        z-index: 5;
        word-break: break-all;

        &:before {
            content: '';
            position: absolute;
            top: -50px;
            left: 0;
            width: 100%;
            height: 60px;
            background-color: $desc-color;
        }
    }

    .label-box {
        width: 90px;
    }

    .time-box {
        width: 140px;

        &.short {
            width: 100px;
        }
    }
}
</style>
