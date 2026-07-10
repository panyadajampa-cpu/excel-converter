#!/usr/bin/env bash
# start.sh — Launch both backend and frontend in parallel

set -e

# Colors
GREEN='\033[0;32m'
GOLD='\033[0;33m'
NC='\033[0m'

echo -e "${GOLD}⚡ Excel Converter — Starting up...${NC}\n"

# ── Backend ────────────────────────────────────────────────────────────────
echo -e "${GREEN}[1/2] Starting Flask backend on :5000${NC}"
cd backend
if [ ! -d "venv" ]; then
  echo "  Creating virtualenv..."
  python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q
python app.py &
BACKEND_PID=$!
cd ..

sleep 1

# ── Frontend ───────────────────────────────────────────────────────────────
echo -e "${GREEN}[2/2] Starting Vite frontend on :3000${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
  echo "  Installing npm packages..."
  npm install -q
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "\n${GOLD}✓ Both servers running.${NC}"
echo "  Frontend → http://localhost:3000"
echo "  Backend  → http://localhost:5000"
echo ""
echo "  Press Ctrl+C to stop."

# Wait and cleanup
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
