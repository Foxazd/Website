const mongoose = require('mongoose');

// Mô hình cho mỗi trang
const pageSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true, // Đường dẫn hình ảnh là bắt buộc
    },
});

// Mô hình cho mỗi chương
const chapterSchema = new mongoose.Schema({
    chapterNumber: {
        type: Number,
        required: true, // Số chương là bắt buộc
    },
    comicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comic', // Liên kết với mô hình Comic
        required: true,
    },
    pages: [pageSchema], // Mảng các trang cho chương này
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Tự động cập nhật `updatedAt` mỗi khi tài liệu được cập nhật
chapterSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Tạo mô hình
const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;
