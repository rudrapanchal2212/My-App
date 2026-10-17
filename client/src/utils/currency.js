/**
 * Currency Utility for Frontend:
 * Database stores prices in integer paise (e.g. 10000 = ₹100)
 */

export const formatINR = (paise) => {
  if (typeof paise !== 'number' || isNaN(paise)) return '₹0';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(rupees);
};

export const paiseToRupees = (paise) => {
  if (typeof paise !== 'number' || isNaN(paise)) return 0;
  return paise / 100;
};

export const rupeesToPaise = (rupees) => {
  if (typeof rupees !== 'number' || isNaN(rupees)) {
    rupees = parseFloat(rupees) || 0;
  }
  return Math.round(rupees * 100);
};
