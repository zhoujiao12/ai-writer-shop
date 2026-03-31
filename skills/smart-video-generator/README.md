# 智能视频生成器 v1.0 - 使用指南

## ✅ 已创建的Skill

**位置：** `~/.openclaw/workspace/skills/smart-video-generator/`

**核心文件：**
- `SKILL.md` - Skill说明文档
- `scripts/smart_video_main.js` - 主控制器
- `scripts/text_analyzer.js` - 文本分析器

---

## 🚀 快速使用

### 方式1：命令行调用

```bash
cd ~/.openclaw/workspace/skills/smart-video-generator/scripts

node smart_video_main.js \
  --text "你的小说/剧本内容" \
  --style 古装 \
  --duration 60 \
  --projectName "我的视频"
```

### 方式2：直接告诉我

直接说：
> "用智能视频生成器，把这段文字生成视频：[你的文本]"

---

## 📋 参数说明

| 参数 | 说明 | 默认值 |
|-----|------|--------|
| `--text` | 要转换的文本内容 | **必填** |
| `--style` | 视频风格（古装/现代/科幻） | cinematic |
| `--duration` | 目标时长（秒） | 60 |
| `--platform` | 目标平台（douyin/bilibili/youtube） | douyin |
| `--projectName` | 项目名称 | 智能视频 |
| `--imageModel` | 图片模型（flux/midjourney） | flux |
| `--videoModel` | 视频模型（vidu-r2v/sora2/kling） | vidu-r2v |

---

## 🎯 核心功能

1. **文本分析** → 自动提取角色和场景
2. **角色库** → 自动生成角色描述和参考图提示词
3. **分镜拆分** → 按平台参数智能拆分
4. **提示词生成** → 按模型公式自动生成
5. **ZZDH注入** → 自动创建项目并注入内容

---

## ⚠️ 当前限制

1. **角色提取** - 需要LLM支持，当前使用简单匹配
2. **视频生成** - 需要手动在ZZDH中选择模型生成
3. **人物一致性** - 推荐使用Vidu R2V模型

---

## 🔧 后续优化方向

1. 集成LLM进行深度文本分析
2. 添加Vidu API直接调用
3. 添加ttv-pipeline支持
4. 自动生成角色参考图
5. 质量检查和自动重试

---

## 💡 使用示例

```
我: 用智能视频生成器，把这段生成视频：

"苏婉音是相府庶女，前世被沉塘。重生后复仇，
嫡姐大婚被退婚，三年后封贵妃。"

风格：古装
时长：60秒
平台：抖音
```

大哥会自动执行全流程。

---

*创建时间: 2026-03-31*
*版本: 1.0*
