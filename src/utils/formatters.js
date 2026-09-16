/**
 * Shared Indian Rupee Currency Formatter
 * Formats numbers into Indian Rupees (INR) with proper Indian numbering system:
 * 1000 -> ₹1,000
 * 10000 -> ₹10,000
 * 100000 -> ₹1,00,000
 * 1000000 -> ₹10,00,000
 *
 * @param {number|string} amount
 * @param {number|null} decimals
 * @returns {string} formatted INR string e.g. "₹1,24,580" or "₹620.74"
 */
export function formatINR(amount, decimals = null) {
  const num = Number(amount) || 0;
  const fracDigits = decimals !== null ? decimals : (num % 1 !== 0 ? 2 : 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: fracDigits,
    maximumFractionDigits: fracDigits,
  }).format(num);
}

export function formatCurrency(amount, options = {}) {
  const decimals = options.fractionDigits ?? options.decimals ?? null;
  return formatINR(amount, decimals);
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(Number(num) || 0);
}

export function formatPercent(value) {
  return `${value > 0 ? '+' : ''}${value}%`;
}
