# zzdh-control-skill

OpenClaw Skill — 通过 WebSocket 控制 ZZDH（随心生成器）软件。

## 功能

- 创建/管理 ZZDH 项目（文案、剧本、静态二创、视频二创）
- 分镜管理（增删改查、拆分合并）
- 提示词编辑（普通更新、流式更新）
- 图片/视频生成
- 首尾帧设置
- 角色/场景/物品管理
- 任务队列管理

## 安装

### 方式一：放入 OpenClaw skills 目录

```bash
# 1. 复制整个文件夹到 OpenClaw skills 目录
cp -r zzdh-control ~/.openclaw-autoclaw/skills/

# 2. 安装依赖
cd ~/.openclaw-autoclaw/skills/zzdh-control
npm install

# 3. 重启 OpenClaw 或等待自动发现
```

### 方式二：符号链接

```bash
ln -s /path/to/zzdh-control ~/.openclaw-autoclaw/skills/zzdh-control
cd ~/.openclaw-autoclaw/skills/zzdh-control
npm install
```

## 使用

OpenClaw 会自动发现此 skill。当你在对话中提到 ZZDH 相关操作时，AI 会通过 `zzdh-cli.js` 执行命令。

手动测试：
```bash
node zzdh-cli.js discover
node zzdh-cli.js connect
node zzdh-cli.js panels
```

## 文件结构

```
zzdh-control/
├── SKILL.md          # OpenClaw skill 定义（自动发现）
├── README.md         # 本文件
├── package.json      # 依赖配置
├── zzdh-cli.js       # CLI 工具（60 个操作）
└── node_modules/     # ws 依赖（npm install 后生成）
```

## 依赖

- [ws](https://github.com/websockets/ws) ^8.18.0 — WebSocket 客户端
- Node.js >= 18

## 前提

- ZZDH 软件正在运行（WebSocket 后端自动启动）

## License

MIT
