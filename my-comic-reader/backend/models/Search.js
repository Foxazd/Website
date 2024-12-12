// server/routes/search.js

const express = require('express');
const Comic = require('../models/Comic'); 
const router = express.Router();

router.get('/search', async (req, res) => {
  const query = req.query.query;
  try {
    const results = await Comic.find({ title: { $regex: query, $options: 'i' } });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tìm kiếm' });
  }
});

module.exports = router;
