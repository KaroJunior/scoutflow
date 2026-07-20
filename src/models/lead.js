/**
 * Lead Model
 * Standardized data structure for all leads
 */

class Lead {
  constructor(data = {}) {
    this.id = data.id || null;
    this.platform = data.platform || null;
    this.author = data.author || null;
    this.text = data.text || null;
    this.url = data.url || null;
    this.createdAt = data.createdAt || null;
    this.score = data.score || 0;
    this.matchedKeywords = data.matchedKeywords || [];
    this.group = data.group || null;
    this.raw = data.raw || null;
    this.processedAt = data.processedAt || null;
  }

  toJSON() {
    return {
      id: this.id,
      platform: this.platform,
      author: this.author,
      text: this.text,
      url: this.url,
      createdAt: this.createdAt,
      score: this.score,
      matchedKeywords: this.matchedKeywords,
      group: this.group,
      processedAt: this.processedAt
    };
  }

  isValid() {
    return !!(this.id && this.platform && this.author && this.url);
  }

  getSummary() {
    return `${this.platform}: ${this.author} - Score ${this.score}`;
  }
}

module.exports = Lead;