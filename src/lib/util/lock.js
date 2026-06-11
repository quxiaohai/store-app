/***********
 * 全局锁
 */
let _isLockMap = {
    _isLock: false
};

export const isLock = (uniqueId = '_isLock') => {
    return _isLockMap[uniqueId];
};
export const unLock = (uniqueId = '_isLock') => {
    _isLockMap[uniqueId] = false
};
export const lock = (uniqueId = '_isLock') => {
    _isLockMap[uniqueId] = true
};


