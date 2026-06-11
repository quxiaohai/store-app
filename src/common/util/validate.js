import regular from 'lib/form/regular';

/// 校验手机号
export const validateMobile = [
    { required: true, message: '请输入手机号' },
    { pattern: /^(1[0-9]{1}[0-9]{1}[0-9]{8})$/, message: '请输入正确的手机号' }
];

/// 邮箱校验
export const validateEmail = [
    {
        required: true,
        validator: (rules, value, callback) => {
            if (!value) {
                return callback('请输入邮箱');
            } else if (!regular.email(value)) {
                return callback('请输入正确的邮箱');
            } else {
                callback();
            }
        }
    }
];

/// 验证码校验
export const validateVerify = [
    {
        required: true,
        validator: (rules, value, callback) => {
            if (!value) {
                return callback('请输入验证码');
            } else if (!regular.verify(value)) {
                return callback('请输入正确的验证码');
            } else {
                callback();
            }
        }
    }
];

/// 姓名校验
export const validatePersonName = [
    { required: true, message: '请输入姓名' }
];

/// 详细地址校验
export const validateAddress = [
    { required: true, message: '请输入详细地址' }
];

/// 详细地址校验 narwal day
export const validateNarwowAddress = [
    {
        required: true,
        validator: (rules, value, callback) => {
            if (!value) {
                return callback('请输入详细地址');
            } else if (value.length < 3) {
                return callback('详细地址长度为3~100个字符');
            } else {
                callback();
            }
        }
    }
];

/// 密码校验
export const validatePassword = [
    {
        required: true,
        validator: (rules, value, callback) => {
            if (!value) {
                return callback('请输入密码');
            } else if (!regular.password(value)) {
                return callback('请输入8-12位含字母和数字的字符');
            } else {
                callback();
            }
        }
    }
];
