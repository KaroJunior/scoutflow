/**
 * Base Scanner Class
 * Abstract class that all platform scanners must extend
 */

const logger = require('../services/logger');
const { getConfig } = require('../config');

class BaseScanner {
  constructor() {
    this.platform = this.constructor.platform || 'unknown';
    this.enabled = false;
    this.config = getConfig();
    this.logger = logger.withContext({ platform: this.platform });
  }

  /**
   * Scan for new leads
   * Must be implemented by subclasses
   * @returns {Promise<Array<Object>>} Array of lead objects
   */
  async scan() {
    throw new Error('scan() must be implemented by subclass');
  }

  /**
   * Normalize platform-specific data to standard Lead format
   * @param {Object} rawData - Platform-specific raw data
   * @returns {Object} Standardized lead object
   */
  normalize(rawData) {
    return {
      id: this.generateId(rawData),
      platform: this.platform,
      author: this.extractAuthor(rawData),
      text: this.extractText(rawData),
      url: this.extractUrl(rawData),
      createdAt: this.extractDate(rawData),
      raw: rawData // Keep raw data for debugging
    };
  }

  /**
   * Generate unique ID for a lead
   * Must be implemented by subclasses
   */
  generateId(rawData) {
    throw new Error('generateId() must be implemented by subclass');
  }

  /**
   * Extract author name from raw data
   * Must be implemented by subclasses
   */
  extractAuthor(rawData) {
    throw new Error('extractAuthor() must be implemented by subclass');
  }

  /**
   * Extract text content from raw data
   * Must be implemented by subclasses
   */
  extractText(rawData) {
    throw new Error('extractText() must be implemented by subclass');
  }

  /**
   * Extract URL from raw data
   * Must be implemented by subclasses
   */
  extractUrl(rawData) {
    throw new Error('extractUrl() must be implemented by subclass');
  }

  /**
   * Extract creation date from raw data
   * Must be implemented by subclasses
   */
  extractDate(rawData) {
    throw new Error('extractDate() must be implemented by subclass');
  }

  /**
   * Extract platform-specific data (optional)
   * Override in subclass if needed
   */
  extractPlatformData(rawData) {
    return {};
  }

  /**
   * Check if scanner is enabled in configuration
   */
  isEnabled() {
    const { getEnabledPlatforms } = require('../config/platforms');
    const enabled = getEnabledPlatforms();
    return enabled.some(p => p.id === this.platform);
  }

  /**
   * Validate scanner configuration
   * Override in subclass
   */
  validate() {
    return true;
  }

  /**
   * Pre-scan setup
   * Override in subclass
   */
  async setup() {
    // Default implementation does nothing
  }

  /**
   * Post-scan cleanup
   * Override in subclass
   */
  async teardown() {
    // Default implementation does nothing
  }
}

module.exports = BaseScanner;