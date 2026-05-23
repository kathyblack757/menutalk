const OpenAI = require('openai');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxyUrl = 'http://127.0.0.1:5780';

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
  httpAgent: new HttpsProxyAgent(proxyUrl),
});

/**
 * 调用 Gemini 视觉模型（图片+文本）
 */
async function chatWithImage(messages, imageBase64, options = {}) {
  const userMessage = messages[messages.length - 1];
  const response = await client.chat.completions.create({
    model: options.model || 'gemini-2.0-flash',
    messages: [
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

module.exports = { chatWithImage };
