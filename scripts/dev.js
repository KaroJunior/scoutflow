/**
 * Development Helper Script
 * Quick check of environment and configuration
 */

require('dotenv').config();
const logger = require('../src/services/logger');
const { validateEnvironment, validateStartup } = require('../src/config');

async function runDevCheck() {
  logger.info('🔧 ScoutFlow Development Check');

  console.log('\n📋 Environment:');
  console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`  TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? '✅ set' : '❌ missing'}`);
  console.log(`  TELEGRAM_ADMIN_CHAT_ID: ${process.env.TELEGRAM_ADMIN_CHAT_ID ? '✅ set' : '❌ missing'}`);
  console.log(`  SCAN_INTERVAL_CRON: ${process.env.SCAN_INTERVAL_CRON || 'not set (default: */15 * * * *)'}`);

  console.log('\n🔍 Validating...');

  const envValid = validateEnvironment();
  if (envValid) {
    console.log('✅ Environment valid');
  } else {
    console.log('❌ Environment invalid');
    return;
  }

  const startupValid = await validateStartup();
  if (startupValid) {
    console.log('✅ Startup checks passed');
  } else {
    console.log('❌ Startup checks failed');
    return;
  }

  console.log('\n✅ All checks passed. Ready to run.');
  console.log('Run: npm start');
}

runDevCheck().catch(console.error);