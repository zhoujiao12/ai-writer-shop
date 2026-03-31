# AI·3D动漫通用提示词模板

---

## 一、技术底座

### 基础渲染参数
```
optimized, masterpiece, 3D anime CGI rendering Unreal Engine 8 style, cinematic production,
professional lens, complete lighting low contrast, soft light, no dead black, no stray light, consistent style
```

### 人物渲染细节
```
subsurface scattering skin, soft ambient occlusion, strand-level flowing hair, precise anatomy, sheer
fabric render, cinematic light transition
```

### 禁止项
```
no dissolve/fade/overlay/day exposure effects
no text/subtitles/dialogue/mouth movement
```

### 运镜参数
```
slow smooth camera movement, static/slow pan/soft zoom, minimal motion, high temporal consistency, stable
edges, no jitter/ghosting/trailing/smearing
```

### 景深设置
```
depth of field, focus on main character, sharp subject, blurred background, soft bokeh
```

### 画质规格
```
ignore 2D reference style, strictly 3D anime CGI render
character/object/light/line unified, no black bars, 4K/8K, 3840 x 2160, 16:9, cinematic lighting, global
illumination, volumetric lighting
correct 1:8 head-to-body ratio, no oversized head/short torso/short legs, anatomically accurate
full consistency of character/scene/object/light
```

### 风格一致性
```
dual-state (realistic/fantasy) proportion consistency: 1.3
clean high-end composition, balanced character-scene ratio
fully compatible with nano banana (image), grok-video-3, veo3.1, Jimeng (video) rendering
```

### 服装与氛围
```
detailed costume with soft pastel tones (light warm pink/ivory white preferred), opalescent fabric with
soft light transmission through thin skin areas: 1.1
render style strictly aligned with Juan Si Ling (@ A888) and Shen Yin Weng Zuo (MAEM EM): exquisite
character modeling, soft cinematic lighting, ethereal delicate texture, elegant feminine temperament
```

---

## 二、人物场景融合约束

### 人物与场景交互
```
on character skin/clothing, atmospheric perspective, consistent light source direction no green screen
effect, no cutout feeling, no floating character, grounded character placement, contact shadows beneath
feet, interaction with scene elements (e.g. grass bending, fabric brushing against objects), stable body
```

---

## 三、参考图严格锁定约束

### 人物一致性
```
character content from the original reference images, keep all character details, correct head-to-body
ratio, body proportions, posture, position, clothing, hairstyle, facial features and temperament
```

---

## 四、四大时段专属光影定义

### 白天·清透柔光
```
sunlight: 1.3, highkey lighting clear cloudless sky, vivid bright natural colors, pure bright aesthetic,
high transparency, crisp light and shadow, soft warm tone, gentle sunlight filtering, no harsh glare,
fresh feminine vitality, warm undertone, gentle hazy mist, soft volumetric light filtering through trees
```

### 黄昏·缱绻暖光
```
cinematic sunset glow, amber atmosphere, warm pink and orange tones, romantic empty environment, soft
golden light, hazy afterglow, gentle light transition, feminine romantic sentiment, warm undertone, soft
ethereal mist
```

### 夜晚·静谧流光
```
crystal clear night sky, soft moonlight: 1.3, deep night aesthetic, silver moonlight glow, volumetric
moonlight, high contrast with soft edges, dreamy bokeh, starlit background, quiet empty night environment,
gentle silver light, no harsh darkness, feminine tranquil elegance, warm undertone, soft ethereal mist
```

### 黎明·清冷仙气
```
mist, pale blue and lavender sky gradient, soft dawn light, quiet and peaceful empty environment, delicate
light layering, gentle haze, no harsh shadows, feminine ethereal atmosphere, warm undertone, enhanced
ethereal glow
```

---

## 五、人物数量约束

### 单人 (Solo)
```
sole, 1 character (referenced from reference image), grounded on ground, feet in contact with ground, no
oracles
```

### 双人 (2 Characters)
```
2 characters (both from reference images), maintain natural safe distance between each other, no body
placement, no floating limbs, subtle interaction (eye contact/gestures) without physical collision
```

### 多人/群像 (3+ Characters: Group)
```
3+ characters (all from reference images), balanced group composition, clear hierarchical focus (core
character in sharp focus), maintain minimum safe distance between each character, no crowding/overlapping,
postures/floating limbs, natural group positioning (semi-circle/line)
```

---

## 六、负面提示词 (Negative Prompts)

### 技术问题
```
ghosting, trailing, double image, smearing, temporal inconsistency, frame misalignment, parallax error
```

### 禁止元素
```
text, watermark, signature, logo, cropped, border, frame, UI element, irrelevant objects, cluttered
background
```

### 风格禁止
```
flat, sketch, drawing, cartoon, cel shading, flat colors, no volume, no depth, no 3D texture, plastic
texture, rough style, inconsistent art style, non-aesthetic style
```

### 内容禁止
```
golden light, runes, particles, fantasy elements in realistic state, realistic elements in fantasy state,
grayscale, silhouette, monochrome
```

### 男性风格禁止 (女频专用)
```
masculine aesthetic, rough and tough style, sharp and hard lines, overly strong contrast, gloomy and heavy
```

---

## 七、使用说明

### 适用场景
- AI 3D动漫短剧制作
- 古风/现代人物渲染
- 四时段光影切换

### 推荐工具
- nano banana (image)
- grok-video-3
- veo3.1
- Jimeng (video)

### 风格参考
- Juan Si Ling (@ A888)
- Shen Yin Weng Zuo (MAEM EM)

---

*整理时间：2026-03-26*
*来源：用户截图OCR识别*
*用途：AI 3D动漫渲染提示词模板*
