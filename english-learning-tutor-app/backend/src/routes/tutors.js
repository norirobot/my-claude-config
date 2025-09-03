const express = require('express');
const router = express.Router();

// 더미 tutors 라우트 (향후 구현 예정)
router.get('/', (req, res) => {
  res.json({ message: 'Tutors endpoint - Coming soon!' });
});

module.exports = router;