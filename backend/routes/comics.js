const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Comic = require('../models/Comic');
const Message = require('../models/Message')
const ReadingHistory = require('../models/ReadingHistory'); 
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const mime = require('mime-types'); 
const fs = require('fs'); // Thư viện để xóa tệp

// Cấu hình multer để xử lý upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Thư mục lưu trữ file upload
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Lấy danh sách tất cả truyện
router.get('/', async (req, res) => {
  try {
    const comics = await Comic.find();
    res.json(comics);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách truyện' });
  }
});


// Lấy chi tiết một truyện theo ID
router.get('/:comicId', async (req, res) => {
  const { comicId } = req.params;
  try {
    const comic = await Comic.findById(comicId);
    if (!comic) {
      return res.status(404).json({ message: 'Truyện không tìm thấy' });
    }
    res.json(comic);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết truyện' });
  }
});

router.post('/', upload.single('coverImage'), async (req, res) => {
  const { title, author, category, description, chapters, status, isNew } = req.body;
  let coverImage = '';

  // Kiểm tra xem có file ảnh bìa không
  if (req.file) {
    // Kiểm tra định dạng tệp hình ảnh
    const mimeType = mime.lookup(req.file.originalname); // Lấy loại MIME của file
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']; // Các định dạng hình ảnh hợp lệ

    if (!validMimeTypes.includes(mimeType)) {
      return res.status(400).json({ 
        message: 'Định dạng ảnh không hợp lệ.',
        details: 'Vui lòng tải lên ảnh có định dạng JPG, JPEG, PNG hoặc WEBP.'
      });
    }

    coverImage = req.file.path; // Lưu đường dẫn file ảnh bìa
  }

  // Kiểm tra tất cả các trường bắt buộc
  if (!title || !author || !category || !chapters || !status) {
    return res.status(400).json({
      message: 'Thông tin truyện không đầy đủ.',
      details: 'Vui lòng cung cấp đầy đủ các trường: Tiêu đề, Tác giả, Danh mục, Chương, và Trạng thái.'
    });
  }

  try {
    // 1. Kiểm tra trùng lặp Tiêu đề
    const existingComicByTitle = await Comic.findOne({ title });
    if (existingComicByTitle) {
      return res.status(400).json({
        message: 'Truyện với tiêu đề này đã tồn tại.',
        details: 'Vui lòng chọn tiêu đề khác hoặc kiểm tra lại dữ liệu.'
      });
    }

    // 2. Kiểm tra trùng lặp Tác giả
    const existingComicByAuthor = await Comic.findOne({ author });
    if (existingComicByAuthor) {
      return res.status(400).json({
        message: 'Truyện của tác giả này đã tồn tại.',
        details: 'Vui lòng chọn tác giả khác hoặc kiểm tra lại dữ liệu.'
      });
    }

    // 3. Kiểm tra trùng lặp Danh mục
    const existingComicByCategory = await Comic.findOne({ category });
    if (existingComicByCategory) {
      return res.status(400).json({
        message: 'Truyện trong danh mục này đã tồn tại.',
        details: 'Vui lòng chọn một danh mục khác hoặc kiểm tra lại dữ liệu.'
      });
    }

    // Tạo một truyện mới
    const newComic = new Comic({
      title,
      author,
      category,
      description,
      chapters,
      status,
      coverImage,
      addedByAdmin: true,
      isNew: true, // Đánh dấu truyện mới được thêm
    });

    // Lưu truyện vào cơ sở dữ liệu
    const savedComic = await newComic.save();

    // Trả về truyện mới được thêm vào cơ sở dữ liệu
    res.status(201).json(savedComic);
  } catch (error) {
    console.error(error);  // Log chi tiết lỗi ra console để debug
    res.status(500).json({
      message: 'Lỗi khi thêm truyện vào cơ sở dữ liệu.',
      details: 'Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ nếu lỗi vẫn tiếp diễn.'
    });
  }
});


// Cập nhật thông tin truyện
router.put('/:comicId', upload.single('coverImage'), async (req, res) => {
  const { comicId } = req.params;
  const { title, author, category, description, status, chapters } = req.body; // chapters là số chương mới
  let coverImage = '';

  try {
    const comic = await Comic.findById(comicId);
    
    if (!comic) {
      return res.status(404).json({ message: 'Truyện không tìm thấy' });
    }

    // Xóa hình ảnh cũ nếu có
    if (comic.coverImage && req.file) {
      const oldImagePath = path.join(__dirname, '../', comic.coverImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Xóa tệp hình ảnh cũ
      }
    }

    // Cập nhật thông tin truyện
    coverImage = req.file ? req.file.path : comic.coverImage;

    // Cập nhật truyện với số chương mới
    const updatedComic = await Comic.findByIdAndUpdate(
      comicId,
      {
        title,
        author,
        category,
        description,
        status,
        chapters: Number(chapters), // Cập nhật trường chapters
        coverImage
      },
      { new: true }
    );

    // Tạo thông báo cho người dùng
    const message = new Message({
      type: 'newChapter', // Loại thông báo
      comicId: updatedComic._id,
      chapterNumber: updatedComic.chapters.toString(), // Gán số chương mới nhất dưới dạng chuỗi
      comicCover: updatedComic.coverImage,
      username: 'admin' // Hoặc ID của admin đang cập nhật
    });

    await message.save(); // Lưu thông báo vào database

    // Gửi phản hồi về truyện đã được cập nhật
    res.json(updatedComic);
  } catch (error) {
    console.error('Lỗi khi cập nhật truyện:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật truyện', error: error.message });
  }
});

// Cập nhật trạng thái truyện
router.put('/:comicId/status', async (req, res) => {
  const { comicId } = req.params;
  const { status } = req.body;
  try {
    const updatedComic = await Comic.findByIdAndUpdate(comicId, { status }, { new: true });
    res.json(updatedComic);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái truyện' });
  }
});

// Xóa truyện theo ID
router.delete('/:comicId', async (req, res) => {
  const { comicId } = req.params;
  try {
    const comic = await Comic.findByIdAndDelete(comicId);
    if (comic.coverImage) {
      const imagePath = path.join(__dirname, '../', comic.coverImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Xóa tệp hình ảnh khi xóa truyện
      }
    }
    res.json({ message: 'Xóa truyện thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa truyện' });
  }
});

router.post('/:id/view', async (req, res) => {
  const comicId = req.params.id;
  console.log('ID truyện:', comicId);

  try {
      const comic = await Comic.findById(comicId);
      if (!comic) {
          return res.status(404).json({ message: 'Truyện không tồn tại.' });
      }

      comic.views += 1; // Tăng lượt xem
      await comic.save(); // Lưu thay đổi vào cơ sở dữ liệu

      res.status(200).json({ message: 'Lượt xem đã được tăng lên.', views: comic.views });
  } catch (error) {
      console.error('Lỗi khi tăng lượt xem:', error);
      res.status(500).json({ message: 'Lỗi khi tăng lượt xem.' });
  }
});


// Endpoint để thích truyện
router.post('/:comicId/like', async (req, res) => {
  const { comicId } = req.params;

  try {
    const comic = await Comic.findById(comicId);
    if (!comic) {
      return res.status(404).json({ message: 'Truyện không tồn tại.' });
    }

    comic.likes += 1; // Tăng số lượt thích lên 1
    await comic.save(); // Lưu thay đổi vào cơ sở dữ liệu

    res.status(200).json({ message: 'Truyện đã được yêu thích.', likes: comic.likes });
  } catch (error) {
    console.error('Lỗi khi thích truyện:', error);
    res.status(500).json({ message: 'Lỗi khi thích truyện.' });
  }
});

// Route DELETE để bỏ thích một truyện
router.delete('/:id/like', async (req, res) => {
  const comicId = req.params.id;

  try {
      // Logic để bỏ thích truyện (giả định bạn có một trường thích trong cơ sở dữ liệu)
      const comic = await Comic.findById(comicId);
      if (!comic) {
          return res.status(404).json({ message: 'Comic not found' });
      }

      // Giả sử bạn có một trường `likes` trong comic
      comic.likes -= 1; // Hoặc logic để cập nhật thích
      await comic.save();

      res.status(200).json({ message: 'Unliked successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint để lấy số lượt thích của truyện
router.get('/:comicId/likes', async (req, res) => {
  const { comicId } = req.params;

  try {
    const comic = await Comic.findById(comicId);
    if (!comic) {
      return res.status(404).json({ message: 'Truyện không tồn tại.' });
    }

    // Trả về số lượt thích của truyện
    res.status(200).json({ likes: comic.likes });
  } catch (error) {
    console.error('Lỗi khi lấy số lượt thích:', error);
    res.status(500).json({ message: 'Lỗi khi lấy số lượt thích.' });
  }
});

// Endpoint để đánh giá truyện
router.post('/:id/rate', async (req, res) => {
  try {
      const { rating, username } = req.body; // Lấy rating và username từ request body
      const comicId = req.params.id; // Lấy ID của truyện từ URL

      // Tìm kiếm truyện theo ID
      const comic = await Comic.findById(comicId);
      if (!comic) {
          return res.status(404).json({ message: 'Truyện không tìm thấy' });
      }

      // Kiểm tra xem người dùng đã đánh giá chưa
      const existingRating = comic.ratings.find(r => r.username === username);
        if (existingRating) {
        // Thay vì trả về lỗi 400, gửi thông báo cho người dùng
          return res.json({ message: 'Bạn đã đánh giá truyện này rồi.' });
        }


      // Thêm đánh giá mới vào mảng ratings
      comic.ratings.push({ username, rating });

      // Tính toán lại điểm trung bình và tổng số người đánh giá
      comic.calculateAverageRating(); // Bạn cần đảm bảo hàm này tính toán lại đúng

      // Lưu cập nhật vào cơ sở dữ liệu
      await comic.save();

      res.status(200).json({ message: 'Đánh giá thành công', comic });
  } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error });
  }
});

// Route tìm truyện theo tiêu đề
router.get('/comics/title/:title', async (req, res) => {
  try {
    // Giải mã tiêu đề từ URL
    const title = decodeURIComponent(req.params.title);

    // Tìm kiếm truyện trong cơ sở dữ liệu theo tiêu đề
    const comic = await Comic.findOne({ title });

    // Nếu không tìm thấy truyện
    if (!comic) {
      return res.status(404).json({ message: 'Truyện không tìm thấy.' });
    }

    // Trả về dữ liệu truyện nếu tìm thấy
    res.json(comic);
  } catch (error) {
    // Ghi log lỗi ra console
    console.error('Server error:', error);

    // Trả về thông báo lỗi với mã 500
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// Lấy nội dung truyện theo tiêu đề và chương
router.get('/:title/chapters/:chapterNumber', async (req, res) => {
  const { title, chapterNumber } = req.params;

  // Tìm truyện theo title
  const comic = await Comic.findOne({ title });
  if (!comic) {
      return res.status(404).json({ message: 'Không tìm thấy truyện' });
  }

  // Tìm chương theo chapterNumber
  const chapter = comic.chapters.find(ch => ch.chapterNumber === parseInt(chapterNumber));
  if (!chapter) {
      return res.status(404).json({ message: 'Không tìm thấy chương' });
  }

  res.json(chapter.images); // Chỉ trả về danh sách hình ảnh
});


// Route thêm chương cho truyện
router.post('/:id/chapters', upload.array('images', 10), async (req, res) => {
  const { chapterNumber } = req.body;
  const images = req.files.map(file => file.path); // Lấy đường dẫn hình ảnh

  try {
      const comic = await Comic.findById(req.params.id);
      if (!comic) {
          return res.status(404).json({ message: 'Không tìm thấy truyện' });
      }

      comic.chapters.push({ chapterNumber: parseInt(chapterNumber), images });
      await comic.save();
      
      res.status(201).json({ message: 'Thêm chương thành công' });
  } catch (error) {
      res.status(500).json({ message: 'Lỗi khi thêm chương' });
  }
});

router.post('/:comicId/add-chapter', upload.array('images'), async (req, res) => {
  const { comicId } = req.params;
  const { chapterNumber } = req.body;
  const images = req.files.map(file => file.path);

  try {
    const comic = await Comic.findById(comicId);
    if (!comic) return res.status(404).send('Truyện không tìm thấy.');

    comic.chapters.push({ chapterNumber, images });
    await comic.save();

    res.status(201).send('Nội dung chương đã được thêm thành công.');
  } catch (error) {
    res.status(500).send('Lỗi khi thêm nội dung.');
  }
});

// API để tìm kiếm toàn bộ truyện
router.get('/search', async (req, res) => {
  try {
    const query = req.query.query ? { title: { $regex: req.query.query, $options: 'i' } } : {}; 
    const comics = await Comic.find(query);  // Lấy toàn bộ truyện nếu không có từ khóa tìm kiếm
    res.json(comics);
  } catch (error) {
    res.status(500).json({ error: 'Có lỗi xảy ra trong quá trình tìm kiếm' });
  }
});

// Lấy danh sách truyện mà người dùng đã thích
router.get('/likes/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const userFavorites = await User.findOne({ username }).populate('favorites'); // Giả sử bạn lưu danh sách yêu thích trong model User
    if (!userFavorites) {
      return res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }
    res.json({ favorites: userFavorites.favorites });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách yêu thích:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách yêu thích.' });
  }
});

router.get('/:id/has-read', async (req, res) => {
  const { id } = req.params; // Lấy id từ URL
  const { username } = req.query;

  // Tìm người dùng trong cơ sở dữ liệu
  const user = await User.findOne({ username });

  // Kiểm tra xem user có tồn tại hay không
  if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
  }

  // Kiểm tra nếu người dùng có id trong danh sách đã đọc
  const hasRead = user.readComics && Array.isArray(user.readComics) && user.readComics.includes(id);

  res.json({ hasRead });
});

router.post('/:comicId/has-read', async (req, res) => {
  const { comicId } = req.params; 
  const { username } = req.body;

  try {
      const hasRead = await ReadingHistory.hasReadComic(username, comicId);
      res.json({ hasRead });
  } catch (error) {
      console.error('Lỗi khi kiểm tra đã đọc:', error);
      res.status(500).json({ message: 'Lỗi khi kiểm tra đã đọc.' });
  }
});

router.post('/ranking', async (req, res) => {
  try {
      console.log('Bắt đầu truy vấn bảng xếp hạng...');

      // Lấy các truyện có lượt thích từ 0 trở lên, sắp xếp giảm dần và giới hạn 20 truyện
      const comics = await Comic.find({ likes: { $gte: 0 } })
                                .sort({ likes: -1 })
                                .limit(20)
                                .lean();

      if (comics.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy truyện nào.' });
      }

      // Trả về dữ liệu bảng xếp hạng
      res.status(200).json(comics); // Trả về danh sách comics
  } catch (error) {
      console.error('Lỗi khi lấy bảng xếp hạng:', error);
      res.status(500).json({ message: 'Lỗi khi lấy bảng xếp hạng. Vui lòng thử lại sau.' });
  }
});


module.exports = router;
