const logger = {
  info: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const metaStr = Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
      console.log(`\x1b[36m[${new Date().toISOString()}] [INFO]\x1b[0m ${message}${metaStr}`);
    } else {
      console.log(JSON.stringify({ level: 'info', timestamp: new Date().toISOString(), message, ...meta }));
    }
  },
  error: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const metaStr = Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
      console.error(`\x1b[31m[${new Date().toISOString()}] [ERROR]\x1b[0m ${message}${metaStr}`);
    } else {
      console.error(JSON.stringify({ level: 'error', timestamp: new Date().toISOString(), message, ...meta }));
    }
  },
  warn: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const metaStr = Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
      console.warn(`\x1b[33m[${new Date().toISOString()}] [WARN]\x1b[0m ${message}${metaStr}`);
    } else {
      console.warn(JSON.stringify({ level: 'warn', timestamp: new Date().toISOString(), message, ...meta }));
    }
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const metaStr = Object.keys(meta).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
      console.debug(`\x1b[35m[${new Date().toISOString()}] [DEBUG]\x1b[0m ${message}${metaStr}`);
    } else {
      // Avoid verbose logging in production if not explicitly needed
    }
  }
};

module.exports = logger;
