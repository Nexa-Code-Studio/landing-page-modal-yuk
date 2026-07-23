#!/bin/bash
# Restart frontend service

echo "=== Restarting Frontend Service (resurva-frontend) ==="

# Try to restart via PM2 under the original user who ran sudo
if [ -n "$SUDO_USER" ] && command -v pm2 &>/dev/null; then
    echo "Attempting PM2 restart as user $SUDO_USER..."
    su - "$SUDO_USER" -c "pm2 restart resurva-frontend" 2>/dev/null || true
fi

# Fallback / primary restart via systemd
echo "Restarting via systemd..."
systemctl restart resurva-frontend
systemctl is-active resurva-frontend
