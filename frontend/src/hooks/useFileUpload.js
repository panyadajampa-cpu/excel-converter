import { useState, useRef, useCallback } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

function getDefaultAsOfMonth() {
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = previousMonth.getFullYear();
  const month = String(previousMonth.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Manages the full lifecycle of file selection -> preview -> convert -> download.
 */
export function useFileUpload() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [asOfMonth, setAsOfMonth] = useState(getDefaultAsOfMonth);
  const [outputName, setOutputName] = useState(null); // must be explicitly chosen, no silent default
  const inputRef = useRef(null);

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
    setAsOfMonth(getDefaultAsOfMonth());
    setOutputName(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const isValidFile = (f) => {
    const ext = f.name.split(".").pop().toLowerCase();
    return ["xlsx", "xls"].includes(ext);
  };

  const selectFile = useCallback(async (f) => {
    if (!f) return;
    if (!isValidFile(f)) {
      setErrorMsg("กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น");
      setStatus("error");
      return;
    }

    setFile(f);
    setErrorMsg("");
    setStatus("previewing");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", f);

    try {
      const { data } = await axios.post(`${API_BASE}/preview`, formData);
      setPreview({
        rows: data.preview,
        columns: data.columns,
        totalRows: data.total_rows,
      });
      setStatus("ready");
    } catch (err) {
      const msg = err.response?.data?.error || "ไม่สามารถโหลดตัวอย่างข้อมูลได้";
      setErrorMsg(msg);
      setStatus("error");
      setFile(null);
    }
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) selectFile(dropped);
    },
    [selectFile],
  );

  const convert = useCallback(async () => {
    if (!file) return;
    if (!outputName) {
      setErrorMsg("กรุณาเลือกรูปแบบไฟล์ผลลัพธ์ (File02 หรือ File03) ก่อนแปลงไฟล์");
      setStatus("error");
      return;
    }

    setStatus("converting");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("as_of_month", asOfMonth);
    formData.append("output_name", outputName);

    try {
      const response = await axios.post(`${API_BASE}/convert`, formData, {
        responseType: "blob",
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / (e.total || 1)) * 60);
          setProgress(pct);
        },
      });

      let prog = 60;
      const interval = setInterval(() => {
        prog += Math.random() * 8;
        if (prog >= 95) {
          clearInterval(interval);
          prog = 95;
        }
        setProgress(Math.round(prog));
      }, 120);

      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      const disposition = response.headers["content-disposition"] || "";
      const nameMatch = disposition.match(/filename="?([^";\n]+)"?/);
      anchor.download = nameMatch ? nameMatch[1] : "converted_output.zip";
      anchor.href = url;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      clearInterval(interval);
      setProgress(100);
      setStatus("success");
    } catch (err) {
      let msg = "เกิดข้อผิดพลาดในการแปลงไฟล์";
      if (err.response) {
        const text = (await err.response.data.text?.()) ?? "";
        try {
          const parsed = JSON.parse(text);
          msg = parsed.error || msg;
        } catch {
          msg = text || msg;
        }
      }
      setErrorMsg(msg);
      setStatus("error");
    }
  }, [asOfMonth, outputName, file]);

  return {
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
  };
}
