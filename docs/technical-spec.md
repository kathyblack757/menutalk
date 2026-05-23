# 菜根谭 MenuTalk — 技术规范

## 技术栈

| 层 | 技术 | 版本 | 说明 |
|-----|------|------|------|
| 前端框架 | React | 18.x | 组件化UI开发 |
| 构建工具 | Vite | 5.x | 快速HMR，开箱即用 |
| 样式方案 | Tailwind CSS | 3.x | 实用优先CSS框架 |
| 后端运行时 | Node.js | 20.x LTS | JavaScript运行时 |
| 后端框架 | Express | 4.x | 轻量HTTP服务 |
| AI服务 | OpenAI API | GPT-4o | OCR+翻译+分析 |
| 语音合成 | Web Speech API | 浏览器原生 | TTS朗读 |
| 汇率数据 | frankfurter.app | 免费API | 实时汇率 |
| 数据存储 | localStorage | 浏览器原生 | MVP阶段 |

## 项目结构

```
project/
├── CLAUDE.md
├── docs/
│   ├── requirements.md
│   ├── technical-spec.md
│   ├── design-spec.md
│   ├── execution-steps.md
│   └── api-design.md
├── dev-logs/
├── client/                # React 前端
│   ├── src/
│   │   ├── components/    # UI组件
│   │   ├── hooks/         # 自定义Hooks
│   │   ├── utils/         # 工具函数
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
└── server/                # Node.js 后端
    ├── routes/            # 路由处理
    ├── services/          # 业务逻辑
    └── index.js
```

## 前后端通信

- 前端开发服务器：`http://localhost:5173`
- 后端API服务器：`http://localhost:3001`
- Vite配置代理，将 `/api/*` 请求转发到后端
- 所有API返回JSON格式

## 数据格式

### 菜品对象
```json
{
  "id": "dish_001",
  "originalName": "蚂蚁上树",
  "translatedName": "Stir-fried Vermicelli with Minced Pork",
  "ingredients": ["粉丝", "猪肉末", "豆瓣酱", "葱姜蒜"],
  "allergens": ["大豆", "小麦"],
  "description": "一道经典川菜，因肉末粘在粉丝上形似蚂蚁上树而得名...",
  "taste": {
    "spiciness": 2,
    "sweetness": 0,
    "saltiness": 3,
    "calories": "medium"
  },
  "price": 38.00,
  "currency": "CNY"
}
```

## AI Prompt设计原则

- System Prompt设定为"跨文化美食专家"角色
- 要求返回结构化JSON，便于前端渲染
- 翻译时保留文化隐喻的解释
- 过敏原识别需包含常见14类过敏原

## 兼容性

- 目标浏览器：iOS Safari 14+、Android Chrome 90+
- 使用标准Web API，不依赖平台特定SDK
- 相机调用使用 `<input type="file" capture="environment">`
