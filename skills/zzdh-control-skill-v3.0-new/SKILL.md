# ZZDH Control Skill

通过 WebSocket 实时操控 ZZDH（随心生成器）软件。
与 MCP Server v3.2.0 完全同步，默认流式输出，覆盖全部 47 个工具。

## 前提条件

- ZZDH 软件正在运行（后端 WebSocket 服务会自动启动）
- Node.js >= 21（使用内置 WebSocket，零依赖）

## CLI 路径

```
__SKILL_DIR__/zzdh-cli.js
```

## 使用方式

通过 `exec` 工具调用 CLI。每次调用自动连接→执行→断开（单次执行模式），输出 JSON（stdout），日志输出 stderr。
```bash
node "__SKILL_DIR__/zzdh-cli.js" <action> [--options]
```

## 完整操作列表（47 个工具，与 MCP Server v3.2.0 一一对应）

### 连接管理（3）

| action | 说明 | 关键参数 |
|--------|------|----------|
| `discover` | 发现端口（不连接） | 无 |
| `connect` | 连接并自动加载第一个项目 | `[--port N]` |
| `status` | 连接状态 | `[--port N]` |
| `disconnect` | 断开连接 | `[--port N]` |

### 页面导航（2）🆕

| action | 说明 | 关键参数 |
|--------|------|----------|
| `go-home` | 返回主页（项目列表） | 无 |
| `open-create-dialog` | 打开创建项目的对话框 | 无 |

### 项目管理（5）

| action | 说明 | 关键参数 |
|--------|------|----------|
| `project-list` | 获取项目列表 | 无 |
| `project-options` | 获取创建选项（模板列表等） | 无 |
| `create-project` | 创建项目 | `--name N --type T [--content C] [--video-path V] [--srt-path S] [--template-id ID]` |
| `open-project` | 打开项目 | `--path P` |
| `switch-project` | 切换项目 | `--path P` |

项目类型（--type）：`paperwork`（文案）、`script`（剧本）、`recreation`（静态二创）、`videoClone`（视频二创）

### 分镜操作（14）

| action | 说明 | 关键参数 |
|--------|------|----------|
| `panels` | 获取分镜列表 | 无 |
| `edit-view` | 获取编辑视图数据 | `[--panel U]` |
| `update-prompt` | 更新提示词 | `--panel U --prompt P` |
| `update-inherit-prompt` | 更新继承提示词 | `--panel U --prompt P` |
| `update-video-prompt` | 更新视频提示词 | `--panel U --prompt P` |
| `update-paperwork` | 更新文案 | `--panel U --text T` |
| `update-negative-prompt` | 更新负面提示词 | `--panel U --prompt P` |
| `stream-update-prompt` | 流式更新提示词 | `--panel U --prompt P [--mode chunk\|typewriter\|smart] [--chunk-size 18] [--delay 150]` |
| `add-panel` | 添加分镜 | `[--after U]` |
| `delete-panel` | 删除分镜 | `--panel U` |
| `move-panel` | 移动分镜 | `--panel U --index N` |
| `split-panel` | 拆分分镜 | `--panel U --dir up\|down` |
| `merge-panel` | 合并分镜 | `--panel U --dir up\|down` |

### 图片操作（15，含新增 5 个）

| action | 说明 | 关键参数 |
|--------|------|----------|
| `select-image` | 选择图片 | `--panel U --index N` |
| `toggle-image-select` | 🆕 切换图片选择状态 | `--panel U --index N` |
| `drag-image` | 拖拽排序 | `--panel U --from N --to N` |
| `delete-image` | 删除图片 | `--panel U --index N` |
| `generate-image` | 生成图片 | `--panel U [--batch 4]` |
| `cancel-generate` | 取消生成 | `--panel U` |
| `batch-generate` | 批量生成 | `--panels U1,U2 [--mode image\|video]` |
| `import-image` | 🆕 导入图片(Base64) | `--panel U --data BASE64` |
| `import-image-from-path` | 从文件路径导入图片 | `--panel U --imagepath P` |
| `export-image` | 🆕 导出图片 | `--panel U [--index N]` |
| `copy-image` | 🆕 复制图片到剪贴板 | `--panel U [--index N]` |
| `paste-image` | 🆕 从剪贴板粘贴图片 | `--panel U` |

### 首尾帧 / 视频操作（10）

| action | 说明 | 关键参数 |
|--------|------|----------|
| `set-first-frame` | 设置首帧 | `--panel U [--imgpath P] [--imgindex N]` |
| `set-end-frame` | 设置尾帧 | `--panel U [--imgpath P] [--imgindex N]` |
| `edit-select-first-frame` | 编辑视图选择首帧 | `--panel U --index N` |
| `edit-select-end-frame` | 编辑视图选择尾帧 | `--panel U --index N` |
| `edit-update-first-frame` | 编辑视图更新首帧 | `--panel U --index N` |
| `edit-update-end-frame` | 编辑视图更新尾帧 | `--panel U --index N` |
| `edit-paste-first-frame` | 粘贴首帧 | `--panel U` |
| `edit-paste-end-frame` | 粘贴尾帧 | `--panel U` |
| `merge-keyframes-first` | 合并关键帧到首帧 | `--panel U` |
| `merge-keyframes-end` | 合并关键帧到尾帧 | `--panel U` |
| `generate-video` | 生成视频 | `--panel U` |
| `set-duration` | 设置时长 | `--panel U --seconds N` |
| `toggle-lip-sync` | 切换口型同步 | `--panel U --enabled true\|false` |

### 模式切换（2）

| action | 说明 | 关键参数 |
|--------|------|----------|
| `switch-media-mode` | 全局切换图片/视频模式 | `--mode image\|video` |
| `switch-prompt-mode` | 单分镜切换提示词模式 | `--panel U [--enabled true\|false]` |

### 角色 / 场景 / 物品（5）

| action | 说明 | 关键参数 |
|--------|------|----------|
| `get-entities` | 获取列表 | `--type character\|location\|item` |
| `toggle-character` | 切换角色 | `--panel U --id ID` |
| `toggle-scene` | 切换场景 | `--panel U --id ID` |
| `toggle-item` | 切换物品 | `--panel U --id ID` |
| `auto-match-character` | 自动匹配角色 | `--panel U` |

### 任务管理（6，含新增 1 个）

| action | 说明 | 关键参数 |
|--------|------|----------|
| `task-status` | 任务队列状态 | 无 |
| `open-task-queue` | 🆕 打开任务队列面板 | 无 |
| `cancel-task` | 取消任务 | `--task-id ID` |
| `pause-task` | 暂停任务 | `--task-id ID` |
| `resume-task` | 恢复任务 | `--task-id ID` |
| `reorder-tasks` | 重排任务 | `--category C --ids ID1,ID2` |

## 与 MCP Server v3.2.0 的消息映射

CLI 内部实现了与 MCP Server `_map_msg_type` 完全一致的映射：

| MCP 工具名 | 后端实际消息类型 |
|------------|-----------------|
| `zzdh_get_project_options` | `get_create_project_options` |
| `zzdh_create_project` (type=paperwork) | `create_project_paper` |
| `zzdh_create_project` (type=script) | `create_project_script` |
| `zzdh_create_project` (type=recreation) | `create_project_recreation` |
| `zzdh_create_project` (type=videoClone) | `create_project_video_clone` |
| `zzdh_stream_update_prompt` | 多次 `update_prompt`（CLI 侧模拟） |
| 其他所有工具 | 去掉 `zzdh_` 前缀直接转发 |

## 典型工作流

### 1. 创建文案作品并生成图片
```bash
node zzdh-cli.js connect
node zzdh-cli.js create-project --name "春日风景" --type paperwork --content "春风拂面，万物复苏"
node zzdh-cli.js panels
node zzdh-cli.js update-prompt --panel <unique_name> --prompt "a beautiful spring landscape with cherry blossoms"
node zzdh-cli.js generate-image --panel <unique_name> --batch 4
node zzdh-cli.js task-status
```

### 2. 视频生成完整流程
```bash
node zzdh-cli.js connect
node zzdh-cli.js panels
node zzdh-cli.js generate-image --panel <unique_name> --batch 4
node zzdh-cli.js switch-media-mode --mode video
node zzdh-cli.js update-video-prompt --panel <unique_name> --prompt "cinematic animation, 4K"
node zzdh-cli.js edit-update-first-frame --panel <unique_name> --index 0
node zzdh-cli.js edit-update-end-frame --panel <unique_name> --index 2
node zzdh-cli.js generate-video --panel <unique_name>
node zzdh-cli.js task-status
```

### 3. 流式提示词更新（新增 typewriter 模式）
```bash
# 标准分块（默认）
node zzdh-cli.js stream-update-prompt --panel <unique_name> --prompt "完整提示词..." --mode chunk
# 打字机效果
node zzdh-cli.js stream-update-prompt --panel <unique_name> --prompt "完整提示词..." --mode typewriter --delay 80
# 智能分词
node zzdh-cli.js stream-update-prompt --panel <unique_name> --prompt "完整提示词..." --mode smart
```

### 4. 图片导入导出（新增）
```bash
# 从文件导入
node zzdh-cli.js import-image-from-path --panel <unique_name> --imagepath "C:\path\to\image.png"
# 导出图片
node zzdh-cli.js export-image --panel <unique_name> --index 0
# 复制/粘贴
node zzdh-cli.js copy-image --panel <unique_name> --index 0
node zzdh-cli.js paste-image --panel <other_unique_name>
```

## 注意事项

1. **每次调用重新连接**：CLI 为单次执行模式
2. **ZZDH 必须运行**：否则报「无法发现 WebSocket 端口」
3. **异步生成等待完成**：generate-image (5min) / generate-video (10min)
4. **unique_name 从 panels 返回值获取**
5. **--port 可选**：默认自动发现
6. **🆕 标记的操作**为 v2.0 新增，对齐 MCP Server v3.2.0

## 触发关键词

当用户提到以下内容时使用此 skill：
- 操控 ZZDH / 随心生成器
- 创建作品 / 生成分镜 / AI视频
- 图片生成 / 视频生成 / 首尾帧
- 提示词 / 流式更新
- ZZDH 项目管理
- 导出图片 / 复制粘贴图片 / 导入图片
- 返回主页 / 创建对话框
