const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.API2D_KEY,
  baseURL: process.env.API2D_BASE_URL || 'https://oa.api2d.net',
});

async function chatWithImage(messages, imageBase64, options = {}) {
  const userMessage = messages[messages.length - 1];
  const response = await client.chat.completions.create({
    model: options.model || 'gpt-4o',
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
