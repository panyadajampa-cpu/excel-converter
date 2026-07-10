import React from 'react'

/** Displays first 5 rows of the uploaded Excel file */
export function PreviewTable({ preview }) {
  if (!preview) return null

  const { rows, columns, totalRows } = preview
  // Limit columns shown to avoid overflow
  const visibleCols = columns.slice(0, 9)

  return (
    <div className="animate-fade-up space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-ink-700 dark:text-ink-200 text-sm tracking-wide uppercase">
            ตัวอย่างข้อมูล
          </h3>
          <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">
            5 แถวแรก จากทั้งหมด{' '}
            <span className="text-gold-500 font-mono font-medium">{totalRows.toLocaleString()}</span>{' '}
            แถว
          </p>
        </div>
        {/* Column count badge */}
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-gold-400/10 text-gold-600 dark:text-gold-400 border border-gold-400/20">
          {columns.length} คอลัมน์
        </span>
      </div>

      {/* Table wrapper */}
      <div className="overflow-auto rounded-xl border border-ink-100 dark:border-ink-800 max-h-52">
        <table className="preview-table w-full text-xs">
          <thead>
            <tr className="bg-ink-50 dark:bg-ink-900">
              {visibleCols.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2.5 text-left font-display font-semibold text-ink-500 dark:text-ink-400
                             uppercase tracking-wider whitespace-nowrap border-b border-ink-100 dark:border-ink-800"
                >
                  {col}
                </th>
              ))}
              {columns.length > visibleCols.length && (
                <th className="px-3 py-2.5 text-left text-ink-400 dark:text-ink-600 border-b border-ink-100 dark:border-ink-800">
                  +{columns.length - visibleCols.length} more
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-ink-50 dark:border-ink-800/50 hover:bg-ink-50/60 dark:hover:bg-ink-800/30 transition-colors"
              >
                {visibleCols.map((col) => (
                  <td
                    key={col}
                    className="px-3 py-2 font-mono text-ink-600 dark:text-ink-300 whitespace-nowrap"
                  >
                    {row[col] !== undefined && row[col] !== null && row[col] !== ''
                      ? String(row[col])
                      : <span className="text-ink-300 dark:text-ink-600 italic">—</span>}
                  </td>
                ))}
                {columns.length > visibleCols.length && <td className="px-3 py-2 text-ink-300">…</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
