#!/usr/bin/env bash

set -Eeuo pipefail

readonly APP_DIR="/home/yack/apps/prod/leela/discord-bot"
readonly SERVICE_NAME="discord-bot.service"

trap 'echo "Deployment failed on line $LINENO." >&2' ERR

cd "$APP_DIR"

sudo -v

echo "Pulling latest from git..."
git pull --ff-only

echo "Installing NPM dependencies..."
npm ci --omit=dev

echo "Restarting Discord Bot Service..."
sudo systemctl restart discord-bot

echo "Discord Bot Service Status..."
sudo systemctl status discord-bot --no-pager
