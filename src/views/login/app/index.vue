<template>
    <loading :visible="true"/>
</template>

<script>
import loading from 'common/components/loading';
import bridge from 'common/util/bridge';

export default {
    name: 'login-app',
    mounted() {
        this.onLoginApp();
    },
    components: {
        loading
    },
    methods: {
        async onLoginApp() {
            const data = await bridge.getUserInfo();
            if (!data) {
                return this.$router.replace({
                    path: '/login',
                    query: this.$route.query
                });
            }

            this.$store.commit('UPDATE_USERINFO', data);
            this.redirectPath();
        },
        /*****
         * 重定向路径
         */
        redirectPath() {
            const query = this.$route.query;
            const url = query.url ? decodeURIComponent(query.url) : null;
            if (url) {
                if (!url.includes('/login') && !url.includes('%2F')) {
                    return this.$router.push({
                        path: url
                    });
                }
            }

            return this.$router.replace('/product/trial');
        }
    }
};
</script>

<style scoped>

</style>