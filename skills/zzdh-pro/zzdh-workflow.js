/**
 * ZZDH 工作流引擎 v1.0.0
 * 
 * 解决问题：
 * - 手动执行多个步骤效率低
 * - 工作流模板一键执行
 * - 自动化完整流程
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  poolPort: 18790,
  templatesDir: path.join(__dirname, 'templates')
};

const log = {
  info: (...a) => console.error('[INFO]', ...a),
  error: (...a) => console.error('[ERROR]', ...a),
  success: (...a) => console.error('[SUCCESS]', ...a),
  step: (step, total, name) => console.error(`\n[STEP ${step}/${total}] ${name}`),
};

// ======================== 工作流引擎 ========================

class WorkflowEngine {
  constructor() {
    this.variables = {};
    this.context = {};
    this.currentStep = 0;
    this.totalSteps = 0;
  }

  /**
   * 加载工作流模板
   */
  loadTemplate(templateName) {
    const templatePath = path.join(CONFIG.templatesDir, `${templateName}.json`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`模板不存在: ${templateName}`);
    }
    
    return JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
  }

  /**
   * 执行工作流
   */
  async run(templateName, variables = {}) {
    log.info(`开始执行工作流: ${templateName}`);
    
    const template = this.loadTemplate(templateName);
    this.variables = { ...template.variables, ...variables };
    this.totalSteps = template.steps.length;
    this.currentStep = 0;

    // 验证必填变量
    this._validateVariables(template.variables);

    // 发送开始通知
    if (template.notifications?.on_start) {
      await this._notify(`工作流开始: ${template.name}`);
    }

    const results = [];
    const startTime = Date.now();

    try {
      for (const step of template.steps) {
        this.currentStep++;
        log.step(this.currentStep, this.totalSteps, step.name);

        // 执行步骤
        const result = await this._executeStep(step, template.retry);
        results.push({
          step: step.id,
          success: !result.error,
          result
        });

        // 保存输出到上下文
        if (step.output && !result.error) {
          this.context[step.output] = result;
        }

        // 检查是否失败
        if (result.error) {
          log.error(`步骤失败: ${step.name} - ${result.error}`);
          
          if (template.notifications?.on_error) {
            await this._notify(`工作流出错: ${step.name} - ${result.error}`);
          }
          
          throw new Error(`步骤失败: ${step.id}`);
        }

        log.success(`步骤完成: ${step.name}`);

        // 进度通知
        if (template.notifications?.progress_interval) {
          const elapsed = Date.now() - startTime;
          if (elapsed >= template.notifications.progress_interval) {
            await this._notify(`进度: ${this.currentStep}/${this.totalSteps} 完成`);
          }
        }
      }

      const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      log.success(`工作流完成! 总耗时: ${totalTime} 分钟`);

      if (template.notifications?.on_complete) {
        await this._notify(`工作流完成: ${template.name} (${totalTime}分钟)`);
      }

      return {
        success: true,
        template: templateName,
        steps: results,
        totalTime,
        context: this.context
      };

    } catch (e) {
      return {
        success: false,
        template: templateName,
        completedSteps: this.currentStep - 1,
        totalSteps: this.totalSteps,
        error: e.message,
        results
      };
    }
  }

  /**
   * 执行单个步骤
   */
  async _executeStep(step, retryConfig) {
    const maxAttempts = retryConfig?.max_attempts || 1;
    const delay = retryConfig?.delay || 1000;
    const backoff = retryConfig?.backoff || 'fixed';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // 解析参数
        const params = this._resolveParams(step.params);

        // 执行操作
        switch (step.action) {
          case 'script':
            return await this._executeScript(step, params);
          
          case 'batch':
            return await this._executeBatch(step, params);
          
          default:
            return await this._callPool(step.action, params);
        }

      } catch (e) {
        if (attempt === maxAttempts) {
          return { error: e.message };
        }
        
        const waitTime = backoff === 'exponential' ? delay * Math.pow(2, attempt - 1) : delay;
        log.info(`重试 ${attempt}/${maxAttempts}，等待 ${waitTime}ms...`);
        await this._sleep(waitTime);
      }
    }
  }

  /**
   * 执行脚本步骤
   */
  async _executeScript(step, params) {
    // 这里可以调用外部脚本或内置处理逻辑
    log.info(`执行脚本: ${step.id}`);
    
    // 返回模拟数据（实际应该调用真实脚本）
    return {
      success: true,
      message: '脚本执行完成',
      data: params
    };
  }

  /**
   * 执行批量操作
   */
  async _executeBatch(step, params) {
    const operation = params.operation;
    const data = this._resolveValue(params.data || params.panels);
    const concurrent = step.concurrent || 1;

    log.info(`批量执行: ${operation}, 数量: ${Array.isArray(data) ? data.length : 'unknown'}, 并行: ${concurrent}`);

    // 如果是面板ID列表，逐个执行
    if (Array.isArray(data)) {
      const groups = this._chunk(data, concurrent);
      const results = [];

      for (const group of groups) {
        const promises = group.map(async (item) => {
          const itemParams = typeof item === 'string' 
            ? { panel: item } 
            : item;
          
          return await this._callPool(operation, itemParams);
        });

        const groupResults = await Promise.all(promises);
        results.push(...groupResults);
      }

      return {
        success: true,
        total: data.length,
        results
      };
    }

    // 如果是提示词映射
    if (typeof data === 'object' && !Array.isArray(data)) {
      const entries = Object.entries(data);
      const results = [];

      for (const [panel, prompt] of entries) {
        const result = await this._callPool(operation, { panel, prompt });
        results.push({ panel, success: !result.error, result });
      }

      return {
        success: true,
        total: entries.length,
        results
      };
    }

    return await this._callPool(operation, data);
  }

  /**
   * 调用连接池
   */
  async _callPool(action, params) {
    const url = new URL(`http://127.0.0.1:${CONFIG.poolPort}/exec`);
    url.searchParams.set('action', action);
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url);
    return response.json();
  }

  /**
   * 解析参数中的变量
   */
  _resolveParams(params) {
    if (!params) return {};
    
    const resolved = {};
    
    for (const [key, value] of Object.entries(params)) {
      resolved[key] = this._resolveValue(value);
    }
    
    return resolved;
  }

  /**
   * 解析单个值中的变量
   */
  _resolveValue(value) {
    if (typeof value !== 'string') return value;
    
    // 匹配 ${variable_name} 格式
    const match = value.match(/^\$\{(.+)\}$/);
    if (match) {
      const varName = match[1];
      
      // 从上下文获取
      if (this.context[varName]) {
        return this.context[varName];
      }
      
      // 从变量定义获取
      if (this.variables[varName]) {
        return this.variables[varName].default || this.variables[varName];
      }
      
      return value; // 未找到变量，返回原值
    }
    
    return value;
  }

  /**
   * 验证必填变量
   */
  _validateVariables(variables) {
    for (const [name, config] of Object.entries(variables)) {
      if (config.required && !this.variables[name]) {
        throw new Error(`缺少必填变量: ${name}`);
      }
    }
  }

  /**
   * 发送通知
   */
  async _notify(message) {
    log.info(`[通知] ${message}`);
    // 实际应该调用通知模块
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

// ======================== 主入口 ========================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    // 列出可用模板
    const templates = fs.readdirSync(CONFIG.templatesDir)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));

    console.error(
      'ZZDH 工作流引擎 v1.0.0\n' +
      '\n' +
      '可用模板:\n' +
      templates.map(t => `  - ${t}`).join('\n') +
      '\n\n' +
      '使用方式:\n' +
      '  node zzdh-workflow.js run <模板名> --变量名 值\n' +
      '  node zzdh-workflow.js list\n' +
      '\n' +
      '示例:\n' +
      '  node zzdh-workflow.js run novel-to-drama --novel_path novel.txt --episodes 3\n' +
      '\n' +
      '注意: 需要先启动连接池: node zzdh-pool.js start'
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

  const engine = new WorkflowEngine();

  if (command === 'run') {
    const templateName = args[1];
    
    if (!templateName || templateName.startsWith('--')) {
      console.log(JSON.stringify({ error: '请指定模板名' }));
      process.exit(1);
    }

    // 检查连接池
    try {
      const statusResponse = await fetch(`http://127.0.0.1:${CONFIG.poolPort}/status`);
      const status = await statusResponse.json();
      
      if (!status.connected) {
        console.log(JSON.stringify({ error: 'ZZDH 未连接' }));
        process.exit(1);
      }
    } catch (e) {
      console.log(JSON.stringify({ error: '连接池服务未启动，请先运行: node zzdh-pool.js start' }));
      process.exit(1);
    }

    const result = await engine.run(templateName, params);
    console.log(JSON.stringify(result, null, 2));
  }
  
  else if (command === 'list') {
    const templates = fs.readdirSync(CONFIG.templatesDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const content = JSON.parse(fs.readFileSync(path.join(CONFIG.templatesDir, f), 'utf-8'));
        return {
          name: f.replace('.json', ''),
          description: content.description,
          steps: content.steps.length
        };
      });

    console.log(JSON.stringify(templates, null, 2));
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
