const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    username: { type: String, required: true },
    type: { type: String, required: true },
    comicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic' },
    chapterNumber: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

// Kiểm tra nếu mô hình đã được định nghĩa trước đó
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

module.exports = Message;
