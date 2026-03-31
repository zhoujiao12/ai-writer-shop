#!/bin/bash
# OpenClaw 自动备份脚本
# 每3小时备份到D盘

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H%M)
TIMESTAMP=$(date +%Y%m%d_%H%M)
BACKUP_DIR="/mnt/d/OpenClaw_Backups"
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"

echo "========================================"
echo "OpenClaw 自动备份"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# 创建备份目录
mkdir -p "${BACKUP_DIR}/${DATE}"
mkdir -p "${BACKUP_DIR}/logs"

# 执行备份
echo ""
echo "正在备份..."

tar -czf "${BACKUP_FILE}" \
  -C /home/quan/.openclaw \
  workspace/memory \
  workspace/MEMORY.md \
  workspace/IDENTITY.md \
  workspace/SOUL.md \
  workspace/USER.md \
  workspace/HEARTBEAT.md \
  workspace/data \
  workspace/skills \
  openclaw.json \
  agents \
  2>/dev/null

# 检查备份结果
if [ -f "${BACKUP_FILE}" ]; then
    SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "✅ 备份完成: ${BACKUP_FILE}"
    echo "✅ 文件大小: ${SIZE}"
    
    # 记录日志
    echo "$(date '+%Y-%m-%d %H:%M:%S') - 备份完成 - ${SIZE}" >> "${BACKUP_DIR}/logs/backup.log"
    
    # 清理30天前的备份
    find "${BACKUP_DIR}" -name "backup_*.tar.gz" -mtime +30 -delete 2>/dev/null
    echo "✅ 已清理30天前的旧备份"
else
    echo "❌ 备份失败"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - 备份失败" >> "${BACKUP_DIR}/logs/backup.log"
fi

echo ""
echo "========================================"
echo "备份任务结束"
echo "========================================"
