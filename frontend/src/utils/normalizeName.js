/**
 * Normalize item names for consistent comparison
 * Handles different logic for different components:
 * - For RemainingStockSummary: handles spaces
 * - For others: simple lowercase and trim
 * @param {string} name - The name to normalize
 * @param {boolean} handleSpaces - Whether to handle spaces (for RemainingStockSummary)
 * @returns {string} - The normalized name
 */
export function normalizeName(name, handleSpaces = false) {
  if (handleSpaces) {
    const lowerName = name.toLowerCase().trim();
    return lowerName.replace(/\s+/g, ' ');
  }
  
  return name.toLowerCase().trim();
}
