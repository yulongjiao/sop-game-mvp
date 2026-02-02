// AI大脑
//识别 KEY 调用大模型
// 读取数据库 data.json
'use server'

import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';

const dataFilePath = path.join(process.cwd(), 'data.json');
// ... import 语句 ...

// 👇 加这一行调试代码
console.log("正在读取 Key:", process.env.DEEPSEEK_API_KEY ? "读取成功" : "读取失败，是 undefined");

// 🔴🔴🔴 请在这里填入你的 API Key 🔴🔴🔴
// 如果是用 DeepSeek: baseURL 是 'https://api.deepseek.com'
// 如果是用 OpenAI: 把 baseURL 那一行删掉即可
const openai = new OpenAI({
  // process.env 就是去读取刚才那个保险箱文件
  apiKey: process.env.DEEPSEEK_API_KEY, 
  baseURL: 'https://api.deepseek.com', // 或者 process.env.DEEPSEEK_BASE_URL
});

// 1. 读取数据
export async function getCourseData() {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    return { title: "新课程", cards: [] };
  }
}

// 2. 保存数据
export async function saveCourseData(newData) {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 3. ✨ AI 生成逻辑 (核心)
export async function generateCourseAI(userText) {
  console.log("正在呼叫 AI...");

//systemPrompt 系统提示词

  const systemPrompt = `
    你是一位拥有 15 年经验的【资深企业培训专家】和【视觉交互设计师】。
    你的任务是将枯燥的操作手册（SOP），重构为图文并茂、排版丰富的移动端互动课程。

    【🎨 智能视觉引擎 (Seede Mode)】
    你的核心能力是根据【文本的逻辑结构】自动选择最酷的排版 (variant) 并填充对应的数据字段。

    请从以下模式中选择：

    1. **variant: "list_with_icons" (结构化清单)**
       - 触发条件：当内容包含 3-4 个明确的步骤、原则、要点时。
       - 数据结构要求：
         "items": [
            {"icon": "star", "title": "第一点", "desc": "简短说明", "color": "blue"},
            {"icon": "alert", "title": "第二点", "desc": "简短说明", "color": "red"}
         ]
       - 可用图标(icon): check, x, zap, alert, info, star

    2. **variant: "comparison" (红绿对比)**
       - 触发条件：当内容在讲“正确 vs 错误”、“以前 vs 现在”、“误区 vs 真相”时。
       - 数据结构要求：
         "left": {"title": "错误做法", "desc": "描述..."},
         "right": {"title": "正确做法", "desc": "描述..."}

    3. **variant: "big_number" (数据冲击)**
       - 触发条件：当内容核心是一个关键数字（如温度、时间、比例）时。
       - 数据结构要求：
         "number": "20",
         "unit": "秒",
         "desc": "这是洗手必须保持的最短时间，否则无法杀菌。"

    4. **variant: "classic" (经典图文)**
       - 触发条件：普通叙述，不符合以上特征。
    
    【输出 JSON 示例】
    {
      "title": "...",
      "cards": [
        {
          "type": "info",
          "variant": "comparison", // AI 自动判断出是对比
          "title": "红黄抹布大比拼",
          "left": { "title": "红布擦台面", "desc": "导致细菌扩散" },
          "right": { "title": "黄布擦台面", "desc": "干净卫生" },
          "imageKeyword": "cleaning cloth"
        }
      ]
    }
    `;

  try {
    // 把 Prompt 和 sop 打包发给大模型
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userText },
      ],
      model: "deepseek-chat", // 🔴 如果用 OpenAI，改成 "gpt-4o"
      response_format: { type: "json_object" },
    });

    const aiContent = completion.choices[0].message.content;
    return { success: true, data: JSON.parse(aiContent) };

  } catch (error) {
    console.error("AI 报错:", error);
    return { success: false, error: "AI 调用失败，请检查 API Key" };
  }
}