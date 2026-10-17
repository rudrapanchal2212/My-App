/**
 * Currency Utility: All internal monetary storage is in integer paise
 * 100 paise = 1 INR (₹)
 */

// Convert paise (integer) to formatted INR string, e.g. 10000 -> "₹100" or "₹100.50"
const formatPaiseToINR = (paise) => {
  if (typeof paise !== 'number' || isNaN(paise)) return '₹0';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(rupees);
};

// Convert rupees (float or number) to integer paise, e.g. 99.50 -> 9950
const rupeesToPaise = (rupees) => {
  if (typeof rupees !== 'number' || isNaN(rupees)) {
    rupees = parseFloat(rupees) || 0;
  }
  return Math.round(rupees * 100);
};

// Convert paise to rupees (number), e.g. 9950 -> 99.50
const paiseToRupees = (paise) => {
  if (typeof paise !== 'number' || isNaN(paise)) return 0;
  return paise / 100;
};

module.exports = {
  formatPaiseToINR,
  rupeesToPaise,
  paiseToRupees,
};
