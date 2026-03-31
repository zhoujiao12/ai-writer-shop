# 全网主流AI模型提示词专业指南

> 深度整理：可灵、Wan2.x、Sora、Grok Imagine、Vidu、Runway、Pika、Luma、海螺等官方文档
> 整理时间：2026-03-28
> 搜索次数：24次

---

## 第一部分：文生视频 vs 图生视频 - 各模型提示词对比

### 一、可灵 Kling（快手）

**官方提示词公式：**
```
提示词 = 主体（主体描述）+ 运动 + 场景（场景描述）+（镜头语言 + 光影 + 氛围）
```

**文生视频：**
```
主体：一位身穿红色旗袍的年轻女性，长发盘起，手持折扇
运动：缓缓转身，折扇轻轻摇动，目光流转
场景：古典园林，亭台楼阁，垂柳依依，湖面波光粼粼
镜头语言：中景缓慢推进，柔焦背景
光影：金色夕阳，侧逆光，暖色调
氛围：优雅、古典、诗意

完整提示词：
一位身穿红色旗袍的年轻女性，长发盘起，手持折扇，缓缓转身，
折扇轻轻摇动，目光流转。古典园林背景，亭台楼阁，垂柳依依，
湖面波光粼粼。中景缓慢推进，金色夕阳，侧逆光，暖色调，优雅诗意的氛围。
```

**图生视频：**
```
❌ 错误：一位身穿红色旗袍的年轻女性...（重复描述图片内容）
✅ 正确：缓缓转身，折扇轻摇，目光流转，镜头缓慢推进，固定镜头。

核心原则：
- 图生视频已有主体、场景、风格，只需描述运动和运镜
- 不重复描述图片中已有的内容
```

**可灵提示词技巧：**
- **主体描述**：外貌、服饰、姿态（文生视频需要，图生视频不需要）
- **运动描述**：不超过5秒可完成的动作
- **场景描述**：室内/室外、自然/人造场景
- **镜头语言**：远景、中景、近景、特写、航拍等

---

### 二、Wan2.x 万卷（阿里云百炼）

**官方提示词公式：**

**基础公式：**
```
提示词 = 主体 + 场景 + 运动
```

**进阶公式：**
```
提示词 = 主体（主体描述）+ 场景（场景描述）+ 运动（运动描述）+ 美学控制 + 风格化
```

**声音公式（Wan2.5/2.6）：**
```
提示词 = 主体 + 场景 + 运动 + 声音描述（人声/音效/背景音乐）

人声 = 角色说话的内容 + 情绪 + 语调 + 语速 + 音色 + 口音
音效 = 音源材质 + 行为 + 环境音
背景音乐 = 背景音乐/配乐 + 风格
```

**图生视频公式：**
```
提示词 = 运动 + 运镜
```

**参考生视频公式（Wan2.6）：**
```
提示词 = 主角 + 动作 + 台词 + 场景

主角：通过"character1"、"character2"等标识引用参考主角
动作：描述主角或其他元素的运动状态
台词：主角的说话内容
场景：主角所在的环境
```

**多镜头公式（Wan2.6）：**
```
提示词 = 总体描述 + 镜头序号 + 时间戳 + 分镜内容

示例：
这个故事以第三人称视角，讲述了一个关于放弃与重拾希望的短剧。
第1个镜头[0-3秒]一个男孩在操场的角落独自坐着，低头望着手中的信纸...
第2个镜头[4-6秒]硬切转场，固定机位，聚焦于男孩的眼睛...
第3个镜头[7-10秒]硬切转场，场景转至一间简朴的教室...
```

---

### 三、Sora 2 / Sora 2 Pro（OpenAI）

**官方提示词公式：**
```
提示词 = Camera shot + Subject + Action + Mood

Camera shot: framing and angle, e.g. wide establishing shot, eye level
Subject: who/what is in the scene
Action: what happens, specific beats or gestures
Mood: overall tone, e.g. cinematic and tense, playful and suspenseful
```

**Sora提示词示例：**
```
Camera shot: Wide establishing shot, eye level
Subject: A lone astronaut floating above Earth
Action: slowly rotates, watching sunrise over the horizon
Mood: cinematic and contemplative, peaceful awe

完整提示词：
Wide establishing shot, eye level. A lone astronaut floating above Earth, 
slowly rotates, watching sunrise over the horizon, cinematic and contemplative, 
peaceful awe.
```

**Sora提示词特点：**
- **自然语言优先**：像写电影剧本描述，不是堆砌关键词
- **必须英文**：Sora只支持英文提示词
- **镜头控制强**：支持复杂镜头运动描述
- **物理真实**：注重物理规律的准确性

---

### 四、Grok Imagine（xAI / Elon Musk）

**官方提示词公式（五部分公式）：**
```
提示词 = Scene + Style + Mood + Lighting + Camera

Scene: what's happening（场景：发生什么）
Style: visual aesthetic（风格：视觉美学）
Mood: emotional direction（情绪：情感方向）
Lighting: time of day / light quality（光影：时间/光线质量）
Camera: shot type, lens, focus（镜头：类型、焦距、焦点）
```

**Grok Imagine提示词示例：**
```
Scene: A lone samurai standing on a foggy mountain ridge.
Style: cinematic realism.
Mood: stoic and timeless.
Lighting: soft dawn light with diffused mist.
Camera: wide shot, 50mm lens feel, deep depth of field, 16:9.

完整提示词：
A lone samurai standing on a foggy mountain ridge, cinematic realism,
stoic and timeless atmosphere, soft dawn light with diffused mist,
wide shot, 50mm lens feel, deep depth of field, 16:9.
```

**Grok Imagine提示词核心特点：**

| 特点 | 说明 |
|-----|------|
| **自然语言优先** | 像写场景描述，不是关键词堆砌 |
| **情绪驱动** | 描述感受，而不是只描述物体 |
| **导演思维** | 想象你是导演，描述镜头 |
| **避免标签堆叠** | 不要用 "knight, castle, epic, 8K" 这种列表 |

**Grok Imagine图生视频提示词模板：**
```
Motion: {SUBTLE / NORMAL / ENERGETIC} — {WHAT MOVES}
Camera: {SLOW DOLLY / ORBIT / HANDHELD}
Style: {CINEMATIC / ANIME / REALISTIC}
Lighting: match the original, add soft highlights
Background: stable, no scene change
Constraints: no extra limbs, no face swap, no text, no logo

示例：
Motion: NORMAL — woman turns head, hair flows in wind
Camera: SLOW DOLLY IN
Style: CINEMATIC
Lighting: match original, add golden hour glow
Background: stable, no scene change
```

**Grok Imagine常见错误：**

| 错误 | 正确 |
|-----|------|
| 标签堆叠："knight, castle, epic, 8K" | 句子描述："A knight stands before a castle, epic cinematic style" |
| 弱动词："standing" | 强动词："surges", "unfurls", "shatters", "rushes" |
| 缺少时间天气 | 添加："at dusk", "in heavy rain", "fog drifting" |
| 模糊美学 | 明确风格："cinematic realism", "vibrant anime" |

---

### 五、Vidu AI

**官方提示词公式：**
```
提示词 = 主体 + 动作 + 场景 + 镜头控制
```

**Vidu Reference-to-Video（参考图生视频）：**
```
提示词 = 使用参考图1的XX + 使用参考图2的YY + 动作描述

示例：
Use reference image 1 for the room and lighting.
Use reference image 2 for the character's appearance and clothing.
The character walks to the window and looks outside.

关键：Vidu支持多参考图（1-3张），保持角色一致性
```

**Vidu提示词特点：**
- **动漫风格最佳**：社区公认动漫风格效果最好
- **角色一致性极强**：多参考图可保持角色一致
- **支持中英文**：两种语言都支持
- **原生音频**：支持音画同步

---

### 六、Runway Gen-3 / Gen-4

**官方提示词原则：**

**文生视频：**
```
提示词 = Subject + Action + Camera Movement + Style
```

**图生视频：**
```
提示词 = Motion Description + Camera Control

核心原则：
- 图生视频提示词几乎只关注运动（motion）
- 不要描述图片中已有的元素
- 描述场景的运动状态
```

**Runway图生视频示例：**
```
❌ 错误：A woman sitting on a sofa, wearing white dress...（重复描述图片）
✅ 正确：The woman turns her head slowly, hair flowing in wind, handheld camera shake.

核心：只描述运动和镜头
```

**Runway镜头控制关键词：**

| 镜头类型 | 提示词示例 |
|---------|-----------|
| 固定镜头 | locked camera, camera doesn't move |
| 手持镜头 | handheld documentary style, natural camera shake |
| 推镜头 | slow zoom in, camera pushes in |
| 移动镜头 | tracking shot, camera follows subject |
| 环绕镜头 | camera orbits around subject |

---

### 七、Pika AI

**官方提示词公式：**
```
提示词 = Subject + Action + Style/Setting + Camera (optional)
```

**Pika提示词四要素：**

| 要素 | 说明 |
|-----|------|
| **Subject** | Who or what is in the scene?（场景中的主体） |
| **Action** | What is happening?（发生什么） |
| **Style/Setting** | Where or how is it happening?（场景和风格） |
| **Camera** | What's the perspective?（镜头视角，可选） |

**Pika提示词示例：**
```
基础版：A golden retriever walking through Times Square at night.

进阶版：A golden retriever wearing sunglasses, walking through Times Square 
at night, neon reflections on the sidewalk, cinematic slow zoom.

解析：
- Subject: golden retriever wearing sunglasses
- Action: walking through Times Square
- Style/Setting: at night, neon reflections on the sidewalk
- Camera: cinematic slow zoom
```

**Pika各工具提示词差异：**

| 工具 | 提示词重点 |
|-----|-----------|
| **Text-to-Video** | 完整描述主体+场景+动作 |
| **Pikadditions** | "Add a [object] [location]" - 添加元素 |
| **Pikaswaps** | "Replace [X] with [Y]" - 替换元素 |
| **Pikatwists** | "At the end, [transformation]" - 变形效果 |

**Pika提示词技巧：**
- 使用形容词：1-2个强力视觉形容词
- 调用镜头角度："overhead shot", "tracking shot", "POV"
- 时间和光线提示："at dusk with long shadows", "rainy night with flickering neon"
- 描述运动："leaves rustling", "camera slowly zooms out"

---

### 八、Luma Dream Machine / Ray3

**官方镜头控制：**

Luma提供预设镜头运动，可在提示词中调用：

| 镜头运动 | 英文提示词 |
|---------|-----------|
| 左移 | Pan Left |
| 右移 | Pan Right |
| 上移 | Move Up |
| 下移 | Move Down |
| 推进 | Dolly In |
| 拉远 | Dolly Out |
| 环绕 | Orbit |

**Luma提示词示例：**
```
固定镜头：
A woman reading a book by the window, camera doesn't move, 
soft morning light, cozy atmosphere.

运动镜头：
A woman reading a book by the window, camera slowly pushes in, 
capturing her peaceful expression, soft morning light.

控制镜头不动：
Type "Camera" to choose from various movement styles
Or use: "camera stays still", "locked camera", "fixed camera"
```

**Luma提示词特点：**
- **HDR原生**：支持原生HDR视频生成
- **电影级质量**：专业制作流程
- **镜头控制强**：明确的镜头运动预设
- **关键帧支持**：首尾帧控制

---

### 九、海螺 AI / MiniMax

**提示词公式：**
```
提示词 = 主体 + 场景 + 运动 + 镜头控制
```

**海螺提示词特点：**
- **速度快**：1-2分钟生成6秒视频
- **支持中文**：提示词可用中文
- **图生视频强**：支持图片动起来
- **首尾帧支持**：增强可控性

---

## 第二部分：各模型提示词对比表

### 文生视频提示词公式对比

| 模型 | 提示词公式 | 语言 | 核心特点 |
|-----|----------|------|---------|
| **可灵 Kling** | 主体（描述）+ 运动 + 场景（描述）+ 镜头/光影/氛围 | 中文 | 场景描述详细，氛围控制强 |
| **Wan2.x** | 主体（描述）+ 场景（描述）+ 运动（描述）+ 美学 + 风格化 | 中文 | 支持声音描述、多镜头、参考生视频 |
| **Sora 2** | Camera shot + Subject + Action + Mood | 英文 | 自然语言，导演思维 |
| **Grok Imagine** | Scene + Style + Mood + Lighting + Camera | 英文 | 情绪驱动，五部分公式 |
| **Vidu** | 主体 + 动作 + 场景 + 镜头控制 | 中英文 | 动漫风格最佳，角色一致性 |
| **Runway** | Subject + Action + Camera Movement + Style | 英文 | 图生视频专注运动描述 |
| **Pika** | Subject + Action + Style/Setting + Camera | 英文 | 四要素，简单直接 |
| **Luma** | Subject + Scene + Motion + Camera Control | 英文 | 镜头预设，HDR支持 |
| **海螺** | 主体 + 场景 + 运动 + 镜头控制 | 中文 | 速度快，图生视频强 |

---

### 图生视频提示词对比

| 模型 | 图生视频提示词 | 核心原则 |
|-----|---------------|---------|
| **可灵** | 运动 + 运镜 | 不重复描述主体和场景 |
| **Wan2.x** | 运动 + 运镜 | 图片已确定主体、场景、风格 |
| **Sora 2** | Action + Camera + Mood | 首帧控制开头 |
| **Grok Imagine** | Motion + Camera + Style + Constraints | 明确运动幅度和约束 |
| **Vidu** | 使用参考图的XX + 动作 | 多参考图保持一致性 |
| **Runway** | Motion Description + Camera | 几乎只关注运动 |
| **Pika** | Action + Camera | 简化描述，专注运动 |
| **Luma** | Motion + Camera Control | 使用镜头预设 |
| **海螺** | 运动 + 运镜 | 中文提示词 |

---

## 第三部分：首帧/首尾帧生视频 - 各模型支持

### 支持情况

| 模型 | 首帧生视频 | 首尾帧生视频 |
|-----|-----------|-------------|
| **Sora 2** | ✅ | ❌ |
| **Veo 3.1** | ✅ | ✅ |
| **Luma Ray3** | ✅ | ✅ |
| **Seedance** | ✅ | ✅ |
| **Wan2.2-kf2v** | ✅ | ✅ |
| **海螺** | ❌ | ✅ |
| **可灵** | ❌ | ❌ |
| **Vidu** | ❌ | ❌ |
| **Runway** | ❌ | ❌ |
| **Pika** | ❌ | ❌ |
| **Grok Imagine** | ❌ | ❌ |

### 首尾帧提示词通用公式

```
提示词 = 过渡方式 + 运动描述 + 时间节奏

过渡方式：
- smooth transition（平滑过渡）
- gradual change（逐渐变化）
- fast transformation（快速变化）
- dramatic reveal（戏剧性揭示）

运动描述：
- 主体如何从首帧变化到尾帧
- 中间发生了什么

时间节奏：
- 2秒过渡
- 自然时间流逝
- 快速切换
```

**示例：**

首帧：整洁的房间（白天）
尾帧：凌乱的房间（夜晚）

```
Veo 3.1：
The room transitions from tidy to messy, books fall one by one,
time passes from day to night, smooth natural transition, 4 seconds.

Seedance：
房间从整洁逐渐变得凌乱，书本一本本掉落，
时间从白天过渡到夜晚，自然变化，3秒过渡时间。
```

---

## 第四部分：专业提示词模板库

### 电影叙事类

```
【可灵/Wan中文版】
主体：[角色描述]
运动：[动作描述]
场景：[环境描述]
镜头：[景别 + 运镜]
光影：[光源 + 色调]
氛围：[情感基调]

【Sora/Grok英文版】
Camera shot: [framing and angle]
Subject: [who/what]
Action: [what happens]
Mood: [emotional tone]
Lighting: [time of day, light quality]
Style: [visual aesthetic]
```

### 产品展示类

```
【通用模板】
主体：[产品名称和外观]
运动：[产品动作：旋转、展示细节、使用演示]
场景：[简洁背景]
镜头：[环绕、推进、特写]
光影：[专业打光]
氛围：[高端、专业]

示例（Pika）：
A sleek smartphone rotating on a white pedestal, camera slowly orbits around,
showing the screen and design details, studio lighting, premium feel.
```

### 角色动画类

```
【Vidu多参考图模板】
Use reference image 1 for the character's face and expression.
Use reference image 2 for the character's outfit and pose.
[角色动作描述], camera [镜头控制].

示例：
Use reference image 1 for the character's face.
Use reference image 2 for the character's red dress.
The character walks to the window and looks outside, 
hair flowing in wind, soft afternoon light.
```

### 首尾帧过渡类

```
【通用模板】
首帧：[起始状态描述]
尾帧：[结束状态描述]
过渡：[变化过程描述]

提示词：
The [主体] transitions from [首帧状态] to [尾帧状态],
[具体变化过程], [过渡速度], [镜头控制].

示例：
The room transforms from modern minimalist to vintage cozy,
furniture changes, colors warm up, gradual transformation,
time-lapse feel, fixed camera, 4 seconds.
```

---

## 总结：核心记忆点

### 文生视频 vs 图生视频

| 核心区别 | 文生视频 | 图生视频 |
|---------|---------|---------|
| **提示词重点** | 描述"有什么" + "怎么动" | 只描述"怎么动" |
| **主体描述** | 需要，详细描述 | 不需要，图片已确定 |
| **场景描述** | 需要，详细描述 | 不需要，图片已确定 |
| **提示词长度** | 100-300字 | 20-100字 |

### 首帧/首尾帧

| 类型 | 输入 | 核心用途 |
|-----|------|---------|
| **首帧生视频** | 首帧图 + 提示词 | 控制开头，AI推断后续 |
| **首尾帧生视频** | 首帧图 + 尾帧图 + 提示词 | 控制开头和结尾，AI填充过渡 |

### 关键原则

1. **图生视频不要重复描述图片内容** - 所有模型通用
2. **提示词语言要匹配模型** - 中文模型用中文，英文模型用英文
3. **首尾帧要有关联性** - 不能首帧是人，尾帧变成狗
4. **运动描述要具体** - 用"缓缓转身"而不是"动一下"

---

*整理时间: 2026-03-28 12:05*
*数据来源: 可灵官方、阿里云百炼、OpenAI、xAI、Vidu、Runway、Pika、Luma官方文档*
*搜索次数: 24次（剩余976次）*
