/**
 * /status Command
 * Shows application status and statistics
 */

const BaseCommand = require('./base-command');
const { getConfig } = require('../config');
const { version } = require('../../package.json');
const { getScheduler } = require('../scheduler');
const { getScannerRegistry } = require('../scanners');

class StatusCommand extends BaseCommand {
  constructor(bot, storage) {
    super(bot, storage, getConfig());
    this.name = 'status';
  }

  async execute(ctx) {
    const config = getConfig();
    const scannerRegistry = getScannerRegistry();
    const allScanners = scannerRegistry.getAll();
    const activeScanners = scannerRegistry.getActive();

    // Get scheduler status
    let schedulerStatus = 'Not started';
    let nextScan = 'Unknown';
    try {
      const scheduler = getScheduler();
      if (scheduler && scheduler.isRunning) {
        schedulerStatus = '✅ Running';
        // Note: In a full implementation, we'd get the next run time
        // For now, we'll show the cron schedule
        nextScan = config.scan.cron;
      }
    } catch (error) {
      schedulerStatus = '❌ Not initialized';
    }

    const message = `
📊 <b>ScoutFlow Status</b>

<b>Version:</b> v${version}
<b>Environment:</b> ${config.env}
<b>Status:</b> ✅ Online

<b>Scheduler:</b> ${schedulerStatus}
<b>Schedule:</b> ${nextScan}
<b>Min Score:</b> ${config.scan.minScore}

<b>Scanners:</b>
• Total: ${allScanners.length}
• Active: ${activeScanners.length}
${activeScanners.map(s => `  - ${s.platform}: ✅`).join('\n')}
${allScanners.filter(s => !activeScanners.includes(s)).map(s => `  - ${s.platform}: ⛔`).join('\n')}

<b>Storage:</b> Memory (in-memory)

<b>System:</b>
• Node: ${process.version}
• Platform: ${process.platform}
• Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
    `.trim();

    await ctx.reply(message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });

    this.logger.info('Status command executed');
  }

  getDescription() {
    return 'Show application status and statistics';
  }
}

module.exports = StatusCommand;