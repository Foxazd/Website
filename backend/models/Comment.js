const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  comicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comic', // Liên kết với bảng Comic
    required: true,
  },
  user: {
    type: String,
    required: true, // Tên người dùng bình luận là bắt buộc
  },
  content: {
    type: String,
    required: true, // Nội dung bình luận là bắt buộc
  },
  timestamp: {
    type: Date,
    default: Date.now, // Ngày giờ hiện tại khi bình luận được tạo
  },
  read: {
    type: Boolean,
    default: false, // Đánh dấu bình luận đã đọc hay chưa
  },
  replies: [{
    user: { type: String, required: true }, // Tên người trả lời
    content: { type: String, required: true }, // Nội dung phản hồi
    createdAt: { type: Date, default: Date.now } // Thời gian phản hồi được tạo
  }],
  deleted: { 
    type: Boolean, 
    default: false // Đánh dấu bình luận đã bị xóa
  },
  deleteReason: { // Lý do bình luận bị xóa
    type: String, 
    default: '' // Mặc định là chuỗi rỗng nếu không có lý do
  },
  reason: { 
    type: String, 
    default: '' // Mặc định là chuỗi rỗng nếu không có lý do bình luận
  }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
