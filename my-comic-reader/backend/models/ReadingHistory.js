const mongoose = require('mongoose');

const readingHistorySchema = new mongoose.Schema({
    username: { type: String, required: true }, // Dùng username thay vì userId
    comicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic', required: true }, // ID của truyện
    lastReadAt: { type: Date, default: Date.now }, // Ngày giờ đọc cuối cùng
    lastChapterRead: { type: Number, required: true }, // Chương đã đọc
    position: { type: String, required: false }, // Vị trí đọc (ID của hình ảnh hoặc bất kỳ định dạng nào bạn muốn)
    category: { type: String, required: true } // Thể loại của truyện
}, {
    timestamps: true, // Tự động thêm trường createdAt và updatedAt
});

// Thêm phương thức kiểm tra đã đọc
readingHistorySchema.statics.hasReadComic = async function(username, comicId) {
    const record = await this.findOne({ username, comicId });
    return !!record; // Trả về true nếu có bản ghi, false nếu không
};

// Tạo model từ schema
const ReadingHistory = mongoose.model('ReadingHistory', readingHistorySchema);

// Xuất model để sử dụng ở nơi khác
module.exports = ReadingHistory;
