export class HttpError extends Error {
    constructor(status, message, details = null) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

export function asyncHandler(handler) {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}

export function ok(res, data = null, message = 'success') {
    res.json({
        code: 1,
        message,
        data
    });
}

export function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const isMysqlConnectionError = ['ECONNREFUSED', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR'].includes(err.code);
    const status = err.status || (isMysqlConnectionError ? 503 : 500);
    const message = isMysqlConnectionError
        ? 'MySQL 连接失败，请检查数据库服务和 .env.local 配置'
        : (status >= 500 ? 'server error' : err.message);
    if (status >= 500) {
        console.error(err);
    }

    res.status(status).json({
        code: 0,
        message,
        details: err.details || undefined
    });
}
