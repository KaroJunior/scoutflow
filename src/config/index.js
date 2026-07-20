// src/config/index.js
const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const logger = require('../services/logger');

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  TELEGRAM_BOT_TOKEN: Joi.string().required(),
  TELEGRAM_ADMIN_CHAT_ID: Joi.string().required(),
  FACEBOOK_LOGIN: Joi.string().required(),
  FACEBOOK_PASSWORD: Joi.string().required(),
  FACEBOOK_SESSION_PATH: Joi.string().default('./sessions/facebook-session.json'),
  FACEBOOK_GROUPS: Joi.string().required(),
  FIREBASE_PROJECT_ID: Joi.string().required(),
  FIREBASE_CLIENT_EMAIL: Joi.string().required(),
  FIREBASE_PRIVATE_KEY: Joi.string().required(),
  FIREBASE_DATABASE_URL: Joi.string().uri().required(),
  SCAN_INTERVAL_CRON: Joi.string().default('*/5 * * * *'),
  MIN_SCORE_THRESHOLD: Joi.number().min(0).max(100).default(30),
  MAX_POSTS_PER_SCAN: Joi.number().min(1).default(20),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_FILE_PATH: Joi.string().default('./logs/app.log')
}).unknown();

function validateEnvironment() {
  try {
    const { error, value } = envSchema.validate(process.env);

    if (error) {
      logger.error('❌ Environment validation failed:', error.details.map(d => d.message).join(', '));
      return false;
    }

    const sanitized = { ...value };
    if (sanitized.TELEGRAM_BOT_TOKEN) {
      sanitized.TELEGRAM_BOT_TOKEN = '***REDACTED***';
    }
    if (sanitized.FIREBASE_PRIVATE_KEY) {
      sanitized.FIREBASE_PRIVATE_KEY = '***REDACTED***';
    }
    if (sanitized.FACEBOOK_PASSWORD) {
      sanitized.FACEBOOK_PASSWORD = '***REDACTED***';
    }
    logger.debug('Environment validated:', sanitized);

    return true;
  } catch (error) {
    logger.error('Environment validation error:', error);
    return false;
  }
}

async function validateStartup() {
  try {
    const logDir = path.dirname(process.env.LOG_FILE_PATH || './logs/app.log');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
      logger.info(`Created log directory: ${logDir}`);
    }

    const sessionDir = path.dirname(process.env.FACEBOOK_SESSION_PATH || './sessions/facebook-session.json');
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
      logger.info(`Created sessions directory: ${sessionDir}`);
    }

    const firebaseKeyPath = path.join(process.cwd(), 'firebase', 'service-account.json');
    if (!fs.existsSync(firebaseKeyPath)) {
      logger.warn('Firebase service account file not found at:', firebaseKeyPath);
      logger.warn('Will attempt to use environment variables for Firebase configuration');
    }

    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 18) {
      logger.warn('Node.js version 18 or higher is recommended');
    }

    const requiredVars = [
      'TELEGRAM_BOT_TOKEN',
      'TELEGRAM_ADMIN_CHAT_ID',
      'FACEBOOK_LOGIN',
      'FACEBOOK_PASSWORD',
      'FACEBOOK_GROUPS',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_DATABASE_URL'
    ];
    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
      logger.error(`Missing required environment variables: ${missing.join(', ')}`);
      return false;
    }

    logger.info('✅ Startup validation passed');
    return true;
  } catch (error) {
    logger.error('Startup validation error:', error);
    return false;
  }
}

function getConfig() {
  return {
    env: process.env.NODE_ENV,
    telegram: {
      token: process.env.TELEGRAM_BOT_TOKEN,
      adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID
    },
    facebook: {
      login: process.env.FACEBOOK_LOGIN,
      password: process.env.FACEBOOK_PASSWORD,
      sessionPath: process.env.FACEBOOK_SESSION_PATH || './sessions/facebook-session.json',
      groups: process.env.FACEBOOK_GROUPS.split(',').map(g => g.trim())
    },
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      databaseUrl: process.env.FIREBASE_DATABASE_URL
    },
    scan: {
      cron: process.env.SCAN_INTERVAL_CRON,
      minScore: parseInt(process.env.MIN_SCORE_THRESHOLD) || 30,
      maxPosts: parseInt(process.env.MAX_POSTS_PER_SCAN) || 20
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      filePath: process.env.LOG_FILE_PATH || './logs/app.log'
    }
  };
}

module.exports = {
  validateEnvironment,
  validateStartup,
  getConfig
};