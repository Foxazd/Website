// backend/routes/followedComics.js

const express = require('express');
const router = express.Router();

// Giả sử bạn có một mô hình Comic và User
const Comic = require('../models/Comic');
const User = require('../models/User');

// Lấy danh sách các truyện mà người dùng đã theo dõi
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('followedComics');
    res.json(user.followedComics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching followed comics', error });
  }
});

module.exports = router;
