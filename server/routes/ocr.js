const { Router } = require('express');
const multer = require('multer');
const { chatWithImage } = require('../services/gpt-vision');

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/ocr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_IMAGE', message: '请上传菜单图片' } });
    }

    const targetLang = req.body.targetLang || 'en';
    const imageBase64 = req.file.buffer.toString('base64');

    const prompt = `你是一位精通饮食文化的菜单解析专家。
请识别这张菜单照片中的所有菜品，并以 JSON 格式返回。

## 目标语言
${targetLang}（翻译菜品名称时使用的语言，请严格遵守）

## 输出格式
只返回合法 JSON，不要任何解释、markdown 标记或代码块符号。
注意：translatedName 必须严格使用目标语言 ${targetLang} 输出。

{
  "dishes": [
    {
      "originalName": "蚂蚁上树",
      "translatedName": "（此处填${targetLang}翻译名）",
      "pinyin": "mǎ yǐ shàng shù",
      "price": 38,
      "currency": "¥",
      "confidence": "high"
    }
  ],
  "totalCount": 15
}

## 字段说明

**translatedName**
- 菜名直接翻译即可
- 含文化隐喻的菜名（如"蚂蚁上树""狮子头""夫妻肺片"），在译名后加括号简要说明实物
- 括号内实物描述不超过 15 个单词
- 不得出现令目标语言用户产生误解或恐惧的直译

**confidence**
- "high"：文字清晰可确认
- "medium"：有轻微模糊但可推断
- "low"：手写潦草或严重模糊，originalName 中用 ? 标注不确定字符

**price**
- 识别不到价格填 null
- 只填数字，货币符号单独放 currency 字段

## 排除规则
以下内容不作为菜品处理，直接忽略：
- 餐厅名称、地址、电话、日期、营业时间
- "今日特价""本店特色""新品推荐"等广告语
- 餐具、餐巾纸等非食品收费项

## 异常处理
- 图片模糊无法识别任何内容：{ "error": "image_unreadable", "dishes": [] }
- 图片内容不是菜单：{ "error": "not_a_menu", "dishes": [] }
- 部分区域模糊：正常返回可识别菜品`;

    const raw = await chatWithImage(
      [{ role: 'user', content: prompt }],
      imageBase64,
      { temperature: 0.3, maxTokens: 4096 }
    );

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // 尝试从 markdown 代码块中提取 JSON
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        parsed = JSON.parse(match[1]);
      } else {
        return res.json({ success: false, error: { code: 'AI_TIMEOUT', message: 'AI 返回格式异常，请重试' } });
      }
    }

    res.json({ success: true, ...parsed });
  } catch (err) {
    console.error('OCR error:', err);
    res.status(500).json({ success: false, error: { code: 'OCR_FAILED', message: '菜单识别失败，请重试' } });
  }
});

module.exports = router;
