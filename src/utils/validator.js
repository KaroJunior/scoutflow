/**
 * Validation Utilities
 */

const Joi = require('joi');

// Lead validation schema
const leadSchema = Joi.object({
  id: Joi.string().required(),
  platform: Joi.string().required(),
  author: Joi.string().required(),
  text: Joi.string().allow(''),
  url: Joi.string().uri().required(),
  createdAt: Joi.string().isoDate(),
  score: Joi.number().min(0).max(100),
  matchedKeywords: Joi.array().items(Joi.string()),
  group: Joi.string().allow(''),
  raw: Joi.any()
});

function validateLead(data) {
  const { error, value } = leadSchema.validate(data);
  if (error) {
    return { valid: false, error: error.details[0].message };
  }
  return { valid: true, value };
}

function validateUrl(url) {
  const schema = Joi.string().uri();
  const { error } = schema.validate(url);
  return !error;
}

function validateEmail(email) {
  const schema = Joi.string().email();
  const { error } = schema.validate(email);
  return !error;
}

function sanitizeText(text, maxLength = 500) {
  if (!text) return '';
  return text.substring(0, maxLength).trim();
}

module.exports = {
  validateLead,
  validateUrl,
  validateEmail,
  sanitizeText
};