const express = require('express');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const Comic = require('../models/Comic'); // Đảm bảo bạn đã import Comic nếu cần
const router = express.Router();

// Route để thêm vào danh sách yêu thích
router.post('/add', async (req, res) => {
    const { username, comicId } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        const comic = await Comic.findById(comicId); // Lấy thông tin truyện
        if (!comic) {
            return res.status(404).json({ message: 'Truyện không tồn tại' });
        }

        const userId = user._id;

        const existingFavorite = await Favorite.findOne({ user: userId, comic: comicId });
        if (existingFavorite) {
            return res.status(400).json({ message: 'Truyện đã có trong danh sách yêu thích' });
        }

        const newFavorite = new Favorite({ user: userId, comic: comicId });
        await newFavorite.save();

        return res.status(200).json({ 
            message: 'Thêm vào danh sách yêu thích thành công',
            username: user.username,
            comicTitle: comic.title // Thêm tên truyện vào phản hồi
        });
    } catch (error) {
        console.error('Lỗi khi thêm vào danh sách yêu thích:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi' });
    }
});

// Route để lấy danh sách yêu thích của người dùng
router.get('/:username', async (req, res) => {
  const { username } = req.params;

  try {
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(404).json({ message: 'Người dùng không tồn tại' });
      }

      const favorites = await Favorite.find({ user: user._id }).populate('comic');

      // Kiểm tra và trả về danh sách yêu thích mà không cần _id
      const responseFavorites = favorites.map(comic => {
          if (comic) {
              return {
                  title: comic.title, // Lấy tên truyện
                  author: comic.author // Lấy tác giả
              };
          } else {
              return null; // Hoặc xử lý theo cách khác nếu comic không tồn tại
          }
      }).filter(fav => fav !== null); // Loại bỏ null

      return res.status(200).json({ 
          message: 'Lấy danh sách yêu thích thành công',
          favorites: responseFavorites
      });
  } catch (error) {
      console.error('Lỗi khi lấy danh sách yêu thích:', error);
      res.status(500).json({ message: 'Đã xảy ra lỗi' });
  }
});

// Xuất router
module.exports = router;
