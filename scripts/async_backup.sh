#!/bin/bash
BACKUP_DIR="/mnt/d/OpenClaw_Backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"

tar -czf "$BACKUP_FILE" \
  -C /home/quan/.openclaw \
  workspace/memory \
  workspace/MEMORY.md \
  workspace/IDENTITY.md \
  workspace/SOUL.md \
  workspace/USER.md \
  workspace/HEARTBEAT.md \
  workspace/data \
  workspace/skills \
  agents/*/MEMORY.md \
  agents/*/IDENTITY.md \
  agents/*/SOUL.md \
  agents/*/USER.md \
  2>/dev/null

echo "$(date): 备份完成 $BACKUP_FILE" >> /home/quan/.openclaw/workspace/logs/backup.log
