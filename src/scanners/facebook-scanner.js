// src/scanners/facebook-scanner.js
/**
 * Facebook Scanner
 * Monitors Facebook groups using Playwright with session persistence
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const BaseScanner = require('./base-scanner');
const logger = require('../services/logger');

class FacebookScanner extends BaseScanner {
  static platform = 'facebook';

  constructor() {
    super();
    this.platform = 'facebook';
    this.browser = null;
    this.context = null;
    this.page = null;
    this.sessionPath = process.env.FACEBOOK_SESSION_PATH || './sessions/facebook-session.json';
    this.groups = [];
    this.maxPosts = parseInt(process.env.MAX_POSTS_PER_SCAN) || 20;
    this.isAuthenticated = false;
  }

  async setup() {
    console.log('[DEBUG FB Scanner] setup: Starting');
    this.logger.info('Setting up Facebook scanner...');
    
    // Load groups from environment
    console.log('[DEBUG FB Scanner] setup: Loading groups...');
    const groupsStr = process.env.FACEBOOK_GROUPS || '';
    this.groups = groupsStr.split(',').map(g => g.trim()).filter(g => g);
    
    if (this.groups.length === 0) {
      this.logger.warn('No Facebook groups configured in FACEBOOK_GROUPS');
      console.log('[DEBUG FB Scanner] setup: No groups found');
      return;
    }
    
    this.logger.info(`Configured ${this.groups.length} Facebook groups`);
    console.log(`[DEBUG FB Scanner] setup: ${this.groups.length} groups loaded`);
    
    // Launch browser
    console.log('[DEBUG FB Scanner] setup: Launching browser...');
    try {
      this.browser = await chromium.launch({
        headless: process.env.NODE_ENV === 'production',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
      console.log('[DEBUG FB Scanner] setup: Browser launched successfully');
      this.logger.info('Browser launched successfully');
    } catch (error) {
      console.error('[DEBUG FB Scanner] setup: Browser launch failed:', error);
      this.logger.error('Failed to launch browser:', error);
      throw error;
    }
    
    // Load or create session
    console.log('[DEBUG FB Scanner] setup: Loading session...');
    await this.loadSession();
    console.log('[DEBUG FB Scanner] setup: Session loaded');
  }

  async loadSession() {
    try {
      // Check if session file exists
      try {
        await fs.access(this.sessionPath);
      } catch (error) {
        this.logger.info('No saved session found, will authenticate');
        await this.authenticate();
        return;
      }
      
      // Read session file
      const sessionData = await fs.readFile(this.sessionPath, 'utf-8');
      const session = JSON.parse(sessionData);
      
      // Create context with saved session
      this.context = await this.browser.newContext({
        storageState: session,
        viewport: { width: 1280, height: 720 }
      });
      
      this.page = await this.context.newPage();
      
      // Verify session is still valid
      await this.page.goto('https://www.facebook.com/', { waitUntil: 'networkidle' });
      
      // Check if logged in
      const loggedIn = await this.checkLoggedIn();
      if (loggedIn) {
        this.isAuthenticated = true;
        this.logger.info('✅ Session restored successfully');
        return;
      }
      
      this.logger.info('Session expired, re-authenticating');
      await this.authenticate();
    } catch (error) {
      this.logger.warn('Failed to load session:', error.message);
      await this.authenticate();
    }
  }

  async checkLoggedIn() {
    try {
      // Check for login form
      const loginForm = await this.page.$('input[name="email"]');
      if (loginForm) {
        return false;
      }
      
      // Check for profile icon or feed
      const profileIcon = await this.page.$('[aria-label*="Profile" i]');
      const feed = await this.page.$('[role="feed"]');
      
      return !!(profileIcon || feed);
    } catch (error) {
      this.logger.error('Error checking login status:', error);
      return false;
    }
  }

  async authenticate() {
    this.logger.info('Starting Facebook authentication...');
    
    try {
      // Create new context for authentication
      if (this.context) {
        await this.context.close();
      }
      
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 }
      });
      
      this.page = await this.context.newPage();
      
      // Navigate to Facebook
      await this.page.goto('https://www.facebook.com/', { waitUntil: 'networkidle' });
      
      // Check if already logged in
      const loggedIn = await this.checkLoggedIn();
      if (loggedIn) {
        this.logger.info('Already logged in');
        await this.saveSession();
        this.isAuthenticated = true;
        return;
      }
      
      // Fill login form
      const email = process.env.FACEBOOK_LOGIN;
      const password = process.env.FACEBOOK_PASSWORD;
      
      if (!email || !password) {
        throw new Error('FACEBOOK_LOGIN and FACEBOOK_PASSWORD must be set');
      }
      
      // Wait for login form
      await this.page.waitForSelector('input[name="email"]', { timeout: 10000 });
      await this.page.fill('input[name="email"]', email);
      await this.page.fill('input[name="pass"]', password);
      await this.page.click('button[name="login"]');
      
      // Wait for navigation
      await this.page.waitForLoadState('networkidle');
      
      // Check for 2FA
      const twoFactorInput = await this.page.$('input[name="approvals_code"]');
      if (twoFactorInput) {
        this.logger.warn('⚠️ Two-factor authentication detected!');
        this.logger.warn('Please enter your 2FA code in the browser window.');
        this.logger.warn('You have 60 seconds to complete this step.');
        
        // Wait for 2FA to complete or timeout
        await this.page.waitForSelector('input[name="approvals_code"]', { timeout: 60000 });
        await this.page.waitForLoadState('networkidle', { timeout: 60000 });
      }
      
      // Verify login success
      const loginSuccess = await this.checkLoggedIn();
      if (!loginSuccess) {
        throw new Error('Authentication failed - please check credentials');
      }
      
      this.logger.info('✅ Authentication successful');
      await this.saveSession();
      this.isAuthenticated = true;
    } catch (error) {
      this.logger.error('Authentication failed:', error);
      throw error;
    }
  }

  async saveSession() {
    try {
      const storageState = await this.context.storageState();
      const sessionDir = path.dirname(this.sessionPath);
      
      // Ensure directory exists
      await fs.mkdir(sessionDir, { recursive: true });
      
      // Write session file
      await fs.writeFile(this.sessionPath, JSON.stringify(storageState, null, 2));
      
      this.logger.info(`Session saved to ${this.sessionPath}`);
    } catch (error) {
      this.logger.error('Failed to save session:', error);
    }
  }

  async scan() {
    if (!this.isAuthenticated) {
      this.logger.error('Not authenticated, cannot scan');
      return [];
    }
    
    if (this.groups.length === 0) {
      this.logger.warn('No groups to scan');
      return [];
    }
    
    this.logger.info(`Scanning ${this.groups.length} groups...`);
    const results = [];
    
    for (const groupUrl of this.groups) {
      try {
        const posts = await this.scanGroup(groupUrl);
        results.push(...posts);
        this.logger.info(`Found ${posts.length} posts in ${groupUrl}`);
      } catch (error) {
        this.logger.error(`Failed to scan group ${groupUrl}:`, error.message);
      }
    }
    
    this.logger.info(`Total posts found: ${results.length}`);
    return results;
  }

  async scanGroup(groupUrl) {
    const posts = [];
    
    try {
      // Navigate to group
      await this.page.goto(groupUrl, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for posts to load
      await this.page.waitForSelector('[role="article"]', { timeout: 15000 });
      
      // Scroll to load more posts
      await this.page.evaluate(() => {
        window.scrollBy(0, window.innerHeight * 2);
      });
      await this.page.waitForTimeout(2000);
      
      // Get posts
      const postElements = await this.page.$$('[role="article"]');
      const limit = Math.min(postElements.length, this.maxPosts);
      
      for (let i = 0; i < limit; i++) {
        try {
          const postData = await this.extractPostData(postElements[i], groupUrl);
          if (postData && postData.postText) {
            posts.push(postData);
          }
        } catch (error) {
          // Skip failed posts
          continue;
        }
      }
    } catch (error) {
      this.logger.error(`Error scanning group: ${error.message}`);
    }
    
    return posts;
  }

  async extractPostData(postElement, groupUrl) {
    try {
      // Extract text content
      const textElement = await postElement.$('div[dir="auto"]');
      const postText = textElement ? await textElement.textContent() : '';
      
      if (!postText || postText.trim().length < 10) {
        return null;
      }
      
      // Extract author
      const authorElement = await postElement.$('a[role="link"] > span, span[dir="auto"]');
      const author = authorElement ? await authorElement.textContent() : 'Unknown User';
      
      // Extract post link
      const linkElement = await postElement.$('a[href*="/posts/"]');
      let postUrl = groupUrl;
      let postId = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      if (linkElement) {
        const href = await linkElement.getAttribute('href');
        if (href) {
          const match = href.match(/\/posts\/(\d+)/);
          if (match) {
            postId = match[1];
            postUrl = `https://www.facebook.com${href}`;
          }
        }
      }
      
      // Extract timestamp
      const timeElement = await postElement.$('abbr');
      let createdAt = new Date().toISOString();
      
      if (timeElement) {
        const timeText = await timeElement.getAttribute('data-tooltip-content') || 
                        await timeElement.getAttribute('title') ||
                        await timeElement.textContent();
        if (timeText) {
          const parsed = this.parseFacebookTimestamp(timeText);
          if (parsed) {
            createdAt = parsed;
          }
        }
      }
      
      return {
        postId,
        postText: postText.trim(),
        authorName: author.trim(),
        postUrl,
        timestamp: createdAt,
        groupUrl,
        groupName: this.extractGroupName(groupUrl)
      };
    } catch (error) {
      return null;
    }
  }

  parseFacebookTimestamp(text) {
    const now = new Date();
    const match = text.match(/^(\d+)\s*([hmd])$/);
    
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      const date = new Date(now);
      
      if (unit === 'h') {
        date.setHours(date.getHours() - value);
        return date.toISOString();
      } else if (unit === 'm') {
        date.setMinutes(date.getMinutes() - value);
        return date.toISOString();
      } else if (unit === 'd') {
        date.setDate(date.getDate() - value);
        return date.toISOString();
      }
    }
    
    // Try parsing as date
    try {
      const parsed = new Date(text);
      if (!isNaN(parsed)) {
        return parsed.toISOString();
      }
    } catch (e) {}
    
    return null;
  }

  extractGroupName(groupUrl) {
    const match = groupUrl.match(/\/groups\/([^/?]+)/);
    return match ? match[1].replace(/-/g, ' ') : 'Unknown Group';
  }

  generateId(rawData) {
    return rawData.postId || `fb_${Date.now()}`;
  }

  extractAuthor(rawData) {
    return rawData.authorName || 'Unknown';
  }

  extractText(rawData) {
    return rawData.postText || '';
  }

  extractUrl(rawData) {
    return rawData.postUrl || '';
  }

  extractDate(rawData) {
    return rawData.timestamp || new Date().toISOString();
  }

  extractPlatformData(rawData) {
    return {
      groupName: rawData.groupName,
      groupUrl: rawData.groupUrl
    };
  }

  async teardown() {
    this.logger.info('Tearing down Facebook scanner...');
    
    try {
      // Save session before closing
      if (this.context && this.isAuthenticated) {
        await this.saveSession();
      }
      
      // Close browser
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.context = null;
        this.page = null;
      }
      
      this.logger.info('Scanner teardown complete');
    } catch (error) {
      this.logger.error('Error during teardown:', error);
    }
  }
}

module.exports = FacebookScanner;