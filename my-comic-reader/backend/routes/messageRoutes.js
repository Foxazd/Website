const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Comic = require('../models/Comic'); // Import model Comic
const User = require('../models/User'); // Import model User

// Lấy tất cả tin nhắn và bổ sung thông tin truyện và người dùng (hàm GET)
router.get('/', async (req, res) => {
  try {
    // Lấy tất cả các tin nhắn
    const messages = await Message.find();

    // Kết hợp với dữ liệu truyện
    const messagesWithInfo = await Promise.all(
      messages.map(async (message) => {
        let messageWithInfo = { ...message._doc };

        // Kiểm tra nếu là thông báo loại 'newChapter'
        if (message.type === 'newChapter') {
          const comic = await Comic.findById(message.comicId);
          if (comic) {
            messageWithInfo = {
              ...messageWithInfo,
              comicTitle: comic.title,
              comicCover: comic.coverImage,
              chapterNumber: message.chapterNumber, // Lấy chapterNumber từ message
            };
          } else {
            // Nếu không tìm thấy comic, bạn có thể xử lý theo ý muốn (như log lỗi)
            messageWithInfo.comicTitle = 'Truyện không tồn tại';
            messageWithInfo.comicCover = null;
            messageWithInfo.chapterNumber = null;
          }
        }

        return messageWithInfo;
      })
    );

    res.json(messagesWithInfo);
  } catch (error) {
    console.error('Lỗi khi lấy tin nhắn:', error);
    res.status(500).json({ error: 'Lỗi khi lấy tin nhắn' });
  }
});

// Route POST để lấy tin nhắn dựa trên dữ liệu từ client (có thể là username)
router.post('/', async (req, res) => {
  try {
    const { username } = req.body; // Giả sử dữ liệu gửi từ client là username

    // Tìm tất cả tin nhắn của người dùng đó
    const messages = await Message.find({ username });

    // Kết hợp với dữ liệu truyện
    const messagesWithInfo = await Promise.all(
      messages.map(async (message) => {
        let messageWithInfo = { ...message._doc };

        // Thêm thông tin cho tin nhắn loại 'newChapter'
        if (message.type === 'newChapter') {
          const comic = await Comic.findById(message.comicId);
          if (comic) {
            messageWithInfo = {
              ...messageWithInfo,
              comicTitle: comic.title,
              comicCover: comic.coverImage,
              chapterNumber: message.chapterNumber, // Lấy từ tin nhắn chứ không phải từ comic
            };
          }
        }

        return messageWithInfo;
      })
    );

    res.json(messagesWithInfo);
  } catch (error) {
    console.error('Lỗi khi lấy tin nhắn:', error); // Log lỗi để dễ dàng gỡ lỗi
    res.status(500).json({ error: 'Lỗi khi lấy tin nhắn' });
  }
});


module.exports = router;
