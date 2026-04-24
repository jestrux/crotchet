#!/bin/bash
set -e

killall Crotchet 2>/dev/null || true
sleep 1

rm -rf /Applications/Crotchet.app
cp -R dist/mac-arm64/Crotchet.app /Applications/Crotchet.app

open /Applications/Crotchet.app
