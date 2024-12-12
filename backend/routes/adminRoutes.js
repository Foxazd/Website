const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Endpoint để lấy tất cả hoạt động
router.get('/admin/recent-activities', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ time: -1 });
    res.json(activities);
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu hoạt động:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu hoạt động.' });
  }
});

module.exports = router;
