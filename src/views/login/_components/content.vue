<template>
    <div class="login-h5-page">
        <div class="login-box">
            <!--    title    -->
            <div class="title flex-center">
                <img
                    alt=""
                    class="narwal-logo"
                    src="~assets/images/common/narwal-logo.svg"
                />
            </div>
            <!--        跳转栏        -->
            <div class="jump-box">
                <span
                    class="tab-item"
                    :class="{ 'login-active-color': type === 'pwd' }"
                    @click="changeType('pwd')"
                >
                    密码登录
                </span>
                <span class="tab-line">|</span>
                <span
                    class="tab-item"
                    :class="{ 'login-active-color': type === 'code' }"
                    @click="changeType('code')"
                >
                    短信登录
                </span>
            </div>
            <!--    form    -->
            <form-model ref="form" class="form" :rules="rules" :model="form">
                <!--      手机号码      -->
                <form-model-item class="l-input flex-left" prop="mobile">
                    <input v-model="form.mobile" class="u-input" placeholder="请输入手机号码"/>
                </form-model-item>
                <!--      验证码      -->
                <form-model-item
                    v-if="type === 'code'"
                    class="l-input-last flex-left"
                    prop="verification">
                    <input
                        v-model="form.verification"
                        class="u-input"
                        type="number"
                        :maxlength="6"
                        placeholder="6位数字验证码"
                        @input="handleInput"
                    />
                    <verify-code
                        :url="$api.getV2SmsCode"
                        :phone="form.mobile"
                        :code="form.code_type"
                    />
                </form-model-item>
                <!--      密码      -->
                <form-model-item
                    v-if="type === 'pwd'"
                    class="l-input-last flex-left"
                    prop="password">
                    <login-password v-model="form.password" placeholder="请输入密码"/>
                </form-model-item>
                <!--      提交      -->
                <div class="submit-wrap">
                    <n-button
                        class="submit-button"
                        type="primary"
                        size="large"
                        round
                        @tap="handleLogin"
                    >
                        登录
                    </n-button>
                </div>
                <!--      用户协议      -->
                <div
                    class="check-policy flex-top"
                    :class="{ checked: form.check }"
                    @click="form.check = !form.check">
                    <i :class="`icon-${form.check  ? 'circle-success' : 'round'}`" class="iconfont"></i>
                    <div>
                        <span @click.stop="form.check = !form.check">勾选表示您同意</span>
                        <span
                            @click.stop="handleToPact('service')"
                            class="href">云鲸用户使用协议、
                        </span>
                        <span
                            @click.stop="handleToPact('privacy')"
                            class="href">隐私政策
                        </span>
                    </div>
                </div>
            </form-model>
        </div>
    </div>
</template>

<script>
import formModel from 'common/components/form-model';
import formModelItem from 'common/components/form-model-item';
import verifyCode from 'common/components/verify-code';
import {
    SMS_AREA_CODE,
    SMS_CODE_TYPE,
    SYSTEM_USER_PLATFORM,
    SYSTEM_USER_PLATFORM_VERSION
} from 'common/util/constant';
import loginPassword from './login-password';

export default {
    name: 'login-content',
    components: {
        formModel,
        formModelItem,
        loginPassword,
        verifyCode
    },
    data() {
        return {
            type: 'code', // code-验证码登录，pwd：密码登录
            form: {
                area_code: SMS_AREA_CODE,
                mobile: '',
                verification: '',
                password: '',
                code_type: SMS_CODE_TYPE.login,
                check: false
            },
            rules: {
                mobile: [
                    { required: true, message: '请输入手机号' },
                    { pattern: /^(1[0-9]{1}[0-9]{1}[0-9]{8})$/, message: '请输入正确的手机号' }
                ],
                verification: [
                    { required: true, message: '请输入验证码' },
                    { pattern: /^(\d+)$/, message: '请输入正整数' }
                ],
                password: [
                    { required: true, message: '请输入密码' }
                ]
            }
        };
    },
    methods: {
        /**
         * @description: 登录操作
         */
        async handleLogin({ loading }) {
            if (!await this.$refs.form.validate()) {
                return false;
            }

            if (!this.form.check) {
                return this.$layer.confirm('还未勾选用户协议,是否勾选?')
                    .then(res => {
                        this.form.check = true;
                    });
            }

            let params = {};
            const url = this.type === 'code' ? this.$api.phoneCodeLogin : this.$api.phonePwdLogin;
            if (this.type === 'code') {
                params = { ...this.form };
                delete params.password;
            } else {
                params = {
                    area_code: this.form.area_code,
                    mobile: this.form.mobile,
                    password: this.form.password,
                    last_login_system: SYSTEM_USER_PLATFORM,
                    last_login_app_version: SYSTEM_USER_PLATFORM_VERSION,
                    source: 2
                };
            }

            const [res, err] = await this.$http.awaitTo(
                this.$http.lock.post(url, params, {
                    loading
                })
            );

            if (err) {
                return false;
            }

            this.$store.commit('UPDATE_USERINFO', res.data);

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
                    if (query.type === 'replace') {
                        return this.$router.replace(url);
                    } else {
                        return this.$router.push(url);
                    }
                }
            }

            return this.$router.push('/index');
        },
        /// 更换登录方式
        changeType(type) {
            this.type = type;
        },
        /// 前往协议
        handleToPact(name) {
            this.$router.push(`/spread/policy?pageKeyword=${name}`);
        },
        handleInput(e) {
            let value = e.target?.value;
            if (value.length > 6) {
                value = value.slice(0, 6);
                this.form.verification = value;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'common/style/static';

.login-h5-page {
    padding: 0 80px;

    .login-box {
    }

    .title {
        position: relative;
        padding-top: 80px;
        padding-bottom: 150px;
        margin-bottom: 15px;

        .narwal-logo {
            width: 520px;
        }
    }

    .form {
        position: relative;

        .pwd-text {
            padding: 20px 0;

            .text {
                font-size: $fs32;
                color: $purple;
            }
        }

        .l-input, .l-input-last {
            box-sizing: border-box;
            height: 112px;
            padding: 0 56px;
            border-radius: 56px;
            font-size: 32px;
            background-color: $input-disabled;
            margin-bottom: 32px;
        }

        .l-input-last {
            margin-bottom: 0;
        }

        .m-verify-code {
            font-size: $fs32;
        }

        .u-input {
            font-size: $fs32;
            flex: 1;
            border: 0 none;
            background: none;
            width: 100%;
        }

        .submit-wrap {
            padding-top: 140px;
            padding-bottom: 40px;
        }

        .submit-button {
            width: 100%;
            margin-bottom: 20px;
        }
    }

    .jump-box {
        padding-bottom: 100px;

        .tab-item, .tab-line {
            font-size: $fs32;
            color: rgba($black, 0.3);
        }

        .login-active-color {
            color: $black;
            font-weight: bold;
        }
    }

    .check-policy {
        line-height: 40px;
        margin: 54px 0 12px;
        font-size: $fs26;
        color: rgba($black, 0.6);
        font-weight: 400;

        &.checked {
            .iconfont {
                color: $purple;
            }
        }

        .iconfont {
            font-size: $fs40;
            margin-right: 8px;
        }

        .href {
            color: $purple;
        }
    }
}
</style>
