const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Route để lấy thông tin hồ sơ
router.get('/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin hồ sơ' });
  }
});

// Route để lưu thông tin hồ sơ
router.post('/saveProfile', async (req, res) => {
  const { username, email, province, gender, birthday, phone} = req.body;

  try {
    let user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    // Chuyển đổi ngày sinh thành định dạng yyyy-MM-dd
    const formattedBirthday = new Date(birthday).toISOString().split('T')[0]; 

    // Cập nhật thông tin hồ sơ
    user.email = email;
    user.province = province;
    user.gender = gender;
    user.birthday = formattedBirthday; 
    user.phone = phone;

    await user.save();
    res.json({ message: 'Thông tin hồ sơ đã được lưu' });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ message: 'Lỗi khi lưu thông tin hồ sơ' });
  }
});


module.exports = router;
