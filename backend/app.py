"""
Excel Converter API
Transforms input Excel files according to business logic and returns converted output.
"""

import io
import zipfile
import calendar
from datetime import date, datetime

import pandas as pd
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow all origins for local development; restrict in production

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

REQUIRED_INPUT_COLUMNS = [
    "Organization Code",
    "Subinventory Code",
    "Item Code",
    "Item Name",
    "Item Type",
    "Primary Uom Name",
    "TOTAL QTY",
    "TOTAL AMT",
    "PRICE",
]

OUTPUT_COLUMNS = [
    "ORGANIZATION_CODE",
    "SUBINVENTORY_CODE",
    "LOCATOR_CODE",
    "ITEM_CODE",
    "QTY",
    "PRIMARY_UOM_NAME",
    "AVG_PRICE",
    "ORGANIZATION_ID",
    "AS_OF_DATE",
    "TOTAL_AMOUNT",
]

FIXED_LOCATOR_CODE = 1
FIXED_ORGANIZATION_ID = 126

# Both output profiles use the exact same transformation logic; they only
# differ in the output file basename. Kept as a dict so new profiles (e.g. a
# future "file04") can be added later without touching /convert's logic.
OUTPUT_PROFILES = {
    "file01": "file01",
    "file02": "file02",
    "file03": "file03",
}


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def get_default_as_of_month() -> str:
    """Return the previous calendar month in YYYY-MM format."""
    today = date.today()
    first_of_current = today.replace(day=1)
    last_of_previous = first_of_current - pd.Timedelta(days=1)
    return last_of_previous.strftime("%Y-%m")


def get_last_day_of_month(as_of_month: str | None = None) -> str:
    """
    Return the last day of the given month as d/M/yyyy (no zero-padding),
    matching the reference output format, e.g. "30/6/2026" not "30/06/2026".
    """
    month_value = (as_of_month or get_default_as_of_month()).strip()

    try:
        target_month = datetime.strptime(month_value, "%Y-%m").date()
    except ValueError as exc:
        raise ValueError("as_of_month ต้องเป็นรูปแบบ YYYY-MM เช่น 2026-01") from exc

    last_day = calendar.monthrange(target_month.year, target_month.month)[1]
    result_date = target_month.replace(day=last_day)
    return f"{result_date.day}/{result_date.month}/{result_date.year}"


def find_header_row(df_raw: pd.DataFrame) -> int | None:
    """Find the real header row inside the first 20 rows."""
    for i, row in df_raw.head(20).iterrows():
        values = [str(value).strip() for value in row.values]
        if "Organization Code" in values:
            return i
    return None


def drop_trailing_summary_rows(df: pd.DataFrame) -> pd.DataFrame:
    """
    Drop trailing footer/grand-total rows.

    Report exports like "Movement Endding Report" end with a single grand
    total row that has no Organization Code (it's blank / NaN there, with
    only aggregate numbers in the movement columns). Real item rows always
    have an Organization Code. Rather than chopping a fixed number of rows
    from the tail (which risks deleting real data if the footer shape
    changes), walk backwards from the end and drop only rows where
    Organization Code is missing.
    """
    mask = df["Organization Code"].notna()
    if mask.all():
        return df.reset_index(drop=True)

    last_valid_idx = mask[mask].index.max()
    return df.loc[:last_valid_idx].reset_index(drop=True)


def get_engine_for_filename(filename: str) -> str:
    """
    Pick the right pandas/Excel engine based on file extension.

    Legacy ".xls" files (BIFF / OLE compound documents, as produced by many
    ERP "export to Excel" report screens) are NOT zip-based and cannot be
    read by openpyxl at all - it raises "File is not a zip file". They need
    the older "xlrd" engine. Modern ".xlsx" files need openpyxl instead.
    """
    return "xlrd" if filename.lower().endswith(".xls") else "openpyxl"


def read_excel_smart(file_storage) -> pd.DataFrame:
    """Read Excel by auto-detecting the actual header row."""
    engine = get_engine_for_filename(file_storage.filename)

    file_storage.stream.seek(0)
    df_raw = pd.read_excel(file_storage.stream, engine=engine, header=None)

    header_row = find_header_row(df_raw)
    if header_row is None:
        raise ValueError("ไม่พบ header row ที่มีคอลัมน์ Organization Code")

    file_storage.stream.seek(0)
    df = pd.read_excel(file_storage.stream, engine=engine, header=header_row)
    df.columns = [str(c).strip() for c in df.columns]
    df = df.dropna(how="all").reset_index(drop=True)
    df = drop_trailing_summary_rows(df)

    return df


def format_number_smart(value) -> str:
    """
    Format a numeric value the way the reference output file (e.g. "4.csv")
    does: whole numbers are written without a trailing ".0" (850, not
    850.0), while genuine decimals keep their natural, shortest round-trip
    representation (179.34545, not 179.34545000000001).

    Used for SUBINVENTORY_CODE, AVG_PRICE and TOTAL_AMOUNT, which pandas
    otherwise stores as float64 and writes with a spurious ".0" suffix in
    CSV/Excel export.
    """
    try:
        f = float(value)
    except (ValueError, TypeError):
        return "" if pd.isna(value) else str(value)

    if pd.isna(f):
        return ""
    # Round away binary floating-point noise (e.g. 32.222069999999995 from a
    # computed Excel cell) while still preserving genuine precision - the
    # source report never needs more than 6 decimal places.
    f = round(f, 6)
    if f == int(f):
        return str(int(f))
    return repr(f)


def validate_columns(df: pd.DataFrame) -> list[str]:
    """Return a list of missing required column names."""
    actual_cols = [c.strip() for c in df.columns.tolist()]
    missing = [col for col in REQUIRED_INPUT_COLUMNS if col not in actual_cols]
    return missing


def transform_dataframe(df: pd.DataFrame, as_of_month: str | None = None) -> pd.DataFrame:
    """
    Apply business logic transformations and return the output DataFrame.

    Column mapping:
      ORGANIZATION_CODE  <- Organization Code
      SUBINVENTORY_CODE  <- Subinventory Code
      LOCATOR_CODE       <- constant 1
      ITEM_CODE          <- Item Code
      QTY                <- TOTAL QTY (natural precision, trailing zeros stripped)
      PRIMARY_UOM_NAME   <- Primary Uom Name
      AVG_PRICE          <- PRICE (natural precision, trailing zeros stripped)
      ORGANIZATION_ID    <- constant 126
      AS_OF_DATE         <- last day of selected month (dd/MM/yyyy)
      TOTAL_AMOUNT       <- TOTAL AMT (rounded 2 dp, trailing zeros stripped)
    """
    df.columns = [c.strip() for c in df.columns]

    as_of_date = get_last_day_of_month(as_of_month)

    output = pd.DataFrame()
    output["ORGANIZATION_CODE"] = df["Organization Code"]
    output["SUBINVENTORY_CODE"] = df["Subinventory Code"].apply(format_number_smart)
    output["LOCATOR_CODE"] = FIXED_LOCATOR_CODE
    output["ITEM_CODE"] = df["Item Code"]
    output["QTY"] = df["TOTAL QTY"].apply(format_number_smart)
    output["PRIMARY_UOM_NAME"] = df["Primary Uom Name"]
    output["AVG_PRICE"] = df["PRICE"].apply(format_number_smart)
    output["ORGANIZATION_ID"] = FIXED_ORGANIZATION_ID
    output["AS_OF_DATE"] = as_of_date
    output["TOTAL_AMOUNT"] = (
        pd.to_numeric(df["TOTAL AMT"], errors="coerce").round(2).apply(format_number_smart)
    )

    return output[OUTPUT_COLUMNS]


def build_csv_bytes(df: pd.DataFrame) -> bytes:
    """Serialize the output DataFrame as UTF-8 CSV bytes."""
    return df.to_csv(index=False, encoding="utf-8-sig").encode("utf-8-sig")


def build_excel_bytes(df: pd.DataFrame) -> bytes:
    """Serialize the output DataFrame as Excel bytes."""
    output_buffer = io.BytesIO()
    with pd.ExcelWriter(output_buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Output")
    return output_buffer.getvalue()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health_check():
    """Simple health-check endpoint."""
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})


@app.route("/preview", methods=["POST"])
def preview():
    """
    Accept an Excel file and return the first 5 rows as JSON for frontend preview.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if not file.filename.endswith((".xlsx", ".xls")):
        return jsonify({"error": "Invalid file type. Please upload an Excel file (.xlsx or .xls)"}), 400

    try:
        df = read_excel_smart(file)
    except ValueError as e:
        return jsonify({"error": str(e)}), 422
    except Exception as e:
        return jsonify({"error": f"Failed to read Excel file: {str(e)}"}), 400

    missing_cols = validate_columns(df)
    if missing_cols:
        return jsonify({
            "error": f"Missing required columns: {', '.join(missing_cols)}"
        }), 422

    preview_data = df.head(5).fillna("").to_dict(orient="records")
    return jsonify({
        "preview": preview_data,
        "total_rows": len(df),
        "columns": df.columns.tolist(),
    })


@app.route("/convert", methods=["POST"])
def convert():
    """
    Main conversion endpoint.
    Accepts a multipart/form-data POST with an Excel file (the original
    source report, e.g. "3 ต้นฉบับ"), transforms it per business logic, and
    returns a .zip bundle containing both .xlsx and .csv outputs.

    The "output_name" form field is required and selects which output
    profile / basename to use: "file01", "file02", or "file03". This is
    intentionally not defaulted - the caller (frontend) must explicitly
    choose, so a forgotten selection never silently produces the wrong
    file. Whichever profile is chosen, the result is saved as
    <profile>.csv and <profile>.xlsx inside <profile>.zip.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    as_of_month = request.form.get("as_of_month")
    output_name_raw = request.form.get("output_name")

    if not output_name_raw:
        return jsonify({
            "error": f"กรุณาระบุ output_name (หนึ่งใน: {', '.join(OUTPUT_PROFILES)})"
        }), 400

    output_name = output_name_raw.strip().lower()
    if output_name not in OUTPUT_PROFILES:
        return jsonify({
            "error": f"output_name ไม่ถูกต้อง ต้องเป็นหนึ่งใน: {', '.join(OUTPUT_PROFILES)}"
        }), 400

    if not file.filename.endswith((".xlsx", ".xls")):
        return jsonify({"error": "Invalid file type. Please upload an Excel file (.xlsx or .xls)"}), 400

    try:
        df = read_excel_smart(file)
    except ValueError as e:
        return jsonify({"error": str(e)}), 422
    except Exception as e:
        return jsonify({"error": f"Failed to read Excel file: {str(e)}"}), 400

    missing_cols = validate_columns(df)
    if missing_cols:
        return jsonify({
            "error": f"Missing required columns: {', '.join(missing_cols)}"
        }), 422

    try:
        output_df = transform_dataframe(df, as_of_month=as_of_month)
    except ValueError as e:
        return jsonify({"error": str(e)}), 422
    except Exception as e:
        return jsonify({"error": f"Transformation failed: {str(e)}"}), 500

    output_basename = OUTPUT_PROFILES[output_name]
    csv_filename = f"{output_basename}.csv"
    excel_filename = f"{output_basename}.xlsx"
    zip_filename = f"{output_basename}.zip"

    output_buffer = io.BytesIO()
    with zipfile.ZipFile(output_buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as zip_file:
        zip_file.writestr(csv_filename, build_csv_bytes(output_df))
        zip_file.writestr(excel_filename, build_excel_bytes(output_df))

    output_buffer.seek(0)

    return send_file(
        output_buffer,
        as_attachment=True,
        download_name=zip_filename,
        mimetype="application/zip",
    )


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
