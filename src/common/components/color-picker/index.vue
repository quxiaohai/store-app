<template>
    <popup v-model="visible" @show="getSelectorQuery" :option="option">
        <div class="m-color-picker">
            <div class="color-header">
                <div class="header-button" @click.stop="onClose">取消</div>
                <div class="header-button btn-ok" @click.stop="onConfirm">确认</div>
            </div>
            <div class="color-wrap"
                 :style="{ background: 'rgb(' + bgColor.r + ',' + bgColor.g + ',' + bgColor.b + ')'}">
                <div
                    ref="box0"
                    class="color-background"
                    @touchstart.stop.prevent="onTouchstart($event, 0)"
                    @touchmove.stop.prevent="onTouchmove($event, 0)"
                    @touchend="onTouchend($event, 0)">
                    <div class="color-mask"></div>
                    <div class="color-pointer"
                         :style="{ top: site[0].top - 8 + 'px', left: site[0].left - 8 + 'px' }"></div>
                </div>
            </div>
            <div class="control-wrap">
                <div class="control-color">
                    <div class="control-color-content"
                         :style="{ background: 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + rgba.a + ')' }"></div>
                </div>
                <div class="control-box-item">
                    <div
                        ref="box1"
                        class="color-controller"
                        @touchstart.stop.prevent="onTouchstart($event, 1)"
                        @touchmove.stop.prevent="onTouchmove($event, 1)"
                        @touchend="onTouchend($event, 1)">
                        <div class="color-hue">
                            <div class="color-circle" :style="{ left: site[1].left - 12 + 'px' }"></div>
                        </div>
                    </div>
                    <div
                        ref="box2"
                        class="color-controller"
                        @touchstart.stop.prevent="onTouchstart($event, 2)"
                        @touchmove.stop.prevent="onTouchmove($event, 2)"
                        @touchend="onTouchend($event, 2)">
                        <div class="color-transparency">
                            <div class="color-circle" :style="{ left: site[2].left - 12 + 'px' }"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="result-wrap-box">
                <div class="result-wrap hex-wrap">
                    <div class="result-item hex-item">
                        <div class="result-wrap-text">HEX:</div>
                        <div class="result-wrap-input" @click="onCopyText(hex)">{{ hex }}</div>
                    </div>
                </div>
                <div class="result-wrap">
                    <div class="result-item">
                        <div class="result-wrap-text">R:</div>
                        <div class="result-wrap-input" @click="onCopyText(rgba.r)">{{ rgba.r }}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-wrap-text">G:</div>
                        <div class="result-wrap-input" @click="onCopyText(rgba.g)">{{ rgba.g }}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-wrap-text">B:</div>
                        <div class="result-wrap-input" @click="onCopyText(rgba.b)">{{ rgba.b }}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-wrap-text">A:</div>
                        <div class="result-wrap-input" @click="onCopyText(rgba.a)">{{ rgba.a }}</div>
                    </div>
                </div>
            </div>
            <div class="alternative">
                <div class="alternative-item" v-for="(item,index) in colorList" :key="index">
                    <div class="alternative-item-content"
                         :style="{ background: 'rgba(' + item.r + ',' + item.g + ',' + item.b + ',' + item.a + ')' }"
                         @click="onSelectColor(item)">
                    </div>
                </div>
            </div>
        </div>
    </popup>
</template>

<script>
import getOffset from 'lib/dom/getOffset';
import { copyText } from 'common/util';
import { isObject } from 'lib/util/dataType';

export default {
    name: 'color-picker',
    props: {
        // 颜色选择器初始颜色 rgba {r: 0, g: 0, b: 0, a: 0}或者hex
        color: [Object, String],
        // 备选色，格式为:[ {r: 0,g: 0,b: 0,a: 1}]
        spareColor: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    data() {
        return {
            option: {
                autoHide: true,
                animate: {
                    name: 'bottom'
                },
                left: 0,
                bottom: 0
            },
            visible: false,
            // rgba 颜色
            rgba: {
                r: 0,
                g: 0,
                b: 0,
                a: 1
            },
            // hsb 颜色
            hsb: {
                h: 0,
                s: 0,
                b: 0
            },
            site: [{
                top: 0,
                left: 0
            }, {
                left: 0
            }, {
                left: 0
            }],
            index: 0,
            bgColor: {
                r: 255,
                g: 0,
                b: 0,
                a: 1
            },
            hex: '#000000',
            colorList: [{
                r: 244,
                g: 67,
                b: 54,
                a: 1
            }, {
                r: 233,
                g: 30,
                b: 99,
                a: 1
            }, {
                r: 156,
                g: 39,
                b: 176,
                a: 1
            }, {
                r: 103,
                g: 58,
                b: 183,
                a: 1
            }, {
                r: 63,
                g: 81,
                b: 181,
                a: 1
            }, {
                r: 33,
                g: 150,
                b: 243,
                a: 1
            }, {
                r: 3,
                g: 169,
                b: 244,
                a: 1
            }, {
                r: 0,
                g: 188,
                b: 212,
                a: 1
            }, {
                r: 0,
                g: 150,
                b: 136,
                a: 1
            }, {
                r: 76,
                g: 175,
                b: 80,
                a: 1
            }, {
                r: 139,
                g: 195,
                b: 74,
                a: 1
            }, {
                r: 205,
                g: 220,
                b: 57,
                a: 1
            }, {
                r: 255,
                g: 235,
                b: 59,
                a: 1
            }, {
                r: 255,
                g: 193,
                b: 7,
                a: 1
            }, {
                r: 255,
                g: 152,
                b: 0,
                a: 1
            }, {
                r: 255,
                g: 87,
                b: 34,
                a: 1
            }, {
                r: 121,
                g: 85,
                b: 72,
                a: 1
            }, {
                r: 158,
                g: 158,
                b: 158,
                a: 1
            }, {
                r: 0,
                g: 0,
                b: 0,
                a: 0.5
            }, {
                r: 0,
                g: 0,
                b: 0,
                a: 0
            }]
        };
    },
    created() {
        this.initColor();
    },
    methods: {
        /**
         * 初始化
         */
        initColor() {
            if (this.color) {
                if (isObject(this.color)) {
                    this.rgba = this.color;
                } else {
                    this.rgba = this.hexToRgba(this.color);
                }
            } else {
                this.rgba = {
                    r: 0,
                    g: 0,
                    b: 0,
                    a: 0
                };
            }

            if (this.spareColor.length !== 0) {
                this.colorList = this.spareColor;
            }
        },
        onShow() {
            this.visible = true;
        },
        onClose() {
            this.visible = false;
        },
        onConfirm() {
            this.onClose();
            this.$emit('confirm', {
                rgba: this.rgba,
                hex: this.hex
            });
        },
        // 复制
        onCopyText(text) {
            copyText(text);
            this.$layer.success('复制成功');
        },
        // 常用颜色选择
        onSelectColor(item) {
            this.setColorBySelect(item);
        },
        onTouchstart(e, index) {
            const {
                pageX,
                pageY
            } = e.touches[0];
            this.pageX = pageX;
            this.pageY = pageY;
            this.setPosition(pageX, pageY, index);
        },
        onTouchmove(e, index) {
            const {
                pageX,
                pageY
            } = e.touches[0];
            this.moveX = pageX;
            this.moveY = pageY;
            this.setPosition(pageX, pageY, index);
        },
        onTouchend(e, index) {
        },
        /**
         * 设置位置
         */
        setPosition(x, y, index) {
            this.index = index;
            const {
                top,
                left,
                width,
                height
            } = this.position[index];
            // 设置最大最小值

            this.site[index].left = Math.max(0, Math.min(parseInt(x - left), width));
            if (index === 0) {
                this.site[index].top = Math.max(0, Math.min(parseInt(y - top), height));
                // 设置颜色
                this.hsb.s = parseInt((100 * this.site[index].left) / width);
                this.hsb.b = parseInt(100 - (100 * this.site[index].top) / height);
                this.setColor();
                this.setValue(this.rgba);
            } else {
                this.setControl(index, this.site[index].left);
            }
        },
        /**
         * 设置 rgb 颜色
         */
        setColor() {
            const rgb = this.HSBToRGB(this.hsb);
            this.rgba.r = rgb.r;
            this.rgba.g = rgb.g;
            this.rgba.b = rgb.b;
        },
        /**
         * 设置二进制颜色
         * @param {Object} rgb
         */
        setValue(rgb) {
            this.hex = '#' + this.rgbToHex(rgb);
        },
        setControl(index, x) {
            const {
                top,
                left,
                width,
                height
            } = this.position[index];

            if (index === 1) {
                this.hsb.h = parseInt((360 * x) / width);
                this.bgColor = this.HSBToRGB({
                    h: this.hsb.h,
                    s: 100,
                    b: 100
                });
                this.setColor();
            } else {
                this.rgba.a = (x / width).toFixed(1);
            }
            this.setValue(this.rgba);
        },
        /**
         * rgb 转 二进制 hex
         * @param {Object} rgb
         */
        rgbToHex(rgb) {
            let hex = [rgb.r.toString(16), rgb.g.toString(16), rgb.b.toString(16)];
            hex.map(function(str, i) {
                if (str.length === 1) {
                    hex[i] = '0' + str;
                }
            });
            return hex.join('');
        },
        /**
         * hex 转 rgb
         * @param {Object} hex
         */
        hexToRgba(hex) {
            const str = hex.substring(1);
            let arr;
            if (str.length === 3) arr = str.split('').map(d => parseInt(d.repeat(2), 16));
            else arr = [parseInt(str.slice(0, 2), 16), parseInt(str.slice(2, 4), 16), parseInt(str.slice(4, 6), 16)];
            return {
                r: arr[0],
                g: arr[1],
                b: arr[2],
                a: 1
            };
        },
        setColorBySelect(getRgb) {
            const {
                r,
                g,
                b,
                a
            } = getRgb;
            let rgb = {};
            rgb = {
                r: r ? parseInt(r) : 0,
                g: g ? parseInt(g) : 0,
                b: b ? parseInt(b) : 0,
                a: a ? a : 0
            };
            this.rgba = rgb;
            this.hsb = this.rgbToHsb(rgb);
            this.changeDivByHsb();
        },
        changeDivByHsb() {
            const [a, b, c] = this.position;
            this.site[0].left = parseInt(this.hsb.s * a.width / 100);
            this.site[0].top = parseInt((100 - this.hsb.b) * a.height / 100);
            this.setColor(this.hsb.h);
            this.setValue(this.rgba);
            this.bgColor = this.HSBToRGB({
                h: this.hsb.h,
                s: 100,
                b: 100
            });

            this.site[1].left = this.hsb.h / 360 * b.width;
            this.site[2].left = this.rgba.a * c.width;

        },
        /**
         * hsb 转 rgb
         * @param hsb 颜色模式  H(hues)表示色相，S(saturation)表示饱和度，B（brightness）表示亮度
         */
        HSBToRGB(hsb) {
            let rgb = {};
            let h = Math.round(hsb.h);
            let s = Math.round((hsb.s * 255) / 100);
            let v = Math.round((hsb.b * 255) / 100);
            if (s === 0) {
                rgb.r = rgb.g = rgb.b = v;
            } else {
                let t1 = v;
                let t2 = ((255 - s) * v) / 255;
                let t3 = ((t1 - t2) * (h % 60)) / 60;
                if (h === 360) h = 0;
                if (h < 60) {
                    rgb.r = t1;
                    rgb.b = t2;
                    rgb.g = t2 + t3;
                } else if (h < 120) {
                    rgb.g = t1;
                    rgb.b = t2;
                    rgb.r = t1 - t3;
                } else if (h < 180) {
                    rgb.g = t1;
                    rgb.r = t2;
                    rgb.b = t2 + t3;
                } else if (h < 240) {
                    rgb.b = t1;
                    rgb.r = t2;
                    rgb.g = t1 - t3;
                } else if (h < 300) {
                    rgb.b = t1;
                    rgb.g = t2;
                    rgb.r = t2 + t3;
                } else if (h < 360) {
                    rgb.r = t1;
                    rgb.g = t2;
                    rgb.b = t1 - t3;
                } else {
                    rgb.r = 0;
                    rgb.g = 0;
                    rgb.b = 0;
                }
            }
            return {
                r: Math.round(rgb.r),
                g: Math.round(rgb.g),
                b: Math.round(rgb.b)
            };
        },
        rgbToHsb(rgb) {
            let hsb = {
                h: 0,
                s: 0,
                b: 0
            };
            let min = Math.min(rgb.r, rgb.g, rgb.b);
            let max = Math.max(rgb.r, rgb.g, rgb.b);
            let delta = max - min;
            hsb.b = max;
            hsb.s = max !== 0 ? 255 * delta / max : 0;
            if (hsb.s !== 0) {
                if (rgb.r === max) hsb.h = (rgb.g - rgb.b) / delta;
                else if (rgb.g === max) hsb.h = 2 + (rgb.b - rgb.r) / delta;
                else hsb.h = 4 + (rgb.r - rgb.g) / delta;
            } else hsb.h = -1;
            hsb.h *= 60;
            if (hsb.h < 0) hsb.h = 0;
            hsb.s *= 100 / 255;
            hsb.b *= 100 / 255;
            return hsb;
        },
        getSelectorQuery() {
            const arr = [];
            for (let i = 0; i < 3; i++) {
                const node = this.$refs[`box${i}`];
                arr.push({
                    ...getOffset(node),
                    width: node.offsetWidth,
                    height: node.offsetHeight
                });
            }

            this.position = arr;
            this.setColorBySelect(this.rgba);
        }
    },
    watch: {
        spareColor(newVal) {
            this.colorList = newVal;
        }
    }
};
</script>

<style lang="scss" scoped>
@import "common/style/static";

.m-color-picker {
    width: 100vw;
    background: $white;
    box-sizing: border-box;
    padding-bottom: 30px;

    .color-header {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 104px;
        border-bottom: 1px solid $page-gray;
        box-sizing: border-box;
    }

    .header-button {
        display: flex;
        align-items: center;
        width: 150px;
        height: 100px;
        font-size: 30px;
        color: $gray;
        padding-left: 24px;

        &.btn-ok {
            justify-content: flex-end;
            padding-right: 24px;
            color: $purple;
        }
    }

    .color-wrap {
        position: relative;
        height: 400px;
        background: rgb(255, 0, 0);
        overflow: hidden;
        box-sizing: border-box;
        margin: 0 20px;
        margin-top: 20px;
    }

    .color-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to right, $white, rgba(255, 255, 255, 0));
    }

    .color-mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 400px;
        background: linear-gradient(to top, $black, rgba(0, 0, 0, 0));
    }

    .color-pointer {
        position: absolute;
        bottom: -8px;
        left: -8px;
        z-index: 2;
        width: 15px;
        height: 15px;
        border: 1px $white solid;
        border-radius: 50%;
    }

    .t-show-color {
        width: 100px;
        height: 50px;
    }

    .control-wrap {
        margin-top: 50px;
        width: 100%;
        display: flex;
        padding-left: 20px;
        box-sizing: border-box;
    }

    .control-color {
        flex-shrink: 0;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background-color: $white;
        background-image: linear-gradient(45deg, $white-light 25%, transparent 25%, transparent 75%, $white-light 75%, $white-light),
        linear-gradient(45deg, $white-light 25%, transparent 25%, transparent 75%, $white-light 75%, $white-light);
        background-size: 36px 36px;
        background-position: 0 0, 18px 18px;
        border: 1px $white-light solid;
        overflow: hidden;
    }

    .control-color-content {
        width: 100%;
        height: 100%;
    }

    .control-box-item {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 100%;
        padding: 0 30px;
    }

    .color-controller {
        position: relative;
        width: 100%;
        height: 16px;
        background-color: $white;
        background-image: linear-gradient(45deg, $white-light 25%, transparent 25%, transparent 75%, $white-light 75%, $white-light),
        linear-gradient(45deg, $white-light 25%, transparent 25%, transparent 75%, $white-light 75%, $white-light);
        background-size: 32px 32px;
        background-position: 0 0, 16px 16px;
    }

    .color-hue {
        width: 100%;
        height: 100%;
        background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
    }

    .color-transparency {
        width: 100%;
        height: 100%;
        background: linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0));
    }

    .color-circle {
        position: absolute;
        /* right: -10px; */
        top: -7px;
        width: 30px;
        height: 30px;
        box-sizing: border-box;
        border-radius: 50%;
        background: $white;
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
    }

    .result-wrap-box {
        padding-top: 20px;
    }

    .result-wrap {
        padding: 10px 24px;
        width: 100%;
        display: flex;
        box-sizing: border-box;
    }

    .result-item {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        width: 100%;
        box-sizing: border-box;

        &.hex-item {
            justify-content: flex-start;

            .result-wrap-input {
                width: 140px;
            }
        }
    }

    .result-wrap-input {
        padding: 4px 0;
        font-size: 24px;
        box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.1);
        color: $gray-dark;
        text-align: center;
        background: $white;
        width: 80px;
    }

    .result-wrap-text {
        font-size: 24px;
        font-weight: bold;
        color: $gray-dark;
        padding-right: 10px;
    }

    .mode-select {
        flex-shrink: 0;
        width: 150px;
        padding: 0 30px;
    }

    .mode-select .result-wrap-input {
        border-radius: 10px;
        border: none;
        color: $gray-light;
        box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.1);
        background: $white;
    }

    .mode-select .result-wrap-input:active {
        box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.1);
    }

    .alternative {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        padding-right: 10px;
        box-sizing: border-box;
    }

    .alternative-item {
        margin-left: 12px;
        margin-top: 10px;
        width: 50px;
        height: 50px;
        border-radius: 10px;
        background-color: $white;
        background-image: linear-gradient(45deg, $white-light 25%, transparent 25%, transparent 75%, $white-light 75%, $white-light),
        linear-gradient(45deg, $white-light 25%, transparent 25%, transparent 75%, $white-light 75%, $white-light);
        background-size: 36px 36px;
        background-position: 0 0, 18px 18px;
        border: 1px $white-light solid;
        overflow: hidden;
    }

    .alternative-item-content {
        width: 50px;
        height: 50px;
        background: rgba(255, 0, 0, 0.5);
    }

    .alternative-item:active {
        transition: all 0.3s;
        transform: scale(1.1);
    }
}
</style>
