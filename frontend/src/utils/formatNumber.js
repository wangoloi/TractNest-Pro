/**
 * Format a number with commas as thousands separators
 * @param {number} num - The number to format
 * @returns {string} - The formatted number as a string
 */
export function formatNumber(num) {
  // Handle invalid inputs
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  
  // Convert to number if it's a string
  const number = typeof num === 'string' ? parseFloat(num) : num;
  
  // Check if conversion was successful
  if (isNaN(number)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(number);
}
