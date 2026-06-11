<template>
    <div
        :ref="id"
        :id="id"
        :report-id="reportId"
        class="nl-button"
        v-hover="'hover'"
        @contextmenu.stop.prevent
        :style="btnStyle"
        :class="[realType, size, theme, { round, loading, disabled, color }]"
        @click="tapHandler"
    >
        <template v-if="getLoading">
            <span v-if="loadingText" class="nl-button-text">
                {{ loadingText }}
            </span>
            <span v-else class="nl-button-text">
                <slot />
                ...
            </span>
        </template>
        <span v-else class="nl-button-text">
            <slot />
        </span>
    </div>
</template>

<script>
export default {
    name: 'n-button',
    props: {
        /// 是否圆角
        round: {
            type: Boolean,
            default: false
        },
        /// 显示主题，接收[warning, plain, grey, new-year, yellow, pink, blue, orange-pink]
        type: {
            type: String,
            default: 'primary'
        },
        // color 自定义颜色
        color: String,
        /// 是否禁用
        disabled: {
            type: Boolean,
            default: false
        },
        /// 是否正在加载中，加载中默认文本后添加...
        loading: {
            type: Boolean,
            default: false
        },
        /// 正在加载中，显示的文本
        loadingText: {
            type: String,
            default: ''
        },
        /// 设置按钮大小，接收[large, medium, small, mini]
        size: {
            type: String,
            default: 'medium'
        },
        // 禁止冒泡
        stop: {
            type: Boolean,
            default: false
        },
        theme: {
            // white, black, gold, light
            type: String,
            default: 'white'
        },
        // 元素id
        id: {
            type: String,
            default: ''
        },
        // 点击事件id
        reportId: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            fnLoading: false
        };
    },
    computed: {
        /// 当前按钮主题
        realType() {
            return this.type || 'primary';
        },
        getLoading() {
            return this.loading || this.fnLoading;
        },
        btnStyle() {
            if (this.color) {
                return {
                    backgroundColor: this.color
                };
            }
            return null;
        }
    },
    methods: {
        /*******
         * 设置loading状态
         */
        setLoading(bool) {
            this.fnLoading = !!bool;
        },
        /**
         * @description: 点击事件
         * @param e {Object} 事件类
         */
        tapHandler(e) {
            if (this.disabled) {
                this.$emit('disabled');
            } else if (!this.disabled && !this.getLoading) {
                this.$emit('tap', {
                    loading: this.setLoading,
                    event: e
                });
            }

            this.stop && e.stopPropagation();
        }
    },
    mounted() {
        if (this.id && this.$refs[this.id]) {
            this.$refs[this.id].setAttribute('id', this.id);
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.nl-button {
    display: inline-block;
    box-sizing: border-box;
    padding: 0 32px;
    border-radius: 16px;
    text-align: center;
    user-select: none;
    vertical-align: top;
    -webkit-touch-callout: none;

    .nl-button-text {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        white-space: normal;
    }

    &.large {
        height: 96px;

        .nl-button-text {
            font-size: 32px;
            font-weight: 700;
        }
    }

    &.medium {
        height: 76px;

        .nl-button-text {
            font-size: 28px;
            font-weight: 500;
        }
    }

    &.small {
        height: 56px;

        .nl-button-text {
            font-size: 24px;
            font-weight: 500;
        }
    }

    &.mini {
        height: 36px;

        .nl-button-text {
            font-size: 18px;
            font-weight: 500;
        }
    }

    &.round {
        border-radius: 48px;
    }

    &.blue {
        color: $white;
        background-color: $blue-light;

        &.hover {
            opacity: 0.6;
        }
    }

    &.primary {
        color: $white;
        background-color: $purple;

        &.hover {
            opacity: 0.6;
        }

        &.gold {
            background-color: $gold-dark;
        }
    }

    &.warning,
    &.pink {
        color: $white;
        background-color: $red;

        &.hover {
            opacity: 0.6;
        }
    }

    &.blue {
        color: $white;
        background-color: $blue-summer;

        &.hover {
            opacity: 0.6;
        }
    }

    &.blue {
        background-color: $blue-summer;
    }

    &.pink {
        background-color: $red-light;
    }

    &.orange {
        color: $white;
        border: 0 none;
        background: linear-gradient(315deg, $orange 0%, #ffa57a 100%);

        &.hover {
            opacity: 0.8;
        }
    }

    &.color {
        &.hover {
            opacity: 0.6;
        }
    }

    &.plain,
    &.pink-plain {
        color: $purple;
        border: 2px solid $purple;
        background-color: $white;

        &.hover {
            background-color: rgba(122, 88, 232, 0.1);
        }

        &.gold {
            border-color: $gold-dark;
            color: $gold-dark;
        }
    }

    &.new-year {
        color: $white;
        background-color: $new-year-red;

        &.hover {
            opacity: 0.6;
        }
    }

    &.orange-pink {
        color: $white;
        background-color: $orange-pink;

        &.hover {
            opacity: 0.6;
        }
    }

    &.yellow {
        color: $yellow-gold;
        border: 2px solid $yellow-gold;
        background-color: $white;

        &.hover {
            opacity: 0.6;
        }
    }

    &.pink-plain {
        color: $red-light;
        border: 2px solid $red-light;
    }

    &.blue-plain {
        color: $blue-summer;
        border: 2px solid $blue-summer;
    }

    &.mark {
        color: $orange;
        border: 2px solid $orange;
        background-color: $white;

        &.hover {
            background-color: rgba(255, 117, 45, 0.35);
        }
    }

    &.grey {
        color: rgba(0, 0, 0, 0.6);
        border: 2px solid rgba(0, 0, 0, 0.2);
        background-color: $white;

        &.hover {
            background-color: rgba(153, 153, 153, 0.1);
        }
    }

    &.dark {
        color: $white;
        border: 2px solid $white-dark;
        background-color: $white-dark;

        &.hover {
            background-color: $gray-light;
        }
    }

    &.loading {
        opacity: 0.6;
    }

    &.disabled {
        background-color: $white-dark !important;
        color: rgba($black, 0.2);
        border: 0 none;

        &.hover {
            background-color: $white-dark !important;
            opacity: 1;
        }

        &.white {
            background-color: rgba($black, 0.2) !important;
            color: $white;

            &.hover {
                background-color: rgba($black, 0.2) !important;
            }
        }

        &.light {
            background-color: #a3a3a3 !important;
            border: 2px solid rgba($white, 0.4) !important;
            color: $white !important;

            &.hover {
                background-color: #a3a3a3 !important;
            }
        }
    }
}
</style>
