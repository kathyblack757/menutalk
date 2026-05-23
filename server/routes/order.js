const { Router } = require('express');
const { chat } = require('../services/deepseek');

const router = Router();

router.post('/order', async (req, res) => {
  try {
    const { dishes, targetLang, totalLocal, totalConverted, convertedCurrency } = req.body;

    if (!dishes || dishes.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'NO_DISHES', message: '购物车为空' } });
    }

    const dishesStr = dishes
      .map((d) => `${d.translatedName} x${d.quantity || 1}`)
      .join(', ');

    const prompt = `请生成一句自然流畅的点单话术。

## 菜品
${dishesStr}

## 目标语言
${targetLang || 'en'}

## 要求
话术结构：打招呼 + 列出菜品和数量 + 结束语（如"谢谢"）。
不要包含价格信息。
保持简短，不超过 3 句话。

## 输出格式
只返回合法 JSON，不要任何解释、markdown 标记或代码块符号。

{
  "orderText": "I'd like to order: 1 Kung Pao Chicken, 2 Fried Rice. Thank you!",
  "orderTextLocal": "こんにちは、注文します：宮保鶏丁 1つ、炒飯 2つ。お願いします。"
}

**orderText**：用户母语版本
**orderTextLocal**：当地语言版本（服务员看的）
如果两个字段内容相同，填一样的即可`;

    const raw = await chat(
      [{ role: 'user', content: prompt }],
      { temperature: 0.7, maxTokens: 512 }
    );

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        parsed = JSON.parse(match[1]);
      } else {
        return res.json({ success: false, error: { code: 'AI_TIMEOUT', message: 'AI 返回格式异常，请重试' } });
      }
    }

    res.json({ success: true, ...parsed });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ success: false, error: { code: 'AI_TIMEOUT', message: '点单文案生成失败，请重试' } });
  }
});

module.exports = router;
