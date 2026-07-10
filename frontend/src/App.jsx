import React from "react";
import { useTheme } from "./hooks/useTheme";
import { useFileUpload } from "./hooks/useFileUpload";
import { ThemeToggle } from "./components/ThemeToggle";
import { DropZone } from "./components/DropZone";
import { ProgressBar } from "./components/ProgressBar";
import { PreviewTable } from "./components/PreviewTable";
import { StatusMessage } from "./components/StatusMessage";

const OUTPUT_SCHEMA = [
  { col: "ORGANIZATION_CODE", src: "Organization Code", note: "" },
  { col: "SUBINVENTORY_CODE", src: "Subinventory Code", note: "" },
  { col: "LOCATOR_CODE", src: "", note: "Fixed: 1" },
  { col: "ITEM_CODE", src: "Item Code", note: "" },
  { col: "QTY", src: "TOTAL QTY", note: "2 dp, trim zeros" },
  { col: "PRIMARY_UOM_NAME", src: "Primary Uom Name", note: "" },
  { col: "AVG_PRICE", src: "PRICE", note: "" },
  { col: "ORGANIZATION_ID", src: "", note: "Fixed: 126" },
  { col: "AS_OF_DATE", src: "", note: "Last day of selected month" },
  { col: "TOTAL_AMOUNT", src: "TOTAL AMT", note: "2 dp" },
];

export default function App() {
  const { isDark, toggle: toggleTheme } = useTheme();

  const {
    file,
    isDragging,
    preview,
    status,
    progress,
    errorMsg,
    asOfMonth,
    setAsOfMonth,
    outputName,
    setOutputName,
    inputRef,
    reset,
    selectFile,
    onDragOver,
    onDragLeave,
    onDrop,
    convert,
  } = useFileUpload();

  const isConverting = status === "converting";
  const isSuccess = status === "success";
  const isError = status === "error";
  const isReady = status === "ready";
  const isPreviewing = status === "previewing";

  const disableZone = isConverting || isSuccess;
  const disableButton =
    !file || !outputName || isConverting || isSuccess || isPreviewing;

  return (
    <div className="grain min-h-screen bg-ink-50 dark:bg-ink-950 transition-colors duration-300">
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full
                     bg-gradient-to-br from-gold-400/12 to-transparent
                     blur-3xl dark:from-gold-500/6"
        />
        <div
          className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full
                     bg-gradient-to-tr from-ink-300/10 to-transparent
                     blur-3xl dark:from-ink-700/20"
        />
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.025] dark:opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#grid)"
            className="text-ink-800 dark:text-ink-200"
          />
        </svg>
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg
                       bg-gradient-to-br from-gold-400 to-gold-600 shadow-sm"
          >
            <span className="font-display text-sm font-black leading-none text-white">
              X
            </span>
          </div>
          <span className="font-display font-semibold tracking-tight text-ink-800 dark:text-ink-100">
            Excel<span className="text-gold-500">Converter</span>
          </span>
        </div>
      </header>

      <main
        className="relative z-10 flex min-h-[calc(100vh-80px)] flex-col items-center justify-center
                   px-4 pb-16 pt-4"
      >
        <div className="mb-10 text-center animate-fade-up">
          <h1
            className="font-display text-4xl font-black leading-none tracking-tight
                       text-ink-900 dark:text-ink-50 sm:text-5xl"
          >
            แปลงไฟล์{" "}
            <span className="relative inline-block">
              <span className="text-gold-500">Excel</span>
              <svg
                className="absolute -bottom-1 left-0 w-full"
                height="6"
                viewBox="0 0 100 6"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5 Q50 0 100 5"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </svg>
            </span>{" "}
          </h1>
        </div>

        <div
          className="w-full max-w-xl animate-fade-up"
          style={{ animationDelay: "0.08s" }}
        >
          <div
            className="space-y-6 rounded-3xl border border-ink-100 bg-white p-7 shadow-card
                       dark:border-ink-800 dark:bg-ink-900 dark:shadow-card-dark"
          >
            {(isSuccess || isError) && (
              <StatusMessage
                status={status}
                errorMsg={errorMsg}
                onReset={reset}
              />
            )}

            {!isSuccess && (
              <DropZone
                file={file}
                isDragging={isDragging}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onFileChange={selectFile}
                inputRef={inputRef}
                disabled={disableZone}
              />
            )}

            {isPreviewing && (
              <div className="flex items-center gap-3 text-sm text-ink-500 animate-fade-up dark:text-ink-400">
                <svg
                  className="h-4 w-4 flex-shrink-0 animate-spin-slow text-gold-500"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                กำลังโหลดตัวอย่างข้อมูล...
              </div>
            )}

            {preview && !isConverting && !isSuccess && (
              <PreviewTable preview={preview} />
            )}

            {!isSuccess && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-ink-600 dark:text-ink-300">
                  รูปแบบไฟล์ผลลัพธ์{" "}
                  <span className="text-coral-500">*ต้องเลือก</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "file01", label: "File01" },
                    { value: "file02", label: "File02" },
                    { value: "file03", label: "File03" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setOutputName(opt.value)}
                      disabled={isConverting}
                      className={`
                        rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-150
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400
                        ${
                          outputName === opt.value
                            ? "border-gold-400 bg-gold-400/10 text-gold-600 dark:text-gold-400"
                            : "border-ink-200 bg-white text-ink-500 hover:border-ink-300 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-400"
                        }
                      `}
                    >
                      {opt.label}.zip
                    </button>
                  ))}
                </div>
                <p className="text-xs text-ink-400 dark:text-ink-500">
                  {outputName
                    ? `ผลลัพธ์จะถูกบันทึกเป็น ${outputName}.csv และ ${outputName}.xlsx ใน ${outputName}.zip`
                    : "เลือกรูปแบบไฟล์ผลลัพธ์ก่อนกดแปลงไฟล์"}
                </p>
              </div>
            )}

            {!isSuccess && (
              <div className="space-y-2">
                <label
                  htmlFor="as-of-month"
                  className="block text-sm font-medium text-ink-600 dark:text-ink-300"
                >
                  AS_OF_DATE month
                </label>
                <input
                  id="as-of-month"
                  type="month"
                  value={asOfMonth}
                  onChange={(e) => setAsOfMonth(e.target.value)}
                  disabled={isConverting}
                  className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm
                             text-ink-700 shadow-sm focus:outline-none focus-visible:ring-2
                             focus-visible:ring-gold-400 dark:border-ink-700 dark:bg-ink-950
                             dark:text-ink-100"
                />
                <p className="text-xs text-ink-400 dark:text-ink-500">
                  ระบบจะใช้วันสุดท้ายของเดือนที่เลือก เช่น 2026-01 จะได้
                  31/01/2026
                </p>
              </div>
            )}

            {isConverting && <ProgressBar progress={progress} />}

            {!isSuccess && (
              <button
                onClick={convert}
                disabled={disableButton}
                className={`
                  relative w-full overflow-hidden rounded-2xl py-3.5 text-sm font-display font-semibold tracking-wide
                  transition-all duration-200 focus:outline-none focus-visible:ring-2
                  focus-visible:ring-gold-400 focus-visible:ring-offset-2
                  ${
                    disableButton
                      ? "cursor-not-allowed bg-ink-100 text-ink-300 dark:bg-ink-800 dark:text-ink-600"
                      : "bg-gradient-to-r from-gold-500 to-gold-400 text-white shadow-sm hover:from-gold-400 hover:to-gold-300 hover:shadow-glow active:scale-[0.98]"
                  }
                `}
              >
                {isConverting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    กำลังแปลง...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {isReady ? "แปลงไฟล์" : "แปลงไฟล์"}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        <div
          className="mt-6 w-full max-w-xl animate-fade-up"
          style={{ animationDelay: "0.16s" }}
        ></div>
      </main>
    </div>
  );
}
