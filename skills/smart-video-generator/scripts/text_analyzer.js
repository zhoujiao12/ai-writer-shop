/**
 * 文本分析器
 * 从小说/剧本中提取角色和场景信息
 */

const fs = require('fs');
const path = require('path');

/**
 * 分析文本，提取角色和场景
 * @param {string} text - 输入文本
 * @param {object} options - 选项
 * @returns {object} 分析结果
 */
async function analyzeText(text, options = {}) {
  const { model = 'glm-5' } = options;
  
  // 构建分析提示词
  const prompt = `你是一个专业的影视编剧分析师。请分析以下文本，提取关键信息。

文本内容：
"""
${text}
"""

请按以下JSON格式输出（不要有任何其他内容，只输出JSON）：
{
  "title": "作品标题",
  "style": "风格（如：古装、现代、科幻）",
  "mood": "整体情感基调",
  "characters": [
    {
      "name": "角色名",
      "role": "角色定位（主角/配角/反派）",
      "appearance": {
        "age": "年龄",
        "gender": "性别",
        "hair": "发型发色",
        "eyes": "眼睛",
        "skin": "肤色",
        "figure": "体型",
        "features": "显著特征"
      },
      "clothing": "典型服装",
      "personality": "性格特点",
      "expressions": ["典型表情1", "典型表情2"]
    }
  ],
  "scenes": [
    {
      "index": 1,
      "description": "场景描述",
      "location": "地点",
      "characters": ["出场角色"],
      "action": "主要动作",
      "emotion": "情感",
      "duration": 5,
      "camera": "镜头建议",
      "lighting": "光线建议"
    }
  ],
  "totalDuration": 预计总时长（秒）
}`;

  try {
    // 调用LLM（使用OpenClaw的内置能力）
    // 这里我们直接使用分析逻辑
    
    // 简单的文本分析（实际应用中应调用LLM）
    const result = simpleAnalysis(text);
    return result;
    
  } catch (error) {
    console.error('文本分析失败:', error);
    throw error;
  }
}

/**
 * 简单的文本分析（备用方案）
 */
function simpleAnalysis(text) {
  // 提取标题（第一行或前20字）
  const lines = text.split('\n').filter(l => l.trim());
  const title = lines[0].substring(0, 20);
  
  // 简单的角色提取（查找常见模式）
  const characters = [];
  const characterPatterns = [
    /([苏王李张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗])\w{1,2}/g,
  ];
  
  // 预设一些常见角色特征
  const foundNames = new Set();
  for (const pattern of characterPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(name => {
        if (name.length >= 2 && name.length <= 4 && !foundNames.has(name)) {
          foundNames.add(name);
          characters.push({
            name: name,
            role: characters.length === 0 ? '主角' : '配角',
            appearance: {
              age: '青年',
              gender: '女',
              hair: '乌黑长发',
              eyes: '明亮',
              skin: '白皙',
              figure: '纤细',
              features: '清秀'
            },
            clothing: '古代汉服',
            personality: '坚韧',
            expressions: ['低眉', '冷笑', '坚定']
          });
        }
      });
    }
  }
  
  // 简单的场景拆分（按段落或标点）
  const scenes = [];
  const paragraphs = text.split(/[。\n]/).filter(p => p.trim().length > 10);
  
  paragraphs.forEach((para, index) => {
    if (index < 20) { // 最多20个场景
      scenes.push({
        index: index + 1,
        description: para.trim().substring(0, 50),
        location: '场景',
        characters: characters.slice(0, 2).map(c => c.name),
        action: '动作',
        emotion: '情感',
        duration: 5,
        camera: '中景',
        lighting: '自然光'
      });
    }
  });
  
  return {
    title: title || '未命名作品',
    style: '古装',
    mood: '悲情',
    characters: characters.slice(0, 5), // 最多5个角色
    scenes: scenes,
    totalDuration: scenes.length * 5
  };
}

/**
 * 生成角色描述文档
 */
function generateCharacterDescription(character) {
  return `
角色名：${character.name}
角色定位：${character.role}

外貌特征：
- 年龄：${character.appearance.age}
- 性别：${character.appearance.gender}
- 发型：${character.appearance.hair}
- 眼睛：${character.appearance.eyes}
- 肤色：${character.appearance.skin}
- 体型：${character.appearance.figure}
- 特征：${character.appearance.features}

服装：${character.clothing}

性格：${character.personality}

典型表情：${character.expressions.join('、')}
  `.trim();
}

/**
 * 生成角色参考图提示词
 */
function generateReferencePrompt(character) {
  const parts = [
    character.name,
    `${character.appearance.age} years old`,
    character.appearance.gender,
    character.appearance.hair,
    character.appearance.eyes,
    character.appearance.skin,
    `wearing ${character.clothing}`,
    'neutral expression',
    'front view',
    'upper body portrait',
    'white background',
    'character reference sheet',
    'high quality',
    'detailed',
    '4K'
  ];
  
  return parts.join(', ');
}

module.exports = {
  analyzeText,
  generateCharacterDescription,
  generateReferencePrompt
};
