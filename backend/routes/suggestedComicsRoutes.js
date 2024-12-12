const express = require('express');
const router = express.Router();
const Comic = require('../models/Comic');
const ReadingHistory = require('../models/ReadingHistory'); // Import mô hình ReadingHistory

// Hàm để lấy thể loại truyện mà người dùng đã đọc
const getUserGenres = async (userId) => {
    try {
        // In ra userId để kiểm tra
        console.log('Fetching genres for userId:', userId);
        
        // Lấy tất cả lịch sử đọc của người dùng
        const userHistory = await ReadingHistory.find({ userId });

        // Nếu không tìm thấy lịch sử đọc nào, trả về một mảng rỗng
        if (userHistory.length === 0) {
            console.log('No reading history found for this user.');
            return [];
        }

        // Lấy comicId từ lịch sử đọc
        const comicIds = userHistory.map((history) => history.comicId); // Lấy comicId từ userHistory

        // Lấy thể loại từ bảng Comic dựa trên comicId
        const comics = await Comic.find({ _id: { $in: comicIds } });

        // Nếu không tìm thấy truyện nào, trả về một mảng rỗng
        if (comics.length === 0) {
            console.log('No comics found for the provided comic IDs.');
            return [];
        }

        // Trả về danh sách các thể loại mà người dùng đã đọc
        return [...new Set(comics.map((comic) => comic.category))]; // Sử dụng Set để loại bỏ các thể loại trùng lặp
    } catch (error) {
        console.error('Lỗi khi lấy thể loại người dùng đã đọc:', error);
        return [];
    }
};

// Gợi ý truyện cho người dùng
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId; // Lấy userId từ query parameters

        // Kiểm tra nếu không có userId
        if (!userId) {
            return res.status(400).json({ error: 'userId là bắt buộc' });
        }

        // Lấy thể loại mà người dùng đã đọc từ hàm getUserGenres
        const userGenres = await getUserGenres(userId);

        if (userGenres.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thể loại nào từ lịch sử đọc của người dùng' });
        }

        // Truy vấn các truyện gợi ý dựa trên thể loại mà người dùng đã đọc
        const suggestedComics = await Comic.find({ category: { $in: userGenres } }).limit(10); // Giới hạn số lượng truyện gợi ý

        // Trả về danh sách truyện gợi ý
        res.json(suggestedComics);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu gợi ý:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy dữ liệu gợi ý' });
    }
});

module.exports = router;
