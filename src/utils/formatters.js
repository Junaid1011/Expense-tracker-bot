// Currency and date formatter utilities

const DEFAULT_CURRENCY = import.meta.env.VITE_DEFAULT_CURRENCY || 'INR';

/**
 * Format a number as a currency string.
 * @param {number} amount
 * @param {string} currency  ISO 4217 code (e.g. "USD", "EUR", "GBP")
 * @returns {string}
 */
export const formatCurrency = (amount, currency = DEFAULT_CURRENCY) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date string or Date object to a readable format.
 * @param {string|Date} date
 * @param {string} style  'short' | 'long' | 'numeric'
 * @returns {string}
 */
export const formatDate = (date, style = 'short') => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  const options =
    style === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : style === 'numeric'
      ? { year: 'numeric', month: '2-digit', day: '2-digit' }
      : { year: 'numeric', month: 'short', day: 'numeric' };

  return new Intl.DateTimeFormat('en-US', options).format(d);
};

/**
 * Format a date for use in HTML date inputs (YYYY-MM-DD).
 * @param {string|Date} date
 * @returns {string}
 */
export const toInputDate = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

/**
 * Get month/year label from a date string (e.g. "Jan 2025").
 * @param {string} dateStr
 * @returns {string}
 */
export const getMonthLabel = (dateStr) => {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(d);
};
