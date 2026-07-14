import React from 'react';
import { colors, typography } from '../../styles/designTokens';

type Column<T> = { key: string; label: string; render?: (row: T) => React.ReactNode };

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  className?: string;
};

export function Table<T extends Record<string, any>>({ columns, data, className }: TableProps<T>) {
  return (
    <table className={`data-table${className ? ` ${className}` : ''}`} style={{ fontFamily: typography.fontFamily }}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} style={{ textAlign: 'left', padding: '14px 16px', color: colors.neutral.gray500 }}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((c) => (
              <td key={c.key} style={{ padding: '14px 16px', color: colors.neutral.gray800 }}>{c.render ? c.render(row) : (row as any)[c.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
