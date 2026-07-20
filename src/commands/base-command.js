/**
 * Base Command Class
 * All commands should extend this class
 */

const logger = require('../services/logger');

class BaseCommand {
  constructor(bot, storage, config) {
    this.bot = bot;
    this.storage = storage;
    this.config = config;
    this.name = this.constructor.name.replace('Command', '').toLowerCase();
    this.logger = logger.withContext({ command: this.name });
  }

  /**
   * Execute the command
   * Must be implemented by subclasses
   * @param {Object} ctx - Telegraf context
   */
  async execute(ctx) {
    throw new Error('execute() must be implemented by subclass');
  }

  /**
   * Get command description
   * Override in subclass
   */
  getDescription() {
    return 'No description available';
  }

  /**
   * Check if command requires authorization
   * Override in subclass
   */
  requiresAuth() {
    return true;
  }

  /**
   * Reply with error message
   */
  async replyError(ctx, message) {
    this.logger.error(`Command error: ${message}`);
    await ctx.reply(`❌ Error: ${message}`);
  }

  /**
   * Reply with success message
   */
  async replySuccess(ctx, message) {
    await ctx.reply(`✅ ${message}`);
  }

  /**
   * Reply with info message
   */
  async replyInfo(ctx, message) {
    await ctx.reply(`ℹ️ ${message}`);
  }
}

module.exports = BaseCommand;