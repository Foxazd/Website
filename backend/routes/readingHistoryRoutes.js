const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const ReadingHistory = require('../models/ReadingHistory');
const User = require('../models/User'); 

// Route để lưu lịch sử đọc
router.post('/', async (req, res) => {
    const { username, comicId, lastChapterRead, category } = req.body;

    console.log('Giá trị username nhận được:', username); // Kiểm tra giá trị username

    // Kiểm tra xem username có hợp lệ không
    if (!username || username === "undefined") {
        return res.status(400).json({ message: 'Username không hợp lệ.' });
    }

    try {
        // Tạo mới lịch sử đọc
        const history = new ReadingHistory({
            username,
            comicId,
            lastChapterRead,
            category,
        });

        await history.save();
        res.status(201).json({ message: 'Lịch sử đọc đã được lưu.' });
    } catch (error) {
        console.error('Lỗi khi lưu lịch sử đọc:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lưu lịch sử đọc.' });
    }
});


// Route lấy lịch sử đọc dựa trên username
router.get('/:username', async (req, res) => {
    const { username } = req.params; // Lấy username từ route parameters

    // Kiểm tra xem username có hợp lệ không
    if (!username || username === "undefined") {
        return res.status(400).json({ message: 'Username không hợp lệ.' });
    }

    try {
        // Tìm lịch sử đọc dựa trên username
        const histories = await ReadingHistory.find({ username });

        // Nếu không tìm thấy lịch sử, trả về mảng rỗng
        if (!histories.length) {
            return res.status(200).json([]); // Trả về mảng rỗng thay vì lỗi 404
        }

        res.status(200).json(histories);
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử đọc:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy lịch sử đọc.' });
    }
});

// Route lấy tất cả lịch sử đọc
router.get('/', async (req, res) => {
    try {
        // Lấy tất cả lịch sử đọc từ cơ sở dữ liệu
        const histories = await ReadingHistory.find();

        // Nếu không có lịch sử đọc
        if (!histories.length) {
            return res.status(404).json({ message: 'Không có lịch sử đọc nào.' });
        }

        res.status(200).json(histories);
    } catch (error) {
        console.error('Lỗi khi lấy tất cả lịch sử đọc:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy lịch sử đọc.' });
    }
});

// Route lấy danh sách truyện gợi ý dựa trên lịch sử đọc của username
router.get('/suggestedComics', async (req, res) => {
    const { username } = req.query; // Lấy username từ query parameters

    // Kiểm tra xem username có hợp lệ không
    if (!username || username === "undefined") {
        return res.status(400).json({ message: 'Username không hợp lệ.' });
    }

    try {
        // Tìm lịch sử đọc dựa trên username
        const history = await ReadingHistory.find({ username }).populate('comicId');

        // Nếu người dùng chưa có lịch sử đọc, trả về mảng rỗng
        if (!history.length) {
            return res.status(200).json([]); // Trả về mảng rỗng nếu không có lịch sử
        }

        // Lấy tất cả thể loại và tác giả mà người dùng đã đọc (loại bỏ trùng lặp)
        const categoriesRead = [...new Set(history.map(h => h.comicId.category))];
        const authorsRead = [...new Set(history.map(h => h.comicId.author))];

        // Tìm các truyện trong cùng thể loại hoặc cùng tác giả, ngoại trừ các truyện mà người dùng đã đọc
        const suggestedComics = await Comic.find({
            $or: [
                { category: { $in: categoriesRead } },  // Truyện có cùng thể loại
                { author: { $in: authorsRead } }       // Truyện có cùng tác giả
            ],
            _id: { $nin: history.map(h => h.comicId._id) } // Loại trừ truyện đã đọc
        }).limit(10); // Giới hạn số truyện gợi ý

        res.status(200).json(suggestedComics); // Trả về danh sách truyện gợi ý
    } catch (error) {
        console.error('Lỗi khi lấy gợi ý truyện:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy gợi ý truyện.' });
    }
});

// Xuất router
module.exports = router;
