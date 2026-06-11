<template>
    <view class="cover" :class="{done}">
        <image v-show="done" :src="url" @load="handleIconSuc" class="photo"/>
    </view>
</template>

<script>
export default {
    name: 'photo',
    props: {
        url: String
    },
    data() {
        return {
            done: false
        };
    },
    methods: {
        handleIconSuc() {
            this.done = true;
        }
    }
};
</script>
