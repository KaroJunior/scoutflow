/**
 * Scanner Result Model
 * Contains results from a scanner run
 */

class ScannerResult {
  constructor(data = {}) {
    this.platform = data.platform || null;
    this.timestamp = data.timestamp || new Date().toISOString();
    this.leads = data.leads || [];
    this.error = data.error || null;
    this.metadata = data.metadata || {};
  }

  toJSON() {
    return {
      platform: this.platform,
      timestamp: this.timestamp,
      leadCount: this.leads.length,
      error: this.error,
      metadata: this.metadata
    };
  }

  get hasError() {
    return !!this.error;
  }

  get leadCount() {
    return this.leads.length;
  }
}

module.exports = ScannerResult;