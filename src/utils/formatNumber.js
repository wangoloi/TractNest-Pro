/**
 * Format a number with commas as thousands separators
 * @param {number} num - The number to format
 * @returns {string} - The formatted number as a string
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
}