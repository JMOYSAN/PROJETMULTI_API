const { securityLogger } = require('../utils/logger');

const sanitizeData = (data) => {
    if (!data) return data;

    const sensitive = ['password', 'token', 'accessToken', 'refreshToken', 'secret'];
    const sanitized = { ...data };

    sensitive.forEach(key => {
        if (sanitized[key]) {
            sanitized[key] = '***REDACTED***';
        }
    });

    return sanitized;
};

const logSensitiveAccess = (action) => {
    return (req, res, next) => {
        const logData = {
            timestamp: new Date().toISOString(),
            action,
            userId: req.user?.id || 'anonymous',
            username: req.user?.username || 'anonymous',
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            method: req.method,
            url: req.originalUrl,
            body: sanitizeData(req.body),
            query: req.query,
        };

        securityLogger.info('Sensitive access', logData);

        const originalSend = res.send;
        res.send = function(data) {
            if (res.statusCode >= 400) {
                securityLogger.warn('Sensitive access failed', {
                    ...logData,
                    statusCode: res.statusCode,
                    responseError: typeof data === 'string' ? data.substring(0, 200) : data
                });
            }
            originalSend.call(this, data);
        };

        next();
    };
};

const logFailedAuth = (req, identifier, reason) => {
    securityLogger.warn('Failed authentication attempt', {
        timestamp: new Date().toISOString(),
        identifier: identifier || 'unknown',
        reason,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        method: req.method,
        url: req.originalUrl
    });
};

const logCriticalAction = (req, action, details = {}) => {
    securityLogger.warn('Critical action', {
        timestamp: new Date().toISOString(),
        action,
        userId: req.user?.id,
        username: req.user?.username,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        ...details
    });
};

module.exports = {
    logSensitiveAccess,
    logFailedAuth,
    logCriticalAction,
    sanitizeData
};