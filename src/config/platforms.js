// src/config/platforms.js
const PLATFORMS = {
  FACEBOOK: {
    id: 'facebook',
    name: 'Facebook',
    enabled: true,
    scanner: 'FacebookScanner',
    groupLimit: 10,
    scanDelay: 2000,
    description: 'Facebook Groups monitoring'
  },
  TWITTER: {
    id: 'twitter',
    name: 'Twitter',
    enabled: false,
    scanner: 'TwitterScanner',
    searchLimit: 50,
    scanDelay: 3000,
    description: 'Twitter public posts monitoring'
  },
  QUORA: {
    id: 'quora',
    name: 'Quora',
    enabled: false,
    scanner: 'QuoraScanner',
    searchLimit: 30,
    scanDelay: 4000,
    description: 'Quora questions and answers monitoring'
  }
};

function getPlatforms() {
  return PLATFORMS;
}

function getPlatform(platformId) {
  return PLATFORMS[platformId.toUpperCase()];
}

function getEnabledPlatforms() {
  return Object.values(PLATFORMS).filter(p => p.enabled);
}

module.exports = {
  PLATFORMS,
  getPlatforms,
  getPlatform,
  getEnabledPlatforms
};