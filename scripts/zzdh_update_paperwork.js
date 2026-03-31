/**
 * ZZDH 更新分镜文案
 * 为20个分镜分别写入对应的文案
 */

const WebSocket = globalThis.WebSocket;
const PORT = 62425;
const PROJECT_NAME = '重生复仇';

// 20个分镜的文案
const PAPERWORKS = [
  "前世苏婉音是相府最卑微的庶女，被陷害沉塘而死。",
  "再睁眼，她回到了十三岁那年，重生复仇开始。",
  "苏婉音在佛堂跪了三个时辰，膝盖渗出血来，低眉顺眼地祈福。",
  "母亲冷笑嘲讽：你这种贱骨头，祈福也配？",
  "苏婉音垂眸，嘴角却勾起一抹不易察觉的冷笑。",
  "这一夜，她独自谋划复仇计划，焚烧纸条，眼神坚定。",
  "嫡姐苏婉柔大婚之日，张灯结彩，宾客云集。",
  "苏婉音亲手将一封信塞进新郎的袖中，动作隐秘。",
  "王爷读信后震怒，当场退婚，婚礼变成闹剧。",
  "嫡姐苏婉柔颜面尽失，瘫坐在地，沦为笑柄。",
  "嫡姐苏婉柔悬梁自尽，以死谢罪。",
  "苏婉音跪在灵堂前，哭得梨花带雨，假意悲伤。",
  "没人看见，她眼底那一抹冷意和快意。",
  "三年后，新帝登基，朝堂更迭。",
  "苏婉音被册封为贵妃，金冠加顶，荣耀无边。",
  "贵妃苏婉音宠冠六宫，其他嫔妃艳羡不已。",
  "曾经抛弃她的渣男王爷，如今衣衫褴褛跪在她脚下。",
  "王爷乞求一瞥恩宠，贵妃目不斜视径直走过。",
  "苏婉音居高临下，冷眼俯视跪地的王爷。",
  "她声音冰冷：王爷，还记得沉塘之水，有多冷吗？"
];

async function main() {
  const ws = new WebSocket(`ws://127.0.0.1:${PORT}`);
  
  let done = false;
  
  ws.addEventListener('open', () => {
    console.log('连接成功');
    ws.send(JSON.stringify({type: 'get_project_list'}));
  });
  
  ws.addEventListener('message', async (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'get_project_list') {
      const target = data.data.projects.find(p => p.name === PROJECT_NAME);
      if (!target) {
        console.log('项目不存在');
        process.exit(1);
      }
      console.log('打开项目:', target.name);
      ws.send(JSON.stringify({
        type: 'open_project',
        data: {full_path: target.full_path}
      }));
    }
    else if (data.type === 'open_project') {
      ws.send(JSON.stringify({
        type: 'frontend_ready',
        data: {project_path: `工作目录/默认/${PROJECT_NAME}`}
      }));
    }
    else if (data.type === 'project_data_init' && !done) {
      done = true;
      const panels = data.data.panels || [];
      console.log('分镜数:', panels.length);
      console.log('\n开始更新文案...');
      
      for (let i = 0; i < Math.min(20, panels.length); i++) {
        const panel = panels[i];
        const text = PAPERWORKS[i];
        
        console.log(`更新分镜 ${i+1}/20: ${panel.unique_name}`);
        
        // 更新文案
        ws.send(JSON.stringify({
          type: 'update_paperwork',
          data: {unique_name: panel.unique_name, paperwork: text}
        }));
        
        await new Promise(r => setTimeout(r, 100));
      }
      
      console.log('\n✅ 文案更新完成！');
      
      // 等待后验证
      await new Promise(r => setTimeout(r, 1000));
      ws.send(JSON.stringify({
        type: 'frontend_ready',
        data: {project_path: `工作目录/默认/${PROJECT_NAME}`}
      }));
    }
    else if (data.type === 'project_data_init' && done) {
      // 验证结果
      const panels = data.data.panels || [];
      console.log('\n验证结果:');
      panels.slice(0, 20).forEach((p, i) => {
        const hasPaperwork = p.paperwork && p.paperwork.length > 0;
        console.log(`分镜${String(i+1).padStart(2)}: ${hasPaperwork ? '✅' : '❌'} ${p.paperwork?.substring(0, 30) || '(空)'}`);
      });
      process.exit(0);
    }
  });
  
  setTimeout(() => { console.log('超时'); process.exit(1); }, 30000);
}

main();
