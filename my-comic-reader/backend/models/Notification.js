const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  username: {
    type: String, // Hoặc type phù hợp với userId của bạn
   
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['registration', 'reason'], // Thêm 'registration' vào danh sách enum hợp lệ
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
