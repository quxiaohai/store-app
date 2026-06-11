<template>
    <div
        class="m-app-skeleton"
        v-if="skeletonShow && !$store.state.isServerRender"
        :class="{white: !!page, hidden: !show}">
        <div class="detail-skeleton" v-if="page === 'detail'">
            <div class="banner">
                <div class="cover flex-center">
                    <loading class="loading-box" :visible="true"/>
                </div>
                <div class="info flex-left">
                    <div class="price"></div>
                </div>
            </div>
            <div class="title">
                <div class="full w-c1 _skeleton"></div>
                <div class="short w-c1 _skeleton"></div>
            </div>
            <div class="desc w-c1 _skeleton"></div>
            <div class="items flex-left">
                <div class="name w-c1 _skeleton"></div>
                <div class="item flex-center">
                    <img alt="" class="img" :src="defaultUrl"/>
                </div>
                <div class="item flex-center">
                    <img alt="" class="img" :src="defaultUrl"/>
                </div>
                <div class="item flex-center">
                    <img alt="" class="img" :src="defaultUrl"/>
                </div>
                <div class="item flex-center">
                    <img alt="" class="img" :src="defaultUrl"/>
                </div>
            </div>
            <div class="select flex-between">
                <div class="name w-c1 _skeleton"></div>
                <div class="text w-c1 _skeleton"></div>
            </div>
            <div class="service flex-left">
                <div class="text1 w-c1 _skeleton"></div>
                <div class="text1 w-c1 _skeleton"></div>
                <div class="text1 w-c1 _skeleton"></div>
                <div class="text1 w-c1 _skeleton"></div>
                <div class="text1 w-c1 _skeleton"></div>
            </div>
            <div class="remark flex-left">
                <div class="text1 w-c1 _skeleton"></div>
                <div class="text1 w-c1 _skeleton"></div>
            </div>
            <div class="buy-box flex-between">
                <div class="flex-left left">
                    <div class="icon-box flex-center box-1">
                        <div class="icon w-c1 _skeleton"></div>
                        <div class="name w-c1 _skeleton"></div>
                    </div>
                    <div class="icon-box flex-center box-2">
                        <div class="icon w-c1 _skeleton"></div>
                        <div class="name w-c1 _skeleton"></div>
                    </div>
                </div>
                <div class="flex-right right">
                    <div class="btn btn-1"></div>
                    <div class="btn btn-2"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import loading from 'common/components/loading';

export default {
    name: 'skeleton',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        page: {// 页面
            type: String,
            default: 'detail'
        }
    },
    components: {
        loading
    },
    data() {
        return {
            defaultUrl: 'https://image-www.narwal.com/applet/images/common/default.png',
            skeletonShow: this.show
        };
    },
    watch: {
        show(v) {
            if (v) {
                this.skeletonShow = true;
            } else {
                setTimeout(() => {
                    this.skeletonShow = false;
                }, 100);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.m-app-skeleton {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 999;
    top: 0;
    left: 0;
    box-sizing: border-box;

    .w-c1 {
        background-color: #f2f2f2;
    }

    &.white {
        background-color: $white;
    }

    opacity: 1;
    @include transition(0.1s);

    &.hidden {
        opacity: 0;
    }


    // 详情
    .detail-skeleton {
        .banner {
            .cover {
                background-color: $input-disabled;
                height: 840px;
                width: 100%;
                position: relative;

                .loading-box {
                    position: relative;
                    width: 100%;
                    height: 840px;
                    z-index: 2;
                }

                &:before {
                    content: "";
                    width: 80px;
                    height: 36px;
                    background-color: rgba($black, 0.2);
                    border-radius: 36px;
                    position: absolute;
                    right: 40px;
                    bottom: 32px;
                    z-index: 3;
                }
            }

            .info {
                padding: 76px 0 70px 40px;

                .price {
                    height: 40px;
                    width: 196px;
                    border-radius: 4px;
                    background-color: rgba($purple, 0.1);
                }
            }
        }

        .title {
            padding: 0 40px;
            box-sizing: content-box;

            .full {
                width: 100%;
                height: 40px;
                border-radius: 4px;
            }

            .short {
                width: 506px;
                height: 28px;
                border-radius: 4px;
                margin-top: 26px;
            }
        }


        .desc {
            width: 268px;
            height: 56px;
            border-radius: 4px;
            margin: 46px 0 0 40px;
        }

        .items {
            padding: 40px 0 18px 40px;

            .name {
                width: 56px;
                height: 28px;
                margin-right: 58px;
                border-radius: 4px;
            }

            .item {
                width: 100px;
                height: 100px;
                margin-right: 12px;
                background-color: $input-disabled;
            }

            .img {
                width: 100px;
            }
        }

        .select {
            padding: 0 60px 0 156px;

            .name {
                width: 190px;
                height: 28px;
                border-radius: 4px;
            }

            .text {
                width: 66px;
                height: 28px;
                border-radius: 4px;

            }
        }

        .service {
            padding: 86px 0 0 40px;

            .text1 {
                width: 56px;
                height: 28px;
                border-radius: 4px;
                margin-right: 56px;
            }

            .text2 {
                width: 40px;
                height: 40px;
                border-radius: 4px;
                margin-right: 8px;
            }

            .text3 {
                width: 48px;
                height: 32px;
                border-radius: 4px;
                margin-right: 52px;
            }

            .text4 {
                width: 40px;
                height: 40px;
                border-radius: 4px;
                margin-right: 8px;
            }

            .text5 {
                width: 168px;
                height: 32px;
                border-radius: 4px;
            }
        }

        .remark {
            padding: 86px 0 0 40px;

            .text1 {
                width: 394px;
                height: 28px;
                border-radius: 4px;
                margin-right: 16px;
            }

            .text2 {
                width: 104px;
                height: 28px;
                border-radius: 4px;
            }
        }

        .buy-box {
            position: fixed;
            min-height: 132px;
            width: 100%;
            bottom: 0;
            background-color: $white;
            left: 0;
            border-radius: 30px 30px 0 0;
            box-shadow: 0px -16px 16px 2px rgba($black, 0.02);
            z-index: 9;
            padding-bottom: $safe-height;
            box-sizing: content-box;

            .left {
                padding-left: 40px;
            }

            .right {
                padding-right: 40px;
            }

            .icon-box {
                width: 92px;
                height: 92px;
                flex-direction: column;

                &.box-1, &.box-2 {
                    .icon {
                        width: 48px;
                        height: 48px;
                        border-radius: 4px;
                    }

                    .name {
                        width: 40px;
                        height: 22px;
                        border-radius: 4px;
                        margin-top: 6px;
                    }
                }

                &.box-2 {
                    .name {
                        width: 60px;
                    }
                }
            }

            .btn {
                width: 222px;
                height: 76px;
                margin-left: 16px;
                border-radius: 76px;

                &.btn-1 {
                    background-color: rgba($purple, 0.1);
                }

                &.btn-2 {
                    background-color: rgba($purple, 0.4);
                }
            }
        }
    }


    // 骨架屏动画
    ._skeleton {
        background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
        background-size: 400% 100%;
        @include animation(skeleton-loading 1.4s ease infinite);
    }

    @include keyframes(skeleton-loading) {
        0% {
            background-position: 100% 50%
        }

        to {
            background-position: 0 50%
        }
    }
}
</style>
