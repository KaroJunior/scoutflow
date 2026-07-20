/**
 * String Utilities
 */

function truncate(text, maxLength = 200, suffix = '...') {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
}

function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function extractEmails(text) {
  if (!text) return [];
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  return text.match(emailRegex) || [];
}

function extractUrls(text) {
  if (!text) return [];
  const urlRegex = /https?:\/\/[^\s]+/g;
  return text.match(urlRegex) || [];
}

function removeExtraWhitespace(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

function containsAny(text, keywords) {
  if (!text || !keywords || keywords.length === 0) return false;
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

module.exports = {
  truncate,
  capitalize,
  extractEmails,
  extractUrls,
  removeExtraWhitespace,
  containsAny
};