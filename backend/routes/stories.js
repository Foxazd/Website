// routes/stories.js
const express = require('express');
const router = express.Router();
const Comic = require('../models/Comic');
const User = require('../models/User');
const { sendEmailNotification } = require('../utils/mailer');

// Endpoint để admin cập nhật chap mới
router.post('/:comicId/update', async (req, res) => {
  const { comicId } = req.params;
  const { newChapter } = req.body;

  if (!newChapter || typeof newChapter !== 'number') {
    return res.status(400).json({ message: 'Chương mới không hợp lệ.' });
  }

  try {
    // Cập nhật chương mới trong cơ sở dữ liệu
    const comic = await Comic.findByIdAndUpdate(
      comicId,
      { chapters: newChapter },
      { new: true }
    );

    if (!comic) {
      return res.status(404).json({ message: 'Không tìm thấy truyện tranh.' });
    }

    // Lấy danh sách người dùng đang theo dõi truyện tranh này
    const users = await User.find({ followingComics: comicId });

    // Gửi thông báo qua email cho từng người dùng
    users.forEach(user => {
      sendEmailNotification(user.email, comic.title, newChapter);
    });

    res.status(200).json({ message: 'Chương mới đã được cập nhật và thông báo qua email đã được gửi.' });
  } catch (error) {
    console.error('Lỗi khi cập nhật chương mới:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật chương mới.' });
  }
});

module.exports = router;
