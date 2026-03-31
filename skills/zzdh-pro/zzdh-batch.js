/**
 * ZZDH 批量处理器 v1.0.0
 * 
 * 解决问题：
 * - 原CLI只能逐个执行操作
 * - 批量操作支持并行处理
 * - 进度跟踪和通知
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  poolPort: 18790,
  maxConcurrent: 3, // 最大并行数
  retryCount: 3,
  retryDelay: 2000,
};

const log = {
  info: (...a) => console.error('[INFO]', ...a),
  error: (...a) => console.error('[ERROR]', ...a),
  success: (...a) => console.error('[SUCCESS]', ...a),
};

// ======================== 批量处理器 ========================

class BatchProcessor {
  constructor() {
    this.results = [];
    this.errors = [];
    this.completed = 0;
    this.total = 0;
  }

  async callPool(action, params = {}) {
    const url = new URL(`http://127.0.0.1:${CONFIG.poolPort}/exec`);
    url.searchParams.set('action', action);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    
    const response = await fetch(url);
    return response.json();
  }

  async generateImages(panels, batchSize = 4, concurrent = CONFIG.maxConcurrent) {
    this.total = panels.length;
    this.completed = 0;
    
    log.info(`开始批量生成图片: ${this.total} 个分镜, 并行数: ${concurrent}`);
    
    // 分组并行执行
    const groups = this._chunk(panels, concurrent);
    
    for (const group of groups) {
      const promises = group.map(async (panel) => {
        for (let retry = 0; retry < CONFIG.retryCount; retry++) {
          try {
            const result = await this.callPool('generate-image', {
              panel: panel.unique_name || panel,
              batch: batchSize
            });
            
            if (result.error) {
              throw new Error(result.error);
            }
            
            this.completed++;
            log.success(`[${this.completed}/${this.total}] 完成: ${panel.unique_name || panel}`);
            
            return { panel, success: true, result };
          } catch (e) {
            if (retry === CONFIG.retryCount - 1) {
              this.errors.push({ panel, error: e.message });
              log.error(`失败: ${panel.unique_name || panel} - ${e.message}`);
              return { panel, success: false, error: e.message };
            }
            await this._sleep(CONFIG.retryDelay * (retry + 1));
          }
        }
      });
      
      await Promise.all(promises);
    }
    
    return {
      total: this.total,
      completed: this.completed,
      errors: this.errors
    };
  }

  async generateVideos(panels, model = 'kling', options = {}) {
    this.total = panels.length;
    this.completed = 0;
    
    log.info(`开始批量生成视频: ${this.total} 个分镜, 模型: ${model}`);
    
    for (const panel of panels) {
      for (let retry = 0; retry < CONFIG.retryCount; retry++) {
        try {
          // 设置视频模型
          if (options.switchMode) {
            await this.callPool('switch-media-mode', { mode: 'video' });
          }
          
          // 生成视频
          const result = await this.callPool('generate-video', {
            panel: panel.unique_name || panel
          });
          
          if (result.error) {
            throw new Error(result.error);
          }
          
          this.completed++;
          log.success(`[${this.completed}/${this.total}] 完成: ${panel.unique_name || panel}`);
          
          // 等待生成完成
          await this._waitForVideoComplete(panel.unique_name || panel);
          
          break;
        } catch (e) {
          if (retry === CONFIG.retryCount - 1) {
            this.errors.push({ panel, error: e.message });
            log.error(`失败: ${panel.unique_name || panel} - ${e.message}`);
          } else {
            await this._sleep(CONFIG.retryDelay * (retry + 1));
          }
        }
      }
    }
    
    return {
      total: this.total,
      completed: this.completed,
      errors: this.errors
    };
  }

  async updatePrompts(panels, promptMap) {
    this.total = panels.length;
    this.completed = 0;
    
    log.info(`开始批量更新提示词: ${this.total} 个分镜`);
    
    for (const panel of panels) {
      const prompt = promptMap[panel.unique_name] || promptMap[panel];
      if (!prompt) continue;
      
      try {
        await this.callPool('update-prompt', {
          panel: panel.unique_name || panel,
          prompt: prompt
        });
        
        this.completed++;
        log.success(`[${this.completed}/${this.total}] 更新: ${panel.unique_name || panel}`);
      } catch (e) {
        this.errors.push({ panel, error: e.message });
        log.error(`失败: ${panel.unique_name || panel} - ${e.message}`);
      }
    }
    
    return {
      total: this.total,
      completed: this.completed,
      errors: this.errors
    };
  }

  async _waitForVideoComplete(panelId, maxWait = 600000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      try {
        const status = await this.callPool('task-status');
        // 检查任务状态
        if (status && !status.pending_tasks) {
          return true;
        }
      } catch (e) {
        // 忽略错误
      }
      
      await this._sleep(5000);
    }
    
    return false;
  }

  _chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ======================== 通知模块 ========================

async function notify(message, type = 'info') {
  const notifyConfigPath = path.join(process.env.HOME, '.openclaw/workspace/data/zzdh-notify.json');
  
  try {
    if (fs.existsSync(notifyConfigPath)) {
      const config = JSON.parse(fs.readFileSync(notifyConfigPath, 'utf-8'));
      
      if (config.telegram && config.telegram.enabled) {
        // 通过OpenClaw发送Telegram通知
        // 这里可以调用OpenClaw的内部API
        log.info(`[Telegram] ${message}`);
      }
    }
  } catch (e) {
    log.error('通知发送失败:', e.message);
  }
}

// ======================== 主入口 ========================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.error(
      'ZZDH 批量处理器 v1.0.0\n' +
      '\n' +
      '使用方式:\n' +
      '  node zzdh-batch.js generate-images --panels "p1,p2,p3" [--batch 4] [--concurrent 3]\n' +
      '  node zzdh-batch.js generate-videos --panels "p1,p2,p3" [--model kling]\n' +
      '  node zzdh-batch.js update-prompts --file prompts.json\n' +
      '\n' +
      '注意：需要先启动连接池: node zzdh-pool.js start'
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

  const processor = new BatchProcessor();

  try {
    // 检查连接池是否运行
    const statusResponse = await fetch(`http://127.0.0.1:${CONFIG.poolPort}/status`);
    const status = await statusResponse.json();
    
    if (!status.connected) {
      console.log(JSON.stringify({ error: 'ZZDH 未连接，请确保 ZZDH 正在运行' }));
      process.exit(1);
    }
    
    log.info('连接池状态:', status);

    let result;

    if (command === 'generate-images') {
      const panels = params.panels ? params.panels.split(',') : [];
      
      if (panels.length === 0) {
        // 获取所有分镜
        const panelsData = await processor.callPool('panels');
        const allPanels = panelsData.panels || panelsData;
        result = await processor.generateImages(
          allPanels,
          parseInt(params.batch || '4'),
          parseInt(params.concurrent || '3')
        );
      } else {
        result = await processor.generateImages(
          panels,
          parseInt(params.batch || '4'),
          parseInt(params.concurrent || '3')
        );
      }
    }
    
    else if (command === 'generate-videos') {
      const panels = params.panels ? params.panels.split(',') : [];
      
      if (panels.length === 0) {
        const panelsData = await processor.callPool('panels');
        const allPanels = panelsData.panels || panelsData;
        result = await processor.generateVideos(allPanels, params.model || 'kling');
      } else {
        result = await processor.generateVideos(panels, params.model || 'kling');
      }
    }
    
    else if (command === 'update-prompts') {
      if (!params.file) {
        console.log(JSON.stringify({ error: '缺少 --file 参数' }));
        process.exit(1);
      }
      
      const promptData = JSON.parse(fs.readFileSync(params.file, 'utf-8'));
      const panelsData = await processor.callPool('panels');
      const allPanels = panelsData.panels || panelsData;
      
      result = await processor.updatePrompts(allPanels, promptData);
    }
    
    else {
      console.log(JSON.stringify({ error: '未知命令: ' + command }));
      process.exit(1);
    }

    // 发送通知
    await notify(`批量操作完成: ${result.completed}/${result.total} 成功, ${result.errors.length} 失败`);

    console.log(JSON.stringify(result, null, 2));

  } catch (e) {
    console.log(JSON.stringify({ error: e.message }));
    process.exit(1);
  }
}

main().catch(e => {
  console.log(JSON.stringify({ error: e.message }));
  process.exit(1);
});
