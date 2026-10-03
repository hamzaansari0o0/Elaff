// columns: [{ key, label, align?: 'right', render?: (row) => node }]
// barKey: numeric column to draw a proportional background bar behind the first cell.
export default function StatTable({ title, subtitle, columns, rows, barKey, empty = 'No data yet' }) {
  const max = barKey ? Math.max(1, ...rows.map((r) => r[barKey] || 0)) : 1;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 pt-4 pb-3">
        <h2 className="text-sm font-black text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {rows.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-gray-400">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wide border-t border-gray-100">
                {columns.map((c) => (
                  <th key={c.key} className={`px-5 py-2 ${c.align === 'right' ? 'text-right' : 'text-left'}`}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-gray-100">
                  {columns.map((c, ci) => (
                    <td key={c.key} className={`px-5 py-2 ${c.align === 'right' ? 'text-right tabular-nums' : 'text-left'} text-gray-700`}>
                      {ci === 0 && barKey ? (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 bg-slate-100 rounded" style={{ width: `${((row[barKey] || 0) / max) * 100}%` }} />
                          <span className="relative block truncate max-w-xs font-medium">{c.render ? c.render(row) : row[c.key]}</span>
                        </div>
                      ) : c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
