/**
 * /start Command
 * Introduces the bot to the user
 */

const BaseCommand = require('./base-command');
const { getConfig } = require('../config');
const { version } = require('../../package.json');

class StartCommand extends BaseCommand {
  constructor(bot, storage) {
    super(bot, storage, getConfig());
    this.name = 'start';
  }

  async execute(ctx) {
    const message = `
🚀 <b>Welcome to ScoutFlow!</b>

Your personal freelance lead discovery assistant.

<b>What I do:</b>
• Monitor Facebook groups for potential clients
• Score posts based on your keywords
• Send you Telegram notifications for promising leads

<b>Quick Commands:</b>
/help - Show all available commands
/ping - Check if I'm responsive
/status - View current monitoring status
/version - Show application version

<b>Version:</b> v${version}

Get started by configuring your target groups and keywords.
Type /help to see all available commands.
    `.trim();

    await ctx.reply(message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });

    this.logger.info(`Start command executed for user ${ctx.from.id}`);
  }

  getDescription() {
    return 'Start the bot and get introduction';
  }
}

module.exports = StartCommand;