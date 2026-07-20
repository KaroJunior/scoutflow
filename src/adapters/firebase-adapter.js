// src/adapters/firebase-adapter.js
const admin = require('firebase-admin');
const logger = require('../services/logger');
const { getConfig } = require('../config');

class FirebaseAdapter {
  constructor() {
    this.db = null;
    this.initialized = false;
    this.collection = 'leads';
    this.settingsCollection = 'settings';
    this.ignoredCollection = 'ignored';
  }

  async initialize() {
    try {
      const config = getConfig();

      if (admin.apps.length > 0) {
        this.db = admin.firestore();
        this.initialized = true;
        logger.info('Firebase already initialized');
        return true;
      }

      let serviceAccount;
      try {
        const serviceAccountPath = process.cwd() + '/firebase/service-account.json';
        serviceAccount = require(serviceAccountPath);
        logger.info('Loaded Firebase credentials from file');
      } catch (error) {
        logger.info('No service account file found, using environment variables');
        serviceAccount = {
          projectId: config.firebase.projectId,
          clientEmail: config.firebase.clientEmail,
          privateKey: config.firebase.privateKey
        };
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: config.firebase.databaseUrl
      });

      this.db = admin.firestore();
      this.initialized = true;

      await this.db.collection(this.collection).limit(1).get();
      logger.info('✅ Firebase initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Firebase:', error);
      throw error;
    }
  }

  async save(key, data) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const docRef = this.db.collection(this.collection).doc(key);
      await docRef.set({
        ...data,
        savedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      logger.debug(`Saved lead: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to save lead ${key}:`, error);
      throw error;
    }
  }

  async get(key) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const doc = await this.db.collection(this.collection).doc(key).get();
      if (!doc.exists) {
        return null;
      }

      return doc.data();
    } catch (error) {
      logger.error(`Failed to get lead ${key}:`, error);
      return null;
    }
  }

  async exists(key) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const doc = await this.db.collection(this.collection).doc(key).get();
      return doc.exists;
    } catch (error) {
      logger.error(`Failed to check lead ${key}:`, error);
      return false;
    }
  }

  async delete(key) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      await this.db.collection(this.collection).doc(key).delete();
      logger.debug(`Deleted lead: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete lead ${key}:`, error);
      return false;
    }
  }

  async list(prefix = '', limit = 100) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      let query = this.db.collection(this.collection).orderBy('createdAt', 'desc').limit(limit);

      if (prefix) {
        const snapshot = await query.get();
        const results = [];
        snapshot.forEach(doc => {
          if (doc.id.startsWith(prefix)) {
            results.push({ key: doc.id, value: doc.data() });
          }
        });
        return results;
      }

      const snapshot = await query.get();
      const results = [];
      snapshot.forEach(doc => {
        results.push({ key: doc.id, value: doc.data() });
      });
      return results;
    } catch (error) {
      logger.error('Failed to list leads:', error);
      return [];
    }
  }

  async close() {
    logger.info('Firebase adapter closed');
    return true;
  }

  async getSetting(key, defaultValue = null) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const doc = await this.db.collection(this.settingsCollection).doc(key).get();
      if (!doc.exists) {
        return defaultValue;
      }
      return doc.data().value;
    } catch (error) {
      logger.error(`Failed to get setting ${key}:`, error);
      return defaultValue;
    }
  }

  async setSetting(key, value) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      await this.db.collection(this.settingsCollection).doc(key).set({
        value,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      logger.debug(`Setting saved: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to save setting ${key}:`, error);
      return false;
    }
  }

  async markIgnored(leadId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      await this.db.collection(this.ignoredCollection).doc(leadId).set({
        leadId,
        ignoredAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await this.db.collection(this.collection).doc(leadId).set({
        ignored: true,
        ignoredAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      logger.info(`Lead marked as ignored: ${leadId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to mark lead ${leadId} as ignored:`, error);
      return false;
    }
  }

  async isIgnored(leadId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const doc = await this.db.collection(this.ignoredCollection).doc(leadId).get();
      return doc.exists;
    } catch (error) {
      logger.error(`Failed to check ignored ${leadId}:`, error);
      return false;
    }
  }
}

function createStorageAdapter(env) {
  try {
    return new FirebaseAdapter();
  } catch (error) {
    logger.error('Failed to create storage adapter:', error);
    const { StorageAdapter } = require('./storage-adapter');
    return new StorageAdapter();
  }
}

module.exports = {
  FirebaseAdapter,
  createStorageAdapter
};