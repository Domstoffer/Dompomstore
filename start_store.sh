#!/bin/bash
# Startup script for Dompomstore Full System

echo "======================================"
echo "🚀 STARTING DOMPOMSTORE SYSTEM"
echo "======================================"

# Stop any running instances of serve globally just in case (optional, we'll try to use a specific port)
# killall serve 2>/dev/null

echo "1. Starting Secure Node.js Backend (Port 3001) ..."
cd dompomstore-backend
npm start &
BACKEND_PID=$!

cd ..

echo "2. Starting Frontend Shop Server (Port 8080) ..."
npx serve . -l 8080 &
FRONTEND_PID=$!

echo "======================================"
echo "✅ SYSTEM IS ONLINE"
echo "======================================"
echo "🛒 Public Shop:  http://localhost:8080"
echo "🔐 Admin Panel:  http://localhost:8080/admin.html"
echo "======================================"
echo "Drücke CTRL+C um das System zu beenden."

# Wait for background processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM
wait
