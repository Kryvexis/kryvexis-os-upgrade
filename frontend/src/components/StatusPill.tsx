export function StatusPill({ value }: { value: string }) {
  const tone = value.toLowerCase();
  return <span className={`status-pill status-${tone.replace(/\s+/g, '-')}`}>{value}</span>;
}
