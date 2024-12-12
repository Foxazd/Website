// routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Đăng nhập quản trị viên
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, role: 'admin' });

    if (!user) return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng.' });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng.' });

    res.status(200).json({ message: 'Đăng nhập thành công!', role: user.role });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
