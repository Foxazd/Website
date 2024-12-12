const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Endpoint để lấy tất cả thông báo
router.get('/', async (req, res) => {
  try {
    const { type } = req.query; // Lấy loại thông báo từ tham số truy vấn

    // Nếu không có loại nào được chỉ định, trả về tất cả thông báo
    const filter = type ? { type } : {};

    // Lấy thông báo từ cơ sở dữ liệu với loại đã chỉ định
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }); // Sắp xếp theo thời gian giảm dần
    res.json(notifications);
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error('Lỗi khi lấy thông báo:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông báo.' });
  }
});


// Endpoint để gửi thông báo
router.post('/', async (req, res) => {
  const { userId, message, type } = req.body; // Thêm type vào destructuring

  if (!userId || !message || !type) { // Kiểm tra xem có thiếu thông tin nào không
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết' });
  }

  try {
      // Tạo thông báo mới
      const newNotification = new Notification({ userId, message, type }); // Gửi type vào constructor
      await newNotification.save();
      res.status(201).json(newNotification); // Trả về thông báo đã tạo
  } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ message: 'Lỗi khi tạo thông báo' });
  }
});


module.exports = router;
