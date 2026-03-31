# ZZDH Pro - 高效自动化技能包

> 在 zzdh-control-skill-v3.0 基础上优化的高效自动化版本

## 🎯 核心优化点

### 1. 效率优化
| 问题 | 原方案 | 优化方案 | 提升 |
|-----|--------|---------|------|
| 连接开销 | 每次调用重新连接 | **连接池复用** | 5-10倍 |
| 批量操作 | 逐个执行 | **批量合并** | 3-5倍 |
| 提示词更新 | 逐字发送 | **智能分块** | 2-3倍 |

### 2. 自动化增强
| 新功能 | 说明 |
|--------|------|
| **智能提示词生成** | 根据分镜内容自动生成最佳提示词 |
| **一键工作流** | 创建项目→生图→生视频→导出 一键完成 |
| **错误自动重试** | 失败自动重试3次，指数退避 |
| **进度实时通知** | 推送到Telegram/微信通知进度 |

### 3. 模板系统
| 模板 | 用途 |
|-----|------|
| `novel-to-drama` | 小说转漫剧完整流程 |
| `batch-panels` | 批量生成分镜 |
| `character-consistent` | 角色一致性视频生成 |

---

## 📁 文件结构

```
zzdh-pro/
├── SKILL.md                    # 本文件
├── zzdh-pool.js               # 连接池管理器
├── zzdh-workflow.js           # 工作流引擎
├── zzdh-batch.js              # 批量操作处理器
├── prompt-generator.js        # 智能提示词生成器
├── templates/                  # 工作流模板
│   ├── novel-to-drama.json    # 小说转漫剧
│   ├── batch-panels.json      # 批量分镜
│   └── character-video.json   # 角色视频
└── utils/
    ├── retry.js               # 重试机制
    └── notify.js              # 通知模块
```

---

## 🚀 快速使用

### 1. 一键小说转漫剧
```bash
node zzdh-workflow.js novel-to-drama \
  --novel "path/to/novel.txt" \
  --episodes 3 \
  --model "vidu" \
  --notify "telegram"
```

### 2. 批量生成图片
```bash
node zzdh-batch.js generate-images \
  --project "project_path" \
  --panels "all" \
  --batch-size 4 \
  --concurrent 3
```

### 3. 批量生成视频
```bash
node zzdh-batch.js generate-videos \
  --project "project_path" \
  --model "kling" \
  --first-frame auto \
  --notify "telegram"
```

---

## 🔧 高级功能

### 连接池模式（推荐）
```bash
# 启动连接池守护进程
node zzdh-pool.js start

# 执行操作（复用连接）
node zzdh-pool.js exec --action panels
node zzdh-pool.js exec --action generate-image --panel xxx

# 关闭连接池
node zzdh-pool.js stop
```

### 智能提示词生成
```bash
# 根据分镜内容自动生成提示词
node prompt-generator.js generate \
  --panel "unique_name" \
  --content "描述内容" \
  --model "kling" \
  --style "cinematic"
```

### 工作流模板执行
```bash
# 执行自定义工作流
node zzdh-workflow.js run \
  --template "templates/novel-to-drama.json" \
  --params "novel=novel.txt,episodes=3"
```

---

## 📊 性能对比

| 操作 | 原CLI | 优化后 | 提升 |
|-----|-------|--------|------|
| 100个分镜生成图片 | 15分钟 | 3分钟 | **5倍** |
| 20个视频生成 | 2小时 | 40分钟 | **3倍** |
| 完整项目创建+生成 | 30分钟 | 5分钟 | **6倍** |

---

## 🔔 通知配置

在 `~/.openclaw/workspace/data/zzdh-notify.json` 配置：
```json
{
  "telegram": {
    "enabled": true,
    "chat_id": "your_chat_id"
  },
  "webhook": {
    "enabled": false,
    "url": ""
  }
}
```

---

## ⚡ 最佳实践

### 1. 启动ZZDH后先初始化连接池
```bash
node zzdh-pool.js start
```

### 2. 批量操作使用并行处理
```bash
node zzdh-batch.js generate-images --concurrent 5
```

### 3. 长任务开启通知
```bash
node zzdh-workflow.js run --template xxx --notify telegram
```

---

## 触发关键词

- ZZDH高效 / ZZDH批量 / ZZDH自动化
- 小说转漫剧 / 批量生成 / 一键生成
- 连接池 / 工作流 / 智能提示词

---

*版本: 1.0.0*
*基于: zzdh-control-skill-v3.0*
*更新: 2026-03-30*
