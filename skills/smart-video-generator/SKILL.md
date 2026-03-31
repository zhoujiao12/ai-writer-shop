# Smart Video Generator Skill

> 输入文本 → 自动生成人物一致的短视频
> 集成 ttv-pipeline + Vidu R2V + ZZDH

---

## 🎯 Skill 描述

当用户想要：
- 从小说/剧本生成视频
- 保持人物一致性
- 自动化全流程

**触发关键词：** 生成视频、文字转视频、小说转视频、人物一致、智能视频

---

## 📋 工作流程

### 用户输入
```
文本内容 + 诉求（风格/时长/平台）
```

### 自动执行

```
Step 1: 文本分析
├── 提取角色信息（姓名、外貌、性格）
├── 拆分场景/分镜
├── 识别情感基调
└── 计算视频时长

Step 2: 工具选择
├── 图片模型：Flux/Midjourney/ComfyUI
├── 视频模型：Vidu R2V/Sora2/ttv-pipeline
└── 按成本/质量/速度优化

Step 3: 角色库构建
├── 为每个角色生成参考图
├── 创建角色描述文档
└── 存入角色库供复用

Step 4: 提示词生成
├── 图片提示词（按模型公式）
├── 视频提示词（按模型公式）
└── 注入角色描述

Step 5: 批量生成
├── 生成角色参考图
├── 批量生成分镜图片
├── 批量生成视频片段
└── 进度通知

Step 6: 质量检查
├── 人物一致性评分
├── 画面质量评分
└── 不合格自动重试

Step 7: 输出交付
├── 导出视频文件
├── 生成项目报告
└── 推送到ZZDH
```

---

## 🛠️ 核心脚本

### 脚本1: 文本分析器
**路径：** `scripts/text_analyzer.js`

```javascript
/**
 * 分析文本，提取角色和场景
 */
async function analyzeText(text) {
  // 使用LLM分析
  const prompt = `
分析以下文本，提取：

1. 角色信息（每个角色的姓名、外貌、性格、服装）
2. 场景列表（每个场景的描述、情感、时长建议）
3. 整体风格建议

文本：
${text}

输出JSON格式。
  `;
  
  // 调用LLM
  const result = await callLLM(prompt);
  return JSON.parse(result);
}
```

### 脚本2: 角色参考图生成器
**路径：** `scripts/character_generator.js`

```javascript
/**
 * 为角色生成参考图
 */
async function generateCharacterReference(character, model = "flux") {
  // 构建提示词
  const prompt = `
${character.name}, ${character.appearance.age} years old, ${character.appearance.gender},
${character.appearance.hair}, ${character.appearance.eyes}, ${character.appearance.skin},
wearing ${character.clothing},
neutral expression, front view, full body,
white background, character reference sheet,
high quality, detailed, 4K
  `.trim();
  
  // 根据模型选择API
  if (model === "flux") {
    return await fluxAPI.generate(prompt);
  } else if (model === "midjourney") {
    return await midjourneyAPI.generate(prompt);
  }
}
```

### 脚本3: Vidu R2V 视频生成器
**路径：** `scripts/vidu_generator.js`

```javascript
/**
 * 使用Vidu R2V生成保持人物一致的视频
 */
async function generateViduVideo(characterRef, scene) {
  const response = await fetch("https://api.vidu.com/v1/reference-to-video", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${VIDU_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      reference_image: characterRef.url,
      prompt: `
Character: ${characterRef.description}
Scene: ${scene.description}
Action: ${scene.action}
Camera: ${scene.camera}
Mood: ${scene.mood}
Style: cinematic, high quality
      `.trim(),
      duration: scene.duration || 5,
      resolution: "1080p"
    })
  });
  
  return await response.json();
}
```

### 脚本4: ZZDH 集成器
**路径：** `scripts/zzdh_integrator.js`

```javascript
/**
 * 将生成的内容注入ZZDH
 */
async function integrateToZZDH(project, panels) {
  const ws = new WebSocket('ws://127.0.0.1:' + await getZZDHPort());
  
  // 创建项目
  ws.send(JSON.stringify({
    type: 'create_project_paper',
    data: { name: project.name, content: project.summary }
  }));
  
  // 添加分镜
  for (const panel of panels) {
    // 更新文案
    ws.send(JSON.stringify({
      type: 'update_paperwork',
      data: { unique_name: panel.id, paperwork: panel.text }
    }));
    
    // 更新图片提示词
    ws.send(JSON.stringify({
      type: 'update_prompt',
      data: { unique_name: panel.id, prompt: panel.imagePrompt }
    }));
    
    // 更新视频提示词
    ws.send(JSON.stringify({
      type: 'update_video_prompt',
      data: { unique_name: panel.id, video_prompt: panel.videoPrompt }
    }));
  }
}
```

### 脚本5: 主控制器
**路径：** `scripts/smart_video_main.js`

```javascript
/**
 * 智能视频生成主控制器
 */
async function generateVideo(text, requirements = {}) {
  console.log("🚀 智能视频生成启动...\n");
  
  // 默认配置
  const config = {
    imageModel: requirements.imageModel || "flux",
    videoModel: requirements.videoModel || "vidu-r2v",
    duration: requirements.duration || 60,
    platform: requirements.platform || "douyin",
    style: requirements.style || "cinematic"
  };
  
  // Step 1: 分析文本
  console.log("📝 Step 1: 分析文本...");
  const analysis = await analyzeText(text);
  console.log(`   发现 ${analysis.characters.length} 个角色`);
  console.log(`   拆分 ${analysis.scenes.length} 个场景\n`);
  
  // Step 2: 构建角色库
  console.log("👥 Step 2: 构建角色库...");
  const characterLibrary = {};
  for (const char of analysis.characters) {
    console.log(`   生成角色参考图: ${char.name}`);
    characterLibrary[char.name] = await generateCharacterReference(char, config.imageModel);
  }
  console.log("");
  
  // Step 3: 生成分镜
  console.log("🎬 Step 3: 生成分镜...");
  const panels = [];
  for (const scene of analysis.scenes) {
    const panel = {
      id: generateId(),
      text: scene.description,
      characters: scene.characters,
      imagePrompt: generateImagePrompt(scene, characterLibrary),
      videoPrompt: generateVideoPrompt(scene, characterLibrary),
      duration: scene.duration
    };
    panels.push(panel);
  }
  console.log(`   生成 ${panels.length} 个分镜\n`);
  
  // Step 4: 注入ZZDH
  console.log("📤 Step 4: 注入ZZDH...");
  await integrateToZZDH({ name: analysis.title, summary: text }, panels);
  console.log("   ✅ 注入完成\n");
  
  // Step 5: 生成报告
  console.log("📊 Step 5: 生成报告...");
  const report = {
    title: analysis.title,
    characters: analysis.characters.map(c => c.name),
    sceneCount: panels.length,
    estimatedDuration: panels.reduce((sum, p) => sum + p.duration, 0),
    estimatedCost: calculateCost(panels.length, config),
    nextSteps: [
      "1. 在ZZDH中打开项目",
      "2. 检查分镜内容",
      "3. 选择图片模型生成图片",
      "4. 切换视频模式选择Vidu",
      "5. 批量生成视频"
    ]
  };
  
  return report;
}

// 导出
module.exports = { generateVideo, analyzeText, generateCharacterReference };
```

---

## 🔌 外部工具集成

### ttv-pipeline 安装
```bash
cd ~/.openclaw/workspace/tools
git clone https://github.com/trilogy-group/ttv-pipeline.git
cd ttv-pipeline
pip install -r requirements.txt
```

### Vidu API 配置
```bash
# 在 .env 中添加
VIDU_API_KEY=your_api_key_here
```

### ComfyUI 集成
```bash
# 安装IP-Adapter节点
cd ComfyUI/custom_nodes
git clone https://github.com/cubiq/ComfyUI_IPAdapter_plus.git
```

---

## 📊 成本估算

| 方案 | 图片成本 | 视频成本 | 总计 |
|-----|---------|---------|------|
| **Vidu R2V** | 免费 | ¥0.3/秒 | ¥30/20镜 |
| **ttv-pipeline + Runway** | 免费 | $0.05/秒 | $5/20镜 |
| **ComfyUI本地** | 免费 | 免费 | 仅时间成本 |

---

## 🚀 使用示例

### 示例1：小说转视频
```javascript
const result = await generateVideo(
  `苏婉音是相府最卑微的庶女...`,
  {
    style: "古装剧",
    duration: 60,
    platform: "douyin",
    videoModel: "vidu-r2v"
  }
);
```

### 示例2：剧本转视频
```javascript
const result = await generateVideo(
  `[场景：古寺]
   苏婉音跪在佛前...
   [场景：婚礼]
   嫡姐大婚...`,
  {
    style: "电影",
    duration: 120,
    platform: "bilibili"
  }
);
```

---

## ⚙️ 配置文件

**路径：** `config/video_config.json`

```json
{
  "imageModels": {
    "flux": {
      "api": "fal.ai",
      "free": true,
      "quality": 4
    },
    "midjourney": {
      "api": "discord",
      "free": false,
      "quality": 5
    }
  },
  "videoModels": {
    "vidu-r2v": {
      "api": "vidu.com",
      "cost": 0.3,
      "consistency": 5,
      "maxDuration": 4
    },
    "sora2": {
      "api": "openai",
      "cost": 0.2,
      "consistency": 5,
      "maxDuration": 20
    },
    "ttv-pipeline": {
      "api": "local",
      "cost": 0,
      "consistency": 4,
      "maxDuration": 120
    }
  },
  "platforms": {
    "douyin": { "shotDuration": 5, "aspectRatio": "9:16" },
    "bilibili": { "shotDuration": 8, "aspectRatio": "16:9" },
    "youtube": { "shotDuration": 10, "aspectRatio": "16:9" }
  }
}
```

---

## 📝 角色库结构

**路径：** `data/character_library/`

```
character_library/
├── su_wanyin/
│   ├── reference.png          # 参考图
│   ├── description.json       # 角色描述
│   └── variations/            # 不同表情/角度
│       ├── front.png
│       ├── side.png
│       └── expression_angry.png
├── su_wanrou/
│   └── ...
└── library_index.json         # 角色库索引
```

---

## 🔄 更新日志

- **v1.0** (2026-03-31): 初始版本
  - 文本分析
  - 角色库构建
  - ZZDH集成
  - Vidu R2V支持

---

## 📚 参考资料

- [ttv-pipeline GitHub](https://github.com/trilogy-group/ttv-pipeline)
- [Vidu R2V 文档](https://www.vidu.com/blog/how-to-maintain-character-consistency-in-ai-videos)
- [ComfyUI IP-Adapter](https://github.com/cubiq/ComfyUI_IPAdapter_plus)

---

*Skill版本: 1.0*
*创建时间: 2026-03-31*
*作者: 大哥*
