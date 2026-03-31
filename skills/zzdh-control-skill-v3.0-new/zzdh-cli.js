/**
 * ZZDH Control CLI v2.0.0
 * 通过 WebSocket 控制 ZZDH（随心生成器）软件
 * 与 MCP Server v3.2.0 完全同步
 *
 * 一次性执行模式：连接 → 执行 → 断开
 * JSON stdout / 日志 stderr
 */

const WebSocket = globalThis.WebSocket;
function wsOn(ws, event, fn) {
  ws.addEventListener(event, fn);
}
function onceOpen(ws) {
  return new Promise((resolve) => ws.addEventListener('open', resolve));
}
function onceError(ws) {
  return new Promise((resolve) => ws.addEventListener('error', (e) => resolve(e)));
}
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================== 配置 ========================

const CONFIG = {
  defaultPorts: [8765, 8766, 8767, 8768, 8769],
  portFile: path.join(__dirname, '.ws_port'),
  frontendUrl: process.env.ZZDH_FRONTEND_URL || 'http://localhost:5173',
  portTestTimeout: 1500,
  requestTimeout: 30000,
  connectionTimeout: 8000,
  portFilePatterns: [
    'zzdh-ws-port.txt',
    'typetale_ws_port_*.txt',
    '*-ws-port.txt',
    '*_ws_port_*.txt',
  ],
};

const log = {
  debug: (...a) => process.env.ZZDH_DEBUG === '1' && console.error('[DEBUG]', ...a),
  info: (...a) => console.error('[INFO]', ...a),
  error: (...a) => console.error('[ERROR]', ...a),
};

// ======================== 参数解析 ========================

function parseArgs(argv) {
  const args = {};
  let key = null;
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--')) { key = arg.slice(2); args[key] = true; }
    else if (key) { args[key] = arg; key = null; }
    else if (!args._action) { args._action = arg; }
  }
  return args;
}

// ======================== WebSocket 客户端 ========================

class SimpleWSClient {
  constructor() {
    this.ws = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this._port = null;
  }

  get connected() { return this.ws && this.ws.readyState === WebSocket.OPEN; }

  /** 扫描临时目录发现端口文件 */
  _scanPortFiles() {
    const tempDir = process.env.TEMP || process.env.TMP || '/tmp';
    const results = [];
    try {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        const isPortFile = CONFIG.portFilePatterns.some(pattern => {
          const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
          return regex.test(file);
        });
        if (isPortFile) {
          const filePath = path.join(tempDir, file);
          try {
            const content = fs.readFileSync(filePath, 'utf-8').trim();
            const port = parseInt(content, 10);
            if (port > 0 && port < 65536) {
              const stat = fs.statSync(filePath);
              results.push({ path: filePath, port, mtime: stat.mtime });
              log.debug('发现端口文件:', filePath, '-> 端口:', port);
            }
          } catch (e) { /* ignore */ }
        }
      }
    } catch (e) {
      log.debug('扫描临时目录失败:', e.message);
    }
    results.sort((a, b) => b.mtime - a.mtime);
    return results;
  }

  /** 自动发现后端端口 */
  async discoverPort() {
    // 1. 扫描临时目录端口文件
    const portFiles = this._scanPortFiles();
    if (portFiles.length > 0) {
      log.debug('发现', portFiles.length, '个端口文件');
      for (const pf of portFiles) {
        if (await this._testPort(pf.port)) {
          log.info('从端口文件发现端口:', pf.port, '(' + path.basename(pf.path) + ')');
          return pf.port;
        }
      }
    }

    // 2. 回退到 CLI 目录端口文件
    try {
      if (fs.existsSync(CONFIG.portFile)) {
        const port = parseInt(fs.readFileSync(CONFIG.portFile, 'utf-8').trim(), 10);
        log.debug('CLI端口文件:', CONFIG.portFile, '-> 端口:', port);
        if (port && await this._testPort(port)) return port;
      }
    } catch (e) { /* ignore */ }

    // 3. HTTP 接口
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 3000);
      const r = await fetch(CONFIG.frontendUrl + '/__dev_ws_ports__', { signal: c.signal });
      clearTimeout(t);
      const d = await r.json();
      log.debug('HTTP 接口返回端口:', d.ports);
      if (d.ports && d.ports.length) {
        const validPorts = [];
        for (const p of d.ports) {
          if (await this._testPort(p)) validPorts.push(p);
        }
        if (validPorts.length > 0) {
          const selectedPort = validPorts[validPorts.length - 1];
          log.info('从 HTTP 接口发现端口:', selectedPort, '(' + validPorts.length + '个可用)');
          return selectedPort;
        }
      }
    } catch (e) { log.debug('HTTP 接口失败:', e.message); }

    // 4. 默认端口
    for (const p of CONFIG.defaultPorts) {
      if (await this._testPort(p)) return p;
    }
    return null;
  }

  _testPort(port) {
    return new Promise(resolve => {
      const ws = new WebSocket('ws://127.0.0.1:' + port);
      const t = setTimeout(() => { try { ws.close() } catch(e) {}; resolve(false); }, CONFIG.portTestTimeout);
      ws.addEventListener('open', () => { clearTimeout(t); ws.close(); resolve(true); });
      ws.addEventListener('error', () => { clearTimeout(t); resolve(false); });
    });
  }

  /** 连接到后端 */
  async connect(port) {
    const tp = port || await this.discoverPort();
    if (!tp) throw new Error('无法发现 WebSocket 端口，请确保 ZZDH 软件正在运行');
    this._port = tp;
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('ws://127.0.0.1:' + tp);
      const t = setTimeout(() => { try { this.ws.close() } catch(e) {}; reject(new Error('连接超时')); }, CONFIG.connectionTimeout);
      this.ws.addEventListener('open', () => {
        clearTimeout(t);
        this.ws.addEventListener('message', (e) => this._handleMessage(e.data));
        resolve();
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
          if (msg.type === 'error') { p.resolve({ error: msg.data && msg.data.message || msg.error }); }
          else { p.resolve(msg.data || {}); }
          return;
        }
      }
      // 按 expectType 匹配
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

  /** 发送 WebSocket 请求 */
  sendRequest(type, data, opts) {
    if (!opts) opts = {};
    const timeout = opts.timeout || CONFIG.requestTimeout;
    const expectType = opts.expectType || null;
    return new Promise((resolve, reject) => {
      if (!this.connected) return reject(new Error('WebSocket 未连接'));
      const rid = 'cli_' + (++this.requestId) + '_' + Date.now();
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
    for (const k of this.pendingRequests.keys()) {
      const p = this.pendingRequests.get(k);
      clearTimeout(p.timer);
      p.reject(new Error('已断开'));
    }
    this.pendingRequests.clear();
    if (this.ws) { this.ws.close(); this.ws = null; }
  }
}

// ======================== 消息类型映射（与 MCP Server _map_msg_type 完全同步）========================

function mapMsgType(msgType, args) {
  // get_project_options -> get_create_project_options
  if (msgType === 'get_project_options') {
    return { msgType: 'get_create_project_options', args };
  }

  // create_project -> create_project_{type}
  // 后端 create_project_service.py 期望 project_name（非 name），content 字段按类型不同
  if (msgType === 'create_project') {
    const projectType = args.type || 'paperwork';
    const typeMap = {
      paperwork: 'create_project_paper',
      script: 'create_project_script',
      recreation: 'create_project_recreation',
      videoClone: 'create_project_video_clone',
    };
    const newType = typeMap[projectType] || 'create_project_paper';
    const newArgs = { project_name: args.name || '' };

    // 按类型映射 content 字段名（与 MCP Server _map_msg_type 一致）
    if (projectType === 'paperwork') {
      newArgs.paperwork = args.content || '';
    } else if (projectType === 'script') {
      newArgs.input_text = args.content || '';
    } else if (projectType === 'recreation') {
      newArgs.split_text = args.content || '';
    }
    // videoClone 不需要 content

    // 可选参数
    if (args.video_path) newArgs.video_path = args.video_path;
    if (args.srt_path) newArgs.srt_path = args.srt_path;
    if (args.template_id) newArgs.template_id = args.template_id;
    if (args['min-shot-duration']) newArgs.min_shot_duration = parseInt(args['min-shot-duration'], 10);
    if (args['start-trim-duration']) newArgs.start_trim_duration = parseInt(args['start-trim-duration'], 10);
    if (args['end-trim-duration']) newArgs.end_trim_duration = parseInt(args['end-trim-duration'], 10);

    return { msgType: newType, args: newArgs };
  }

  return { msgType, args };
}

// ======================== 流式更新提示词（与 MCP Server _handle_stream_update_prompt 完全同步）========================

async function streamUpdatePrompt(client, uniqueName, prompt, mode, chunkSize, delayMs) {
  mode = mode || 'typewriter';
  chunkSize = parseInt(chunkSize || '18', 10);
  delayMs = parseInt(delayMs || '17', 10);
  const delayS = delayMs / 1000.0;

  if (mode === 'typewriter') {
    // 逐字发送
    for (let i = 1; i <= prompt.length; i++) {
      await client.sendRequest('update_prompt', { unique_name: uniqueName, prompt: prompt.substring(0, i) }, { timeout: 10000 });
      if (delayS > 0 && i < prompt.length) await new Promise(r => setTimeout(r, delayS));
    }
  } else {
    // chunk / smart 模式：按块发送
    for (let i = 0; i < prompt.length; i += chunkSize) {
      await client.sendRequest('update_prompt', { unique_name: uniqueName, prompt: prompt.substring(0, i + chunkSize) }, { timeout: 10000 });
      if (delayS > 0 && i + chunkSize < prompt.length) await new Promise(r => setTimeout(r, delayS));
    }
  }

  // 确保最终发送完整文本
  const lastResult = await client.sendRequest('update_prompt', { unique_name: uniqueName, prompt }, { timeout: 10000 });
  return { success: true, unique_name: uniqueName, processed_prompt: (lastResult && lastResult.processed_prompt) || prompt };
}

// ======================== 连接 + 自动加载项目 ========================

async function doConnect(client, args) {
  const port = args.port ? parseInt(args.port, 10) : null;
  await client.connect(port);
  let projectLoaded = false;
  let currentProject = null;
  try {
    const list = await client.sendRequest('get_project_list', { sort_key: 'access_time' }, { timeout: 10000 });
    const projects = list.projects || [];
    if (projects.length > 0) {
      const sorted = projects.slice().sort(function(a, b) { return (b.access_time || 0) - (a.access_time || 0); });
      const target = sorted[0];
      const openResult = await client.sendRequest('open_project', { project_path: target.full_path });
      if (openResult.success !== false) {
        await client.sendRequest('frontend_ready', { project_path: target.full_path }, { expectType: 'project_data_init', timeout: 30000 });
        currentProject = target.full_path;
        projectLoaded = true;
      }
    }
  } catch (e) { /* auto-load failure is non-fatal */ }
  return { success: true, port: client._port, projectLoaded, currentProject };
}

/** 确保项目已加载（业务操作前调用） */
async function ensureProjectLoaded(client) {
  try {
    const list = await client.sendRequest('get_project_list', { sort_key: 'access_time' }, { timeout: 10000 });
    const projects = list.projects || [];
    if (projects.length > 0) {
      // 按 access_time 降序排列，选最近访问的项目（而非优先选有内容的老项目）
      const sorted = projects.slice().sort(function(a, b) { return (b.access_time || 0) - (a.access_time || 0); });
      const target = sorted[0];
      await client.sendRequest('open_project', { full_path: target.full_path, name: '', project_type: 0 });
      const data = await client.sendRequest('frontend_ready', { project_path: target.full_path }, { expectType: 'project_data_init', timeout: 30000 });
      return data;
    }
  } catch (e) { /* non-fatal */ }
  return null;
}

// ======================== 工具使用辅助：要求必填参数 ========================

function require(args, ...keys) {
  for (const k of keys) {
    if (!args[k]) throw new Error('缺少参数 --' + k.replace(/_/g, '-'));
  }
}

// ======================== 主入口 ========================

async function main() {
  const args = parseArgs(process.argv);
  const action = args._action;

  if (!action || action === 'help' || action === '--help') {
    console.error(
      'ZZDH Control CLI v2.0.0 (MCP Server v3.2.0)\n' +
      'Usage: node zzdh-cli.js <action> [--options]\n\n' +
      'Actions:\n' +
      '  discover            发现后端端口\n' +
      '  connect             连接并自动加载第一个项目\n' +
      '  status              连接状态\n' +
      '  disconnect          断开连接\n\n' +
      '  project-list        获取项目列表\n' +
      '  project-options     获取创建选项\n' +
      '  create-project      创建项目\n' +
      '  open-project        打开项目\n' +
      '  switch-project      切换项目\n\n' +
      '  panels              获取分镜列表\n' +
      '  edit-view           获取编辑视图数据\n' +
      '  update-prompt       更新提示词\n' +
      '  stream-update-prompt  流式更新提示词\n' +
      '  add-panel           添加分镜\n' +
      '  delete-panel        删除分镜\n' +
      '  move-panel          移动分镜\n' +
      '  split-panel         拆分分镜\n' +
      '  merge-panel         合并分镜\n\n' +
      '  generate-image      生成图片\n' +
      '  generate-video      生成视频\n' +
      '  task-status         任务队列状态\n' +
      '  go-home             返回主页\n' +
      '  open-create-dialog  打开创建对话框\n\n' +
      'Run with ZZDH_DEBUG=1 for debug logs.'
    );
    process.exit(0);
  }

  const client = new SimpleWSClient();

  // ---- 无需连接的操作 ----
  if (action === 'discover') {
    const p = await client.discoverPort();
    console.log(JSON.stringify({ discovered: !!p, port: p }, null, 2));
    process.exit(0);
  }

  if (action === 'connect') {
    try { console.log(JSON.stringify(await doConnect(client, args), null, 2)); }
    catch (e) { console.log(JSON.stringify({ error: e.message }, null, 2)); process.exit(1); }
    client.disconnect();
    process.exit(0);
  }

  // ---- 需要连接的操作 ----
  try {
    const port = args.port ? parseInt(args.port, 10) : null;
    await client.connect(port);

    let result;
    let initData = null;

    // 业务操作前自动加载项目
    const NO_INIT_ACTIONS = ['status', 'disconnect', 'help', '--help', 'go-home', 'open-create-dialog', 'create-project', 'task-status', 'open-task-queue'];
    if (!NO_INIT_ACTIONS.includes(action)) {
      initData = await ensureProjectLoaded(client);
    }

    switch (action) {

      // ============ 连接管理 ============
      case 'disconnect':
        client.disconnect();
        result = { success: true };
        break;

      case 'status':
        result = { connected: true, port: client._port };
        break;

      // ============ 页面导航（新增 v2.0） ============
      case 'go-home':
        result = await client.sendRequest('go_home', {});
        break;

      case 'open-create-dialog':
        result = await client.sendRequest('open_create_dialog', {});
        break;

      // ============ 项目管理 ============
      case 'project-list':
        result = await client.sendRequest('get_project_list', {});
        break;

      case 'project-options': {
        // 映射: get_project_options -> get_create_project_options
        result = await client.sendRequest('get_create_project_options', {});
        break;
      }

      case 'create-project': {
        require(args, 'name', 'type');
        // 映射: create_project -> create_project_{type}
        const mapped = mapMsgType('create_project', args);
        result = await client.sendRequest(mapped.msgType, mapped.args, { timeout: 600000 });
        // 创建成功后，立即打开新项目（确保后续操作在新项目上执行）
        if (result && result.project_path && result.success !== false) {
          try {
            await client.sendRequest('open_project', { full_path: result.project_path, name: '', project_type: 0 });
            initData = await client.sendRequest('frontend_ready', { project_path: result.project_path }, { expectType: 'project_data_init', timeout: 30000 });
          } catch (e) { log.error('创建后打开项目失败:', e.message); }
        }
        break;
      }

      case 'open-project': {
        require(args, 'path');
        const o = await client.sendRequest('open_project', { full_path: args.path, name: '', project_type: 0 });
        if (o.success === false) {
          result = o;
        } else {
          const dd = await client.sendRequest('frontend_ready', { project_path: args.path }, { expectType: 'project_data_init', timeout: 30000 });
          result = { success: true, project_path: args.path, panels: dd.panels || [] };
        }
        break;
      }

      case 'switch-project': {
        require(args, 'path');
        result = await client.sendRequest('switch_active_project', { project_path: args.path });
        break;
      }

      // ============ 分镜操作 ============
      case 'panels':
        result = initData ? (initData.panels || []) : [];
        break;

      case 'edit-view':
        result = await client.sendRequest('get_edit_view_data', { unique_name: args.panel || null });
        break;

      case 'update-prompt': {
        require(args, 'panel', 'prompt');
        // Default: typewriter streaming at ~60 chars/sec
        result = await streamUpdatePrompt(
          client,
          args.panel,
          args.prompt,
          args.mode || 'typewriter',
          args['chunk-size'] || '18',
          args.delay || '17'
        );
        break;
      }

      case 'update-inherit-prompt':
        require(args, 'panel', 'prompt');
        result = await client.sendRequest('update_inherit_prompt', { unique_name: args.panel, inherit_prompt: args.prompt });
        break;

      case 'update-video-prompt':
        require(args, 'panel', 'prompt');
        result = await client.sendRequest('update_video_prompt', { unique_name: args.panel, video_prompt: args.prompt });
        break;

      case 'update-paperwork': {
        require(args, 'panel', 'text');
        // Stream paperwork: typewriter at ~60 chars/sec
        const paperText = args.text;
        const paperDelay = 17;
        for (let i = 1; i <= paperText.length; i++) {
          await client.sendRequest('update_paperwork', { unique_name: args.panel, paperwork: paperText.substring(0, i) });
          if (i < paperText.length) await new Promise(r => setTimeout(r, paperDelay));
        }
        result = { success: true, unique_name: args.panel, text_length: paperText.length };
        break;
      }

      case 'update-negative-prompt':
        require(args, 'panel', 'prompt');
        result = await client.sendRequest('update_negative_prompt', { unique_name: args.panel, negative_prompt: args.prompt });
        break;

      case 'stream-update-prompt': {
        require(args, 'panel', 'prompt');
        result = await streamUpdatePrompt(
          client,
          args.panel,
          args.prompt,
          args.mode,       // chunk | typewriter | smart（新增 v2.0）
          args['chunk-size'],
          args.delay
        );
        break;
      }

      case 'add-panel': {
        const apd = await client.sendRequest('add_panel', { after_unique_name: args.after || null }, { expectType: 'main_view_panels', timeout: 10000 });
        const aps = apd.panels || [];
        result = { success: true, panel: aps[aps.length - 1], totalPanels: aps.length };
        break;
      }

      case 'delete-panel':
        require(args, 'panel');
        result = await client.sendRequest('delete_panel', { unique_name: args.panel });
        break;

      case 'move-panel':
        require(args, 'panel', 'index');
        result = await client.sendRequest('move_panel', { unique_name: args.panel, target_index: parseInt(args.index, 10) });
        break;

      case 'split-panel':
        require(args, 'panel', 'dir');
        result = await client.sendRequest('split_panel_' + args.dir, { unique_name: args.panel });
        break;

      case 'merge-panel':
        require(args, 'panel', 'dir');
        result = await client.sendRequest('merge_panel_' + args.dir, { unique_name: args.panel });
        break;

      // ============ 图片选择 ============
      case 'select-image':
        require(args, 'panel', 'index');
        result = await client.sendRequest('select_image', { unique_name: args.panel, index: parseInt(args.index, 10) });
        break;

      case 'toggle-image-select': {
        // 新增 v2.0
        require(args, 'panel', 'index');
        result = await client.sendRequest('toggle_image_select', { unique_name: args.panel, index: parseInt(args.index, 10) });
        break;
      }

      case 'drag-image':
        require(args, 'panel', 'from', 'to');
        result = await client.sendRequest('drag_image', { unique_name: args.panel, from_index: parseInt(args.from, 10), to_index: parseInt(args.to, 10) });
        break;

      case 'delete-image':
        require(args, 'panel', 'index');
        result = await client.sendRequest('delete_image', { unique_name: args.panel, index: parseInt(args.index, 10) });
        break;

      // ============ 图片生成 ============
      case 'generate-image':
        require(args, 'panel');
        result = await client.sendRequest('generate_image', { unique_name: args.panel, batch_num: parseInt(args.batch || '4', 10) }, { timeout: 300000 });
        break;

      case 'cancel-generate':
        require(args, 'panel');
        result = await client.sendRequest('cancel_generate', { unique_name: args.panel });
        break;

      case 'batch-generate':
        require(args, 'panels');
        result = await client.sendRequest('batch_generate', { unique_names: args.panels.split(','), mode: args.mode || 'image' }, { timeout: 600000 });
        break;

      // ============ 图片导入 ============
      case 'import-image': {
        // 新增 v2.0：Base64 导入
        require(args, 'panel', 'data');
        result = await client.sendRequest('import_image', { unique_name: args.panel, image_data: args.data });
        break;
      }

      case 'import-image-from-path':
        require(args, 'panel', 'imagepath');
        result = await client.sendRequest('import_image_from_path', { unique_name: args.panel, image_path: args.imagepath });
        break;

      // ============ 图片导出/复制/粘贴（新增 v2.0） ============
      case 'export-image': {
        require(args, 'panel');
        const exportArgs = { unique_name: args.panel };
        if (args.index) exportArgs.image_index = parseInt(args.index, 10);
        result = await client.sendRequest('export_image', exportArgs);
        break;
      }

      case 'copy-image': {
        require(args, 'panel');
        const copyArgs = { unique_name: args.panel };
        if (args.index) copyArgs.image_index = parseInt(args.index, 10);
        result = await client.sendRequest('copy_image', copyArgs);
        break;
      }

      case 'paste-image': {
        require(args, 'panel');
        result = await client.sendRequest('paste_image', { unique_name: args.panel });
        break;
      }

      // ============ 首尾帧 ============
      case 'set-first-frame': {
        require(args, 'panel');
        const ffArgs = { unique_name: args.panel };
        if (args.imgpath) ffArgs.image_path = args.imgpath;
        if (args.imgindex) ffArgs.image_index = parseInt(args.imgindex, 10);
        result = await client.sendRequest('set_first_frame', ffArgs);
        break;
      }

      case 'set-end-frame': {
        require(args, 'panel');
        const efArgs = { unique_name: args.panel };
        if (args.imgpath) efArgs.image_path = args.imgpath;
        if (args.imgindex) efArgs.image_index = parseInt(args.imgindex, 10);
        result = await client.sendRequest('set_end_frame', efArgs);
        break;
      }

      case 'edit-select-first-frame':
        require(args, 'panel', 'index');
        result = await client.sendRequest('edit_select_first_frame', { unique_name: args.panel, image_index: parseInt(args.index, 10) });
        break;

      case 'edit-select-end-frame':
        require(args, 'panel', 'index');
        result = await client.sendRequest('edit_select_end_frame', { unique_name: args.panel, image_index: parseInt(args.index, 10) });
        break;

      case 'edit-update-first-frame':
        require(args, 'panel', 'index');
        result = await client.sendRequest('edit_update_first_frame', { unique_name: args.panel, image_index: parseInt(args.index, 10) });
        break;

      case 'edit-update-end-frame':
        require(args, 'panel', 'index');
        result = await client.sendRequest('edit_update_end_frame', { unique_name: args.panel, image_index: parseInt(args.index, 10) });
        break;

      case 'edit-paste-first-frame':
        require(args, 'panel');
        result = await client.sendRequest('edit_paste_first_frame', { unique_name: args.panel });
        break;

      case 'edit-paste-end-frame':
        require(args, 'panel');
        result = await client.sendRequest('edit_paste_end_frame', { unique_name: args.panel });
        break;

      case 'merge-keyframes-first':
        require(args, 'panel');
        result = await client.sendRequest('merge_keyframes_to_first_frame', { unique_name: args.panel });
        break;

      case 'merge-keyframes-end':
        require(args, 'panel');
        result = await client.sendRequest('merge_keyframes_to_end_frame', { unique_name: args.panel });
        break;

      // ============ 模式切换 ============
      case 'switch-media-mode':
        require(args, 'mode');
        result = await client.sendRequest('switch_media_mode', { mode: args.mode, is_video: args.mode === 'video' });
        break;

      case 'switch-prompt-mode':
        require(args, 'panel');
        result = await client.sendRequest('switch_prompt_mode', { unique_name: args.panel, is_video: args.enabled !== 'false' });
        break;

      // ============ 视频操作 ============
      case 'generate-video':
        require(args, 'panel');
        result = await client.sendRequest('generate_video', { unique_name: args.panel }, { timeout: 600000 });
        break;

      case 'set-duration':
        require(args, 'panel', 'seconds');
        result = await client.sendRequest('set_scene_duration', { unique_name: args.panel, duration: parseInt(args.seconds, 10) });
        break;

      case 'toggle-lip-sync':
        require(args, 'panel');
        result = await client.sendRequest('toggle_lip_sync', { unique_name: args.panel, enabled: args.enabled !== 'false' });
        break;

      // ============ 角色/场景/物品 ============
      case 'get-entities':
        require(args, 'type');
        result = await client.sendRequest('get_entity_list', { entity_type: args.type });
        break;

      case 'toggle-character':
        require(args, 'panel', 'id');
        result = await client.sendRequest('toggle_character', { unique_name: args.panel, character_id: args.id });
        break;

      case 'toggle-scene':
        require(args, 'panel', 'id');
        result = await client.sendRequest('toggle_scene', { unique_name: args.panel, scene_id: args.id });
        break;

      case 'toggle-item':
        require(args, 'panel', 'id');
        result = await client.sendRequest('toggle_item', { unique_name: args.panel, item_id: args.id });
        break;

      case 'auto-match-character':
        require(args, 'panel');
        result = await client.sendRequest('auto_match_character', { unique_name: args.panel });
        break;

      // ============ 任务管理 ============
      case 'task-status':
        result = await client.sendRequest('get_task_status', {});
        break;

      case 'open-task-queue': {
        // 新增 v2.0
        result = await client.sendRequest('open_task_queue', {});
        break;
      }

      case 'cancel-task':
        require(args, 'task-id');
        result = await client.sendRequest('cancel_task', { task_id: args['task-id'] });
        break;

      case 'pause-task':
        require(args, 'task-id');
        result = await client.sendRequest('pause_task', { task_id: args['task-id'] });
        break;

      case 'resume-task':
        require(args, 'task-id');
        result = await client.sendRequest('resume_task', { task_id: args['task-id'] });
        break;

      case 'reorder-tasks':
        require(args, 'category', 'ids');
        result = await client.sendRequest('reorder_tasks', { category: args.category, ordered_ids: args.ids.split(',') });
        break;

      default:
        throw new Error('未知操作: ' + action + '。运行 node zzdh-cli.js help 查看帮助');
    }

    console.log(JSON.stringify(result, null, 2));
    client.disconnect();

  } catch (e) {
    console.log(JSON.stringify({ error: e.message, action }, null, 2));
    client.disconnect();
    process.exit(1);
  }
}

main().catch(function(e) {
  console.log(JSON.stringify({ error: e.message }, null, 2));
  process.exit(1);
});
