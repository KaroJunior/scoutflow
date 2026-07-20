/**
 * Date Utilities
 */

function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function timeAgo(date) {
  if (!date) return 'N/A';

  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    return `${diffDay}d ago`;
  } else if (diffHour > 0) {
    return `${diffHour}h ago`;
  } else if (diffMin > 0) {
    return `${diffMin}m ago`;
  } else {
    return 'Just now';
  }
}

function isWithinLastHours(date, hours) {
  if (!date) return false;
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= hours;
}

function getDaysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = d2 - d1;
  return diffMs / (1000 * 60 * 60 * 24);
}

module.exports = {
  formatDate,
  timeAgo,
  isWithinLastHours,
  getDaysBetween
};