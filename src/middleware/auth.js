/**
 * Authentication Middleware
 * Restricts bot commands to authorized admin users
 */

const logger = require('../services/logger');

/**
 * Authorization middleware for Telegraf
 * Checks if the user is the configured admin
 */
function authorizeAdmin(ctx, next) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const userId = ctx.from?.id?.toString();

  if (!adminChatId) {
    logger.error('TELEGRAM_ADMIN_CHAT_ID not configured');
    ctx.reply('⚠️ Bot is not properly configured. Please contact the administrator.');
    return;
  }

  if (userId !== adminChatId) {
    logger.warn(`Unauthorized access attempt from user: ${userId} (${ctx.from?.username || 'unknown'})`);
    ctx.reply('⛔ Unauthorized. This bot is for personal use only.');
    return;
  }

  logger.debug(`Authorized command from admin: ${userId}`);
  return next();
}

/**
 * Middleware that logs all commands
 */
function logCommands(ctx, next) {
  const userId = ctx.from?.id;
  const username = ctx.from?.username || 'unknown';
  const command = ctx.message?.text;

  if (command && command.startsWith('/')) {
    logger.info(`Command received: ${command} from user ${userId} (${username})`);
  }

  return next();
}

module.exports = {
  authorizeAdmin,
  logCommands
};