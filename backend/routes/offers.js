const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');

router.post('/offers', async (req, res) => {
  try {
    // Xóa các ưu đãi hiện có (tùy chọn)
    await Offer.deleteMany({});

    // Chèn các ưu đãi mới
    await Offer.insertMany(req.body);
    
    res.status(200).json({ message: 'Offers saved successfully' });
  } catch (error) {
    console.error('Error saving offers:', error);
    res.status(500).json({ message: 'Error saving offers' });
  }
});

module.exports = router;
