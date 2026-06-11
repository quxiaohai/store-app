<template>
    <div class="nl-timeline-content" :class="{ top, bottom }">
        <span class="dt"/>
        <span class="line" v-if="showLine"/>
        <span class="line-icon" v-if="icon" :class="icon"/>
        <div class="content fz-40 fw-500">
            <slot/>
        </div>
    </div>
</template>
<script>
export default {
    name: 'timelineTitle',
    props: {
        top: {
            type: Boolean,
            default: false
        },
        bottom: {
            type: Boolean,
            default: false
        },
        icon: {
            type: String,
            default: ''
        },
        showLine: {
            type: Boolean,
            default: true
        },
    }
};
</script>
<style lang="scss">
@import 'common/style/static';

.nl-timeline-content {
    position: relative;
    padding-bottom: 40px;
    overflow: hidden;

    .dt {
        box-sizing: border-box;
        position: absolute;
        top: 10px;
        left: 16px;
        width: 40px;
        height: 40px;
        border-radius: 20px;
        border: 6px solid $white;
        background-color: #f2f2f2;
        z-index: 10;

        &:before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 12px;
            height: 12px;
            margin-left: -6px;
            margin-top: -6px;
            border-radius: 6px;
            background-color: #c2c2c2;
        }
    }

    .line-icon {
        box-sizing: border-box;
        position: absolute;
        top: 0;
        left: 0;
        width: 72px;
        height: 72px;
        border-radius: 36px;
        border: 6px solid $white;
        font-size: 50px;
        color: #f2f2f2;
        z-index: 12;
    }

    .line {
        position: absolute;
        top: 0;
        left: 34px;
        width: 0;
        height: 100%;
        border-left: 2px dashed rgba(0, 0, 0, 0.2);
        z-index: 5;
    }

    &.top {
        .line {
            top: 14px;
        }
    }

    &.bottom {
        padding-bottom: 0;

        .line {
            height: 30px;
        }
    }

    .content {
        padding-left: 80px;
        line-height: 1.3;
    }
}
</style>
