<template>
    <view class="m-views-login">
        <app-content/>
    </view>
</template>

<script>
import appContent from './_components/content';

export default {
    name: 'Login',
    components: { appContent }
};
</script>