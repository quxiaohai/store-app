<template>
    <div class="comment-items-box">
        <slot/>
        <div
            class="comment-detail-tags flex-left"
            v-if="type === 'detail' && list.length > 0">
            <div
                class="tag selected"
                @click="handleSelect(item.value)"
                v-for="item in tagList"
                :key="item.value">{{ item.label }}
            </div>
        </div>
        <scroll-view
            @scroll="handleScroll"
            :scroll-x="true"
            :scroll-left="scrollLeft"
            :scroll-with-animation="true"
            class="comment-tags flex-left"
            v-else-if="type === 'list' && tagList.length > 0">
            <div
                class="tag"
                @click="handleSelect(item.value, i, $event)"
                v-for="(item, i) in tagList"
                :class="{selected: selectTag === item.value}"
                :key="item.value">{{ item.label }}
            </div>
            <div class="tag last"></div>
        </scroll-view>
        <div
            class="comment-items"
            v-for="item in list"
            :key="item.id"
            :class="type"
            v-if="list.length > 0">
            <div class="comment-item">
                <div class="user-box flex-left">
                    <div class="cover">
                        <lazy-image class="photo" :error-src="defaultPhoto" :url="item.userIcon"/>
                    </div>
                    <div class="info">
                        <div class="name">{{ item.userName }}</div>
                        <div class="flex-between">
                            <div class="date">{{ item.createTime }}</div>
                            <star-score v-model="item.productStar"/>
                        </div>
                    </div>
                </div>
                <div class="comment-content" :class="type">
                    {{ item.content }}
                </div>
                <div class="comment-images flex-left" v-if="item.images && item.images.length">
                    <media-show
                        v-for="(img, i) in item.images"
                        :key="i"
                        preview
                        screen-full
                        :level="3"
                        :controls="false"
                        :url="img"
                        :list="item.images"
                        class="image"/>
                </div>
                <div class="comment-size">已购商品：{{ item.size || item.title }}</div>
                <div class="comment-reply" v-if="item.adminContent && type === 'list'">
                    <fold-box :row="2">
                        {{ item.adminContent }}
                    </fold-box>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import scrollView from 'common/components/scroll-view';
import starScore from 'common/components/star-score';
import mediaShow from 'common/components/media-show';
import foldBox from 'common/components/fold-box';

export default {
    name: 'comment-items',
    props: {
        list: {
            type: Array,
            default() {
                return [];
            }
        },
        tagList: {
            type: Array,
            default() {
                return [];
            }
        },
        type: {
            type: String,
            default: 'list'// detail
        }
    },
    data() {
        return {
            selectTag: '',
            scrollLeft: 0,
            defaultPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAE5XRFWHRDb21tZW50AHtUd7UAPHByb3BzPg0KPHByb3A+DQo8a2V5Pl9JUEdGSUQ8L2tleT4NCjx2YWw+W0RvY0lEXT0yMzA3OEVERS1EQjNFLTM4NDktQjg0RC01ODQzNzJERTgzNTU8L3ZhbD4NCjwvcHJvcD4NCjxwcm9wPg0KPGtleT5fSVBHRkxPV19QLUI1RjZfRS0wX0NWLThBMTRCMkI1X0NOLTlGMkFGN0IwPC9rZXk+DQo8dmFsPkRQRlBNS3wzfDUwfDJ8MDwvdmFsPg0KPC9wcm9wPg0KPHByb3A+DQo8a2V5Pl9JUEdGTE9XX1AtQjVGNl9FLTFfRlAtMV9DVi1FRTExODA5Q19DTi1CRkRCQTM5ODwva2V5Pg0KPHZhbD4ya0JlYWdrbUdxVzBvQkQ3N05TS2M0c0s3RHMzZHZ1QUlFR2dRckVOdGozNkRMQmlRWVR6MzJYRE1jOGhSMWl3aFNRTnZncnJFdUJaWXA3TWplT2VRMDhUeGcyWmswZHd1ZTlPbExwRW1uN2ZRRDJXTFhvYm9QSGh4SHNDY1c5c0dBeGo2YjhoZWNhaGRFNEZQZnhxYk1NUmtEM2hQQjUxRU1QYjNGd1FBV0JZL1VOOXp6a1RXUndMcVlNbUw2ajhqUjNtU3Y3cFF6cHp2Tmh3aEFZZzQ1b0VOblRUYVpYYnNtSXI0cTBuQzlEN3Q2Ynl1RDZabzlvamQ4OFNESHVzcjBRT1V5S1VOOThnaUZCMm5ZYkhuOUpzOW41OCtCUWJselV0R3VLUUhUcm5lYnRoSysrRDdrYkN2UkdQNkt3YWZFaTVsV1cyTGtpb0tXNGwySjJxTmJSbkN6MlBWaElUMEZUME1OUlJHUXFSbWtSeGFUM1VuTWdrNXdZTGV3TG9kRHdtT1l6ZzUxZ0FmeDhEWWZ5a3BhNkFVQUdGbURWWHBaaHF1YVJWSW04PTwvdmFsPg0KPC9wcm9wPg0KPHByb3A+DQo8a2V5Pl9JUEdGTE9XX1AtQjVGNl9FLTFfRlAtMl9DVi01MDcxMTJDN19DTi0zQTdDRkRFQTwva2V5Pg0KPHZhbD5ibWorVUh2NWJNZkdIckIzQWZmQnNweTNaWHcrQmQ0Vk1FeSt5MzJiWTVnMWdUVXFj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'
        };
    },
    components: {
        scrollView,
        starScore,
        mediaShow,
        foldBox
    },
    computed: {
        screenWidth() {
            return this.$store.state.screenWidth;
        }
    },
    watch: {
        tagList() {
            this.$nextTick(() => {
                this.onScrollTo();
            });
        }
    },
    methods: {
        // 滚动监听
        handleScroll(ev) {
            this._scrollX = ev.detail?.scrollLeft;
        },
        // 选中ID
        selectTagId(id) {
            this.selectTag = parseInt(id);
            this.onScrollTo();
        },
        // 滚动到指定位置
        onScrollTo() {
            if (this.tagList.length > 0 && this.selectTag !== '') {
                const index = this.tagList.findIndex(r => r.value === this.selectTag);
                if (index > -1) {
                    this.scrollLeft = index * 80;
                }
            }
        },
        // 选择标签
        handleSelect(id, i, ev) {
            if (this.type === 'list') {
                this.selectTag = this.selectTag === id ? '' : id;
            } else {
                this.selectTag = id;
            }

            this.$emit('search', {
                tagId: this.selectTag
            });

            if (this.type === 'list') {
                const x = ev.detail.x;
                if (x >= this.screenWidth - 100) {// 靠右
                    this.scrollLeft = this._scrollX + 120;
                } else if (x <= 100) {// 靠左
                    this.scrollLeft = this._scrollX - 120;
                }
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.comment-items-box {
    .comment-tags, .comment-detail-tags {
        padding: 0 40px;

        .tag {
            line-height: 46px;
            font-size: $fs24;
            color: rgba($black, 0.6);
            padding: 0 20px;
            margin: 0 24px 16px 0;
            border-radius: 46px;
            background-color: $page-gray;
            box-sizing: content-box;
            display: inline-block;

            &.selected {
                background-color: $orange-light;
                color: $orange-dark;
                border-color: $orange-light;
            }

            &.last {
                border: 0 none;
                width: 6px;
                margin-right: 10px;
                padding: 0;
            }
        }
    }

    .comment-tags {
        white-space: nowrap;
        height: 54px;
        width: 100%;
        box-sizing: border-box;
        padding: 0;

        .tag {
            margin-bottom: 0;

            &:first-of-type {
                margin-left: 40px;
            }
        }
    }

    .comment-detail-tags {
        flex-wrap: wrap;
        max-height: 116px;
        overflow: hidden;
    }

    .comment-items {
        padding: 60px 40px 0;

        &.detail {
            padding-top: 40px;

            .comment-item {
                padding-bottom: 40px;
            }
        }

        .comment-item {
            padding-bottom: 60px;

            .user-box {
                .cover {
                    width: 68px;
                    height: 68px;
                    border-radius: 100%;
                    overflow: hidden;
                }

                .photo {
                    width: 100%;
                    height: 100%;
                }

                .info {
                    padding-left: 24px;
                    flex: 1;

                    .name {
                        font-size: $fs24;
                        color: $black;
                        font-weight: 600;
                        line-height: 28px;
                        padding-bottom: 4px;
                    }

                    .date {
                        font-size: $fs24;
                        color: rgba($black, 0.4);
                    }
                }
            }

            .comment-content {
                font-size: $fs28;
                font-weight: 400;
                color: rgba($black, 0.8);
                line-height: 42px;
                margin: 24px 0;

                &.detail {
                    max-height: 84px;
                    @include line-clamp(2);
                }
            }

            .comment-images {
                flex-wrap: wrap;

                .image {
                    width: 152px;
                    height: 152px;
                    margin: 0 20px 20px 0;

                    &:nth-child(4n) {
                        margin-right: 0;
                    }

                    &:nth-child(4n + 1) {
                        margin-bottom: 20px;
                    }
                }
            }

            .comment-size {
                line-height: 36px;
                font-size: $fs24;
                color: rgba($black, 0.3);
            }

            .comment-reply {
                line-height: 40px;
                font-size: $fs24;
                padding: 24px 32px;
                background-color: $gray-disabled;
                width: 100%;
                box-sizing: border-box;
                margin-top: 24px;
                color: rgba($black, 0.4);
            }
        }
    }
}
</style>
