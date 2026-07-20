/**
 * /ping Command
 * Health check for bot responsiveness
 */

const BaseCommand = require('./base-command');

class PingCommand extends BaseCommand {
  constructor(bot, storage) {
    super(bot, storage);
    this.name = 'ping';
  }

  async execute(ctx) {
    const startTime = Date.now();

    // Get bot info
    const botInfo = await this.bot.telegram.getMe();

    // Calculate response time
    const responseTime = Date.now() - startTime;

    const message = `
🏓 <b>Pong!</b>

<b>Bot:</b> @${botInfo.username}
<b>Response time:</b> ${responseTime}ms
<b>Status:</b> ✅ Online
<b>Node.js:</b> ${process.version}
    `.trim();

    await ctx.reply(message, {
      parse_mode: 'HTML'
    });

    this.logger.debug(`Ping command executed: ${responseTime}ms`);
  }

  getDescription() {
    return 'Check bot responsiveness';
  }
}

module.exports = PingCommand;