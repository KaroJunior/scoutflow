/**
 * /help Command
 * Shows all available commands
 */

const BaseCommand = require('./base-command');
const { getCommands } = require('../config/commands');

class HelpCommand extends BaseCommand {
  constructor(bot, storage) {
    super(bot, storage);
    this.name = 'help';
  }

  async execute(ctx) {
    const commands = getCommands();
    const categories = {};

    // Group commands by category
    for (const [key, cmd] of Object.entries(commands)) {
      if (!categories[cmd.category]) {
        categories[cmd.category] = [];
      }
      categories[cmd.category].push(`/${cmd.name} - ${cmd.description}`);
    }

    // Build help message
    let message = '📚 <b>ScoutFlow Commands</b>\n\n';

    const categoryEmojis = {
      general: '📌',
      monitoring: '📊',
      facebook: '📘',
      scoring: '🎯',
      administration: '⚙️'
    };

    for (const [category, commands] of Object.entries(categories)) {
      const emoji = categoryEmojis[category] || '📁';
      message += `<b>${emoji} ${category.charAt(0).toUpperCase() + category.slice(1)}</b>\n`;
      message += commands.join('\n');
      message += '\n\n';
    }

    message += '💡 <b>More commands coming soon:</b>\n';
    message += '• /groups - Manage monitored groups\n';
    message += '• /keywords - Configure keywords\n';
    message += '• /services - Enable/disable platforms\n';
    message += '• /settings - View and modify settings\n';
    message += '• /stats - Detailed statistics';

    await ctx.reply(message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });

    this.logger.info(`Help command executed for user ${ctx.from.id}`);
  }

  getDescription() {
    return 'Show all available commands';
  }
}

module.exports = HelpCommand;