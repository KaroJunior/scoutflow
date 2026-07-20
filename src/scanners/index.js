/**
 * Scanner Registry
 * Manages all platform scanners
 */

const BaseScanner = require('./base-scanner');
const FacebookScanner = require('./facebook-scanner');
const logger = require('../services/logger');
const { getEnabledPlatforms } = require('../config/platforms');

class ScannerRegistry {
  constructor() {
    this.scanners = new Map();
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) {
      logger.warn('Scanner registry already initialized');
      return;
    }

    // Register all available scanners
    const scanners = [
      FacebookScanner
    ];

    for (const ScannerClass of scanners) {
      const instance = new ScannerClass();
      this.register(instance);
    }

    this.initialized = true;
    logger.info(`Scanner registry initialized with ${this.scanners.size} scanners`);
  }

  register(scanner) {
    if (!(scanner instanceof BaseScanner)) {
      throw new Error('Scanner must be an instance of BaseScanner');
    }

    if (this.scanners.has(scanner.platform)) {
      logger.warn(`Scanner for ${scanner.platform} already registered, overwriting`);
    }

    this.scanners.set(scanner.platform, scanner);
    logger.debug(`Registered scanner: ${scanner.platform}`);
  }

  get(platform) {
    return this.scanners.get(platform);
  }

  getActive() {
    const active = [];
    const enabledPlatforms = getEnabledPlatforms();

    for (const [platform, scanner] of this.scanners) {
      // Check if platform is enabled in config
      const config = enabledPlatforms.find(p => p.id === platform);
      if (config) {
        active.push(scanner);
      }
    }

    return active;
  }

  getAll() {
    return Array.from(this.scanners.values());
  }
}

let registryInstance = null;

function getScannerRegistry() {
  if (!registryInstance) {
    registryInstance = new ScannerRegistry();
    registryInstance.initialize();
  }
  return registryInstance;
}

module.exports = {
  ScannerRegistry,
  getScannerRegistry
};