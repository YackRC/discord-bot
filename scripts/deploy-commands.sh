#!/usr/bin/env bash
set -Eeuo pipefail

readonly APP_DIR="/home/yack/apps/prod/leela/discord-bot"

trap 'echo "Deployment failed on line $LINENO." >&2' ERR

cd "$APP_DIR"

npm run deploy
