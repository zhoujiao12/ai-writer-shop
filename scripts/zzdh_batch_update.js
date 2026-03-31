/**
 * ZZDH 批量更新提示词
 * 单次连接，批量更新所有分镜的提示词
 */

const WebSocket = globalThis.WebSocket;

const PORT = 62425;
const PROJECT_NAME = '重生复仇';

// 20个分镜的提示词（Grok Imagine公式）
const PROMPTS = [
  // 1. 前世苏婉音被沉塘
  "Scene: A young woman in ancient Chinese white burial robes being dragged to a pond by guards, her face showing terror and despair. The water is dark and cold. Style: Chinese period drama, tragic composition. Mood: Despair, injustice, terror. Lighting: Gloomy overcast sky, cold blue tones. Camera: Wide shot pulling back as she is thrown into the water.",
  
  // 2. 重生回到十三岁
  "Scene: A young girl's eyes snap open in an ornate wooden bed, morning light streaming through paper windows. She gasps, realizing she has returned to the past. Style: Chinese period drama, ethereal atmosphere. Mood: Shock, disbelief, hope dawning. Lighting: Soft morning light, golden rays. Camera: Close-up on eyes opening, then pull back to show bedroom.",
  
  // 3. 佛堂跪拜祈福
  "Scene: A young woman in plain white robes kneeling on cold stone floor in a dim Buddhist temple, blood seeping through her skirt at the knees. Buddha statue looms above. Style: Chinese period drama, somber atmosphere. Mood: Humility, hidden determination, physical pain. Lighting: Dim temple light, candles flickering. Camera: Low angle, knees in foreground, face in shadow.",
  
  // 4. 母亲冷笑嘲讽
  "Scene: An elegant older woman in luxurious silk robes standing over the kneeling girl, sneering with contempt. Her face is cold and dismissive. Style: Chinese period drama, stark contrast. Mood: Cruelty, superiority, disdain. Lighting: Harsh temple light, sharp shadows. Camera: Medium shot, mother looming above, girl small below.",
  
  // 5. 婉音暗自冷笑
  "Scene: Close-up of the kneeling girl's face, head bowed but lips curving into a barely perceptible cold smile. Eyes gleam with hidden malice. Style: Chinese period drama, subtle expression. Mood: Secret satisfaction, cold calculation, hidden intent. Lighting: Side light catching her subtle expression. Camera: Extreme close-up on face, focus on mouth.",
  
  // 6. 谋划复仇计划
  "Scene: The young woman alone at night, writing on paper by candlelight, her face illuminated with determination. She burns each note after writing. Style: Chinese period drama, noir atmosphere. Mood: Determination, cunning, cold resolve. Lighting: Single candle, dramatic chiaroscuro. Camera: Over-shoulder shot, focus on her hands and burning paper.",
  
  // 7. 嫡姐大婚之日
  "Scene: Grand wedding ceremony in ancient Chinese courtyard, red lanterns everywhere. The bride in elaborate red wedding attire, groom in ceremonial robes. Style: Chinese period drama, opulent celebration. Mood: Festive surface, underlying tension. Lighting: Bright red and gold, celebratory atmosphere. Camera: Wide establishing shot of the ceremony.",
  
  // 8. 塞信入新郎袖
  "Scene: The young woman in simple attire surreptitiously slipping a folded letter into the groom's sleeve as she passes by. No one notices. Style: Chinese period drama, suspenseful moment. Mood: Secret triumph, calculated risk. Lighting: Warm wedding light, shadows hiding her action. Camera: Close-up on hands, letter sliding into sleeve.",
  
  // 9. 王爷震怒退婚
  "Scene: The groom reading the letter, his face transforming from confusion to rage. He throws the letter down and declares the marriage void. Style: Chinese period drama, dramatic peak. Mood: Fury, betrayal, public humiliation. Lighting: Harsh wedding lights now seem accusatory. Camera: Medium shot on groom's angry face, then wide on chaos.",
  
  // 10. 嫡姐颜面尽失
  "Scene: The bride collapsing on the ground, elaborate wedding dress now a symbol of shame. Guests whisper and turn away. Style: Chinese period drama, tragic downfall. Mood: Shame, humiliation, public disgrace. Lighting: Cold light now, shadows lengthening. Camera: High angle looking down on fallen bride.",
  
  // 11. 嫡姐悬梁自尽
  "Scene: Dark room, a silhouette of a figure hanging from a beam, wedding dress still on. A tragic end to a fallen woman. Style: Chinese period drama, somber tragedy. Mood: Despair, finality, dark consequence. Lighting: Very dim, only moonlight through window. Camera: Wide shot, figure in shadow, respectful distance.",
  
  // 12. 灵堂假意哭泣
  "Scene: The young woman kneeling before a coffin, crying dramatically with a handkerchief. Other mourners watch sympathetically. Style: Chinese period drama, ironic scene. Mood: Performed grief, hidden satisfaction. Lighting: White funeral candles, mournful atmosphere. Camera: Medium shot, her crying face, then subtle shift.",
  
  // 13. 眼底一抹快意
  "Scene: Close-up of the young woman's face, tears on cheeks, but eyes showing cold satisfaction for just a moment. Style: Chinese period drama, revelatory moment. Mood: Secret triumph, cold victory, hidden malice. Lighting: Funeral candlelight, catching her eyes. Camera: Extreme close-up on eyes, micro-expression.",
  
  // 14. 三年后新帝登基
  "Scene: Grand imperial ceremony, new emperor ascending the throne. Below, courtiers bow. In the crowd, the now-beautiful woman watches. Style: Chinese period drama, epic scale. Mood: Power shift, new era, opportunity. Lighting: Golden imperial light, majestic atmosphere. Camera: Wide shot of throne room, then find her in crowd.",
  
  // 15. 册封贵妃之位
  "Scene: The woman in magnificent empress robes, kneeling before the emperor who places a golden crown on her head. She rises as a consort. Style: Chinese period drama, opulent ceremony. Mood: Triumph, power achieved, destiny fulfilled. Lighting: Divine golden light, celebratory atmosphere. Camera: Low angle on her rising, crown on head.",
  
  // 16. 宠冠六宫之宠
  "Scene: The consort walking through imperial gardens, other concubines watching with envy. She radiates confidence and beauty. Style: Chinese period drama, opulent beauty. Mood: Supremacy, jealousy of others, power. Lighting: Beautiful garden light, flowers in bloom. Camera: Following shot, her elegance on display.",
  
  // 17. 渣男王爷跪地
  "Scene: The same prince from before, now in beggar's rags, kneeling on cold palace floor. His face shows desperation and shame. Style: Chinese period drama, fallen grace. Mood: Humiliation, desperation, contrast to past. Lighting: Cold palace light, unforgiving atmosphere. Camera: High angle looking down on kneeling figure.",
  
  // 18. 乞求一瞥恩宠
  "Scene: The fallen prince reaching up toward the consort who passes by, pleading for just one look. She walks past without acknowledgment. Style: Chinese period drama, cruel dismissal. Mood: Desperation, rejection, power reversed. Lighting: Palace light, she in brightness, he in shadow. Camera: He in foreground, she walking away.",
  
  // 19. 婉音居高临下
  "Scene: The consort on an ornate throne, looking down at the kneeling prince. Her face is cold, beautiful, and powerful. Style: Chinese period drama, power composition. Mood: Dominance, cold satisfaction, revenge complete. Lighting: She bathed in divine light, he in darkness below. Camera: Low angle up at her, reverse to him below.",
  
  // 20. 沉塘之水多冷
  "Scene: The consort leaning forward slightly, speaking cold words. Flashback to the pond from the beginning. Full circle. Style: Chinese period drama, bookend moment. Mood: Cold triumph, dark satisfaction, poetic justice. Lighting: Her face cold and beautiful, flashback in blue tones. Camera: Close-up on her lips speaking, dissolve to pond."
];

async function main() {
  const ws = new WebSocket(`ws://127.0.0.1:${PORT}`);
  
  ws.addEventListener('open', async () => {
    console.log('连接成功');
    
    // 获取项目列表
    ws.send(JSON.stringify({type: 'get_project_list', request_id: 'r1'}));
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
        data: {full_path: target.full_path, name: target.name, project_type: 0},
        request_id: 'r2'
      }));
    } 
    else if (data.type === 'open_project') {
      console.log('项目已打开');
      ws.send(JSON.stringify({
        type: 'frontend_ready',
        data: {project_path: `工作目录/默认/${PROJECT_NAME}`},
        request_id: 'r3'
      }));
    }
    else if (data.type === 'project_data_init') {
      const panels = data.data.panels || [];
      console.log('当前分镜数:', panels.length);
      
      if (panels.length < 20) {
        // 添加分镜到20个
        const lastPanel = panels[panels.length - 1];
        for (let i = panels.length; i < 20; i++) {
          console.log(`添加分镜 ${i+1}/20`);
          ws.send(JSON.stringify({
            type: 'add_panel',
            data: {after_unique_name: lastPanel?.unique_name || null},
            request_id: `add_${i}`
          }));
          await new Promise(r => setTimeout(r, 200));
        }
        await new Promise(r => setTimeout(r, 500));
        // 重新获取
        ws.send(JSON.stringify({
          type: 'frontend_ready',
          data: {project_path: `工作目录/默认/${PROJECT_NAME}`},
          request_id: 'r4'
        }));
      } else {
        // 更新提示词
        console.log('\\n开始更新提示词...');
        for (let i = 0; i < Math.min(20, panels.length); i++) {
          const panel = panels[i];
          const prompt = PROMPTS[i];
          console.log(`更新分镜 ${i+1}/20: ${panel.unique_name}`);
          
          // 发送完整提示词
          ws.send(JSON.stringify({
            type: 'update_prompt',
            data: {unique_name: panel.unique_name, prompt: prompt},
            request_id: `update_${i}`
          }));
          await new Promise(r => setTimeout(r, 100));
        }
        
        console.log('\\n✅ 提示词更新完成！');
        
        // 验证
        await new Promise(r => setTimeout(r, 500));
        ws.send(JSON.stringify({
          type: 'frontend_ready',
          data: {project_path: `工作目录/默认/${PROJECT_NAME}`},
          request_id: 'final'
        }));
      }
    }
    else if (data.type === 'project_data_init' && data.request_id === 'final') {
      const panels = data.data.panels || [];
      console.log('\\n验证结果:');
      panels.slice(0, 20).forEach((p, i) => {
        const hasPrompt = p.prompt && p.prompt.length > 0;
        console.log(`分镜${i+1}: ${hasPrompt ? '✅ 有提示词' : '❌ 无提示词'} - ${p.prompt?.substring(0, 40) || '(空)'}...`);
      });
      process.exit(0);
    }
    else if (data.type === 'project_data_init' && data.request_id === 'r4') {
      const panels = data.data.panels || [];
      console.log('\\n分镜已添加，当前数:', panels.length);
      // 现在更新提示词
      console.log('\\n开始更新提示词...');
      for (let i = 0; i < Math.min(20, panels.length); i++) {
        const panel = panels[i];
        const prompt = PROMPTS[i];
        console.log(`更新分镜 ${i+1}/20: ${panel.unique_name}`);
        ws.send(JSON.stringify({
          type: 'update_prompt',
          data: {unique_name: panel.unique_name, prompt: prompt},
          request_id: `update_${i}`
        }));
        await new Promise(r => setTimeout(r, 100));
      }
      console.log('\\n✅ 提示词更新完成！');
      await new Promise(r => setTimeout(r, 500));
      ws.send(JSON.stringify({
        type: 'frontend_ready',
        data: {project_path: `工作目录/默认/${PROJECT_NAME}`},
        request_id: 'final'
      }));
    }
  });
  
  setTimeout(() => { console.log('超时'); process.exit(1); }, 60000);
}

main();
