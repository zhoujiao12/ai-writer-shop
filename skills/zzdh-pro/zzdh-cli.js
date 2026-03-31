#!/usr/bin/env node
/**
 * ZZDH CLI - 单次执行模式
 * 
 * 用法: node zzdh-cli.js <action> [--options]
 * 
 * 每次调用自动连接→执行→断开
 */

const WebSocket = globalThis.WebSocket;
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  defaultPorts: [8765, 8766, 8767, 8768, 8769],
  connectionTimeout: 8000,
  requestTimeout: 30000,
};

// 发现端口
function discoverPort() {
  // Windows临时目录
  const tempDirs = [
    '/mnt/c/Users/Administrator/AppData/Local/Temp',
    process.env.TEMP,
    process.env.TMP,
    '/tmp'
  ];
  
  for (const tempDir of tempDirs) {
    if (!tempDir) continue;
    try {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        if (file === 'zzdh-ws-port.txt' || file.startsWith('typetale_ws_port_')) {
          const content = fs.readFileSync(path.join(tempDir, file), 'utf-8').trim();
          const port = parseInt(content, 10);
          if (port > 0 && port < 65536) {
            return port;
          }
        }
      }
    } catch (e) { /* ignore */ }
  }
  return null;
}

// WebSocket客户端
class ZZDHClient {
  constructor(port) {
    this.port = port;
    this.ws = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.uploadPort = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const url = `ws://127.0.0.1:${this.port}`;
      this.ws = new WebSocket(url);
      
      const timeout = setTimeout(() => {
        reject(new Error('连接超时'));
      }, CONFIG.connectionTimeout);
      
      this.ws.addEventListener('open', () => {
        clearTimeout(timeout);
        resolve();
      });
      
      this.ws.addEventListener('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
      
      this.ws.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // 保存upload_port
          if (data.type === 'upload_port') {
            this.uploadPort = data.data?.port;
            return;
          }
          
          // 处理响应
          if (data.type && this.pendingRequests.has(data.type)) {
            const { resolve: res } = this.pendingRequests.get(data.type);
            this.pendingRequests.delete(data.type);
            res(data);
          }
        } catch (e) {
          console.error('解析消息失败:', e);
        }
      });
    });
  }

  send(type, data = {}) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(type);
        reject(new Error(`请求超时: ${type}`));
      }, CONFIG.requestTimeout);
      
      this.pendingRequests.set(type, {
        resolve: (response) => {
          clearTimeout(timeout);
          resolve(response);
        },
        reject
      });
      
      this.ws.send(JSON.stringify({ type, ...data }));
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// CLI入口
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('用法: node zzdh-cli.js <action> [--options]');
    console.log('可用操作: discover, connect, project-list, panels, create-project, open-project, update-prompt, generate-image, generate-video');
    process.exit(1);
  }
  
  const action = args[0];
  
  // 解析参数
  const options = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      options[key] = value;
      if (value !== true) i++;
    }
  }
  
  // 发现端口
  if (action === 'discover') {
    const port = discoverPort();
    if (port) {
      console.log(JSON.stringify({ success: true, port }));
    } else {
      console.log(JSON.stringify({ success: false, error: '无法发现端口' }));
    }
    return;
  }
  
  // 连接并执行
  const port = options.port || discoverPort();
  if (!port) {
    console.log(JSON.stringify({ success: false, error: '无法发现WebSocket端口，请确保ZZDH正在运行' }));
    process.exit(1);
  }
  
  const client = new ZZDHClient(port);
  
  try {
    await client.connect();
    
    let response;
    
    switch (action) {
      case 'connect':
        // 连接后获取项目列表
        response = await client.send('get_project_list');
        break;
        
      case 'project-list':
        response = await client.send('get_project_list');
        break;
        
      case 'panels':
      case 'get_panel_list':
        response = await client.send('get_panel_list');
        break;
        
      case 'create-project':
        const msg = {
          type: options.type === 'paperwork' ? 'create_project_paper' : 
                options.type === 'script' ? 'create_project_script' : 'create_project_paper',
          data: {
            name: options.name,
            content: options.content || ''
          }
        };
        response = await client.send(msg.type, msg.data);
        break;
        
      case 'update-prompt':
        response = await client.send('update_prompt', {
          panel_unique_name: options.panel,
          prompt: options.prompt
        });
        break;
        
      case 'generate-image':
        response = await client.send('generate_image', {
          panel_unique_name: options.panel,
          batch: parseInt(options.batch) || 4
        });
        break;
        
      case 'generate-video':
        response = await client.send('generate_video', {
          panel_unique_name: options.panel
        });
        break;
        
      default:
        // 直接发送消息
        response = await client.send(action, options);
    }
    
    console.log(JSON.stringify(response, null, 2));
    
  } catch (err) {
    console.log(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
  } finally {
    client.disconnect();
  }
}

main().catch(console.error);
