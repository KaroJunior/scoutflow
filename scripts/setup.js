#!/usr/bin/env node

/**
 * ScoutFlow Setup Script
 * Helps with initial configuration and testing
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

async function checkNodeVersion() {
  console.log(`${colors.cyan}📦 Checking Node.js version...${colors.reset}`);
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  if (major < 18) {
    console.log(`${colors.red}❌ Node.js ${version} detected. Version 18+ required.${colors.reset}`);
    return false;
  }
  console.log(`${colors.green}✅ Node.js ${version} OK${colors.reset}`);
  return true;
}

async function checkDependencies() {
  console.log(`${colors.cyan}📦 Checking dependencies...${colors.reset}`);
  try {
    await execPromise('npm list --depth=0');
    console.log(`${colors.green}✅ Dependencies installed${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.yellow}⚠️ Dependencies not fully installed. Running npm install...${colors.reset}`);
    try {
      await execPromise('npm install');
      console.log(`${colors.green}✅ Dependencies installed${colors.reset}`);
      return true;
    } catch (installError) {
      console.log(`${colors.red}❌ Failed to install dependencies${colors.reset}`);
      console.log(installError.message);
      return false;
    }
  }
}

async function checkEnvironment() {
  console.log(`${colors.cyan}🔍 Checking environment variables...${colors.reset}`);

  try {
    require('dotenv').config();
  } catch (error) {
    console.log(`${colors.red}❌ dotenv not found. Run npm install first.${colors.reset}`);
    return false;
  }

  const required = [
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_ADMIN_CHAT_ID',
    'FACEBOOK_LOGIN',
    'FACEBOOK_GROUPS',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_DATABASE_URL'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.log(`${colors.red}❌ Missing required environment variables:${colors.reset}`);
    missing.forEach(key => console.log(`  - ${key}`));
    console.log(`\n${colors.yellow}💡 Create a .env file from .env.example and fill in your values${colors.reset}`);
    return false;
  }

  console.log(`${colors.green}✅ All required environment variables are set${colors.reset}`);
  return true;
}

async function checkFirebaseCredentials() {
  console.log(`${colors.cyan}🔍 Checking Firebase credentials...${colors.reset}`);

  const keyPath = path.join(process.cwd(), 'firebase', 'service-account.json');

  try {
    await fs.access(keyPath);
    console.log(`${colors.green}✅ Firebase service account found at ${keyPath}${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.yellow}⚠️ Firebase service account file not found at ${keyPath}${colors.reset}`);
    console.log(`${colors.yellow}💡 You can either:${colors.reset}`);
    console.log(`   1. Place service-account.json in firebase/ directory`);
    console.log(`   2. Set FIREBASE_* environment variables in .env`);
    return true; // Environment variables might be set
  }
}

async function checkSessionsDirectory() {
  console.log(`${colors.cyan}🔍 Checking sessions directory...${colors.reset}`);

  const sessionDir = path.dirname(process.env.FACEBOOK_SESSION_PATH || './sessions/facebook-session.json');

  try {
    await fs.mkdir(sessionDir, { recursive: true });
    console.log(`${colors.green}✅ Sessions directory ready at ${sessionDir}${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Failed to create sessions directory: ${error.message}${colors.reset}`);
    return false;
  }
}

async function checkLogsDirectory() {
  console.log(`${colors.cyan}🔍 Checking logs directory...${colors.reset}`);

  try {
    await fs.mkdir('./logs', { recursive: true });
    console.log(`${colors.green}✅ Logs directory ready${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Failed to create logs directory: ${error.message}${colors.reset}`);
    return false;
  }
}

async function checkPlaywright() {
  console.log(`${colors.cyan}🔍 Checking Playwright installation...${colors.reset}`);

  try {
    await execPromise('npx playwright --version');
    console.log(`${colors.green}✅ Playwright is installed${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.yellow}⚠️ Playwright not found. Installing...${colors.reset}`);
    try {
      await execPromise('npx playwright install chromium');
      console.log(`${colors.green}✅ Playwright installed${colors.reset}`);
      return true;
    } catch (installError) {
      console.log(`${colors.red}❌ Failed to install Playwright: ${installError.message}${colors.reset}`);
      return false;
    }
  }
}

async function createFirebaseConfig() {
  console.log(`${colors.cyan}🔍 Checking Firebase configuration...${colors.reset}`);

  const firebaseDir = path.join(process.cwd(), 'firebase');
  try {
    await fs.mkdir(firebaseDir, { recursive: true });
    console.log(`${colors.green}✅ Firebase directory created${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.yellow}⚠️ Could not create firebase directory: ${error.message}${colors.reset}`);
    return false;
  }
}

async function main() {
  console.log(`\n${colors.bright}${colors.blue}🔧 ScoutFlow Setup Wizard${colors.reset}`);
  console.log(`${colors.dim}This script will check your setup and guide you through configuration${colors.reset}\n`);

  const checks = [
    { name: 'Node.js Version', fn: checkNodeVersion },
    { name: 'Dependencies', fn: checkDependencies },
    { name: 'Environment Variables', fn: checkEnvironment },
    { name: 'Firebase Credentials', fn: checkFirebaseCredentials },
    { name: 'Firebase Directory', fn: createFirebaseConfig },
    { name: 'Sessions Directory', fn: checkSessionsDirectory },
    { name: 'Logs Directory', fn: checkLogsDirectory },
    { name: 'Playwright', fn: checkPlaywright }
  ];

  let allPassed = true;

  for (const check of checks) {
    console.log(`\n${colors.dim}--- ${check.name} ---${colors.reset}`);
    const passed = await check.fn();
    if (!passed) {
      allPassed = false;
    }
  }

  console.log(`\n${colors.dim}----------------------------------------${colors.reset}`);

  if (allPassed) {
    console.log(`\n${colors.bright}${colors.green}✅ All checks passed! ScoutFlow is ready to run.${colors.reset}`);
    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log(`  1. Make sure your Facebook account is ready`);
    console.log(`  2. Ensure you've joined the groups you want to monitor`);
    console.log(`  3. Run: ${colors.bright}npm start${colors.reset}`);
    console.log(`  4. Check logs in ./logs/app.log for any errors`);
  } else {
    console.log(`\n${colors.bright}${colors.yellow}⚠️ Some checks failed. Please fix the issues above and run again.${colors.reset}`);
  }

  console.log(`\n${colors.bright}${colors.blue}📚 For more help, check the README.md file${colors.reset}\n`);
}

// Run setup
main().catch(console.error);