# 全球AI生图生视频模型提示词完整指南 2026

> 全面覆盖所有主流模型的提示词公式、风格、技巧
> 更新时间：2026-03-31

---

## 📋 目录

1. [图片生成模型](#图片生成模型)
2. [视频生成模型](#视频生成模型)
3. [人物一致性技巧](#人物一致性技巧)
4. [风格关键词库](#风格关键词库)
5. [场景描述词库](#场景描述词库)
6. [镜头语言库](#镜头语言库)

---

## 图片生成模型

### 1. Midjourney V7 / V8 Alpha

**语言：** 英文
**特点：** 艺术性强，风格多样，参数丰富

**当前版本：**
- V7 - 稳定版
- V8 Alpha - 测试版（2026-03-17发布）

**提示词公式：**
```
[主体描述] + [场景环境] + [动作/状态] + [艺术风格] + [参数]
```

**核心参数：**
- `--ar 16:9` / `--ar 9:16` - 宽高比
- `--v 7` / `--v 8` - 版本号
- `--style raw` - 写实风格
- `--s 250` - 风格化程度（0-1000）
- `--c 15` - 混乱度（0-100）
- `--q 2` / `--q 4` - 质量（V8支持q 4）
- `--iw 0.5` - 参考图权重（0-1）

**V8 Alpha 新特性：**
- `--hd` - 原生2K分辨率渲染
- `--q 4` - 更高一致性
- 兼容V7的个人化配置、情绪板、srefs
- 更好遵循详细指令

**示例：**
```
Young Chinese woman, 16 years old, long black hair, wearing white hanfu, 
kneeling in ancient Buddhist temple, stone floor, candlelight, 
humble expression, hands clasped in prayer, 
cinematic style, dramatic lighting, 
--ar 16:9 --v 7 --style raw --s 250
```

**垫图技巧：**
```
[参考图URL] [新描述] --iw 0.5

示例：
https://example.com/ref.jpg Young girl in white hanfu, ancient temple --iw 0.5 --ar 16:9
```

**关键技巧：**
- 用逗号分隔关键词
- 重要词放前面
- 风格词放后面
- 参数用 `--` 开头

---

### 2. Flux 2 Pro / Max (Black Forest Labs) ⭐ 写实最佳

**语言：** 英文/中文
**特点：** 写实最佳，文本渲染好，4MP原生分辨率

**当前版本：**
- Flux 2 Pro - 生产级，快速
- Flux 2 Max - 最高质量
- Flux Kontext - 图像编辑

**提示词公式：**
```
[主体] + [动作] + [风格] + [环境/光线]
```

**Flux 2 Pro 新特性（2026-03更新）：**
- 原生4MP分辨率（4百万像素）
- 速度提升2倍
- HEX精确颜色匹配
- 多参考图支持
- 单提示词系统（VLM驱动）

**提示词框架：**
```
Subject: 主体描述
Action: 动作/姿态
Style: 风格/媒介
Context: 环境/光线/氛围
```

**JSON结构化提示词（高级）：**
```json
{
  "scene": "Professional studio product photography setup",
  "subjects": [
    {
      "description": "Minimalist ceramic coffee mug",
      "position": "Center foreground",
      "color_palette": ["matte black ceramic", "bright red steam"]
    }
  ],
  "style": "Ultra-realistic product photography",
  "lighting": "Three-point softbox setup",
  "camera": {
    "angle": "high angle",
    "lens-mm": 85,
    "f-number": "f/5.6"
  }
}
```

**HEX颜色精确匹配：**
```
A brand logo with exact colors #FF4500 (orange red) and #1E90FF (dodger blue), 
clean design on white background
```

**多参考图：**
```
# 使用多个参考图保持一致性
Reference 1: character_face.jpg
Reference 2: character_outfit.jpg
Reference 3: scene_style.jpg
Prompt: Combine references into a cohesive image
```

**示例：**
```
# 人物肖像
Young Chinese woman, 16 years old, long black hair, fair skin, 
wearing white hanfu with blue accents, humble expression, 
kneeling in ancient Buddhist temple, candlelight from both sides, 
dramatic shadows, cinematic photography, 85mm lens, shallow depth of field

# 产品摄影
Minimalist ceramic coffee mug with bright red steam rising, 
on polished concrete surface, three-point softbox lighting, 
ultra-realistic product photography, commercial quality, sharp focus

# 风景
Serene mountain lake surrounded by towering peaks, thick morning fog, 
pine trees along shoreline, calm reflective water, moody and tranquil, 
golden hour lighting filtering through mist, photorealistic landscape
```

---

### 3. Stable Diffusion 3.5

**语言：** 英文
**特点：** 开源免费，自定义强，支持文本渲染

**提示词公式：**
```
[风格] + [主体] + [动作] + [构图] + [光线] + [技术参数]
```

**提示词元素：**

1. **Style（风格）**
   - illustration style, painting medium
   - digital art, photography
   - line art, watercolor, oil painting
   - surrealism, expressionism

2. **Subject & Action（主体与动作）**
   - 先写主体，再写动作
   - 详细描述外貌特征

3. **Composition & Framing（构图）**
   - close-up, wide-angle
   - bird's eye view, crane shot
   - fish-eye lens

4. **Lighting & Color（光线与颜色）**
   - backlight, hard rim light
   - dynamic shadows
   - golden hour, blue hour

5. **Text（文本）**
   - 用双引号包裹文本
   - 短文本效果更好
   - 示例：`The text "OPEN" in red neon letters`

6. **Negative Prompt（负面提示）**
   - 过滤不需要的元素
   - 示例：`blurry, low quality, distorted hands`

**示例：**
```
Positive: 
Photography style, young Chinese woman, 16 years old, 
kneeling on stone floor in Buddhist temple, 
candlelight illuminating her face, humble expression, 
close-up shot, warm lighting, dramatic shadows, 4K quality

Negative:
blurry, low quality, distorted, text, watermark
```

---

### 4. DALL-E 3

**语言：** 英文
**特点：** 理解力强，精确执行，简单易用

**提示词公式：**
```
[详细场景描述] + [主体细节] + [动作] + [风格] + [氛围]
```

**关键技巧：**

1. **用自然语言描述**
   - DALL-E 3 理解自然语言很好
   - 不需要复杂的关键词堆砌

2. **避免指令式语言**
   - ❌ "Create an image of..."
   - ❌ "Generate a scene..."
   - ✅ 直接描述画面

3. **详细但不要冗余**
   - 包含关键细节
   - 不要过度描述

4. **风格指定**
   - photography style
   - digital art, oil painting
   - cinematic, dramatic

**示例：**
```
A young Chinese woman in white hanfu kneeling on the stone floor 
of an ancient Buddhist temple. Her hands are clasped in prayer, 
her head slightly bowed with a humble expression. Candlelight 
illuminates her face with warm golden glow. A large Buddha statue 
looms in the background. Cinematic photography style with dramatic lighting.
```

---

### 5. Ideogram AI

**语言：** 英文
**特点：** 文本渲染最佳，适合设计

**提示词公式：**
```
[主体/场景] + [文本内容] + [风格] + [排版]
```

**文本技巧：**
```
# 明确指定文本
The text "OPEN" in red neon letters above the door

# 指定字体风格
elegant serif typography
bold industrial lettering

# 指定位置
text at the top, text in the center
```

**示例：**
```
A vintage coffee shop poster. The text "MORNING BREW" 
in elegant retro script at the top. A steaming coffee cup 
in the center, surrounded by coffee beans. Warm color palette, 
nostalgic design, poster style, high contrast.
```

**适用场景：**
- Logo设计
- 海报
- 社交媒体图
- 需要文字的图像

---

### 6. Recraft AI

**语言：** 英文
**特点：** 矢量图生成，适合设计

**提示词公式：**
```
[主体] + [风格] + [设计类型] + [颜色/细节]
```

**支持格式：**
- Vector art（矢量图）
- Icon（图标）
- Illustration（插画）
- Logo

**示例：**
```
# 矢量艺术
Mountain landscape with pine trees, vector art style, 
flat colors, clean lines, minimal design, blue and green palette

# 图标
Home icon, simple minimalist style, flat design, 
blue color, clean edges, no shadows

# Logo
Tech company logo, abstract geometric shape, 
modern style, gradient blue, professional, clean design
```

---

## 视频生成模型

### 1. Sora 2 (OpenAI)

**语言：** 英文
**特点：** 电影级质量，音画同步，最长25秒

**提示词公式：**
```
[场景设置] + [主体与动作] + [镜头语言] + [光线与色彩] + [物理细节] + [音频提示]
```

**核心结构：**

```
Scene Setup: 场景描述，时间，天气，氛围
Subject and Action: 主体，动作，情绪，节奏
Camera Grammar: 角度，构图，镜头类型，运动
Lighting and Color: 光源，方向，情绪，调色
Physics and Materials: 真实物理，材质，纹理
Audio Cues: 环境音，对话，音效
Exclusions: 避免的元素
```

**示例：**
```
Scene: A bustling neon-lit Tokyo alley at midnight during light rain, 
reflective puddles on the pavement.

Subject: A young woman in leather jacket walks confidently, 
glancing over her shoulder with determination.

Camera: Wide-angle 24mm lens, tracking shot from behind, 
shallow depth of field blurring background crowds.

Lighting: Neon signs provide vibrant key lighting with cool blue and pink hues, 
casting glowing reflections on wet surfaces.

Physics: Rain droplets ripple in puddles, wind gently rustles the jacket's fabric, 
realistic shadows from overhead lights.

Audio: Soft rain patter and distant city hum, footsteps splashing, 
dialogue: "Time to move."

Exclusions: No text on signs, avoid lens flares.
```

**参数建议：**
- 时长：5-10秒最佳
- 分辨率：最高4K
- 帧率：24fps（电影感）

---

### 2. Google Veo 3.1

**语言：** 英文
**特点：** 4K分辨率，首尾帧控制，原生音频

**五元素提示词结构：**
```
1. Shot specification（镜头规格）
2. Setting and atmosphere（场景与氛围）
3. Subject specification（主体描述）
4. Action sequence（动作序列）
5. Dialogue integration（对话集成）
```

**示例：**
```
A medium shot frames a cartographer in a cluttered Victorian study. 
Warm lamplight illuminates ancient maps spread across a mahogany table. 
The cartographer, wearing round spectacles and a burgundy vest, 
traces a route with his finger. 
"According to this sea chart, the lost island exists. We sail at dawn."
```

**时长选择：**

| 时长 | 适用场景 | 复杂度 |
|-----|---------|--------|
| 4秒 | 产品展示，简单动作 | 单一动作 |
| 6秒 | 叙事内容，对话场景 | 多阶段动作 |
| 8秒 | 复杂序列，氛围镜头 | 长对话，多动作 |

**宽高比：**
- `16:9` - 标准宽屏（推荐）
- `9:16` - 竖屏（移动端）
- `1:1` - 方形

---

### 3. Vidu R2V 2.0 (Reference to Video)

**语言：** 中文/英文
**特点：** 人物一致性最佳，多角色支持

**提示词公式：**
```
[角色描述] + [场景] + [动作] + [镜头] + [氛围]
```

**R2V 2.0 新特性：**
- 支持最多 **7个参考图**
- Multi-Entity Consistency（多实体一致性）
- 3角色×1场景 同时保持一致

**R2V工作流：**
```
1. 上传角色参考图（最多7张）
   ├── 支持人物、物体、场景
   └── 三视图效果最佳

2. 输入视频提示词
   ├── 用 @ 符号插入参考
   └── 专注于动作和场景描述

3. Vidu保持角色特征生成视频
```

**使用方法：**
```
Step 1: 选择 Reference to Video 模式
Step 2: 点击 Reference 上传参考图
Step 3: 在输入框输入 @ 插入参考
Step 4: 输入提示词（描述动作，不要重复描述角色）
Step 5: 点击创建
```

**示例：**
```
参考图：角色A的正面照
提示词：@角色A 身穿白色汉服，在古寺中跪拜，双手合十，烛光摇曳，肃穆氛围，中景镜头

Reference image: Character A's front view portrait
Prompt: @CharacterA wearing white hanfu, kneeling in ancient temple, 
hands clasped in prayer, candlelight flickering, solemn atmosphere, medium shot
```

**多角色一致性技巧：**
```
1. 每个角色准备1张高质量参考图
2. 上传多个参考图时，用 @ 引用对应角色
3. 提示词中明确每个角色的位置和动作
4. 保持场景描述一致
```

---

### 4. 可灵 Kling 3.0

**语言：** 中文
**特点：** 最长视频（2分钟），电影级质量，多镜头序列

**提示词公式：**
```
[主体] + [场景] + [运动] + [氛围] + [风格]
```

**Kling 3.0 核心能力：**
- **多镜头序列**：最多6个镜头切换
- **15秒连续视频**：单次生成
- **原生音频**：5种语言+口音支持
- **Subject Binding**：角色/元素一致性
- **物理感知运动**：真实物理效果
- **文本渲染**：标志和字幕

**多镜头提示词结构：**
```
Shot 1 (0-5秒): [描述] + [镜头类型]
Shot 2 (5-10秒): [描述] + [镜头类型]
Shot 3 (10-15秒): [描述] + [镜头类型]
```

**示例：**
```
# 单镜头
年轻女子身穿白色汉服，跪在昏暗佛堂的石板地上，
双手合十祈祷，烛光摇曳，佛像庄严背景，
电影质感，戏剧光影，缓慢推进镜头

# 多镜头序列
Shot 1 (0-3秒): 中景，女子跪在佛堂中央，烛光从两侧照亮
Shot 2 (3-8秒): 镜头缓慢推进，她抬起头，眼神坚定
Shot 3 (8-15秒): 面部特写，眼泪滑落，烛光映照

# 电影美学
Handheld camcorder footage in dimly lit room, 
two women with red lipstick frantically eating cheeseburgers, 
VHS camcorder aesthetic with heavy grain and chromatic aberration, 
camera shaking wildly, chaotic handheld movement

# 微动细节
Static tripod camera in narrow neon-lit ramen shop, 
condensation fogs the window, couple sits side by side, 
steam rising from bowls as they eat noodles, 
broth splattering gently, shot on 35mm film
```

**镜头运动控制：**
```
# 精确镜头运动
"Camera performs a dolly push from medium shot to extreme close-up over 3 seconds"

# 镜头类型
dolly push (推轨)
tracking shot (跟拍)
crane shot (摇臂)
steadicam (稳定器)
handheld (手持)
```

---

### 5. 海螺 Hailuo 02 (MiniMax)

**语言：** 中文/英文
**特点：** Director Mode（导演模式），自然语言控制镜头

**提示词公式：**
```
[场景描述] + [角色动作] + [镜头运动] + [氛围]
```

**Director Mode特色：**
```
用自然语言控制镜头：
- "镜头从左向右移动"
- "镜头缓慢推进"
- "围绕角色旋转"
- "从低角度仰拍"
```

**示例：**
```
# 标准模式
年轻女子在古寺中跪拜，烛光摇曳，氛围肃穆，5秒视频

# 导演模式
镜头从远处缓慢推进，年轻女子身穿白色汉服跪在佛堂中央，
双手合十，烛光从两侧照亮她的侧脸，氛围庄严，
当她抬起头时，镜头定格在她的面部特写
```

---

### 6. Runway Gen-4

**语言：** 英文
**特点：** 视频编辑能力强，运动控制精准

**提示词公式：**
```
[主体] + [运动] + [镜头] + [风格]
```

**提示词元素：**
```
# 主体运动
walks, runs, turns, looks up, reaches out

# 场景运动
camera pans left, tracking shot, zoom in slowly

# 风格描述
cinematic, documentary style, noir, vibrant
```

**示例：**
```
A woman in white dress stands in a misty forest, 
camera slowly circles around her, 
she turns to face the camera with a mysterious smile, 
cinematic style, soft diffused lighting
```

**关键技巧：**
- 一次只描述一个镜头运动
- 使用专业镜头术语
- 保持提示词简洁

---

### 7. Pika Labs

**语言：** 英文
**特点：** 简单易用，迭代快速

**提示词公式：**
```
[场景] + [主体] + [动作] + [风格]
```

**示例：**
```
A cat sleeping on a windowsill, sunlight streaming through, 
peaceful afternoon, soft colors, cinematic style
```

---

### 8. Luma Dream Machine

**语言：** 英文
**特点：** 电影级HDR，高质量

**提示词公式：**
```
[场景描述] + [动作] + [镜头] + [氛围]
```

**示例：**
```
A woman walking through an empty art gallery, 
camera follows from behind, 
natural light from skylights, contemplative atmosphere, 
HDR cinematic style
```

**文本生成：**
```
A poster with text that reads "Dream Machine", 
bold typography, modern design
```

---

### 9. PixVerse V5.6

**语言：** 英文
**特点：** 4K视频，一致性好

**提示词公式：**
```
[主体] + [场景] + [动作] + [镜头] + [风格] + [光线]
```

**示例：**
```
Young woman in traditional Chinese dress, 
ancient temple interior, 
kneeling in prayer, 
medium shot with soft focus background, 
cinematic style, warm candlelight
```

**负面提示词：**
```
blur, distortion, extra limbs, unnatural movement, watermark
```

---

## 人物一致性技巧

### 核心方法

| 方法 | 工具 | 一致性 | 难度 |
|-----|------|--------|------|
| **Reference to Video** | Vidu, Grok R2V | ⭐⭐⭐⭐⭐ | 简单 |
| **Cameos** | Sora 2 | ⭐⭐⭐⭐⭐ | 简单 |
| **Character DNA** | Kling | ⭐⭐⭐⭐ | 中等 |
| **IP-Adapter** | ComfyUI | ⭐⭐⭐⭐ | 复杂 |
| **LoRA训练** | SD/ComfyUI | ⭐⭐⭐⭐⭐ | 很复杂 |

### Reference to Video 工作流

```
Step 1: 生成角色参考图
├── 使用Midjourney/Flux生成高质量角色图
├── 要求：正面、中性表情、全身或半身
└── 背景：白色或简单背景

Step 2: 上传到Vidu R2V
├── 登录Vidu平台
├── 选择Reference to Video模式
└── 上传角色参考图

Step 3: 输入视频提示词
├── 描述动作和场景
├── 不要重复描述角色外貌
└── 专注于"怎么动"

Step 4: 生成视频
├── Vidu会保持角色特征
└── 批量生成时使用同一参考图
```

### Character Sheet 方法

```
# 角色信息文档
{
  "name": "苏婉音",
  "age": "16-18",
  "gender": "female",
  "appearance": {
    "hair": "long black hair",
    "eyes": "bright almond eyes",
    "skin": "fair skin",
    "figure": "slender"
  },
  "clothing": "white hanfu with blue accents",
  "features": "small red mark on forehead, jade earring on left ear",
  "seed": 12345,
  "basePrompt": "young Chinese woman, 16 years old, long black hair, fair skin, slender figure, wearing white hanfu with blue accents, small red mark on forehead, jade earring on left ear"
}
```

---

## 风格关键词库

### 图片风格

**摄影风格：**
```
photography, cinematic photography, portrait photography, 
fashion photography, documentary style, street photography,
product photography, architectural photography, macro photography
```

**艺术风格：**
```
oil painting, watercolor, impressionism, surrealism, 
expressionism, minimalism, pop art, art nouveau, art deco,
Chinese painting, Japanese ukiyo-e, digital art, concept art
```

**设计风格：**
```
minimalist, brutalist, retro, vintage, futuristic,
cyberpunk, steampunk, art deco, Scandinavian, industrial
```

**渲染风格：**
```
3D render, octane render, unreal engine, cinema 4D,
blender render, low poly, voxel art, isometric
```

### 视频风格

**电影风格：**
```
cinematic, film noir, blockbuster style, indie film,
documentary style, music video style, commercial style
```

**氛围风格：**
```
dramatic, mysterious, romantic, peaceful, tense,
nostalgic, futuristic, ethereal, dark, bright
```

---

## 场景描述词库

### 室内场景

```
ancient temple, Buddhist temple, traditional Chinese house,
palace interior, throne room, bedroom, kitchen, study,
library, art gallery, museum, church, castle interior
```

### 室外场景

```
ancient Chinese garden, bamboo forest, cherry blossom garden,
mountain path, riverside, lakeside, village, marketplace,
battlefield, forest clearing, mountain peak, desert
```

### 光线描述

```
golden hour, blue hour, candlelight, moonlight, sunlight,
neon lights, dramatic lighting, soft diffused light,
backlight, rim light, volumetric lighting, natural light
```

---

## 镜头语言库

### 景别

```
extreme wide shot (极远景)
wide shot (远景)
full shot (全景)
medium shot (中景)
medium close-up (中近景)
close-up (近景/特写)
extreme close-up (大特写)
```

### 镜头运动

```
pan left/right (左右摇)
tilt up/down (上下摇)
zoom in/out (推拉)
dolly in/out (推轨)
tracking shot (跟拍)
crane shot (摇臂)
steadicam (稳定器)
handheld (手持)
```

### 角度

```
eye level (平视)
low angle (仰拍)
high angle (俯拍)
bird's eye view (鸟瞰)
worm's eye view (仰视)
dutch angle (倾斜角度)
```

---

## 小说风格适配

### 古装/历史

**图片提示词模板：**
```
[角色], ancient Chinese [场景], traditional hanfu, 
historical setting, candlelight/lantern light, 
period-accurate details, cinematic composition, 
dramatic lighting, 4K quality
```

**视频提示词模板：**
```
[角色] in [场景], [动作], ancient Chinese atmosphere, 
candlelight flickering, slow camera movement, 
cinematic style, historical drama mood
```

### 现代/都市

**图片提示词模板：**
```
[角色], modern city [场景], contemporary fashion, 
urban setting, natural lighting, lifestyle photography, 
clean composition, vibrant colors
```

**视频提示词模板：**
```
[角色] in modern [场景], [动作], urban atmosphere, 
natural daylight, handheld camera style, 
contemporary aesthetic
```

### 奇幻/玄幻

**图片提示词模板：**
```
[角色], fantasy [场景], magical elements, 
ethereal lighting, mystical atmosphere, 
digital art style, vivid colors, epic composition
```

**视频提示词模板：**
```
[角色] in fantasy [场景], [动作], magical particles, 
glowing effects, epic camera movement, 
fantasy film style, otherworldly atmosphere
```

---

## 使用建议

### 选择模型决策树

```
需要人物一致性？
├── 是 → Vidu R2V 或 Sora 2 Cameos
└── 否
    └── 需要长视频（>1分钟）？
        ├── 是 → Kling
        └── 否
            └── 需要最快速度？
                ├── 是 → Hailuo 或 Grok Imagine
                └── 否
                    └── 预算有限？
                        ├── 是 → Vidu（¥0.3/秒）
                        └── 否 → 按质量选择
```

### 图片模型选择

```
需要文本渲染？
├── 是 → Ideogram AI
└── 否
    └── 需要矢量图？
        ├── 是 → Recraft AI
        └── 否
            └── 需要最佳写实？
                ├── 是 → Flux 2
                └── 否
                    └── 需要艺术性？
                        ├── 是 → Midjourney V7
                        └── 否 → DALL-E 3 或 SD 3.5
```

---

*更新时间：2026-03-31*
*版本：1.0*
*数据来源：官方文档 + 深度搜索*
