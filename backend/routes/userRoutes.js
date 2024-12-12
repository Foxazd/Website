const express = require('express');
const User = require('../models/User');
const Comic = require('../models/Comic');
const bcrypt = require('bcrypt'); 
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');
const router = express.Router();

// Route để đăng ký người dùng mới
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Kiểm tra xem tên người dùng đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên người dùng đã tồn tại.' });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email đã tồn tại.' });
    }

    // Tạo người dùng mới
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Thêm thông báo mới nếu cần
    const newNotification = new Notification({
      message: `Người dùng mới đã đăng ký: ${newUser.username}`,
      type: 'registration'
    });
    await newNotification.save();

    res.status(201).json({ message: 'Đăng ký thành công!', newUser });
  } catch (error) {
    console.error('Lỗi khi đăng ký người dùng:', error);
    res.status(500).json({ message: 'Đăng ký không thành công.' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Tìm người dùng dựa trên tên người dùng
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Tên người dùng không hợp lệ' });
    }

    // In ra mật khẩu người dùng nhập vào và mật khẩu đã băm từ cơ sở dữ liệu
    console.log('Password entered:', password);
    console.log('Hashed password in DB:', user.password);

    // So sánh mật khẩu nhập vào với mật khẩu đã băm
    const isMatch = await bcrypt.compare(password.trim(), user.password); // Sử dụng trim()

    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không chính xác' });
    }

    res.json({ message: 'Đăng nhập thành công' });
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error); // Log lỗi để kiểm tra
    res.status(500).json({ message: 'Lỗi khi đăng nhập' });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng' });
  }
});

// Route xóa người dùng theo ID
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }
    res.json({ message: 'Người dùng đã bị xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa người dùng' });
  }
});

// Cập nhật thông tin người dùng
router.put('/:id', async (req, res) => {
  try {
    const { username, email } = req.body; // Dữ liệu cần cập nhật từ request body
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { username, email },  // Cập nhật các trường username và email
      { new: true }  // Trả về người dùng sau khi cập nhật
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    res.json(updatedUser);  // Trả về dữ liệu người dùng đã cập nhật
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật thông tin người dùng' });
  }
});

// Endpoint để lấy số lượng người dùng mới và cũ trong tháng hiện tại
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Ngày đầu tháng hiện tại

    // Tính số lượng người dùng mới trong tháng hiện tại
    const newUsersCount = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Tính số lượng người dùng cũ
    const totalUsersCount = await User.countDocuments();
    const oldUsersCount = totalUsersCount - newUsersCount;

    res.json({
      newUsers: newUsersCount,
      oldUsers: oldUsersCount
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng' });
  }
});

// Lấy danh sách yêu thích của người dùng
router.get('/favorites', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('favorites');
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }
    res.json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách yêu thích' });
  }
});

// Thêm một truyện vào danh sách yêu thích của người dùng
router.post('/:id/favorites/add/:comicId', async (req, res) => {
  try {
    const { id, comicId } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }
    if (!user.favorites.includes(comicId)) {
      user.favorites.push(comicId);
      await user.save();
    }
    res.json({ message: 'Đã thêm vào danh sách yêu thích' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm vào danh sách yêu thích' });
  }
});

// Gỡ bỏ một truyện khỏi danh sách yêu thích của người dùng
router.post('/:id/favorites/remove/:comicId', async (req, res) => {
  try {
    const { id, comicId } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }
    user.favorites = user.favorites.filter(favId => favId.toString() !== comicId);
    await user.save();
    res.json({ message: 'Đã gỡ bỏ khỏi danh sách yêu thích' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi gỡ bỏ khỏi danh sách yêu thích' });
  }
});

// Route để lấy cấp bậc của người dùng
router.get('/level/:username', async (req, res) => {
  const { username } = req.params;

  try {
      // Giả sử bạn có phương thức để tìm người dùng theo username
      const user = await User.findOne({ username });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Lấy cấp bậc của người dùng (thay đổi theo cách bạn định nghĩa cấp bậc)
      const userLevel = user.level; 

      res.status(200).json({ username, level: userLevel });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});

// Định nghĩa route cập nhật cấp bậc tài khoản
router.put('/updateLevel/:id', async (req, res) => {
  const userId = req.params.id;
  const { accountLevel } = req.body;

  // Tìm và cập nhật người dùng trong cơ sở dữ liệu
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).send({ message: 'Người dùng không tồn tại' });
  }

  user.accountLevel = accountLevel;
  await user.save();
  res.send(user);
});

// Cập nhật cấp bậc tự động dựa trên số lượng truyện đã đọc
const getAccountLevel = (comicsRead) => {
  switch (true) {
      case comicsRead >= 50:
          return 'Level 10'; // Cấp độ cao nhất
      case comicsRead >= 40:
          return 'Level 9';  // Cấp độ 9
      case comicsRead >= 30:
          return 'Level 8';  // Cấp độ 8
      case comicsRead >= 20:
          return 'Level 7';  // Cấp độ 7
      case comicsRead >= 15:
          return 'Level 6';  // Cấp độ 6
      case comicsRead >= 10:
          return 'Level 5';  // Cấp độ 5
      case comicsRead >= 5:
          return 'Level 4';  // Cấp độ 4
      case comicsRead >= 3:
          return 'Level 3';  // Cấp độ 3
      case comicsRead >= 1:
          return 'Level 2';  // Cấp độ 2
      default:
          return 'Bình thường'; // Cấp độ mặc định
  }
};

router.put('/:username/comicsRead', async (req, res) => {
  const { title } = req.body; // Lấy title từ body
  const { username } = req.params;

  // Kiểm tra title có phải là một chuỗi không rỗng không
  if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Giá trị title không hợp lệ' });
  }

  try {
      // Tìm người dùng dựa trên tên người dùng
      const user = await User.findOne({ username });

      // Kiểm tra xem người dùng có tồn tại không
      if (!user) {
          return res.status(404).json({ message: 'Người dùng không tìm thấy' });
      }

      // Tìm comic dựa trên title
      const comic = await Comic.findOne({ title }); // Thay đổi này

      // Kiểm tra xem comic có tồn tại không
      if (!comic) {
          return res.status(404).json({ message: 'Truyện không tìm thấy' });
      }

      // Cập nhật số lượng truyện đã đọc
      user.comicsRead += 1; // Tăng số lượng truyện đã đọc

      // Cập nhật cấp bậc tài khoản dựa trên số lượng truyện đã đọc
      user.accountLevel = getAccountLevel(user.comicsRead);

      // Lưu thay đổi vào cơ sở dữ liệu
      await user.save();

      // Trả về thông tin người dùng đã cập nhật
      res.status(200).json({
          message: 'Số lượng truyện đã đọc được cập nhật thành công',
          user: {
              username: user.username,
              comicsRead: user.comicsRead,
              accountLevel: user.accountLevel
          }
      });
  } catch (error) {
      console.error('Lỗi khi cập nhật comicsRead:', error); // Log lỗi để kiểm tra
      res.status(500).json({ message: 'Lỗi khi cập nhật số lượng truyện đã đọc', error });
  }
});

router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    // Tìm người dùng trong cơ sở dữ liệu theo tên người dùng
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Không tìm thấy người dùng này trong hệ thống!' });
    }

    // Băm mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới đã băm vào cơ sở dữ liệu
    user.password = hashedPassword;
    await user.save();

    // Trả về phản hồi thành công
    res.status(200).json({ message: 'Mật khẩu đã được cập nhật thành công.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' });
  }
});

module.exports = router;