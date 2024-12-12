const express = require('express');
const router = express.Router();
const ChatbotMessage = require('../models/ChatbotMessage');
const Comic = require('../models/Comic'); 

router.post('/', async (req, res) => {
  const userMessage = req.body.message;

  try {
    // Lưu tin nhắn của người dùng vào cơ sở dữ liệu
    const userMessageRecord = new ChatbotMessage({
      sender: 'user',
      text: userMessage,
    });
    await userMessageRecord.save();

    // Kiểm tra nếu tin nhắn có chứa yêu cầu về comic
    const lowerCaseMessage = userMessage.toLowerCase();

    let botResponse = 'Xin lỗi, tôi không hiểu câu hỏi của bạn.';

    if (lowerCaseMessage.includes('tên comic')) {
      // Ví dụ: Người dùng hỏi "Tên comic XYZ"
      const comicName = userMessage.split('Tên comic')[1].trim();
      const comic = await Comic.findOne({ name: comicName });

      if (comic) {
        botResponse = `Tên comic là ${comic.name}, tác giả: ${comic.author}, mô tả: ${comic.description}.`;
      } else {
        botResponse = `Xin lỗi, tôi không tìm thấy comic có tên "${comicName}".`;
      }
    } else if (lowerCaseMessage.includes('số tập')) {
      // Ví dụ: Người dùng hỏi "Comic ABC có bao nhiêu tập?"
      const comicName = userMessage.split('số tập')[1].trim();
      const comic = await Comic.findOne({ name: comicName });

      if (comic) {
        botResponse = `${comic.name} có tổng cộng ${comic.totalChapters} tập.`;
      } else {
        botResponse = `Xin lỗi, tôi không tìm thấy comic có tên "${comicName}".`;
      }
    }

    // Lưu phản hồi của chatbot vào cơ sở dữ liệu
    const botMessageRecord = new ChatbotMessage({
      sender: 'bot',
      text: botResponse,
    });
    await botMessageRecord.save();

    // Trả về phản hồi cho frontend
    res.json({ response: botResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi khi xử lý tin nhắn' });
  }
});

module.exports = router;
