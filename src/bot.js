/**
 * Telegram Bot Initialization
 * Sets up Telegraf bot with authentication middleware
 */

const { Telegraf } = require('telegraf');
const logger = require('./services/logger');
const { authorizeAdmin, logCommands } = require('./middleware/auth');
const { getCommandRegistry } = require('./commands');

let botInstance = null;

async function initializeBot(storage) {
  console.log('[DEBUG Bot] 1. Entering initializeBot');
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set in environment');
    }
    console.log('[DEBUG Bot] 2. Token found');

    const bot = new Telegraf(token);
    console.log('[DEBUG Bot] 3. Telegraf instance created');

    // Global error handling
    bot.catch((err, ctx) => {
      logger.error('Telegram bot error:', err);
      if (ctx) {
        ctx.reply('❌ An error occurred. Please try again later.');
      }
    });
    console.log('[DEBUG Bot] 4. Error handler set');

    // Middleware: Log all commands
    bot.use(logCommands);
    console.log('[DEBUG Bot] 5. logCommands middleware set');

    // Middleware: Authorization for all commands
    bot.use(authorizeAdmin);
    console.log('[DEBUG Bot] 6. authorizeAdmin middleware set');

    // Get command registry
    console.log('[DEBUG Bot] 7. Getting command registry...');
    const commandRegistry = getCommandRegistry(bot, storage);
    console.log('[DEBUG Bot] 8. Command registry retrieved');

    // Register command handlers
    const commands = commandRegistry.getAll();
    console.log(`[DEBUG Bot] 9. Got ${commands.length} commands`);
    for (const cmd of commands) {
      bot.command(cmd.name, (ctx) => {
        commandRegistry.execute(ctx, cmd.name);
      });
    }
    console.log('[DEBUG Bot] 10. Command handlers registered');

    // Callback handler for inline buttons
    bot.action(/ignore_(.+)/, async (ctx) => {
      try {
        const leadId = ctx.match[1];
        await storage.markIgnored(leadId);
        await ctx.answerCbQuery('✅ Lead ignored. You won\'t be notified about this one again.');
        await ctx.deleteMessage();
        logger.info(`Lead ignored: ${leadId}`);
      } catch (error) {
        logger.error('Error processing ignore callback:', error);
        await ctx.answerCbQuery('❌ Error ignoring lead. Please try again.', true);
      }
    });
    console.log('[DEBUG Bot] 11. Action handler set');

    // Start bot with explicit polling options
    console.log('[DEBUG Bot] 12. Starting bot.launch() with polling options...');
    
    // IMPORTANT: Use explicit polling mode and drop any existing webhook
    await bot.launch({
      dropPendingUpdates: true,  // Drop any pending updates
      webhook: undefined          // Explicitly disable webhook mode
    });
    
    console.log('[DEBUG Bot] 13. bot.launch() completed');

    // Get bot info
    console.log('[DEBUG Bot] 14. Getting bot info...');
    const botInfo = await bot.telegram.getMe();
    bot.botInfo = botInfo;
    console.log(`[DEBUG Bot] 15. Bot info: @${botInfo.username}`);

    botInstance = bot;

    logger.info(`Telegram bot launched as @${botInfo.username}`);
    logger.info(`Admin user ID: ${process.env.TELEGRAM_ADMIN_CHAT_ID}`);
    logger.info(`${commands.length} commands registered`);

    console.log('[DEBUG Bot] 16. Returning bot');
    return bot;
  } catch (error) {
    console.error('[DEBUG Bot] ERROR:', error);
    logger.error('Failed to initialize Telegram bot:', error);
    throw error;
  }
}

function getBot() {
  if (!botInstance) {
    throw new Error('Bot not initialized. Call initializeBot() first.');
  }
  return botInstance;
}

module.exports = {
  initializeBot,
  getBot
};