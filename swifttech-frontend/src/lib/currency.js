/**
 * Format a number as Kenyan Shillings (KES)
 */
export function formatKES(amount) {
  if (amount === undefined || amount === null) return 'KES 0.00';
  return `KES ${Number(amount).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const CURRENCY = 'KES';