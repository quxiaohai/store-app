import md5 from 'lib/str/md5';

/// 获取商城私有校验
export function getUploadPrivate(path) {
    const time = Date.now();
    return {
        'MALL-SIGN': md5(path, 'narwal-mall-api-key-' + time),
        'MALL-TIMESTAMP': time
    };
}
