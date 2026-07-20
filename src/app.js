/**
 * ScoutFlow - Application Entry Point
 * Personal lead discovery bot
 */

require('dotenv').config();

const { validateEnvironment, validateStartup } = require('./config');
const logger = require('./services/logger');
const { initializeBot } = require('./bot');
const { initializeScheduler } = require('./scheduler');
const { createStorageAdapter } = require('./adapters/firebase-adapter');

class ScoutFlow {
  constructor() {
    this.bot = null;
    this.scheduler = null;
    this.storage = null;
    this.isRunning = false;
  }

  async start() {
    try {
      logger.info('🚀 Starting ScoutFlow...');
      console.log('[DEBUG] 1. Starting ScoutFlow...');

      // 1. Validate environment variables
      console.log('[DEBUG] 2. Validating environment...');
      const envValid = validateEnvironment();
      if (!envValid) {
        throw new Error('Environment validation failed. Check .env file.');
      }
      console.log('[DEBUG] 3. Environment validated.');

      // 2. Validate startup conditions
      console.log('[DEBUG] 4. Validating startup conditions...');
      const startupValid = await validateStartup();
      if (!startupValid) {
        throw new Error('Startup validation failed. Check system requirements.');
      }
      console.log('[DEBUG] 5. Startup conditions validated.');

      // 3. Initialize storage (Firebase)
      console.log('[DEBUG] 6. Creating storage adapter...');
      this.storage = createStorageAdapter(process.env.NODE_ENV);
      console.log('[DEBUG] 7. Storage adapter created. Initializing...');
      await this.storage.initialize();
      logger.info('Storage adapter initialized');
      console.log('[DEBUG] 8. Storage adapter initialized.');

      // 4. Initialize Telegram bot (pass storage for command registry)
      console.log('[DEBUG] 9. Starting initializeBot...');
      this.bot = await initializeBot(this.storage);
      logger.info('Telegram bot initialized');
      console.log('[DEBUG] 10. Bot initialized.');

      // 5. Initialize scheduler
      console.log('[DEBUG] 11. Starting initializeScheduler...');
      this.scheduler = await initializeScheduler({
        bot: this.bot,
        storage: this.storage
      });
      logger.info('Scheduler initialized');
      console.log('[DEBUG] 12. Scheduler initialized.');

      // 6. Start everything
      console.log('[DEBUG] 13. Starting scheduler...');
      await this.scheduler.start();
      this.isRunning = true;
      console.log('[DEBUG] 14. Scheduler started.');

      logger.info(`✅ ScoutFlow is running in ${process.env.NODE_ENV} mode`);
      logger.info(`📡 Telegram bot: @${this.bot.botInfo.username}`);
      logger.info(`⏰ Scan schedule: ${process.env.SCAN_INTERVAL_CRON}`);
      logger.info(`📋 Monitoring ${process.env.FACEBOOK_GROUPS.split(',').length} Facebook groups`);
      console.log('[DEBUG] 15. All startup complete.');

      // 7. Graceful shutdown handlers
      this._setupShutdownHandlers();

      return this;
    } catch (error) {
      logger.error('❌ Failed to start ScoutFlow:', error);
      console.error('[DEBUG] Startup error:', error);
      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) return;

    logger.info('🛑 Shutting down ScoutFlow...');

    try {
      if (this.scheduler) {
        await this.scheduler.stop();
      }

      if (this.bot) {
        await this.bot.stop();
      }

      if (this.storage) {
        await this.storage.close();
      }

      this.isRunning = false;
      logger.info('✅ ScoutFlow stopped gracefully');
    } catch (error) {
      logger.error('Error during shutdown:', error);
      throw error;
    }
  }

  _setupShutdownHandlers() {
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection:', reason);
      shutdown('unhandledRejection');
    });
  }
}

// Run the application
if (require.main === module) {
  const app = new ScoutFlow();

  app.start().catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ScoutFlow;