export function RecordTimeline({ items }: { items: string[] }) {
  return <ol className="timeline">{items.map((item) => <li key={item}>{item}</li>)}</ol>;
}
