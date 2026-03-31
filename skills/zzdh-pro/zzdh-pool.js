/**
 * ZZDH 连接池管理器 v1.0.0
 * 
 * 解决问题：
 * - 原CLI每次调用都重新连接，开销大
 * - 连接池维持长连接，复用WebSocket
 * 
 * 使用方式：
 * - 守护进程模式：node zzdh-pool.js start
 * - 执行命令：node zzdh-pool.js exec --action xxx
 * - 停止守护进程：node zzdh-pool.js stop
 */

const WebSocket = globalThis.WebSocket;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  defaultPorts: [8765, 8766, 8767, 8768, 8769],
  poolPort: 18790, // 连接池服务端口
  connectionTimeout: 8000,
  requestTimeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
};

const log = {
  debug: (...a) => process.env.ZZDH_DEBUG === '1' && console.error('[DEBUG]', ...a),
  info: (...a) => console.error('[INFO]', ...a),
  error: (...a) => console.error('[ERROR]', ...a),
};

// ======================== WebSocket 客户端 ========================

class WSClient {
  constructor() {
    this.ws = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this._port = null;
    this._connected = false;
    this._reconnectTimer = null;
  }

  async discoverPort() {
    // 扫描临时目录端口文件
    const tempDir = process.env.TEMP || process.env.TMP || '/tmp';
    const patterns = ['zzdh-ws-port.txt', 'typetale_ws_port_*.txt'];
    
    try {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        for (const pattern of patterns) {
          const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
          if (regex.test(file)) {
            const content = fs.readFileSync(path.join(tempDir, file), 'utf-8').trim();
            const port = parseInt(content, 10);
            if (port > 0 && port < 65536) {
              if (await this._testPort(port)) return port;
            }
          }
        }
      }
    } catch (e) { /* ignore */ }

    // 默认端口扫描
    for (const p of CONFIG.defaultPorts) {
      if (await this._testPort(p)) return p;
    }
    return null;
  }

  _testPort(port) {
    return new Promise(resolve => {
      const ws = new WebSocket('ws://127.0.0.1:' + port);
      const t = setTimeout(() => { try { ws.close() } catch(e) {}; resolve(false); }, 1500);
      ws.addEventListener('open', () => { clearTimeout(t); ws.close(); resolve(true); });
      ws.addEventListener('error', () => { clearTimeout(t); resolve(false); });
    });
  }

  async connect(port) {
    const tp = port || await this.discoverPort();
    if (!tp) throw new Error('无法发现 WebSocket 端口，请确保 ZZDH 软件正在运行');
    this._port = tp;
    
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('ws://127.0.0.1:' + tp);
      const t = setTimeout(() => { 
        try { this.ws.close() } catch(e) {}; 
        reject(new Error('连接超时')); 
      }, CONFIG.connectionTimeout);
      
      this.ws.addEventListener('open', () => {
        clearTimeout(t);
        this._connected = true;
        this.ws.addEventListener('message', (e) => this._handleMessage(e.data));
        this.ws.addEventListener('close', () => this._handleClose());
        this.ws.addEventListener('error', (e) => this._handleError(e));
        resolve({ success: true, port: tp });
      });
      this.ws.addEventListener('error', (e) => { clearTimeout(t); reject(e); });
    });
  }

  _handleMessage(data) {
    try {
      const msg = JSON.parse(typeof data === 'string' ? data : String(data));
      if (msg.request_id && this.pendingRequests.has(msg.request_id)) {
        const p = this.pendingRequests.get(msg.request_id);
        if (!p.expectType || msg.type === p.expectType || msg.type === 'error') {
          this.pendingRequests.delete(msg.request_id);
          clearTimeout(p.timer);
          if (msg.type === 'error') { 
            p.resolve({ error: msg.data && msg.data.message || msg.error }); 
          } else { 
            p.resolve(msg.data || {}); 
          }
        }
      }
      // 按类型匹配
      for (const [id, p] of this.pendingRequests) {
        if (p.expectType === msg.type) {
          this.pendingRequests.delete(id);
          clearTimeout(p.timer);
          p.resolve(msg.data || {});
          return;
        }
      }
    } catch (e) { log.error('消息解析失败:', e.message); }
  }

  _handleClose() {
    this._connected = false;
    log.info('WebSocket 连接已关闭');
    // 通知所有pending请求
    for (const [id, p] of this.pendingRequests) {
      clearTimeout(p.timer);
      p.reject(new Error('连接已断开'));
    }
    this.pendingRequests.clear();
  }

  _handleError(e) {
    log.error('WebSocket 错误:', e);
    this._connected = false;
  }

  sendRequest(type, data, opts = {}) {
    const timeout = opts.timeout || CONFIG.requestTimeout;
    const expectType = opts.expectType || null;
    
    return new Promise((resolve, reject) => {
      if (!this._connected || !this.ws) {
        return reject(new Error('WebSocket 未连接'));
      }
      
      const rid = 'pool_' + (++this.requestId) + '_' + Date.now();
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(rid)) {
          this.pendingRequests.delete(rid);
          reject(new Error('请求超时: ' + type));
        }
      }, timeout);
      
      this.pendingRequests.set(rid, { resolve, reject, timer, expectType });
      this.ws.send(JSON.stringify({ type, data, request_id: rid }));
    });
  }

  disconnect() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    for (const k of this.pendingRequests.keys()) {
      const p = this.pendingRequests.get(k);
      clearTimeout(p.timer);
      p.reject(new Error('已断开'));
    }
    this.pendingRequests.clear();
    if (this.ws) { 
      this.ws.close(); 
      this.ws = null; 
    }
    this._connected = false;
  }

  get connected() { return this._connected; }
  get port() { return this._port; }
}

// ======================== 连接池服务 ========================

class ConnectionPool {
  constructor() {
    this.client = new WSClient();
    this.server = null;
    this.projectData = null;
  }

  async start() {
    // 连接ZZDH
    log.info('正在连接 ZZDH...');
    await this.client.connect();
    log.info('已连接到 ZZDH，端口:', this.client.port);

    // 自动加载项目
    await this._loadProject();

    // 启动HTTP服务
    this.server = createServer(async (req, res) => {
      await this._handleRequest(req, res);
    });

    this.server.listen(CONFIG.poolPort, () => {
      log.info('连接池服务已启动，端口:', CONFIG.poolPort);
      log.info('使用方式: curl http://127.0.0.1:' + CONFIG.poolPort + '/exec?action=panels');
    });
  }

  async _loadProject() {
    try {
      const list = await this.client.sendRequest('get_project_list', { sort_key: 'access_time' }, { timeout: 10000 });
      const projects = list.projects || [];
      if (projects.length > 0) {
        const sorted = projects.slice().sort((a, b) => (b.access_time || 0) - (a.access_time || 0));
        const target = sorted[0];
        await this.client.sendRequest('open_project', { project_path: target.full_path });
        this.projectData = await this.client.sendRequest('frontend_ready', { project_path: target.full_path }, { expectType: 'project_data_init', timeout: 30000 });
        log.info('已加载项目:', target.full_path);
      }
    } catch (e) {
      log.error('加载项目失败:', e.message);
    }
  }

  async _handleRequest(req, res) {
    const url = new URL(req.url, 'http://127.0.0.1');
    const pathname = url.pathname;

    res.setHeader('Content-Type', 'application/json');

    try {
      if (pathname === '/status') {
        res.end(JSON.stringify({
          connected: this.client.connected,
          port: this.client.port,
          projectLoaded: !!this.projectData
        }));
        return;
      }

      if (pathname === '/exec') {
        const action = url.searchParams.get('action');
        if (!action) {
          res.end(JSON.stringify({ error: '缺少 action 参数' }));
          return;
        }
        
        // 解析其他参数
        const params = {};
        for (const [key, value] of url.searchParams) {
          if (key !== 'action') params[key] = value;
        }
        
        const result = await this._executeAction(action, params);
        res.end(JSON.stringify(result, null, 2));
        return;
      }

      if (pathname === '/batch') {
        // 批量操作
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const { actions } = JSON.parse(body);
            const results = [];
            for (const { action, params } of actions) {
              results.push(await this._executeAction(action, params));
            }
            res.end(JSON.stringify({ success: true, results }, null, 2));
          } catch (e) {
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      res.end(JSON.stringify({ error: '未知路径: ' + pathname }));

    } catch (e) {
      res.end(JSON.stringify({ error: e.message }));
    }
  }

  async _executeAction(action, params) {
    // 确保连接
    if (!this.client.connected) {
      await this.client.connect();
    }

    // 消息类型映射
    const msgType = this._mapActionToMsgType(action, params);
    
    const result = await this.client.sendRequest(
      msgType.type, 
      msgType.data, 
      { timeout: msgType.timeout || CONFIG.requestTimeout, expectType: msgType.expectType }
    );

    // 更新项目数据
    if (action === 'panels') {
      this.projectData = { ...this.projectData, panels: result };
    }

    return result;
  }

  _mapActionToMsgType(action, params) {
    const actionMap = {
      'panels': { type: 'get_project_list', data: {}, expectType: 'project_data_init' },
      'project-list': { type: 'get_project_list', data: {} },
      'generate-image': { type: 'generate_image', data: { unique_name: params.panel, batch_num: parseInt(params.batch || '4') }, timeout: 300000 },
      'generate-video': { type: 'generate_video', data: { unique_name: params.panel }, timeout: 600000 },
      'update-prompt': { type: 'update_prompt', data: { unique_name: params.panel, prompt: params.prompt } },
      'add-panel': { type: 'add_panel', data: { after_unique_name: params.after || null }, expectType: 'main_view_panels' },
      'delete-panel': { type: 'delete_panel', data: { unique_name: params.panel } },
      'task-status': { type: 'get_task_status', data: {} },
    };

    return actionMap[action] || { type: action.replace(/-/g, '_'), data: params };
  }

  stop() {
    if (this.server) {
      this.server.close();
      log.info('连接池服务已停止');
    }
    this.client.disconnect();
  }
}

// ======================== 主入口 ========================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'start') {
    const pool = new ConnectionPool();
    
    // 优雅退出
    process.on('SIGINT', () => {
      log.info('正在关闭...');
      pool.stop();
      process.exit(0);
    });
    
    await pool.start();
    
    // 保持运行
    process.stdin.resume();
  }
  
  else if (command === 'exec') {
    // 单次执行模式（通过连接池服务）
    const params = {};
    for (let i = 1; i < args.length; i++) {
      if (args[i].startsWith('--')) {
        const key = args[i].slice(2);
        const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
        params[key] = value;
        if (value !== 'true') i++;
      }
    }
    
    const action = params.action;
    delete params.action;
    
    try {
      const response = await fetch(`http://127.0.0.1:${CONFIG.poolPort}/exec?action=${action}&${new URLSearchParams(params)}`);
      const result = await response.json();
      console.log(JSON.stringify(result, null, 2));
    } catch (e) {
      console.log(JSON.stringify({ error: '连接池服务未启动，请先运行: node zzdh-pool.js start' }));
      process.exit(1);
    }
  }
  
  else if (command === 'stop') {
    try {
      // 发送关闭信号
      process.exit(0);
    } catch (e) {
      console.log(JSON.stringify({ error: e.message }));
    }
  }
  
  else {
    console.error(
      'ZZDH 连接池管理器 v1.0.0\n' +
      '\n' +
      '使用方式:\n' +
      '  node zzdh-pool.js start          启动连接池守护进程\n' +
      '  node zzdh-pool.js exec --action  执行操作（通过连接池）\n' +
      '  node zzdh-pool.js stop           停止守护进程\n' +
      '\n' +
      'HTTP API:\n' +
      '  GET /status                      查看状态\n' +
      '  GET /exec?action=xxx             执行单个操作\n' +
      '  POST /batch                      批量执行操作\n'
    );
    process.exit(0);
  }
}

main().catch(e => {
  console.log(JSON.stringify({ error: e.message }));
  process.exit(1);
});
