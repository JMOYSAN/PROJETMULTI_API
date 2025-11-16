const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'bobberchat-api' },
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join('logs', 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '30d',
            maxSize: '20m'
        }),
        new winston.transports.DailyRotateFile({
            filename: path.join('logs', 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
            maxSize: '20m'
        })
    ]
});

const securityLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { service: 'security' },
    transports: [
        new winston.transports.DailyRotateFile({
            filename: path.join('logs', 'security-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '90d',
            maxSize: '20m'
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

module.exports = { logger, securityLogger };