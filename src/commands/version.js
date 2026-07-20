/**
 * /version Command
 * Shows application version information
 */

const BaseCommand = require('./base-command');
const { version, name, description } = require('../../package.json');

class VersionCommand extends BaseCommand {
  constructor(bot, storage) {
    super(bot, storage);
    this.name = 'version';
  }

  async execute(ctx) {
    const message = `
📦 <b>ScoutFlow</b>

<b>Name:</b> ${name}
<b>Version:</b> v${version}
<b>Description:</b> ${description}

<b>Dependencies:</b>
• Telegraf: v${require('telegraf/package.json').version}
• Winston: v${require('winston/package.json').version}
• node-cron: v${require('node-cron/package.json').version}

<b>System:</b>
• Node.js: ${process.version}
• Platform: ${process.platform}
• Architecture: ${process.arch}

<b>Build Date:</b> ${new Date().toISOString().split('T')[0]}
    `.trim();

    await ctx.reply(message, {
      parse_mode: 'HTML'
    });

    this.logger.debug('Version command executed');
  }

  getDescription() {
    return 'Show application version';
  }
}

module.exports = VersionCommand;