import type { ReactNode } from 'react';

type TableColumn = {
  key: string;
  label: string;
};

type TableRow = Record<string, ReactNode> & { id: string };

export function TableShell({
  title,
  description,
  columns,
  rows,
  actions
}: {
  title: string;
  description: string;
  columns: TableColumn[];
  rows: TableRow[];
  actions?: ReactNode;
}) {
  return (
    <section className="table-shell glass-panel">
      <div className="table-shell-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {actions ? <div className="table-shell-actions">{actions}</div> : null}
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.key}>{row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
