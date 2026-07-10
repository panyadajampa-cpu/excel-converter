import React from "react";

/** Drag-and-drop / click-to-select file upload area */
export function DropZone({
  file,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  inputRef,
  disabled,
}) {
  return (
    <div
      onDragOver={!disabled ? onDragOver : undefined}
      onDragLeave={!disabled ? onDragLeave : undefined}
      onDrop={!disabled ? onDrop : undefined}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200
        flex flex-col items-center justify-center gap-3 py-12 px-6 select-none
        ${isDragging ? "drop-active" : ""}
        ${
          disabled
            ? "opacity-50 cursor-not-allowed border-ink-200 dark:border-ink-700"
            : "border-ink-200 dark:border-ink-700 hover:border-gold-400 dark:hover:border-gold-500 hover:bg-amber-50/40 dark:hover:bg-ink-800/60"
        }
      `}
    >
      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files[0])}
        disabled={disabled}
      />

      {/* Icon */}
      <div
        className={`
        w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
        transition-transform duration-200
        ${isDragging ? "scale-110" : ""}
        ${
          file
            ? "bg-sage-500/10 text-sage-500"
            : "bg-gold-400/10 text-gold-500 dark:text-gold-400"
        }
      `}
      >
        {file ? "✓" : "⬆"}
      </div>

      {/* Text */}
      {file ? (
        <div className="text-center">
          <p className="font-display font-semibold text-ink-800 dark:text-ink-100 text-base">
            {file.name}
          </p>
          <p className="text-sm text-ink-400 dark:text-ink-500 mt-1">
            {(file.size / 1024).toFixed(1)} KB
          </p>
          <p className="text-xs text-gold-500 mt-2 font-medium tracking-wide">
            คลิกเพื่อเปลี่ยนไฟล์
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="font-display font-semibold text-ink-700 dark:text-ink-200 text-base">
            {isDragging ? "วางไฟล์ที่นี่" : "ลากไฟล์มาวาง หรือคลิกเพื่อเลือก"}
          </p>
          <p className="text-sm text-ink-400 dark:text-ink-500 mt-1">
            รองรับ .xlsx และ .xls เท่านั้น!
          </p>
        </div>
      )}
    </div>
  );
}
