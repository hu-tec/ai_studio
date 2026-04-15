import React from 'react';

interface KpiTableProps {
  data: Array<Record<string, string | number>>;
  headers: string[];
  title: string;
  emoji: string;
  mode: 'view' | 'edit' | 'add' | 'delete';
  onUpdate?: (rowIndex: number, colKey: string, value: string) => void;
}

export const KpiTable: React.FC<KpiTableProps> = ({ data, headers, title, emoji, mode, onUpdate }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="bg-slate-50 px-2 py-3 border-b border-slate-200 flex items-center gap-2">
        <span className="text-sm">{emoji}</span>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              {headers.map((header) => (
                <th key={header} className="px-2 py-2 font-medium text-slate-500 bg-slate-50/50">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                {headers.map((header) => (
                  <td key={`${rowIndex}-${header}`} className="px-2 py-2 text-slate-700">
                    {mode === 'edit' ? (
                      <input
                        type="text"
                        value={row[header] || ''}
                        onChange={(e) => onUpdate?.(rowIndex, header, e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm"
                      />
                    ) : (
                      <span className={typeof row[header] === 'number' ? "font-mono" : ""}>
                        {row[header]}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
