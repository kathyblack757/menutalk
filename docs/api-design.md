# 菜根谭 MenuTalk — API接口设计

## 基础信息

- 基础URL：`http://localhost:3001/api`
- 请求格式：JSON / multipart/form-data（文件上传）
- 响应格式：JSON
- 编码：UTF-8

---

## 1. 健康检查

```
GET /api/health
```

**响应**：
```json
{ "status": "ok", "timestamp": "2026-05-16T12:00:00Z" }
```

---

## 2. 菜单OCR识别

```
POST /api/ocr
Content-Type: multipart/form-data

参数：
  image: File        # 菜单图片（必填）
  targetLang: string # 目标翻译语言，如 "en"、"ja"（必填）
```

**响应**：
```json
{
  "success": true,
  "dishes": [
    {
      "id": "dish_001",
      "originalName": "蚂蚁上树",
      "translatedName": "Stir-fried Vermicelli with Minced Pork",
      "price": 38.00,
      "currency": "CNY"
    }
  ],
  "totalCount": 15
}
```

---

## 3. 菜品详情分析

```
POST /api/dish
Content-Type: application/json

参数：
  originalName: string  # 原始菜名（必填）
  targetLang: string    # 目标翻译语言（必填）
  userLang: string      # 用户语言，默认 "zh"
  allergies: string[]   # 用户饮食禁忌/过敏原
```

**响应**：
```json
{
  "success": true,
  "dish": {
    "id": "dish_001",
    "originalName": "蚂蚁上树",
    "translatedName": "Stir-fried Vermicelli with Minced Pork",
    "ingredients": ["粉丝", "猪肉末", "豆瓣酱", "葱", "姜", "蒜"],
    "allergens": ["大豆", "小麦"],
    "userAllergyWarnings": ["大豆"],
    "description": "一道经典川菜，因肉末粘在粉丝上形似蚂蚁上树而得名。粉丝吸收肉香和酱香，口感滑嫩微辣，是家常下饭菜的代表。",
    "taste": {
      "spiciness": 2,
      "sweetness": 0,
      "saltiness": 3,
      "calories": "medium"
    },
    "culturalNote": "菜名源于视觉联想，体现了中国烹饪中'以形取名'的趣味传统。"
  }
}
```

---

## 4. 汇率查询

```
GET /api/exchange?from=CNY&to=USD
```

**响应**：
```json
{
  "success": true,
  "from": "CNY",
  "to": "USD",
  "rate": 0.14,
  "date": "2026-05-16"
}
```

---

## 5. 生成点单文案

```
POST /api/order
Content-Type: application/json

参数：
  dishes: [{ name, translatedName, quantity, price }]
  targetLang: string       # 当地语言
  totalLocal: number       # 当地货币总价
  totalConverted: number   # 换算后总价
  convertedCurrency: string
```

**响应**：
```json
{
  "success": true,
  "orderText": "I would like to order: 1x Stir-fried Vermicelli with Minced Pork, 2x Lion's Head Meatballs. Total: ¥128.00 (about $17.92). Thank you!",
  "orderTextLocal": "こちらの料理をお願いします：...",
  "totalLocal": 128.00,
  "totalConverted": 17.92,
  "convertedCurrency": "USD"
}
```

---

## 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "OCR_FAILED",
    "message": "无法识别菜单中的文字，请确保照片清晰"
  }
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| `OCR_FAILED` | 菜单识别失败 |
| `NO_DISHES` | 未识别到任何菜品 |
| `AI_TIMEOUT` | AI服务超时 |
| `INVALID_IMAGE` | 图片格式不支持 |
| `EXCHANGE_ERROR` | 汇率查询失败 |
