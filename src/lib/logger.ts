import pino from 'pino';

// Safe log level determination without process.env in browser
const getLogLevel = () => {
  if (typeof process !== 'undefined' && process.env && process.env.LOG_LEVEL) {
    const validLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];
    const envLevel = process.env.LOG_LEVEL.toLowerCase();
    return validLevels.includes(envLevel) ? envLevel : 'info';
  }
  return 'info';
};

const logger = pino({
  level: getLogLevel(),
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard',
    },
  },
});

export default logger;
