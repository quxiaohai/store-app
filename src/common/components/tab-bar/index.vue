<template>
    <ul class="m-tab-bar">
        <li
            class="tab flex-center"
            @click="handleSelect(item.value)"
            v-for="item in tabs"
            :class="{selected: modelValue === item.value}"
            :key="item.value">
            <div class="label">
                <slot v-if="item.slot" :data="item" :name="item.slot"/>
                <template v-else>{{ item.label }}</template>
            </div>
        </li>
    </ul>
</template>

<script>
export default {
    name: 'tab-bar',
    props: {
        tabs: {
            type: Array,
            default() {
                return [];
            }
        },
        modelValue: {
            type: Number,
            default: 1
        }
    },
    emits: ['update:modelValue', 'change'],
    methods: {
        handleSelect(val) {
            this.$emit('update:modelValue', val);
            this.$emit('change', val);
        }
    }
};
</script>

<style lang="scss">
@import "common/style/static";

.m-tab-bar {
    white-space: nowrap;
    display: flex;
    box-shadow: inset 0px -0.5px 0px rgba(203, 201, 211, 0.5);
    height: 120px;
    box-sizing: border-box;

    .tab {
        height: 100%;

        .label {
            padding: 0 10px;
            @include transition(all 0.3s);
            position: relative;
            font-size: $fs28;
            color: rgba($black, 0.2);

            &:before {
                content: '';
                width: 100%;
                height: 8px;
                background-color: rgba($purple, 0.3);
                @include transition(all 0.5s);
                z-index: 1;
                border-radius: 8px;
                position: absolute;
                left: 0;
                bottom: 2px;
                @include scaleX(0);
            }
        }

        &.selected {
            .label {
                font-size: $fs32;
                color: $black;
                font-weight: bold;

                &:before {
                    @include scaleX(1);
                }
            }
        }
    }
}
</style>
