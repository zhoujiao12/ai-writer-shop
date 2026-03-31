/**
 * 智能视频生成主控制器
 * 
 * 使用方式：
 * node smart_video_main.js --text "小说内容..." --style 古装 --duration 60
 */

const fs = require('fs');
const path = require('path');
const WebSocket = globalThis.WebSocket;

// 导入子模块
const { analyzeText, generateCharacterDescription, generateReferencePrompt } = require('./text_analyzer');

// 配置
const CONFIG = {
  zzdhPortFile: '/mnt/c/Users/Administrator/AppData/Local/Temp/zzdh-ws-port.txt',
  characterLibraryPath: path.join(__dirname, '../data/character_library'),
  defaultImageModel: 'flux',
  defaultVideoModel: 'vidu-r2v',
  defaultDuration: 60,
  defaultPlatform: 'douyin'
};

// 平台配置
const PLATFORM_CONFIG = {
  douyin: { shotDuration: 5, aspectRatio: '9:16', shotsPerMinute: 12 },
  bilibili: { shotDuration: 8, aspectRatio: '16:9', shotsPerMinute: 7 },
  youtube: { shotDuration: 10, aspectRatio: '16:9', shotsPerMinute: 6 }
};

// 视频模型配置
const VIDEO_MODELS = {
  'vidu-r2v': {
    name: 'Vidu Reference to Video',
    costPerSecond: 0.3,
    consistency: 5,
    maxDuration: 4,
    supports: ['multi-character', 'reference']
  },
  'sora2': {
    name: 'Sora 2',
    costPerSecond: 0.2,
    consistency: 5,
    maxDuration: 20,
    supports: ['cameos']
  },
  'kling': {
    name: 'Kling 可灵',
    costPerSecond: 2.0,
    consistency: 4,
    maxDuration: 120,
    supports: ['long-video', 'i2v']
  }
};

/**
 * 主函数：生成视频
 */
async function generateVideo(text, requirements = {}) {
  console.log('🚀 智能视频生成启动...\n');
  
  // 合并配置
  const config = {
    imageModel: requirements.imageModel || CONFIG.defaultImageModel,
    videoModel: requirements.videoModel || CONFIG.defaultVideoModel,
    duration: requirements.duration || CONFIG.defaultDuration,
    platform: requirements.platform || CONFIG.defaultPlatform,
    style: requirements.style || 'cinematic',
    projectName: requirements.projectName || '智能视频'
  };
  
  console.log('📋 配置信息:');
  console.log(`   平台: ${config.platform}`);
  console.log(`   时长: ${config.duration}秒`);
  console.log(`   风格: ${config.style}`);
  console.log(`   图片模型: ${config.imageModel}`);
  console.log(`   视频模型: ${config.videoModel}\n`);
  
  // Step 1: 分析文本
  console.log('📝 Step 1: 分析文本...');
  const analysis = await analyzeText(text, { model: 'glm-5' });
  console.log(`   ✅ 发现 ${analysis.characters.length} 个角色`);
  console.log(`   ✅ 拆分 ${analysis.scenes.length} 个场景`);
  console.log(`   ✅ 预计时长: ${analysis.totalDuration}秒\n`);
  
  // Step 2: 构建角色库
  console.log('👥 Step 2: 构建角色库...');
  const characterLibrary = {};
  
  for (const char of analysis.characters) {
    console.log(`   📌 角色: ${char.name} (${char.role})`);
    
    // 生成角色描述
    const description = generateCharacterDescription(char);
    
    // 生成参考图提示词
    const refPrompt = generateReferencePrompt(char);
    
    characterLibrary[char.name] = {
      info: char,
      description: description,
      referencePrompt: refPrompt,
      referenceImage: null // 稍后生成
    };
    
    // 保存角色信息
    saveCharacterToLibrary(char.name, { description, refPrompt });
  }
  console.log('');
  
  // Step 3: 生成分镜
  console.log('🎬 Step 3: 生成分镜...');
  const platformConfig = PLATFORM_CONFIG[config.platform];
  const shotCount = Math.min(
    Math.floor(config.duration / platformConfig.shotDuration),
    analysis.scenes.length
  );
  
  const panels = [];
  
  for (let i = 0; i < shotCount; i++) {
    const scene = analysis.scenes[i];
    
    // 生成分镜内容
    const panel = {
      index: i + 1,
      unique_name: generateId(),
      text: scene.description,
      characters: scene.characters,
      
      // 图片提示词
      imagePrompt: generateImagePrompt(scene, characterLibrary, config),
      
      // 视频提示词
      videoPrompt: generateVideoPrompt(scene, characterLibrary, config),
      
      // 分镜信息
      duration: platformConfig.shotDuration,
      camera: scene.camera,
      lighting: scene.lighting,
      emotion: scene.emotion
    };
    
    panels.push(panel);
  }
  
  console.log(`   ✅ 生成 ${panels.length} 个分镜`);
  console.log(`   ✅ 每个分镜 ${platformConfig.shotDuration}秒\n`);
  
  // Step 4: 注入ZZDH
  console.log('📤 Step 4: 注入ZZDH...');
  try {
    await integrateToZZDH(config.projectName, panels, text);
    console.log('   ✅ 注入完成\n');
  } catch (error) {
    console.log(`   ❌ 注入失败: ${error.message}`);
    console.log('   💡 请确保ZZDH软件已打开\n');
  }
  
  // Step 5: 生成报告
  console.log('📊 Step 5: 生成报告...');
  const report = generateReport(analysis, panels, config);
  
  console.log('\n' + '='.repeat(50));
  console.log('📈 生成报告');
  console.log('='.repeat(50));
  console.log(`作品: ${analysis.title}`);
  console.log(`角色数: ${analysis.characters.length}`);
  console.log(`分镜数: ${panels.length}`);
  console.log(`总时长: ${panels.reduce((s, p) => s + p.duration, 0)}秒`);
  console.log(`预计成本: ¥${estimateCost(panels.length, config).toFixed(2)}`);
  console.log('='.repeat(50));
  console.log('\n📋 下一步操作:');
  console.log('   1. 在ZZDH中刷新并打开项目');
  console.log('   2. 检查分镜内容和提示词');
  console.log('   3. 选择图片模型生成参考图');
  console.log('   4. 批量生成分镜图片');
  console.log('   5. 切换视频模式选择Vidu R2V');
  console.log('   6. 批量生成视频\n');
  
  // 保存报告
  saveReport(report, config.projectName);
  
  return report;
}

/**
 * 生成图片提示词
 */
function generateImagePrompt(scene, characterLibrary, config) {
  const parts = [];
  
  // 场景描述
  parts.push(scene.description);
  
  // 角色信息
  if (scene.characters && scene.characters.length > 0) {
    const charName = scene.characters[0];
    const char = characterLibrary[charName];
    if (char) {
      parts.push(`${char.info.name}，${char.info.appearance.age}`);
      parts.push(char.info.clothing);
    }
  }
  
  // 风格和氛围
  parts.push(`${config.style}风格`);
  parts.push(`${scene.emotion}氛围`);
  parts.push('电影级光影');
  parts.push('高质量');
  
  return parts.join('，') + '。';
}

/**
 * 生成视频提示词
 */
function generateVideoPrompt(scene, characterLibrary, config) {
  const parts = [];
  
  // 场景
  parts.push(`Scene: ${scene.description}`);
  
  // 动作
  parts.push(`Action: ${scene.action}`);
  
  // 角色
  if (scene.characters && scene.characters.length > 0) {
    const charName = scene.characters[0];
    const char = characterLibrary[charName];
    if (char) {
      parts.push(`Character: ${char.info.name}, ${char.info.appearance.age}`);
    }
  }
  
  // 风格和镜头
  parts.push(`Style: ${config.style}, cinematic`);
  parts.push(`Mood: ${scene.emotion}`);
  parts.push(`Lighting: ${scene.lighting}`);
  parts.push(`Camera: ${scene.camera}`);
  
  return parts.join('. ') + '.';
}

/**
 * 注入到ZZDH
 */
async function integrateToZZDH(projectName, panels, fullText) {
  // 获取ZZDH端口
  const port = getZZDHPort();
  if (!port) {
    throw new Error('无法获取ZZDH端口，请确保软件已打开');
  }
  
  const ws = new WebSocket(`ws://127.0.0.1:${port}`);
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('连接超时'));
    }, 30000);
    
    ws.addEventListener('open', () => {
      console.log('   🔗 连接ZZDH成功');
      
      // 创建项目
      const createMsg = {
        type: 'create_project_paper',
        data: {
          name: projectName,
          content: fullText.substring(0, 500)
        }
      };
      
      ws.send(JSON.stringify(createMsg));
    });
    
    ws.addEventListener('message', async (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'create_project_paper') {
        if (data.data?.success) {
          console.log('   ✅ 项目创建成功');
          
          // 等待一下
          await new Promise(r => setTimeout(r, 500));
          
          // 发送frontend_ready
          ws.send(JSON.stringify({
            type: 'frontend_ready',
            data: { project_path: `工作目录/默认/${projectName}` }
          }));
        }
      } else if (data.type === 'project_data_init') {
        const existingPanels = data.data.panels || [];
        console.log(`   📌 当前分镜数: ${existingPanels.length}`);
        
        // 更新每个分镜的提示词
        for (let i = 0; i < Math.min(panels.length, existingPanels.length); i++) {
          const panel = panels[i];
          const existing = existingPanels[i];
          
          // 更新文案
          ws.send(JSON.stringify({
            type: 'update_paperwork',
            data: { unique_name: existing.unique_name, paperwork: panel.text }
          }));
          await new Promise(r => setTimeout(r, 50));
          
          // 更新图片提示词
          ws.send(JSON.stringify({
            type: 'update_prompt',
            data: { unique_name: existing.unique_name, prompt: panel.imagePrompt }
          }));
          await new Promise(r => setTimeout(r, 50));
          
          // 更新视频提示词
          ws.send(JSON.stringify({
            type: 'update_video_prompt',
            data: { unique_name: existing.unique_name, video_prompt: panel.videoPrompt }
          }));
          await new Promise(r => setTimeout(r, 50));
        }
        
        clearTimeout(timeout);
        ws.close();
        resolve();
      }
    });
    
    ws.addEventListener('error', (error) => {
      clearTimeout(timeout);
      reject(new Error('WebSocket连接失败'));
    });
  });
}

/**
 * 获取ZZDH端口
 */
function getZZDHPort() {
  try {
    const port = fs.readFileSync(CONFIG.zzdhPortFile, 'utf-8').trim();
    return parseInt(port, 10);
  } catch (error) {
    return null;
  }
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Math.random().toString(36).substring(2, 12);
}

/**
 * 估算成本
 */
function estimateCost(shotCount, config) {
  const model = VIDEO_MODELS[config.videoModel];
  const platformConfig = PLATFORM_CONFIG[config.platform];
  const totalSeconds = shotCount * platformConfig.shotDuration;
  return totalSeconds * (model?.costPerSecond || 0);
}

/**
 * 生成报告
 */
function generateReport(analysis, panels, config) {
  return {
    title: analysis.title,
    style: analysis.style,
    mood: analysis.mood,
    characterCount: analysis.characters.length,
    characters: analysis.characters.map(c => ({
      name: c.name,
      role: c.role,
      description: c.personality
    })),
    sceneCount: panels.length,
    totalDuration: panels.reduce((s, p) => s + p.duration, 0),
    estimatedCost: estimateCost(panels.length, config),
    config: config,
    createdAt: new Date().toISOString()
  };
}

/**
 * 保存角色到库
 */
function saveCharacterToLibrary(name, data) {
  const charDir = path.join(CONFIG.characterLibraryPath, name);
  
  try {
    fs.mkdirSync(charDir, { recursive: true });
    fs.writeFileSync(
      path.join(charDir, 'info.json'),
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    // 静默失败
  }
}

/**
 * 保存报告
 */
function saveReport(report, projectName) {
  const reportsDir = path.join(__dirname, '../reports');
  
  try {
    fs.mkdirSync(reportsDir, { recursive: true });
    const filename = `${projectName}_${Date.now()}.json`;
    fs.writeFileSync(
      path.join(reportsDir, filename),
      JSON.stringify(report, null, 2)
    );
    console.log(`   💾 报告已保存: ${filename}`);
  } catch (error) {
    // 静默失败
  }
}

// CLI入口
if (require.main === module) {
  const args = process.argv.slice(2);
  const params = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      params[key] = value;
      if (value !== true) i++;
    }
  }
  
  if (!params.text) {
    console.log('用法: node smart_video_main.js --text "文本内容" [选项]');
    console.log('');
    console.log('选项:');
    console.log('  --text "文本"      要转换的文本内容');
    console.log('  --style "风格"     视频风格（古装/现代/科幻）');
    console.log('  --duration 时长    目标时长（秒）');
    console.log('  --platform 平台    目标平台（douyin/bilibili/youtube）');
    console.log('  --projectName 名称 项目名称');
    console.log('');
    console.log('示例:');
    console.log('  node smart_video_main.js --text "苏婉音是相府庶女..." --style 古装 --duration 60');
    process.exit(1);
  }
  
  generateVideo(params.text, params).catch(console.error);
}

module.exports = { generateVideo, analyzeText };
