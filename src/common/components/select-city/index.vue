<template>
    <popup v-model="visible" :option="popupOption">
        <div class="m-select-city">
            <div class="header flex-center">
                <span class="cancel" @click="onClose">取消</span>
                <span>请选择所在区域</span>
                <span class="ok" :class="{disabled}" @click="onConfirm" v-if="!hideConfirm" >确定</span>
            </div>
            <ul class="tab-items flex-left" @click.stop.prevent>
                <template v-for="(item, index) in tabs" :key="index">
                    <li
                        v-if="item.show"
                        class="item flex-center"
                        @click="changeSwipe(index, item.key)"
                        :class="{selected: index === selected}">
                        {{ item.value !== '' ? item.label : item.default }}
                    </li>
                </template>
                <li class="line"></li>
            </ul>
            <swiper :options="options" class="citySwiper" ref="mySwipe">
                <template v-for="(item, index) in tabs" :key="index">
                    <swiper-slide v-if="item.show">
                        <ul class="province-items scrolling">
                            <li
                                v-for="(city) in cityMap[item.key]"
                                :class="{checked: city.id === item.value}"
                                @click="selectItem(city, index)"
                                class="item flex-between"
                                :key="city.id">
                                {{ city.name }}
                                <i v-if="city.id === item.value" class="iconfont icon-hook"></i>
                            </li>
                        </ul>
                    </swiper-slide>
                </template>
            </swiper>
        </div>
    </popup>
</template>
<script>

import { swiper, swiperSlide } from 'common/components/swiper';

export default {
    name: 'select-city',
    props: {
        /// 是否隐藏确认按钮
        hideConfirm: {
            type: Boolean,
            default: false
        }
    },
    data() {
        const vm = this;
        return {
            selected: 0,
            tabs: [
                { default: '请选择', key: 0, value: '', label: '', show: true },
                { default: '请选择', key: '', value: '', label: '', show: false },
                { default: '请选择', key: '', value: '', label: '', show: false }
            ],
            cityMap: {},
            visible: false,
            popupOption: {
                autoHide: true,
                animate: {
                    name: 'bottom'
                },
                left: 0,
                bottom: 0
            },
            options: {
                initialSlide: 0,
                centeredSlides: true,
                onInit(ev) {
                    vm.selected = ev.activeIndex;
                },
                onSlideChangeEnd(ev) {
                    vm.selected = ev.activeIndex;
                }
            }
        };
    },
    emits: ['select'],
    components: {
        swiper,
        swiperSlide
    },
    mounted() {
        this.loadData(0);
    },
    computed: {
        disabled() {
            return this.tabs.filter(r => !r.value).length > 0;
        }
    },
    methods: {
        onShow(defaultList) {
            let lastLevelIndex = 0;
            defaultList?.forEach((item, i) => {
                this.tabs[i].key = item.pid;
                this.tabs[i].value = item.id;
                this.tabs[i].label = item.name;
                this.tabs[i].show = true;
                lastLevelIndex = !item.value ? i : lastLevelIndex;
            });

            if(lastLevelIndex > 0) {
                this.changeSwipe(lastLevelIndex, this.tabs[lastLevelIndex]?.key);
            }
            this.visible = true;
        },
        onClose() {
            this.visible = false;
        },
        async loadData(value) {
            if (this.cityMap[value]) {
                return true;
            }

            const [res, err] = await this.$http.awaitTo(
                this.$http.get(this.$api.getRegionsList, {
                    params: {
                        pid: value
                    }
                })
            );

            if (err) {
                return true;
            }

            this.cityMap[value] = res.data;

            return true;
        },
        async selectItem(obj, index) {
            this.tabs[index].key = obj.pid;
            this.tabs[index].value = obj.id;
            this.tabs[index].label = obj.name;
            if (index < 2) {
                this.loadData(obj.id);
                this.tabs.forEach((o, i) => {
                    if (i > index) {
                        o.key = '';
                        o.value = '';
                        o.label = '';
                        o.show = false;
                    }
                });
                this.tabs[index + 1].key = obj.id;
                this.tabs[index + 1].show = true;
                this.$nextTick(() => {
                    this.selected = index + 1;
                    this.$refs.mySwipe.swiper.slideTo(this.selected, 300);
                });
            } else {
                if(this.hideConfirm) {
                    this.onConfirm();
                }
            }
        },
        changeSwipe(index, pid) {
            this.selected = index;
            this.loadData(pid);
            this.$refs.mySwipe.swiper.slideTo(index, 300);
        },
        onConfirm() {
            if (this.disabled) {
                return false;
            }
            this.$emit('select', this.tabs.map(item => {
                return {
                    id: item.value,
                    name: item.label
                };
            }));

            this.onClose();
        }
    }
};
</script>
<style lang="scss" scoped>
@import "common/style/static";

.m-select-city {
    width: 100vw;
    background-color: $white;
    height: 85vh;
    @include display-flex;
    @include flex-direction;

    .citySwiper {
        .swiper-wrapper {
            position: absolute !important;
        }
    }

    .header {
        font-size: $fs36;
        color: #1b1b1b;
        height: 130px;
        background-color: $white;

        .cancel {
            color: $gray-light;
            font-size: $fs28;
            position: absolute;
            left: 0;
            display: inline-block;
            padding: 0 28px;
        }

        .ok {
            color: $purple;
            font-size: $fs28;
            position: absolute;
            right: 0;
            display: inline-block;
            padding: 0 28px;

            &.disabled {
                opacity: 0.4;
            }
        }
    }

    .tab-items {
        padding: 0 36px;
        font-size: $fs28;
        color: $gray-dark;
        border-bottom: 1px solid $white-light;
        height: 64px;

        .item {
            margin-right: 80px;
            position: relative;
            height: 64px;

            &:before {
                opacity: 0;
                content: '';
                position: absolute;
                width: 100%;
                height: 4px;
                background-color: $purple;
                left: 0;
                bottom: 0;
            }

            &.selected {
                color: $purple;

                &:before {
                    opacity: 1;
                }
            }
        }
    }

    .swiper-container {
        @include flex(1);
        width: 100%;
    }

    .province-items {
        height: 100%;
        width: 100%;

        .item {
            height: 96px;
            font-size: $fs28;
            color: $gray-dark;
            padding-left: 50px;

            &.checked {
                color: $purple;
            }
        }

        .iconfont {
            margin-right: 50px;
            font-size: $fs32;
            color: $purple;
        }
    }
}
</style>