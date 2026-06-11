<template>
    <div class="m-verify-code" :class="{ loading, running }" @click="sendHandler">
        {{ running ? times + '(S)' : sent ? '重新发送' : '获取验证码' }}
    </div>
</template>
<script>
import regular from 'lib/form/regular';
import { SMS_AREA_CODE } from 'common/util/constant';

const times = 60;

export default {
    name: 'verify-code',
    props: {
        url: Object,
        phone: String,
        code: Number
    },
    data() {
        return {
            loading: false,
            running: false,
            sent: false,
            timer: null,
            times: times
        };
    },
    methods: {
        sendHandler() {
            const isPhone = regular.mobile(this.phone);
            if (isPhone && !this.loading && !this.running) {
                this.loading = true;
                this.$http.lock.post(this.url, {
                    area_code: SMS_AREA_CODE,
                    mobile: this.phone,
                    code_type: this.code
                }).then(() => {
                    this.sent = true;
                    this.startTimer();
                    this.$layer.toast('发送成功');
                }).finally(() => {
                    this.loading = false;
                });
            } else {
                if (!isPhone) this.$layer.toast('请输入正确的手机号');
            }
        },
        startTimer() {
            this.running = true;
            this.times = times;
            this.timer = setInterval(() => {
                this.times--;
                if (this.times <= 0) {
                    this.running = false;
                    this.times = times;
                    clearInterval(this.timer);
                }
            }, 1000);
        }
    }
};
</script>
<style lang="scss" scoped>
@import 'common/style/static';

.m-verify-code {
    color: $purple;
    white-space: nowrap;

    &.loading {
        opacity: 0.6;
    }

    &.running {
        color: $gray-light;
    }
}
</style>
