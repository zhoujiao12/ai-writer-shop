# 智能短视频生成系统 v1.0

> 输入文本 → 自动生成人物一致的短视频

---

## 一、核心需求

**输入：**
- 小说/剧本文本
- 用户诉求（风格、时长、平台等）

**输出：**
- 人物一致的视频片段
- 自动选择最优工具
- 完整视频成片

**核心难点：人物一致性**

---

## 二、人物一致性解决方案

### 方案对比

| 方案 | 一致性 | 成本 | 难度 | 推荐度 |
|-----|-------|------|------|--------|
| **Vidu R2V** | ⭐⭐⭐⭐⭐ | ¥0.3/秒 | 简单 | **最佳** |
| **Sora2 Cameos** | ⭐⭐⭐⭐⭐ | $20/月 | 简单 | 推荐 |
| **ComfyUI + IP-Adapter** | ⭐⭐⭐⭐ | 免费 | 复杂 | 进阶 |
| **训练LoRA** | ⭐⭐⭐⭐⭐ | 时间成本高 | 很复杂 | 专业 |

### 推荐方案：Vidu Reference to Video 2.0

**原因：**
- Multi-Entity Consistency（多实体一致性）
- 支持3个角色同时保持一致
- 操作简单：上传参考图 → 生成视频
- 价格便宜：¥0.3/秒

**工作流程：**
```
1. 生成角色参考图（1张高质量人物图）
2. 上传到Vidu R2V
3. 输入视频提示词
4. 生成保持人物一致的视频
```

---

## 三、智能化系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    用户输入                              │
│  文本内容 + 诉求（风格/时长/平台/角色数量）              │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│              第一步：智能分析                            │
│  • 提取角色信息（姓名、外貌、性格）                      │
│  • 拆分场景/分镜                                        │
│  • 识别情感基调                                         │
│  • 计算视频时长                                         │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│              第二步：工具选择                            │
│  根据需求自动选择：                                      │
│  • 图片模型：Flux/Midjourney/ComfyUI                    │
│  • 视频模型：Vidu R2V/Sora2/Grok                        │
│  • 按成本/质量/速度优化                                  │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│              第三步：角色库构建                          │
│  为每个角色生成：                                        │
│  • 1张高质量参考图（正面、中性表情、全身）               │
│  • 角色描述文档（外貌特征、服装、气质）                  │
│  • 存入角色库供复用                                     │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│              第四步：提示词生成                          │
│  按模型公式自动生成：                                    │
│  • 图片提示词（主体+场景+动作+风格）                     │
│  • 视频提示词（Scene+Style+Mood+Lighting+Camera）        │
│  • 注入角色描述保持一致性                                │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│              第五步：批量生成                            │
│  自动执行：                                              │
│  • 生成角色参考图                                       │
│  • 批量生成分镜图片                                     │
│  • 批量生成视频片段                                     │
│  • 进度通知                                             │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│              第六步：质量检查                            │
│  自动检测：                                              │
│  • 人物一致性评分                                       │
│  • 画面质量评分                                         │
│  • 不合格自动重试                                       │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│              第七步：输出交付                            │
│  • 导出视频文件                                         │
│  • 生成项目报告                                         │
│  • 推送到ZZDH或其他平台                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 四、关键技术实现

### 4.1 角色提取与描述生成

```javascript
// 从文本中提取角色信息
function extractCharacters(text) {
  // 使用LLM提取
  return {
    name: "苏婉音",
    appearance: {
      age: "16-18岁",
      gender: "女",
      hair: "乌黑长发",
      eyes: "清澈明亮",
      skin: "白皙",
      figure: "纤细"
    },
    clothing: "古代汉服，以白色、淡蓝色为主",
    personality: "外表柔弱，内心坚韧，复仇心强",
    expressions: ["低眉顺眼", "冷笑", "坚定", "悲伤"]
  };
}

// 生成角色参考图提示词
function generateCharacterPrompt(character) {
  return `${character.name}, ${character.appearance.age}, ${character.appearance.gender}, 
    ${character.appearance.hair}, ${character.appearance.eyes}, ${character.appearance.skin},
    wearing ${character.clothing}, neutral expression, full body shot, 
    white background, character reference sheet, high quality, detailed`;
}
```

### 4.2 分镜拆分

```javascript
// 智能分镜拆分
function splitIntoScenes(text, options) {
  const { duration = 60, platform = "douyin" } = options;
  
  // 根据平台确定分镜参数
  const config = {
    douyin: { shotDuration: 5, shotsPerMinute: 12 },
    bilibili: { shotDuration: 8, shotsPerMinute: 7 },
    youtube: { shotDuration: 10, shotsPerMinute: 6 }
  };
  
  const shotCount = Math.floor(duration / config[platform].shotDuration);
  
  // 使用LLM拆分
  return {
    shots: [
      {
        index: 1,
        description: "苏婉音被拖向池塘",
        characters: ["苏婉音"],
        emotion: "绝望",
        duration: 5,
        imagePrompt: "...",
        videoPrompt: "..."
      },
      // ... 更多分镜
    ]
  };
}
```

### 4.3 工具选择器

```javascript
// 智能选择工具
function selectTools(requirements) {
  const { budget, quality, speed, characterCount } = requirements;
  
  // 图片模型选择
  let imageModel;
  if (budget === "free") {
    imageModel = "Flux Schnell"; // 免费快速
  } else if (quality === "best") {
    imageModel = "Midjourney V7"; // 最佳质量
  } else {
    imageModel = "ComfyUI + Flux"; // 平衡
  }
  
  // 视频模型选择（重点：人物一致性）
  let videoModel;
  if (characterCount > 1) {
    videoModel = "Vidu R2V 2.0"; // 多角色一致性最佳
  } else if (budget === "premium") {
    videoModel = "Sora2"; // 高质量
  } else {
    videoModel = "Vidu R2V"; // 性价比
  }
  
  return { imageModel, videoModel };
}
```

### 4.4 人物一致性保证

```javascript
// Vidu R2V 工作流
async function generateConsistentVideo(characterRef, videoPrompt) {
  // 1. 上传角色参考图
  const refImage = await uploadToVidu(characterRef.imagePath);
  
  // 2. 构建视频提示词（注入角色描述）
  const enhancedPrompt = `
    Character: ${characterRef.description}
    Action: ${videoPrompt.action}
    Scene: ${videoPrompt.scene}
    Camera: ${videoPrompt.camera}
    Mood: ${videoPrompt.mood}
  `;
  
  // 3. 调用Vidu R2V API
  const video = await viduAPI.generate({
    referenceImage: refImage,
    prompt: enhancedPrompt,
    duration: 5
  });
  
  return video;
}
```

---

## 五、完整工作流脚本

```javascript
// 智能短视频生成主函数
async function generateVideoFromText(text, requirements) {
  console.log("🚀 开始智能视频生成...");
  
  // 第一步：分析文本
  console.log("📝 分析文本...");
  const characters = await extractCharacters(text);
  const scenes = await splitIntoScenes(text, requirements);
  
  // 第二步：选择工具
  console.log("🔧 选择工具...");
  const tools = selectTools(requirements);
  
  // 第三步：构建角色库
  console.log("👥 构建角色库...");
  const characterLibrary = {};
  for (const char of characters) {
    const refImage = await generateCharacterReference(char, tools.imageModel);
    characterLibrary[char.name] = {
      description: char,
      referenceImage: refImage
    };
  }
  
  // 第四步：生成分镜
  console.log("🎬 生成分镜...");
  for (const scene of scenes.shots) {
    // 生成图片提示词
    scene.imagePrompt = generateImagePrompt(scene, characterLibrary);
    // 生成视频提示词
    scene.videoPrompt = generateVideoPrompt(scene, characterLibrary);
  }
  
  // 第五步：批量生成
  console.log("🎨 批量生成...");
  const results = [];
  for (const scene of scenes.shots) {
    // 生成图片
    const image = await generateImage(scene.imagePrompt, tools.imageModel);
    // 生成视频（使用角色参考保持一致性）
    const video = await generateConsistentVideo(
      characterLibrary[scene.characters[0]],
      scene.videoPrompt
    );
    results.push({ scene, image, video });
    
    console.log(`✅ 分镜 ${scene.index}/${scenes.shots.length} 完成`);
  }
  
  // 第六步：质量检查
  console.log("🔍 质量检查...");
  const quality = await checkQuality(results);
  if (quality.score < 0.8) {
    console.log("⚠️ 质量不达标，自动重试...");
    // 重试逻辑
  }
  
  // 第七步：输出
  console.log("📦 输出交付...");
  return {
    videos: results,
    report: generateReport(results, quality)
  };
}
```

---

## 六、实际执行脚本

创建 `~/.openclaw/workspace/scripts/smart_video_generator.js`

```javascript
// 实际可执行的脚本
// 使用ZZDH CLI + Vidu API
```

---

## 七、成本估算

### Vidu R2V（推荐）
- 20个分镜 × 5秒 × ¥0.3/秒 = **¥30**
- 人物一致性：⭐⭐⭐⭐⭐

### Sora2（高端）
- 20个分镜 × 5秒 = 100秒
- ChatGPT Plus: $20/月
- 人物一致性：⭐⭐⭐⭐⭐

### ComfyUI本地（免费）
- 需要显卡：RTX 3060以上
- 时间成本：约2小时
- 人物一致性：⭐⭐⭐⭐

---

## 八、下一步行动

1. **创建角色库系统** - 存储和管理角色参考图
2. **集成Vidu API** - 实现R2V自动调用
3. **编写智能分镜拆分** - 文本→分镜的自动化
4. **构建提示词模板库** - 按风格/场景分类
5. **添加质量检查** - 自动评估一致性

---

*创建时间: 2026-03-31*
*状态: 方案设计完成，待开发*
