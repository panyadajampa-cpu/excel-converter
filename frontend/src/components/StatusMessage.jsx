import React from 'react'

const VARIANTS = {
  success: {
    bg:   'bg-sage-500/8 border-sage-500/20',
    icon: '✓',
    iconBg: 'bg-sage-500/10 text-sage-500',
    title: 'แปลงไฟล์สำเร็จ!',
    sub:  'ไฟล์ถูกดาวน์โหลดอัตโนมัติแล้ว',
  },
  error: {
    bg:   'bg-coral-500/8 border-coral-500/20',
    icon: '✕',
    iconBg: 'bg-coral-500/10 text-coral-500',
    title: 'เกิดข้อผิดพลาด',
    sub:  null,
  },
}

export function StatusMessage({ status, errorMsg, onReset }) {
  const variant = status === 'success' ? VARIANTS.success : VARIANTS.error
  if (!variant) return null

  return (
    <div className={`
      animate-scale-in rounded-2xl border px-5 py-4 flex items-start gap-4
      ${variant.bg}
    `}>
      {/* Icon */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-base ${variant.iconBg}`}>
        {variant.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-ink-800 dark:text-ink-100 text-sm">
          {variant.title}
        </p>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
          {status === 'error' ? errorMsg : variant.sub}
        </p>
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="flex-shrink-0 text-xs font-medium text-ink-400 dark:text-ink-500
                   hover:text-ink-700 dark:hover:text-ink-200 transition-colors mt-0.5
                   underline underline-offset-2"
      >
        {status === 'success' ? 'แปลงไฟล์อื่น' : 'ลองอีกครั้ง'}
      </button>
    </div>
  )
}
