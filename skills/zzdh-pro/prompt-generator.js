/**
 * ZZDH 智能提示词生成器 v1.0.0
 * 
 * 解决问题：
 * - 手动编写提示词效率低
 * - 根据分镜内容自动生成最佳提示词
 * - 自动选择模型和公式
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================== 模型公式库 ========================

const PROMPT_FORMULAS = {
  // 图片模型
  image: {
    midjourney: {
      formula: '{主体} + {场景} + {风格} + {动作} + --ar {宽高比}',
      language: 'en',
      suffix: '--ar 16:9 --v 6'
    },
    stable_diffusion: {
      formula: '{主体} + {特征} + {环境} + {质量词}',
      language: 'en',
      suffix: ', best quality, 4k, detailed'
    },
    flux: {
      formula: '{主体} + {场景} + {风格} + {光影}',
      language: 'en',
      suffix: ', cinematic lighting, high detail'
    },
    即梦: {
      formula: '@参考图 + {主体} + {动作链} + {镜头} + {特效}',
      language: 'zh',
      suffix: ''
    },
    comfyui: {
      formula: '{主体} + {特征} + {环境} + {负面提示词}',
      language: 'en',
      suffix: ''
    }
  },
  
  // 视频模型
  video: {
    sora2: {
      formula: '{镜头}: {场景}. {细节}',
      language: 'en',
      features: ['文生视频', '首帧生视频'],
      maxDuration: 20
    },
    kling: {
      formula: '{主体} + {场景} + {运动} + {氛围}',
      language: 'zh',
      features: ['文生视频', '图生视频'],
      maxDuration: 120
    },
    vidu: {
      formula: '{主体} + {场景} + {运动} + {镜头}',
      language: 'zh',
      features: ['文生视频', '图生视频', '角色一致性'],
      maxDuration: 10
    },
    wan2: {
      formula: '{主体} + {场景} + {运动} + {镜头} + {氛围}',
      language: 'zh',
      features: ['文生视频', '图生视频'],
      maxDuration: 10
    },
    seedance: {
      formula: '{主体} + {场景} + {运动} + {镜头} + {氛围}',
      language: 'zh',
      features: ['文生视频', '首帧生视频', '首尾帧生视频'],
      maxDuration: 10
    },
    veo3: {
      formula: '{镜头}: {场景}. {细节}',
      language: 'en',
      features: ['文生视频', '首帧生视频', '首尾帧生视频'],
      maxDuration: 8
    },
    hailuo: {
      formula: '{主体} + {场景} + {运动} + {镜头}',
      language: 'zh',
      features: ['文生视频', '图生视频', '首尾帧生视频'],
      maxDuration: 6
    }
  }
};

// ======================== 动作链库 ========================

const ACTION_CHAINS = {
  // 情感动作
  emotion: {
    悲伤: ['先低头垂眸', '随后泪珠滑落', '最后转身离去'],
    愤怒: ['先紧握双拳', '随后咬牙切齿', '最后转身摔门'],
    惊讶: ['先瞪大眼睛', '随后后退一步', '最后捂住嘴巴'],
    喜悦: ['先眼中闪烁光芒', '随后嘴角上扬', '最后欢笑跳跃'],
    恐惧: ['先瞳孔收缩', '随后身体颤抖', '最后向后退去']
  },
  
  // 互动动作
  interaction: {
    对视: ['先抬眼望去', '随后目光交汇', '最后定格凝视'],
    离去: ['先转身', '随后迈步', '最后身影渐远'],
    追逐: ['先回头', '随后奔跑', '最后消失远方'],
    拥抱: ['先张开双臂', '随后紧紧相拥', '最后闭上眼睛']
  },
  
  // 环境动作
  environment: {
    风起: ['先发丝飘动', '随后衣角飞扬', '最后落叶纷飞'],
    雨落: ['先乌云密布', '随后雨点落下', '最后雨中奔跑'],
    日出: ['先天边泛白', '随后阳光洒落', '最后照亮大地']
  }
};

// ======================== 镜头运动库 ========================

const CAMERA_MOVEMENTS = {
  推进: '镜头缓慢推进，从远景到近景',
  拉远: '镜头缓缓拉远，展现全景',
  环绕: '镜头环绕主体360度',
  跟随: '镜头跟随主体移动',
  升降: '镜头从低角度缓缓升起',
  摇镜: '镜头水平摇动，从左到右',
  俯拍: '俯拍镜头，从上往下',
  仰拍: '仰拍镜头，从下往上',
  特写: '镜头聚焦特写，突出细节',
  全景: '广角全景，展现全貌'
};

// ======================== 提示词生成器 ========================

class PromptGenerator {
  constructor(options = {}) {
    this.model = options.model || 'kling';
    this.type = options.type || 'video';
    this.style = options.style || 'cinematic';
    this.version = options.version || '10s'; // 5s, 10s, 15s
  }

  /**
   * 生成分镜提示词
   */
  generatePanelPrompt(panelData) {
    const {
      content,       // 分镜内容描述
      character,     // 角色信息
      action,        // 动作描述
      emotion,       // 情感
      scene,         // 场景
      camera,        // 镜头
      style          // 风格
    } = panelData;

    // 获取模型公式
    const formula = PROMPT_FORMULAS[this.type]?.[this.model];
    if (!formula) {
      throw new Error(`不支持的模型: ${this.model}`);
    }

    // 构建提示词组件
    const components = {
      主体: this._buildSubject(character, emotion),
      场景: scene || '室内',
      动作: this._buildAction(action, emotion),
      运动: this._buildMovement(action),
      镜头: CAMERA_MOVEMENTS[camera] || camera || '镜头缓慢推进',
      氛围: this._buildAtmosphere(emotion),
      光影: this._buildLighting(style),
      细节: this._buildDetails(panelData),
      动作链: this._buildActionChain(emotion, action)
    };

    // 应用公式
    let prompt = this._applyFormula(formula.formula, components);

    // 添加后缀
    if (formula.suffix) {
      prompt += formula.suffix;
    }

    // 版本限制
    prompt = this._applyVersionConstraints(prompt, this.version);

    return {
      prompt,
      language: formula.language,
      components,
      estimatedDuration: this._estimateDuration(prompt)
    };
  }

  /**
   * 批量生成提示词
   */
  generateBatchPrompts(panels) {
    return panels.map((panel, index) => {
      const result = this.generatePanelPrompt({
        content: panel.content || panel.paperwork,
        character: panel.character,
        action: panel.action,
        emotion: panel.emotion,
        scene: panel.scene,
        camera: panel.camera,
        style: panel.style
      });

      return {
        index,
        unique_name: panel.unique_name,
        ...result
      };
    });
  }

  /**
   * 智能选择最佳模型
   */
  static selectBestModel(requirements) {
    const {
      needFirstFrame = false,
      needEndFrame = false,
      needLongVideo = false,
      needCharacterConsistency = false,
      style = 'realistic',
      language = 'zh'
    } = requirements;

    // 决策树
    if (needEndFrame) {
      return 'seedance'; // 首尾帧最佳
    }
    
    if (needLongVideo) {
      return 'kling'; // 最长支持2分钟
    }
    
    if (needCharacterConsistency && style === 'anime') {
      return 'vidu'; // 动漫角色一致性最佳
    }
    
    if (style === 'realistic' && language === 'en') {
      return 'sora2'; // 真实感最佳
    }
    
    if (language === 'zh') {
      return 'kling'; // 中文默认
    }
    
    return 'vidu'; // 性价比最高
  }

  // ======================== 私有方法 ========================

  _buildSubject(character, emotion) {
    if (!character) return '一个女人';
    
    const parts = [character.name || '女人'];
    
    if (character.appearance) {
      parts.push(character.appearance);
    }
    
    if (emotion) {
      parts.push(this._getEmotionDescription(emotion));
    }
    
    return parts.join('，');
  }

  _buildAction(action, emotion) {
    if (!action) return '';
    
    // 查找匹配的动作链
    for (const [category, chains] of Object.entries(ACTION_CHAINS)) {
      for (const [key, chain] of Object.entries(chains)) {
        if (action.includes(key) || key.includes(action)) {
          return chain.join('，');
        }
      }
    }
    
    return action;
  }

  _buildMovement(action) {
    if (!action) return '轻微晃动';
    
    const movements = {
      走: '缓慢行走',
      跑: '快速奔跑',
      转身: '转身动作',
      抬头: '抬头动作',
      低头: '低头动作',
      手: '手部动作'
    };
    
    for (const [key, value] of Object.entries(movements)) {
      if (action.includes(key)) {
        return value;
      }
    }
    
    return '轻微晃动';
  }

  _buildAtmosphere(emotion) {
    const atmospheres = {
      悲伤: '阴郁，冷色调',
      愤怒: '紧张，对比强烈',
      惊讶: '明亮，光影跳跃',
      喜悦: '温暖，色调柔和',
      恐惧: '阴暗，阴影浓重',
      平静: '柔和，自然光'
    };
    
    return atmospheres[emotion] || '自然光';
  }

  _buildLighting(style) {
    const lightings = {
      cinematic: '电影级光效，轮廓光，氛围光',
      natural: '自然光，柔和散射',
      dramatic: '戏剧性光效，强对比',
      soft: '柔光，低对比度'
    };
    
    return lightings[style] || lightings.cinematic;
  }

  _buildDetails(panelData) {
    const details = [];
    
    if (panelData.costume) {
      details.push(panelData.costume);
    }
    
    if (panelData.props) {
      details.push(panelData.props);
    }
    
    if (panelData.weather) {
      details.push(panelData.weather);
    }
    
    return details.join('，');
  }

  _buildActionChain(emotion, action) {
    // 优先查找情感动作链
    if (emotion && ACTION_CHAINS.emotion[emotion]) {
      return ACTION_CHAINS.emotion[emotion].join('，');
    }
    
    // 查找互动动作链
    if (action) {
      for (const [key, chain] of Object.entries(ACTION_CHAINS.interaction)) {
        if (action.includes(key)) {
          return chain.join('，');
        }
      }
    }
    
    return '先静止，随后轻微移动，最后定格';
  }

  _applyFormula(formula, components) {
    let result = formula;
    
    // 替换占位符
    for (const [key, value] of Object.entries(components)) {
      result = result.replace(`{${key}}`, value);
    }
    
    // 清理空占位符
    result = result.replace(/\{[^}]+\}/g, '');
    
    // 清理多余符号
    result = result.replace(/\+ \+ /g, '+ ');
    result = result.replace(/\+ $/, '');
    result = result.replace(/^ \+ /, '');
    
    return result.trim();
  }

  _applyVersionConstraints(prompt, version) {
    const constraints = {
      '5s': { maxDialogue: 2, maxSentenceLength: 8 },
      '10s': { maxDialogue: 3, maxSentenceLength: 10 },
      '15s': { maxDialogue: 4, maxSentenceLength: 12 }
    };
    
    const constraint = constraints[version];
    if (!constraint) return prompt;
    
    // 这里可以添加对话长度限制逻辑
    return prompt;
  }

  _estimateDuration(prompt) {
    // 简单估算：基于字符数
    const charCount = prompt.length;
    const estimatedSeconds = Math.max(3, Math.min(15, Math.ceil(charCount / 50)));
    return estimatedSeconds;
  }

  _getEmotionDescription(emotion) {
    const descriptions = {
      悲伤: '眼眶泛红，泪光闪烁',
      愤怒: '眉头紧锁，目光凌厉',
      惊讶: '瞪大双眼，微微张嘴',
      喜悦: '眉眼弯弯，嘴角上扬',
      恐惧: '瞳孔放大，面色苍白'
    };
    
    return descriptions[emotion] || '';
  }
}

// ======================== 主入口 ========================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.error(
      'ZZDH 智能提示词生成器 v1.0.0\n' +
      '\n' +
      '使用方式:\n' +
      '  node prompt-generator.js generate --content "描述内容" --model kling\n' +
      '  node prompt-generator.js batch --file panels.json --model vidu\n' +
      '  node prompt-generator.js recommend --first-frame --end-frame --style anime\n' +
      '\n' +
      '支持的模型:\n' +
      '  图片: midjourney, stable_diffusion, flux, 即梦, comfyui\n' +
      '  视频: sora2, kling, vidu, wan2, seedance, veo3, hailuo'
    );
    process.exit(0);
  }

  // 解析参数
  const params = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
      params[key] = value;
      if (value !== 'true') i++;
    }
  }

  if (command === 'generate') {
    const generator = new PromptGenerator({
      model: params.model || 'kling',
      type: params.type || 'video'
    });

    const result = generator.generatePanelPrompt({
      content: params.content,
      character: params.character ? JSON.parse(params.character) : null,
      action: params.action,
      emotion: params.emotion,
      scene: params.scene,
      camera: params.camera
    });

    console.log(JSON.stringify(result, null, 2));
  }
  
  else if (command === 'batch') {
    if (!params.file) {
      console.log(JSON.stringify({ error: '缺少 --file 参数' }));
      process.exit(1);
    }

    const panels = JSON.parse(fs.readFileSync(params.file, 'utf-8'));
    const generator = new PromptGenerator({
      model: params.model || 'kling',
      type: params.type || 'video'
    });

    const results = generator.generateBatchPrompts(panels);
    console.log(JSON.stringify(results, null, 2));
  }
  
  else if (command === 'recommend') {
    const bestModel = PromptGenerator.selectBestModel({
      needFirstFrame: params['first-frame'] === 'true',
      needEndFrame: params['end-frame'] === 'true',
      needLongVideo: params['long-video'] === 'true',
      needCharacterConsistency: params['character-consistency'] === 'true',
      style: params.style || 'realistic',
      language: params.language || 'zh'
    });

    console.log(JSON.stringify({ recommendedModel: bestModel }, null, 2));
  }
  
  else {
    console.log(JSON.stringify({ error: '未知命令: ' + command }));
    process.exit(1);
  }
}

main().catch(e => {
  console.log(JSON.stringify({ error: e.message }));
  process.exit(1);
});

export { PromptGenerator, PROMPT_FORMULAS, ACTION_CHAINS, CAMERA_MOVEMENTS };
