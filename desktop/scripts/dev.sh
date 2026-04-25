#!/bin/bash
set -e

killall Crotchet 2>/dev/null || true
pkill -f "electron.*crotchet/desktop" 2>/dev/null || true

cd "$(dirname "$0")/../../app"
npm run dev &
VITE_PID=$!

echo "Waiting for vite on port 5170..."
until curl -s http://localhost:5170 > /dev/null 2>&1; do
  sleep 0.5
done

echo "Vite ready, starting desktop..."
cd ../desktop
cross-env NODE_ENV=dev electron .

kill $VITE_PID 2>/dev/null || true
