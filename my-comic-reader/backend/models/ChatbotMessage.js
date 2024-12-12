const mongoose = require('mongoose');

// Định nghĩa schema cho tin nhắn chatbot
const chatbotMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'bot'], // Chỉ có thể là 'user' hoặc 'bot'
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now, // Lưu thời gian gửi tin nhắn
  },
});

// Tạo model từ schema
const ChatbotMessage = mongoose.model('ChatbotMessage', chatbotMessageSchema);

module.exports = ChatbotMessage;
