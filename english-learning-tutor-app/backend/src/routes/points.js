const express = require('express');
const router = express.Router();

// 더미 points 라우트 (향후 구현 예정)
router.get('/', (req, res) => {
  res.json({ message: 'Points endpoint - Coming soon!' });
});

module.exports = router;