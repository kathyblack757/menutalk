const { Router } = require('express');

const router = Router();

router.get('/exchange', async (req, res) => {
  try {
    const { from = 'CNY', to = 'USD' } = req.query;
    const resp = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
    const data = await resp.json();

    res.json({
      success: true,
      from,
      to,
      rate: data.rates[to],
      date: data.date,
    });
  } catch {
    res.status(500).json({ success: false, error: { code: 'EXCHANGE_ERROR', message: '汇率查询失败' } });
  }
});

module.exports = router;
