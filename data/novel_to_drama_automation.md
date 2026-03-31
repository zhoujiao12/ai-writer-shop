# 小说→AI漫剧 全自动化流程设计

> 基于备份资料整合的全自动化管线设计
> 版本: v1.0
> 创建时间: 2026-03-30

---

## 🎯 总体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        全自动化管线架构                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │ Phase 1     │    │ Phase 2     │    │ Phase 3     │             │
│  │ ─────────── │    │ ─────────── │    │ ─────────── │             │
│  │ 小说筛选     │ →  │ 剧本改编     │ →  │ 分镜设计     │             │
│  │             │    │             │    │             │             │
│  │ • 硬性指标   │    │ • 提取核心   │    │ • 场景拆分   │             │
│  │ • 矛盾评估   │    │ • 开头改造   │    │ • 镜头设计   │             │
│  │ • 情绪曲线   │    │ • 模板套用   │    │ • 时长控制   │             │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│         ↓                  ↓                  ↓                     │
│    [评估报告]         [剧本文件]          [分镜JSON]                 │
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │ Phase 4     │    │ Phase 5     │    │ Phase 6     │             │
│  │ ─────────── │    │ ─────────── │    │ ─────────── │             │
│  │ 提示词生成   │ →  │ 内容生成     │ →  │ 后期合成     │             │
│  │             │    │             │    │             │             │
│  │ • 多模型适配 │    │ • 图片生成   │    │ • 视频剪辑   │             │
│  │ • 格式转换   │    │ • 视频生成   │    │ • 配音配乐   │             │
│  │ • 批量输出   │    │ • 质量检查   │    │ • 成片输出   │             │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│         ↓                  ↓                  ↓                     │
│    [提示词JSON]       [素材文件夹]         [最终成片]                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Phase 1: 小说筛选

### 输入
- 小说文本（TXT/JSON）
- 或小说URL

### 处理流程

```python
def phase1_novel_selection(novel_text):
    """
    小说筛选流程
    """
    # Step 1: 硬性指标检查
    hard_checks = {
        "platform_threshold": check_platform_metrics(novel_text),
        "format_quality": check_format(novel_text),
        "pacing_check": check_pacing(novel_text)
    }
    
    # 如果硬性指标不通过，直接淘汰
    if not all(hard_checks.values()):
        return {"status": "rejected", "reason": hard_checks}
    
    # Step 2: 核心标准评估
    core_scores = {
        "conflict_strength": evaluate_conflict(novel_text),      # 权重25%
        "goldfinger_timing": evaluate_goldfinger(novel_text),    # 权重20%
        "emotion_curve": evaluate_emotion_curve(novel_text),     # 权重20%
        "immersion": evaluate_immersion(novel_text),             # 权重15%
        "format": evaluate_format(novel_text),                   # 权重10%
        "platform": evaluate_platform(novel_text)                # 权重10%
    }
    
    # Step 3: 综合评分
    total_score = calculate_weighted_score(core_scores)
    
    # Step 4: 输出
    return {
        "status": "approved" if total_score >= 80 else "rejected",
        "total_score": total_score,
        "scores": core_scores,
        "adaptation_suggestions": generate_adaptation_hints(novel_text, core_scores)
    }
```

### 输出
```json
{
  "status": "approved",
  "total_score": 85,
  "scores": {
    "conflict_strength": "A",
    "goldfinger_timing": 90,
    "emotion_curve": 85,
    "immersion": 88,
    "format": 75,
    "platform": 82
  },
  "adaptation_suggestions": {
    "type": "重生复仇类",
    "core_emotion": "背叛+复仇",
    "recommended_template": "前世惨状→重生→复仇宣言"
  }
}
```

---

## 📋 Phase 2: 剧本改编

### 输入
- 小说文本
- Phase 1 评估报告

### 处理流程

```python
def phase2_script_adaptation(novel_text, evaluation):
    """
    剧本改编流程
    """
    # Step 1: 提取核心元素
    core_elements = extract_core_elements(novel_text)
    # 返回: {矛盾点, 痛点, 爆点, 情绪核}
    
    # Step 2: 确定改编类型
    adaptation_type = determine_adaptation_type(core_elements)
    # 返回: "重生复仇" / "系统觉醒" / "身份反差" / "极端困境"
    
    # Step 3: 选择模板
    template = select_template(adaptation_type)
    
    # Step 4: 套用模板
    script = apply_template(novel_text, template, core_elements)
    
    # Step 5: 优化开头
    optimized_script = optimize_opening(script)
    # 应用: 数字冲击 / 身份反差 / 双循环 / 痛点前置
    
    # Step 6: 输出
    return {
        "script": optimized_script,
        "episodes": split_into_episodes(optimized_script, episode_count=3),
        "character_profiles": extract_characters(novel_text)
    }
```

### 输出
```json
{
  "script": "剧本内容...",
  "episodes": [
    {
      "episode_id": 1,
      "title": "重生·血泪觉醒",
      "duration": "60-90秒",
      "scenes": [...]
    }
  ],
  "character_profiles": {
    "protagonist": {
      "name": "苏凝引",
      "age": 16,
      "personality": "外柔内刚，重生后冷艳复仇"
    }
  }
}
```

---

## 📋 Phase 3: 分镜设计

### 输入
- 剧本文本
- 角色设定

### 处理流程

```python
def phase3_storyboard_design(script, characters):
    """
    分镜设计流程
    """
    # Step 1: 场景拆分
    scenes = split_scenes(script)
    
    # Step 2: 为每个场景生成分镜
    storyboards = []
    for scene in scenes:
        # 计算分镜数量（基于密度）
        shot_count = calculate_shot_count(scene, density="5秒版")
        
        # 生成分镜
        shots = generate_shots(scene, shot_count)
        storyboards.extend(shots)
    
    # Step 3: 添加镜头描述
    for shot in storyboards:
        shot["camera"] = determine_camera_type(shot)
        shot["movement"] = determine_camera_movement(shot)
        shot["lighting"] = determine_lighting(shot)
        shot["atmosphere"] = determine_atmosphere(shot)
    
    # Step 4: 输出
    return {
        "storyboards": storyboards,
        "total_duration": calculate_total_duration(storyboards),
        "episode_breakdown": group_by_episode(storyboards)
    }
```

### 分镜密度参考
| 视频时长 | 分镜数/千字 | 单镜头时长 |
|---------|------------|-----------|
| 5秒版 | 135 | 0.75秒 |
| 10秒版 | 67 | 1.5秒 |
| 15秒版 | 45 | 2.2秒 |

### 输出
```json
{
  "storyboards": [
    {
      "scene_id": 1,
      "episode": 1,
      "duration": "5秒",
      "description": "新婚夜，红烛摇曳",
      "camera": "中景镜头",
      "movement": "镜头缓慢推进",
      "character": "苏凝引",
      "action": "她缓缓睁开眼睛",
      "emotion": "迷茫→冷测",
      "lighting": "红烛光摇曳",
      "atmosphere": "戏剧性氛围"
    }
  ],
  "total_duration": "3分钟",
  "episode_breakdown": {...}
}
```

---

## 📋 Phase 4: 提示词生成

### 输入
- 分镜JSON
- 目标模型列表

### 处理流程

```python
def phase4_prompt_generation(storyboards, models):
    """
    提示词生成流程
    """
    # Step 1: 为每个模型生成提示词
    for model in models:
        for shot in storyboards:
            # 生成图片提示词
            shot[f"{model}_image_prompt"] = generate_image_prompt(shot, model)
            
            # 生成视频提示词
            shot[f"{model}_video_prompt"] = generate_video_prompt(shot, model)
    
    # Step 2: 输出
    return {
        "storyboards": storyboards,
        "model_assignments": assign_models_to_shots(storyboards, models)
    }
```

### 模型公式库

#### 可灵Kling（中文）
```
图片: {主体描述}，{动作描述}。{场景描述}。{镜头描述}，{光影描述}，{氛围描述}，8K。

视频: {运镜描述}，{动作描述}。{光影流动描述}。{氛围描述}，5秒。
```

#### Sora2（英文）
```
图片: {Camera shot}. {Subject}. {Action}. {Mood}. Cinematic quality. 8K masterpiece.

视频: The camera {movement}. {Subject} {action}. {Atmosphere}. 5 seconds, 24fps film quality.
```

#### Vidu（中英混合）
```
图片: {主体描述}，{动作描述}，{场景描述}。{镜头控制}。动漫风格渲染。

视频: Use reference image for character. {动作描述}。固定镜头微推，5秒。
```

### 输出
```json
{
  "storyboards": [
    {
      "scene_id": 1,
      "kling_image_prompt": "年轻女子，新婚夜，红烛摇曳，她缓缓睁开眼睛...",
      "kling_video_prompt": "镜头缓慢推进，新婚夜，红烛摇曳...",
      "sora2_image_prompt": "Medium shot. A young woman...",
      "sora2_video_prompt": "The camera slowly pushes in...",
      "assigned_model": "kling"
    }
  ]
}
```

---

## 📋 Phase 5: 内容生成

### 输入
- 提示词JSON
- ZZDH配置

### 处理流程

```python
def phase5_content_generation(prompts, zzdh_config):
    """
    内容生成流程
    """
    # Step 1: 连接ZZDH
    zzdh = connect_zzdh(zzdh_config["port"])
    
    # Step 2: 批量生成图片
    images = []
    for shot in prompts["storyboards"]:
        model = shot["assigned_model"]
        image = zzdh.generate_image(
            prompt=shot[f"{model}_image_prompt"],
            model=model
        )
        images.append(image)
    
    # Step 3: 批量生成视频
    videos = []
    for i, shot in enumerate(prompts["storyboards"]):
        model = shot["assigned_model"]
        video = zzdh.generate_video(
            prompt=shot[f"{model}_video_prompt"],
            reference_image=images[i],
            model=model,
            duration=5
        )
        videos.append(video)
    
    # Step 4: 质量检查
    quality_check = check_quality(images, videos)
    
    # Step 5: 输出
    return {
        "images": images,
        "videos": videos,
        "quality_report": quality_check
    }
```

### 质量检查标准
| 维度 | 标准 | 不合格处理 |
|------|------|-----------|
| 清晰度 | ≥1080p | 重新生成 |
| 流畅度 | ≥24fps | 重新生成 |
| 风格一致性 | ≥85%相似 | 调整提示词 |
| 角色一致性 | ≥90%相似 | 使用参考图 |

### 输出
```json
{
  "images": ["image_001.png", "image_002.png", ...],
  "videos": ["video_001.mp4", "video_002.mp4", ...],
  "quality_report": {
    "pass_rate": 95,
    "issues": []
  }
}
```

---

## 📋 Phase 6: 后期合成

### 输入
- 视频片段
- 配音文件（可选）
- 配乐文件（可选）

### 处理流程

```python
def phase6_post_production(videos, audio=None, music=None):
    """
    后期合成流程
    """
    # Step 1: 视频剪辑
    edited_video = edit_videos(videos)
    
    # Step 2: 添加配音
    if audio:
        edited_video = add_voiceover(edited_video, audio)
    
    # Step 3: 添加配乐
    if music:
        edited_video = add_background_music(edited_video, music)
    
    # Step 4: 导出成片
    final_video = export_video(
        edited_video,
        resolution="1080x1920",
        fps=24,
        format="mp4"
    )
    
    # Step 5: 输出
    return {
        "final_video": final_video,
        "duration": get_duration(final_video),
        "file_size": get_file_size(final_video)
    }
```

### 输出
```json
{
  "final_video": "output/final_episode_01.mp4",
  "duration": "90秒",
  "file_size": "45MB"
}
```

---

## 🔄 全自动化脚本示例

```python
#!/usr/bin/env python3
"""
小说→AI漫剧 全自动化脚本
"""

def automate_novel_to_drama(novel_path, output_dir):
    """
    全自动化主函数
    """
    # Phase 1: 小说筛选
    novel_text = read_novel(novel_path)
    evaluation = phase1_novel_selection(novel_text)
    
    if evaluation["status"] != "approved":
        print(f"小说未通过筛选: {evaluation['total_score']}分")
        return None
    
    print(f"小说通过筛选: {evaluation['total_score']}分")
    
    # Phase 2: 剧本改编
    script = phase2_script_adaptation(novel_text, evaluation)
    save_script(script, output_dir)
    
    print(f"剧本改编完成: {len(script['episodes'])}集")
    
    # Phase 3: 分镜设计
    storyboards = phase3_storyboard_design(
        script["script"], 
        script["character_profiles"]
    )
    save_storyboards(storyboards, output_dir)
    
    print(f"分镜设计完成: {len(storyboards['storyboards'])}个分镜")
    
    # Phase 4: 提示词生成
    models = ["kling", "vidu", "sora2"]
    prompts = phase4_prompt_generation(storyboards, models)
    save_prompts(prompts, output_dir)
    
    print(f"提示词生成完成: {len(models)}个模型")
    
    # Phase 5: 内容生成
    zzdh_config = load_zzdh_config()
    content = phase5_content_generation(prompts, zzdh_config)
    save_content(content, output_dir)
    
    print(f"内容生成完成: {len(content['videos'])}个视频")
    
    # Phase 6: 后期合成
    final = phase6_post_production(
        content["videos"],
        audio=load_audio(output_dir),
        music=load_music(output_dir)
    )
    
    print(f"成片输出: {final['final_video']}")
    
    return final

if __name__ == "__main__":
    automate_novel_to_drama(
        novel_path="input/novel.txt",
        output_dir="output/"
    )
```

---

## 📊 效率对比

| 阶段 | 手动耗时 | 自动化耗时 | 节省 |
|------|---------|-----------|------|
| 小说筛选 | 30分钟 | 1分钟 | 97% |
| 剧本改编 | 2小时 | 5分钟 | 96% |
| 分镜设计 | 4小时 | 10分钟 | 96% |
| 提示词生成 | 1小时 | 2分钟 | 97% |
| 内容生成 | 8小时 | 2小时 | 75% |
| 后期合成 | 2小时 | 30分钟 | 75% |
| **总计** | **17.5小时** | **2.8小时** | **84%** |

---

## ⚠️ 注意事项

### 安全边界
1. **危险操作需确认**: 删除文件、修改系统配置
2. **API调用限流**: 避免触发模型API限流
3. **质量检查**: 每个阶段都要有质量检查

### 人工介入点
1. 小说筛选后确认
2. 剧本改编后审核
3. 分镜设计后调整
4. 成片输出后验收

---

*设计者: 大哥*
*版本: v1.0*
*更新时间: 2026-03-30*
