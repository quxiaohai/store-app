<template>
    <div v-if="show || !$store.state.isServerRender">
        <slot/>
    </div>
</template>

<script>
export default {
    name: 'client-view',
    data() {
        return {
            show: false
        };
    },
    mounted() {
        this.show = true;
    }
};
</script>
