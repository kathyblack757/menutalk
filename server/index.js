require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 路由
app.use('/api', require('./routes/ocr'));
app.use('/api', require('./routes/dish'));
app.use('/api', require('./routes/order'));
app.use('/api', require('./routes/exchange'));
app.use('/api', require('./routes/images'));

app.listen(PORT, () => {
  console.log(`MenuTalk server running on http://localhost:${PORT}`);
});
