export function moneyToNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function numberToMoney(value) {
  const amount = Number(value || 0);
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function textOrNull(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

export function parseRelativeDue(value) {
  if (!value) return null;
  if (/due today/i.test(value)) return 0;
  const inMatch = String(value).match(/due in\s+(\d+)\s+day/i);
  if (inMatch) return Number.parseInt(inMatch[1], 10);
  const overdueMatch = String(value).match(/overdue by\s+(\d+)\s+day/i);
  if (overdueMatch) return -Number.parseInt(overdueMatch[1], 10);
  return null;
}
