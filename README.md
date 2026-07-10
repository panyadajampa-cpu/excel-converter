# Excel Converter — Production-Ready Full Stack App

> Transform Excel files with precision. Built with React + Vite (frontend) and Python Flask (backend).

---

## 📁 Project Structure

```
excel-converter/
├── backend/
│   ├── app.py              # Flask REST API
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment config template
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js       # Dev proxy → backend :5000
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── App.jsx          # Main UI
        ├── index.css        # Global styles + animations
        ├── main.jsx
        ├── hooks/
        │   ├── useTheme.js       # Dark/light mode
        │   └── useFileUpload.js  # Upload → preview → convert flow
        └── components/
            ├── ThemeToggle.jsx
            ├── DropZone.jsx
            ├── ProgressBar.jsx
            ├── PreviewTable.jsx
            └── StatusMessage.jsx
```

---

## 🚀 Getting Started

### 1. Backend (Python Flask)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Run dev server
python app.py
# → http://localhost:5000
```

### 2. Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
# → http://localhost:3000
```

> The Vite dev server proxies `/api/*` → `http://localhost:5000` automatically.

---

## 🔄 Business Logic

| Output Column       | Source / Rule                          |
|---------------------|----------------------------------------|
| ORGANIZATION_CODE   | Organization Code                      |
| SUBINVENTORY_CODE   | Subinventory Code                      |
| LOCATOR_CODE        | Fixed: **1**                           |
| ITEM_CODE           | Item Code                              |
| QTY                 | TOTAL QTY — 2 dp, trailing zeros trimmed |
| PRIMARY_UOM_NAME    | Primary Uom Name                       |
| AVG_PRICE           | PRICE                                  |
| ORGANIZATION_ID     | Fixed: **126**                         |
| AS_OF_DATE          | Last day of previous month (dd/MM/yyyy)|
| TOTAL_AMOUNT        | TOTAL AMT — 2 dp                       |

---

## 🏗️ Production Build

### Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Backend (Gunicorn)
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 🌐 API Endpoints

| Method | Path       | Description                        |
|--------|------------|------------------------------------|
| GET    | /health    | Health check                       |
| POST   | /preview   | Returns first 5 rows as JSON       |
| POST   | /convert   | Converts file, returns .xlsx blob  |

---

## ✨ Features

- Drag & Drop or click-to-select upload
- 5-row preview before converting
- Animated shimmer progress bar
- Dark mode (persisted to localStorage)
- Column validation with descriptive errors
- Auto-download on success
- Business logic schema panel (collapsible)
