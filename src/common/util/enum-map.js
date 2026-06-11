/**
 * 预约活动类型
 * tradein: 1
 */
export const SUBSCRIBE_TYPE = {
    tradeIn: 1
};

/**
 * 以旧换新-可取消预约状态 100（已接单）390（已下发）
 */
export const RECYCLE_CANCEL_STATUS_LIST = ['100', '390'];

/**
 * 以旧换新-可重新预约状态 100（已接单）390（已下发）480（已拦截）500（异常终止）530（拒收）690（已取消）
 */
export const RECYCLE_RESET_STATUS_LIST = ['100', '390', '480', '500', '530', '690'];
