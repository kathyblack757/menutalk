# 菜根谭 MenuTalk — AI助手指引

## 项目简介

**菜根谭（MenuTalk）**是一款面向出境游客的H5跨文化美食菜单翻译与点单助手。核心解决"看得见菜但看不懂菜名"的问题，尤其是中文菜名中的文化隐喻（如蚂蚁上树、狮子头）。

技术栈：React + Vite + Tailwind CSS（前端） / Node.js + Express（后端） / OpenAI API（AI能力）

## 规范文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 需求文档 | [docs/requirements.md](docs/requirements.md) | 项目背景、目标用户、功能需求 |
| 技术规范 | [docs/technical-spec.md](docs/technical-spec.md) | 技术栈、项目结构、数据格式 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | UI风格、色彩、布局、交互动画 |
| 执行步骤 | [docs/execution-steps.md](docs/execution-steps.md) | 分步实施计划（第0~9步） |
| API设计 | [docs/api-design.md](docs/api-design.md) | 后端接口定义 |

## 开发日志

每日开发日志存放于 [dev-logs/](dev-logs/) 文件夹，按日期命名（如 `2026-05-16.md`）。

### 每次开发会话结束时必须：
1. 在 `dev-logs/` 下创建/更新当天日期的日志文件
2. 记录 ✅ 已完成事项、📋 待办事项、⚠️ 遇到的问题与解决方案

### 每次开发会话开始时必须：
1. 读取最新的开发日志文件，了解当前进度
2. 检查待办事项，确定本次会话要完成的任务

## 工作约定

1. **渐进式开发**：每次只做1个模块，完成+验证后再进入下一步
2. **每步验证**：关键步骤完成后在手机浏览器中实际测试
3. **不跨步**：当前步骤未完成不开始下一步
4. **先问后改**：对方案有疑问时，先与用户沟通再动手
5. **保持简洁**：代码不写多余注释，组件职责单一
6. **安全第一**：API Key等敏感信息放在 `.env` 文件中，不提交到版本库

## 项目执行步骤

当前按 [docs/execution-steps.md](docs/execution-steps.md) 中的计划推进，共10步（第0步~第9步）。

## 项目根目录

`/Users/qwq/Desktop/毕业设计`
