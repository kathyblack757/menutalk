const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
});

const SYSTEM_PROMPT = `你是一个跨文化美食专家，精通世界各国菜系。
始终返回合法 JSON，不要包含任何 markdown 代码块标记。`;

/**
 * 调用 DeepSeek 文本模型（纯文本对话）
 */
async function chat(messages, options = {}) {
  const response = await client.chat.completions.create({
    model: options.model || 'deepseek-chat',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2048,
  });
  return response.choices[0].message.content;
}

/**
 * 调用 DeepSeek 视觉模型（图片+文本）
 * 注意：需使用支持视觉的模型，如 deepseek-chat（已支持 vision）
 */
async function chatWithImage(messages, imageBase64, options = {}) {
  // DeepSeek vision 支持 base64 图片
  const userMessage = messages[messages.length - 1];
  const response = await client.chat.completions.create({
    model: options.model || 'deepseek-chat',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(0, -1),
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          { type: 'text', text: userMessage.content },
        ],
      },
    ],
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 4096,
  });
  return response.choices[0].message.content;
}

module.exports = { chat, chatWithImage };
