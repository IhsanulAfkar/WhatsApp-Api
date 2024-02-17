import pino from 'pino';
import fs from 'fs'
const isDevelopment = process.env.NODE_ENV === 'development';

const pinoPretty = isDevelopment
    ? {
        transport: {
            target: 'pino-pretty',
            options: { colorize: true },
        },
    }
    : undefined;

const logger = pino({
    level: process.env.LOG_LEVEL || 'debug',
    formatters: {
        bindings: (bindings) => {
            return {
                pid: bindings.pid,
                host: bindings.hostname,
                node_version: process.version,
            };
        },
        level(level) {
            return { level: level.toUpperCase() };
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    ...pinoPretty,
}, pino.destination({
    // dest: './logger.log'
    fd: fs.openSync('logger.txt', 'a')
}));

export default logger
