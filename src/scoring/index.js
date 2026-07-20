/**
 * Scoring Engine
 * Evaluates leads based on keyword matching
 */

const logger = require('../services/logger');
const { getKeywordWeights } = require('../config/keywords');
const { getTelegramService } = require('../services/telegram');

/**
 * Score a lead based on keyword matching
 * @param {Object} lead - Lead object
 * @param {Object} options - Scoring options
 * @returns {Object} Score result with matched keywords
 */
function scoreLead(lead, options = {}) {
  const weights = options.keywords || getKeywordWeights();
  const text = (lead.text || '').toLowerCase();

  let totalScore = 0;
  const matchedKeywords = [];

  for (const [keyword, weight] of Object.entries(weights)) {
    if (text.includes(keyword.toLowerCase())) {
      totalScore += weight;
      matchedKeywords.push(keyword);
    }
  }

  // Recency bonus (if createdAt is available)
  if (lead.createdAt) {
    const hoursAgo = (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 24) {
      totalScore += 5;
    } else if (hoursAgo < 48) {
      totalScore += 2;
    }
  }

  // Cap at 100
  totalScore = Math.min(totalScore, 100);

  return {
    score: totalScore,
    matchedKeywords,
    matchedCount: matchedKeywords.length
  };
}

/**
 * Process leads from a scanner
 * @param {Object} params - Processing parameters
 * @returns {Promise<number>} Number of processed leads
 */
async function processLeads(params) {
  const { leads, scanner, storage, bot, minScore = 30 } = params;

  if (!leads || leads.length === 0) {
    return 0;
  }

  let processed = 0;
  const telegram = getTelegramService();

  for (const rawLead of leads) {
    try {
      // Normalize the lead
      const lead = scanner.normalize(rawLead);

      // Check for duplicates
      const isDuplicate = await storage.exists(lead.id);
      if (isDuplicate) {
        logger.debug(`Duplicate lead skipped: ${lead.id}`);
        continue;
      }

      // Score the lead
      const { score, matchedKeywords } = scoreLead(lead);

      // Save the lead
      await storage.save(lead.id, {
        ...lead,
        score,
        matchedKeywords,
        processedAt: new Date().toISOString()
      });

      // Notify if score exceeds threshold
      if (score >= minScore && matchedKeywords.length > 0) {
        lead.score = score;
        lead.matchedKeywords = matchedKeywords;
        await telegram.sendNotification(lead);
        logger.info(`Lead notified: ${lead.id}, score: ${score}`);
      }

      processed++;
    } catch (error) {
      logger.error('Error processing lead:', error);
    }
  }

  return processed;
}

module.exports = {
  scoreLead,
  processLeads
};