#!/bin/bash

# SmartHire - AI Mock Interview Platform Startup Script

echo "======================================="
echo "  SmartHire - AI Mock Interview Platform"
echo "======================================="
echo

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo "Error: Backend directory not found at $BACKEND_DIR"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "Error: Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "  ✓ Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "  ✓ Frontend stopped"
    fi
    exit 0
}

trap cleanup SIGINT

# Start Backend
echo "[1/2] Starting Backend Server..."
cd "$BACKEND_DIR"
pnpm run dev &
BACKEND_PID=$!
echo "  ✓ Backend running on http://localhost:5000"

# Start Frontend
echo ""
echo "[2/2] Starting Frontend..."
cd "$FRONTEND_DIR"
pnpm start &
FRONTEND_PID=$!
echo "  ✓ Frontend running on http://localhost:3000"

echo ""
echo "======================================="
echo "  Both services are running!"
echo "  - Backend: http://localhost:5000"
echo "  - Frontend: http://localhost:3000"
echo "======================================="
echo ""
echo "Open http://localhost:3000 in your browser"
echo "Press Ctrl+C to stop both services"
echo ""

# Wait for both processes
wait
