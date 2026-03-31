# HEARTBEAT.md - 心跳任务配置

## 📋 当前专注：小说漫剧创作

---

## 🔄 自动备份（Cron异步）
- **已配置**: 系统 cron 每3小时自动执行
- **脚本**: `/home/quan/.openclaw/workspace/scripts/async_backup.sh`
- **日志**: `/home/quan/.openclaw/workspace/logs/backup.log`
- **注意**: 心跳不再执行备份，备份不阻塞回复

---

## 心跳检查任务
- [x] 系统状态正常
- [x] 备份由 cron 自动完成

---

## 心跳规则
- **安静时间**: 23:00-08:00 (除非紧急)
- **输出格式**:
  - 正常：`HEARTBEAT_OK`
  - 备份完成：`[备份] 备份完成 - D:\OpenClaw_Backups\backup_YYYYMMDD_HHMM.tar.gz`
  - 异常：`[警报] 具体描述`

---

*最后更新: 2026-03-30 08:27*
*状态: ✅ 3小时备份已启用*
*记录者: 大哥*
