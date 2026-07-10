import React from 'react'

/** Animated progress bar shown during conversion */
export function ProgressBar({ progress }) {
  return (
    <div className="space-y-2 animate-fade-up">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-ink-500 dark:text-ink-400 font-mono">
          กำลังแปลงไฟล์...
        </span>
        <span className="text-sm font-display font-bold text-gold-500 font-mono">
          {progress}%
        </span>
      </div>
      {/* Track */}
      <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
        <div
          className="h-full rounded-full shimmer transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-ink-400 dark:text-ink-600 text-center">
        {progress < 60 ? 'กำลังอัปโหลดไฟล์…' : progress < 95 ? 'กำลังประมวลผลข้อมูล…' : 'เกือบเสร็จแล้ว…'}
      </p>
    </div>
  )
}
