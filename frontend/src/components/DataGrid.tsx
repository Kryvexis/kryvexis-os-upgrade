import { Link } from 'react-router-dom';
import { Badge } from './Badge';
type Column<T> = { key: string; header: string; render: (item: T) => React.ReactNode; };
type DataGridProps<T extends { id: string }> = { items: T[]; columns: Column<T>[]; getHref?: (item: T) => string; };
export function DataGrid<T extends { id: string }>({ items, columns, getHref }: DataGridProps<T>) {
  return <div className="table-wrap"><table className="data-grid"><thead><tr>{columns.map((column) => <th key={column.key}>{column.header}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.id}>{columns.map((column, index) => <td key={column.key}>{index === 0 && getHref ? <Link to={getHref(item)} className="row-link">{column.render(item)}</Link> : column.render(item)}</td>)}</tr>)}</tbody></table></div>;
}
export function renderStatus(value: string) { return <Badge value={value} />; }
