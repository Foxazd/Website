const mongoose = require('mongoose');

const readingStatusSchema = new mongoose.Schema({
    username: { type: String, required: true },
    comicId: { type: String, required: true },
    // Các thuộc tính khác có thể có
});

const ReadingStatus = mongoose.model('ReadingStatus', readingStatusSchema);
module.exports = ReadingStatus;
