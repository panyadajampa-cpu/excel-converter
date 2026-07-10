import React from 'react'

/** Sun / Moon toggle button */
export function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle dark mode"
      className={`
        relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none
        focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2
        ${isDark
          ? 'bg-ink-700 border border-ink-600'
          : 'bg-ink-200 border border-ink-300'}
      `}
    >
      {/* Track knob */}
      <span
        className={`
          absolute top-0.5 w-5 h-5 rounded-full flex items-center justify-center
          transition-all duration-300 text-xs
          ${isDark
            ? 'translate-x-6 bg-gold-400 shadow-lg'
            : 'translate-x-0.5 bg-white shadow-sm'}
        `}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
