const { Router } = require('express');

const router = Router();

router.get('/images', async (req, res) => {
  try {
    const query = req.query.query || 'food';
    const resp = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
      headers: { Authorization: process.env.PEXELS_API_KEY },
    });
    const data = await resp.json();
    const url = data.photos?.[0]?.src?.medium || data.photos?.[0]?.src?.original;
    if (url) return res.redirect(url);
    // 没找到图，返回占位
    res.redirect(`https://placehold.co/400x300/FDF6EC/C9A96E?text=${encodeURIComponent(query.substring(0, 20))}`);
  } catch {
    res.redirect('https://placehold.co/400x300/FDF6EC/C9A96E?text=No+Image');
  }
});

module.exports = router;
