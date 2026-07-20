/**
 * Default Keyword Configuration
 * Configurable - can be updated via Firebase later
 */

const DEFAULT_KEYWORDS = {
  // High priority - Direct hiring intent
  hiring: { weight: 10, priority: 'high' },
  'looking for': { weight: 8, priority: 'high' },
  'need a developer': { weight: 10, priority: 'high' },
  'need developer': { weight: 10, priority: 'high' },
  'hire developer': { weight: 10, priority: 'high' },
  'looking for developer': { weight: 10, priority: 'high' },
  'need a web developer': { weight: 10, priority: 'high' },
  'need a telegram bot': { weight: 10, priority: 'high' },
  'looking for a dev': { weight: 9, priority: 'high' },

  // Medium priority - Specific tech stack
  'web developer': { weight: 8, priority: 'medium' },
  'website designer': { weight: 7, priority: 'medium' },
  'Telegram bot': { weight: 8, priority: 'medium' },
  'automation': { weight: 6, priority: 'medium' },
  'freelance': { weight: 6, priority: 'medium' },
  'freelancer': { weight: 6, priority: 'medium' },
  'wordpress': { weight: 5, priority: 'medium' },
  'react': { weight: 5, priority: 'medium' },
  'nodejs': { weight: 5, priority: 'medium' },
  'javascript': { weight: 4, priority: 'medium' },

  // Low priority - General signals
  'project': { weight: 4, priority: 'low' },
  'quote': { weight: 4, priority: 'low' },
  'build a website': { weight: 6, priority: 'medium' },
  'website': { weight: 3, priority: 'low' },
  'need help': { weight: 3, priority: 'low' },
  'looking for help': { weight: 4, priority: 'low' }
};

function getKeywords() {
  // In future: Load from Firebase
  return DEFAULT_KEYWORDS;
}

function getKeywordWeights() {
  const keywords = getKeywords();
  return Object.fromEntries(
    Object.entries(keywords).map(([key, config]) => [key, config.weight])
  );
}

function getKeywordPriorities() {
  const keywords = getKeywords();
  return Object.fromEntries(
    Object.entries(keywords).map(([key, config]) => [key, config.priority])
  );
}

module.exports = {
  DEFAULT_KEYWORDS,
  getKeywords,
  getKeywordWeights,
  getKeywordPriorities
};