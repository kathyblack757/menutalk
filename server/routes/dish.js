const { Router } = require('express');
const { chat } = require('../services/deepseek');

const router = Router();

router.post('/dish', async (req, res) => {
  try {
    const { originalName, userLang = 'zh', allergenList = [] } = req.body;

    if (!originalName) {
      return res.status(400).json({ success: false, error: { code: 'NO_DISHES', message: '请提供菜名' } });
    }

    const prompt = `请分析以下菜品，返回结构化 JSON。

## 菜品信息
- 菜名：${originalName}
- 用户语言：${userLang}
- 用户过敏原：${JSON.stringify(allergenList)}

## 输出格式
只返回合法 JSON，不要任何解释、markdown 标记或代码块符号。

{
  "ingredients": ["粉丝", "猪肉末", "豆瓣酱", "姜"],
  "allergens": ["大豆", "小麦"],
  "spiceLevel": 2,
  "flavorTags": ["鲜辣", "咸香"],
  "culturalNote": "名字来源于粉丝缠绕肉末的形态，形似蚂蚁爬树。四川经典家常菜。",
  "imageSearchQuery": "ants climbing tree glass noodles chinese"
}

## 字段说明

**ingredients**：主要食材，3~8 个

**allergens**：可能含有的过敏原，从常见14类过敏原（花生、大豆、牛奶、鸡蛋、鱼类、贝类、坚果、小麦、芝麻等）中筛选

**spiceLevel**：0=不辣，1=微辣，2=中辣，3=很辣，4=变态辣

**flavorTags**：2~4 个风味标签，如"鲜辣""咸香""酸甜""清淡""浓郁"等

**culturalNote**：不超过 80 个中文字（或 120 个英文单词），简要说明菜名由来或文化背景

**imageSearchQuery**：2~4 个英文词，描述菜品实际样子，用于图片搜索`;

    const raw = await chat(
      [{ role: 'user', content: prompt }],
      { temperature: 0.7, maxTokens: 1024 }
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

    res.json({ success: true, dish: parsed });
  } catch (err) {
    console.error('Dish error:', err);
    res.status(500).json({ success: false, error: { code: 'AI_TIMEOUT', message: '菜品分析失败，请重试' } });
  }
});

module.exports = router;
