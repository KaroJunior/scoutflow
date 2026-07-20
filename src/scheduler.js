/**
 * Task Scheduler
 * Manages recurring scan tasks using node-cron
 */

const cron = require('node-cron');
const logger = require('./services/logger');
const { getScannerRegistry } = require('./scanners');
const { processLeads } = require('./scoring');

class Scheduler {
  constructor(config) {
    this.config = config;
    this.bot = config.bot;
    this.storage = config.storage;
    this.task = null;
    this.isRunning = false;
    this.scannerRegistry = getScannerRegistry();
    console.log('[DEBUG Scheduler] 1. Scheduler constructor complete');
  }

  async start() {
    console.log('[DEBUG Scheduler] 2. Entering start()');
    if (this.isRunning) {
      logger.warn('Scheduler is already running');
      return;
    }

    const cronExpression = process.env.SCAN_INTERVAL_CRON || '*/5 * * * *';

    logger.info(`Starting scheduler with cron: ${cronExpression}`);
    console.log(`[DEBUG Scheduler] 3. Cron expression: ${cronExpression}`);

    console.log('[DEBUG Scheduler] 4. Scheduling cron task...');
    this.task = cron.schedule(cronExpression, async () => {
      await this._runScanCycle();
    });
    console.log('[DEBUG Scheduler] 5. Cron task scheduled');

    // Run immediately on start
    console.log('[DEBUG Scheduler] 6. Running initial scan cycle...');
    logger.info('Running initial scan cycle...');
    await this._runScanCycle();
    console.log('[DEBUG Scheduler] 7. Initial scan cycle completed');

    this.isRunning = true;
    console.log('[DEBUG Scheduler] 8. Scheduler started');
  }

  async stop() {
    if (!this.isRunning) {
      logger.warn('Scheduler is not running');
      return;
    }

    if (this.task) {
      this.task.stop();
    }

    this.isRunning = false;
    logger.info('Scheduler stopped');
  }

  async _runScanCycle() {
    const startTime = Date.now();
    console.log('[DEBUG Scheduler] _runScanCycle: Starting');
    logger.info('🔄 Starting scan cycle...');

    try {
      // Get all active scanners
      console.log('[DEBUG Scheduler] _runScanCycle: Getting active scanners...');
      const activeScanners = this.scannerRegistry.getActive();
      console.log(`[DEBUG Scheduler] _runScanCycle: Found ${activeScanners.length} active scanners`);

      if (activeScanners.length === 0) {
        logger.warn('No active scanners found');
        return;
      }

      let totalLeads = 0;
      let totalProcessed = 0;

      // Run each scanner
      for (const scanner of activeScanners) {
        try {
          console.log(`[DEBUG Scheduler] _runScanCycle: Running scanner: ${scanner.platform}`);
          logger.info(`📡 Running scanner: ${scanner.platform}`);

          // Setup scanner
          console.log(`[DEBUG Scheduler] _runScanCycle: Setting up ${scanner.platform}...`);
          await scanner.setup();
          console.log(`[DEBUG Scheduler] _runScanCycle: ${scanner.platform} setup complete`);

          // Scan for new content
          console.log(`[DEBUG Scheduler] _runScanCycle: Scanning ${scanner.platform}...`);
          const results = await scanner.scan();
          console.log(`[DEBUG Scheduler] _runScanCycle: ${scanner.platform} scan complete, found ${results.length} results`);

          if (results.length > 0) {
            logger.info(`Found ${results.length} results from ${scanner.platform}`);

            // Process the results
            console.log(`[DEBUG Scheduler] _runScanCycle: Processing ${results.length} leads...`);
            const processed = await processLeads({
              leads: results,
              scanner: scanner,
              storage: this.storage,
              bot: this.bot,
              minScore: parseInt(process.env.MIN_SCORE_THRESHOLD) || 30
            });
            console.log(`[DEBUG Scheduler] _runScanCycle: Processed ${processed} leads`);

            totalLeads += results.length;
            totalProcessed += processed;
          }

          // Cleanup scanner
          console.log(`[DEBUG Scheduler] _runScanCycle: Tearing down ${scanner.platform}...`);
          await scanner.teardown();
          console.log(`[DEBUG Scheduler] _runScanCycle: ${scanner.platform} teardown complete`);
        } catch (error) {
          console.error(`[DEBUG Scheduler] _runScanCycle: Scanner ${scanner.platform} failed:`, error);
          logger.error(`Scanner ${scanner.platform} failed:`, error);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`[DEBUG Scheduler] _runScanCycle: Complete in ${duration}ms`);
      logger.info(`✅ Scan cycle completed: ${totalLeads} leads, ${totalProcessed} processed, ${duration}ms`);
    } catch (error) {
      console.error('[DEBUG Scheduler] _runScanCycle: Scan cycle failed:', error);
      logger.error('Scan cycle failed:', error);
    }
  }
}

let schedulerInstance = null;

async function initializeScheduler(config) {
  console.log('[DEBUG Scheduler] initializeScheduler: Entering');
  if (schedulerInstance) {
    logger.warn('Scheduler already initialized');
    return schedulerInstance;
  }

  console.log('[DEBUG Scheduler] initializeScheduler: Creating new instance');
  schedulerInstance = new Scheduler(config);
  console.log('[DEBUG Scheduler] initializeScheduler: Returning instance');
  return schedulerInstance;
}

function getScheduler() {
  if (!schedulerInstance) {
    throw new Error('Scheduler not initialized');
  }
  return schedulerInstance;
}

module.exports = {
  Scheduler,
  initializeScheduler,
  getScheduler
};