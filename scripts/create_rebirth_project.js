/**
 * ZZDH项目创建和提示词注入
 */

const WebSocket = require('ws');
const fs = require('fs');

const PORT_FILE = '/mnt/c/Users/Administrator/AppData/Local/Temp/zzdh-ws-port.txt';

// 读取端口
function getPort() {
  try {
    return parseInt(fs.readFileSync(PORT_FILE, 'utf-8').trim(), 10);
  } catch (e) {
    return null;
  }
}

// 提示词数据
const PANELS = [
  {
    text: "池塘边，黄昏。苏婉音被两个婆子拖向池塘，眼中含泪挣扎。",
    imagePrompt: "Young Chinese woman, 16 years old, long black hair, fair skin, wearing white hanfu, being dragged by two servants toward a lotus pond, crying, sunset golden hour, traditional Chinese garden, lotus flowers, willow trees, cinematic photography, 4K",
    videoPrompt: "Scene: Traditional Chinese garden pond at golden hour sunset. Subject: Young woman in white hanfu being dragged by two servants, struggling and crying. Camera: Wide shot slowly pushing in. Lighting: Golden hour, warm orange sky. Mood: Tragic, dramatic. Style: Cinematic period drama."
  },
  {
    text: "苏婉音被推入池塘，冰冷的池水淹没她...",
    imagePrompt: "Young woman in white hanfu falling into lotus pond, water splashing, lotus flowers floating, sunset sky reflecting on water, dramatic moment, cinematic, 4K",
    videoPrompt: "Scene: Lotus pond at sunset. Subject: Woman falling into water, splashing. Camera: Slow motion capture. Lighting: Golden hour reflections on water. Mood: Tragic climax. Style: Cinematic period drama."
  },
  {
    text: "黑暗中，苏婉音想起前世的一切——被陷害、被嫁给病秧子、含冤而死。",
    imagePrompt: "Dark void with floating memories, scenes of a woman suffering, kneeling, crying, being mistreated, ghostly flashback images, dramatic lighting, emotional, 4K",
    videoPrompt: "Scene: Dark void with floating memory fragments. Subject: Flashback scenes of suffering and injustice. Camera: Dissolving between memories. Lighting: Ethereal, ghostly. Mood: Sorrowful, reflective. Style: Cinematic flashback."
  },
  {
    text: "苏婉音在闺房猛然醒来，发现自己回到了十三岁！",
    imagePrompt: "Young Chinese woman sitting up in ornate wooden bed, shocked expression, morning light through paper window, traditional Chinese maiden chamber, silk curtains, cinematic, 4K",
    videoPrompt: "Scene: Traditional Chinese maiden's chamber at dawn. Subject: Woman suddenly sitting up in bed, touching face in disbelief. Camera: Medium close-up pulling back. Lighting: Soft golden morning light. Mood: Shock, realization. Style: Cinematic period drama."
  },
  {
    text: "苏婉音眼神变得坚定：这一次，我要让他们付出代价！",
    imagePrompt: "Young Chinese woman, beautiful face with determined expression, red beauty mark on forehead, wearing white hanfu, eyes full of resolve, dramatic lighting, close-up, cinematic, 4K",
    videoPrompt: "Scene: Close-up of woman's face. Subject: Eyes becoming determined, slight smile forming. Camera: Extreme close-up on eyes, pulling back. Lighting: Dramatic side lighting. Mood: Determined, powerful. Style: Cinematic character moment."
  },
  {
    text: "正厅，苏婉柔端坐在主位。苏婉音走进来行礼。",
    imagePrompt: "Two Chinese women in traditional hall - one in white hanfu bowing gracefully, one in luxurious red hanfu sitting arrogantly, red pillars, golden decorations, daylight, period drama, cinematic, 4K",
    videoPrompt: "Scene: Grand traditional Chinese main hall. Subject: Woman in white enters and bows to woman in red sitting on main seat. Camera: Wide shot to medium shot. Lighting: Bright daylight from windows. Mood: Tense, political. Style: Period drama."
  },
  {
    text: "苏婉柔：哟，妹妹来了？昨日让你抄的佛经，可抄完了？",
    imagePrompt: "Glamorous Chinese woman, 18 years old, in luxurious red hanfu with gold jewelry, sitting on carved chair, haughty expression, holding silk fan, traditional hall background, cinematic, 4K",
    videoPrompt: "Scene: Woman in red hanfu on ornate chair. Subject: Speaking arrogantly, waving fan dismissively. Camera: Medium shot, slight low angle. Lighting: Warm indoor lighting. Mood: Arrogant, dismissive. Style: Period drama."
  },
  {
    text: "苏婉音平静地呈上佛经：回嫡姐，抄完了。",
    imagePrompt: "Young woman in white hanfu calmly presenting a scripture book, serene expression, traditional Chinese hall, daylight, elegant composition, cinematic, 4K",
    videoPrompt: "Scene: Traditional hall. Subject: Woman in white calmly offering a book with both hands. Camera: Medium close-up on hands and face. Lighting: Soft daylight. Mood: Calm, composed. Style: Period drama."
  },
  {
    text: "苏婉柔翻看佛经，脸色微变：字写得倒是不错...",
    imagePrompt: "Woman in red hanfu examining a book, suspicious expression, traditional hall background, dramatic lighting, cinematic, 4K",
    videoPrompt: "Scene: Woman in red looking through book. Subject: Eyes narrowing, expression changing from smug to suspicious. Camera: Close-up on face and book. Lighting: Even indoor lighting. Mood: Suspicious, tense. Style: Period drama."
  },
  {
    text: "深夜，苏婉音坐在桌前翻看账册，眼中闪过锐利的光。",
    imagePrompt: "Young woman in white hanfu examining account book by candlelight, focused expression, brush in hand, dark chamber, warm flickering light, mysterious atmosphere, cinematic, 4K",
    videoPrompt: "Scene: Dark chamber at night, single candle. Subject: Woman examining old account book, circling suspicious numbers, determined expression. Camera: Over-shoulder close-up, slow push. Lighting: Flickering candlelight. Mood: Mysterious, determined. Style: Noir period drama."
  }
];

async function createProject() {
  const port = getPort();
  if (!port) {
    console.error('❌ ZZDH未运行');
    return;
  }

  console.log(`🔌 连接ZZDH (端口 ${port})...`);

  const ws = new WebSocket(`ws://127.0.0.1:${port}`);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('超时'));
    }, 60000);

    ws.on('open', () => {
      console.log('✅ 连接成功');

      // 创建项目
      const createMsg = {
        type: 'create_project_paper',
        data: {
          name: '重生之嫡女归来',
          content: '古装虐恋重生复仇剧 - 庶女苏婉音重生复仇故事'
        }
      };

      console.log('📝 创建项目...');
      ws.send(JSON.stringify(createMsg));
    });

    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());
        console.log('📩 收到:', msg.type);

        if (msg.type === 'create_project_paper') {
          if (msg.data?.success) {
            console.log('✅ 项目创建成功');

            // 等待一下
            await new Promise(r => setTimeout(r, 1000));

            // 发送frontend_ready
            ws.send(JSON.stringify({
              type: 'frontend_ready',
              data: { project_path: '工作目录/默认/重生之嫡女归来' }
            }));
          } else {
            console.error('❌ 创建失败:', msg.data);
            clearTimeout(timeout);
            ws.close();
            reject(new Error('创建失败'));
          }
        } else if (msg.type === 'project_data_init') {
          console.log('📦 收到项目数据');
          const panels = msg.data.panels || [];
          console.log(`   当前分镜数: ${panels.length}`);

          // 更新每个分镜
          for (let i = 0; i < Math.min(PANELS.length, panels.length); i++) {
            const panel = PANELS[i];
            const existing = panels[i];

            console.log(`\n📝 更新分镜 ${i + 1}/${PANELS.length}...`);

            // 更新文案
            ws.send(JSON.stringify({
              type: 'update_paperwork',
              data: { unique_name: existing.unique_name, paperwork: panel.text }
            }));
            await new Promise(r => setTimeout(r, 100));

            // 更新图片提示词
            ws.send(JSON.stringify({
              type: 'update_prompt',
              data: { unique_name: existing.unique_name, prompt: panel.imagePrompt }
            }));
            await new Promise(r => setTimeout(r, 100));

            // 更新视频提示词
            ws.send(JSON.stringify({
              type: 'update_video_prompt',
              data: { unique_name: existing.unique_name, video_prompt: panel.videoPrompt }
            }));
            await new Promise(r => setTimeout(r, 100));
          }

          console.log('\n✅ 全部注入完成！');
          clearTimeout(timeout);
          ws.close();
          resolve();
        }
      } catch (e) {
        console.error('❌ 解析错误:', e.message);
      }
    });

    ws.on('error', (e) => {
      console.error('❌ 连接错误:', e.message);
      clearTimeout(timeout);
      reject(e);
    });
  });
}

createProject().catch(console.error);
