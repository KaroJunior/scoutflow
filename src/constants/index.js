/**
 * Application Constants
 */

module.exports = {
  // Application
  APP_NAME: 'ScoutFlow',
  APP_VERSION: '0.1.0',

  // Platforms
  PLATFORMS: {
    FACEBOOK: 'facebook',
    TWITTER: 'twitter',
    QUORA: 'quora'
  },

  // Scoring
  SCORE: {
    MAX: 100,
    MIN_NOTIFICATION: 30,
    RECENCY_BONUS: 5,
    ENGAGEMENT_BONUS: 2
  },

  // Time (in milliseconds)
  TIME: {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000
  },

  // Logging
  LOG: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES: 5
  },

  // Status codes
  STATUS: {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
  }
};