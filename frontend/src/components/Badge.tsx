type BadgeProps = { value: string; };
function tone(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes('overdue') || normalized.includes('urgent')) return 'danger';
  if (normalized.includes('pending') || normalized.includes('action') || normalized.includes('approval')) return 'warning';
  if (normalized.includes('healthy') || normalized.includes('allocated')) return 'success';
  return 'neutral';
}
export function Badge({ value }: BadgeProps) { return <span className={`badge ${tone(value)}`}>{value}</span>; }
