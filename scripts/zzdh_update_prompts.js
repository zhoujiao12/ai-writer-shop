/**
 * ZZDH 更新提示词 - 图片(Gemini Nonabanana) + 视频(Grok Imagine)
 */

const WebSocket = globalThis.WebSocket;
const PORT = 62425;
const PROJECT_NAME = '重生复仇';

// 20个分镜的提示词
const PANELS = [
  {
    // 分镜1: 前世苏婉音被沉塘
    image: "一位身穿白色丧服的古代女子被侍卫拖向池塘，她面容惊恐绝望，双手挣扎。池塘水阴暗冰冷，天空阴沉。中国古代宫廷场景，悲剧氛围，电影级光影。",
    video: "Scene: A young woman in white burial robes dragged by guards to a dark pond. Style: Chinese period drama, tragic. Mood: Terror, despair. Lighting: Gloomy overcast. Camera: Wide shot pulling back."
  },
  {
    // 分镜2: 重生回到十三岁
    image: "一位少女在精致的木床上猛然睁眼，清晨阳光透过纸窗照入，她神情震惊后转为恍然大悟。古代闺房场景，梦幻氛围，柔美光影。",
    video: "Scene: Young girl's eyes snap open in ornate bed, morning light streaming. Style: Ethereal Chinese period. Mood: Shock turning to realization. Lighting: Soft golden morning. Camera: Close-up eyes then pull back."
  },
  {
    // 分镜3: 佛堂跪拜祈福
    image: "一位白衣女子跪在阴暗佛堂的石板上，膝盖渗血染红白裙，双手合十虔诚祈祷。佛像庄严高大，烛光摇曳。古代寺庙场景，肃穆氛围。",
    video: "Scene: Woman in white kneeling on cold stone, blood seeping through skirt, praying. Style: Somber temple setting. Mood: Humility, hidden pain. Lighting: Dim candlelight. Camera: Low angle, knees foreground."
  },
  {
    // 分镜4: 母亲冷笑嘲讽
    image: "一位华服贵妇居高临下俯视跪地的女子，嘴角冷笑，眼神轻蔑。华丽丝绸衣着，气场凌厉。古代府邸场景，压迫氛围。",
    video: "Scene: Elegant woman in silk robes sneering down at kneeling girl. Style: Dramatic contrast. Mood: Cruelty, superiority. Lighting: Harsh shadows. Camera: Medium shot, mother looming."
  },
  {
    // 分镜5: 婉音暗自冷笑
    image: "跪地女子的面部特写，低垂的眼眸中闪过一丝冷意，嘴角微微上扬。微表情藏着的复仇决心。古代场景，暗色调。",
    video: "Scene: Close-up of kneeling girl, head bowed, lips curving cold smile. Style: Subtle expression. Mood: Hidden malice, secret triumph. Lighting: Side light. Camera: Extreme close-up on face."
  },
  {
    // 分镜6: 谋划复仇计划
    image: "女子深夜独坐，烛光下书写纸条，每写完一张便焚烧，火光映照她坚定的面容。古代书房场景，谍影氛围。",
    video: "Scene: Woman alone at night, writing by candlelight, burning each note. Style: Noir atmosphere. Mood: Determination, cunning. Lighting: Single candle chiaroscuro. Camera: Over-shoulder shot."
  },
  {
    // 分镜7: 嫡姐大婚之日
    image: "盛大婚礼场景，红色灯笼高挂，新娘身穿华丽红嫁衣，新郎着吉服。宾客云集，喜庆热闹。古代府邸庭院，华丽氛围。",
    video: "Scene: Grand wedding ceremony, red lanterns, bride in elaborate red attire. Style: Opulent celebration. Mood: Festive surface, underlying tension. Lighting: Bright red and gold. Camera: Wide establishing."
  },
  {
    // 分镜8: 塞信入新郎袖
    image: "素衣女子悄然将折好的信笺塞入新郎袖中，动作隐秘无人察觉。婚礼背景虚化。古代场景，悬疑氛围。",
    video: "Scene: Young woman surreptitiously slipping letter into groom's sleeve. Style: Suspenseful. Mood: Secret triumph, calculated risk. Lighting: Warm wedding light. Camera: Close-up on hands."
  },
  {
    // 分镜9: 王爷震怒退婚
    image: "新郎读信后面容扭曲愤怒，将信摔在地上，手指指向新娘怒吼。宾客惊愕围观。古代婚礼场景，戏剧高潮。",
    video: "Scene: Groom reading letter, face transforming to rage, throwing it down. Style: Dramatic peak. Mood: Fury, betrayal. Lighting: Harsh accusatory. Camera: Medium shot to wide chaos."
  },
  {
    // 分镜10: 嫡姐颜面尽失
    image: "新娘瘫坐在地，华美嫁衣此刻成为耻辱象征，宾客窃窃私语转身离去。古代婚礼场景，悲凉氛围。",
    video: "Scene: Bride collapsing on ground, elaborate dress symbol of shame. Style: Tragic downfall. Mood: Humiliation, disgrace. Lighting: Cold, shadows. Camera: High angle looking down."
  },
  {
    // 分镜11: 嫡姐悬梁自尽
    image: "昏暗房间，一道身影悬于梁上，仍穿着嫁衣。悲剧的终局。古代室内场景，阴暗氛围。（含蓄处理，不直接展示）",
    video: "Scene: Dark room, silhouette of figure hanging from beam, wedding dress on. Style: Somber tragedy. Mood: Despair, finality. Lighting: Very dim moonlight. Camera: Wide shot, respectful distance."
  },
  {
    // 分镜12: 灵堂假意哭泣
    image: "女子跪在棺木前，手帕掩面痛哭，周围吊唁者投来同情目光。白色挽联飘动。古代灵堂场景，哀悼氛围。",
    video: "Scene: Woman kneeling before coffin, crying dramatically with handkerchief. Style: Ironic scene. Mood: Performed grief. Lighting: White funeral candles. Camera: Medium shot on crying face."
  },
  {
    // 分镜13: 眼底一抹快意
    image: "女子泪痕满面的面部特写，眼角却闪过一丝冷意和满足。微表情的揭露。古代灵堂场景，反差氛围。",
    video: "Scene: Close-up of tear-streaked face, eyes showing cold satisfaction for a moment. Style: Revelatory. Mood: Secret triumph. Lighting: Funeral candlelight. Camera: Extreme close-up on eyes."
  },
  {
    // 分镜14: 三年后新帝登基
    image: "宏伟皇宫大殿，新皇登基，百官跪拜。人群中一位美貌女子冷眼旁观。古代皇宫场景，权力更迭。",
    video: "Scene: Grand imperial ceremony, new emperor ascending throne. Style: Epic scale. Mood: Power shift, new era. Lighting: Golden imperial. Camera: Wide throne room, find her in crowd."
  },
  {
    // 分镜15: 册封贵妃之位
    image: "女子身穿华丽贵妃服饰，跪在皇帝面前受封，金冠加顶。她容光焕发，贵气逼人。古代皇宫场景，荣耀氛围。",
    video: "Scene: Woman in magnificent robes, kneeling before emperor receiving crown. Style: Opulent ceremony. Mood: Triumph, power achieved. Lighting: Divine golden. Camera: Low angle on her rising."
  },
  {
    // 分镜16: 宠冠六宫之宠
    image: "贵妃漫步御花园，其他嫔妃艳羡注视。她自信优雅，容光焕发。古代御花园场景，繁华氛围。",
    video: "Scene: Consort walking through imperial gardens, other concubines watching with envy. Style: Opulent beauty. Mood: Supremacy, power. Lighting: Beautiful garden light. Camera: Following shot."
  },
  {
    // 分镜17: 渣男王爷跪地
    image: "曾经嚣张的王爷此刻衣衫褴褛，跪在冰冷宫殿地面上，面容卑微绝望。古代宫殿场景，落魄氛围。",
    video: "Scene: Former prince now in beggar's rags, kneeling on cold palace floor. Style: Fallen grace. Mood: Humiliation, desperation. Lighting: Cold palace light. Camera: High angle down on him."
  },
  {
    // 分镜18: 乞求一瞥恩宠
    image: "落魄王爷伸手向路过的贵妃乞求，贵妃目不斜视径直走过。古代宫殿走廊场景，冷酷氛围。",
    video: "Scene: Fallen prince reaching toward passing consort, pleading for one look. Style: Cruel dismissal. Mood: Rejection, power reversed. Lighting: She in brightness, he in shadow. Camera: He foreground, she walking away."
  },
  {
    // 分镜19: 婉音居高临下
    image: "贵妃端坐华丽宝座，俯视脚下跪着的王爷，面容冰冷美丽，眼神充满权力和满足。古代宫殿场景，压迫氛围。",
    video: "Scene: Consort on ornate throne looking down at kneeling prince. Style: Power composition. Mood: Dominance, revenge complete. Lighting: She in divine light, he in darkness. Camera: Low angle up at her."
  },
  {
    // 分镜20: 沉塘之水多冷
    image: "贵妃微微前倾，冷冷开口。画面闪回到开头的池塘，完成轮回。古今交错场景，诗意氛围。",
    video: "Scene: Consort leaning forward speaking cold words, flashback to the pond. Style: Bookend moment. Mood: Cold triumph, poetic justice. Lighting: Her face cold, flashback in blue. Camera: Close-up lips, dissolve to pond."
  }
];

async function main() {
  const ws = new WebSocket(`ws://127.0.0.1:${PORT}`);
  
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
    else if (data.type === 'project_data_init') {
      const panels = data.data.panels || [];
      console.log('分镜数:', panels.length);
      console.log('\\n开始更新提示词...');
      
      for (let i = 0; i < Math.min(20, panels.length); i++) {
        const panel = panels[i];
        const prompts = PANELS[i];
        
        console.log(`\\n更新分镜 ${i+1}/20: ${panel.unique_name}`);
        
        // 更新图片提示词
        ws.send(JSON.stringify({
          type: 'update_prompt',
          data: {unique_name: panel.unique_name, prompt: prompts.image}
        }));
        await new Promise(r => setTimeout(r, 50));
        
        // 更新视频提示词
        ws.send(JSON.stringify({
          type: 'update_video_prompt',
          data: {unique_name: panel.unique_name, video_prompt: prompts.video}
        }));
        await new Promise(r => setTimeout(r, 50));
      }
      
      console.log('\\n✅ 全部更新完成！');
      
      // 验证
      await new Promise(r => setTimeout(r, 500));
      ws.send(JSON.stringify({
        type: 'frontend_ready',
        data: {project_path: `工作目录/默认/${PROJECT_NAME}`}
      }));
    }
    else if (data.type === 'project_data_init') {
      // 验证结果
      const panels = data.data.panels || [];
      console.log('\\n验证结果:');
      panels.slice(0, 20).forEach((p, i) => {
        const imgOk = p.prompt && p.prompt.length > 0;
        const vidOk = p.video_prompt && p.video_prompt.length > 0;
        console.log(`分镜${i+1}: 图片${imgOk ? '✅' : '❌'} 视频${vidOk ? '✅' : '❌'}`);
      });
      process.exit(0);
    }
  });
  
  setTimeout(() => { console.log('超时'); process.exit(1); }, 30000);
}

main();
