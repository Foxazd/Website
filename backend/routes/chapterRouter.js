const express = require('express');
const multer = require('multer');
const Chapter = require('../models/Chapter');
const Comic = require('../models/Comic');
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage });

router.post('/:comicId/add-chapter', upload.array('pages'), async (req, res) => {
    const { comicId } = req.params;
    const { chapterNumber } = req.body; // Nhận chapterNumber từ body
    const chapterNum = parseInt(chapterNumber, 10); // Chuyển đổi thành số nguyên

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Không có hình ảnh nào được tải lên.' });
    }

    const newPages = req.files.map(file => ({
        imageUrl: file.path, // Lưu đường dẫn ảnh đã tải lên
    }));

    try {
        // Kiểm tra xem chương đã tồn tại hay chưa
        let chapter = await Chapter.findOne({ comicId, chapterNumber: chapterNum });

        if (chapter) {
            // Nếu chương đã tồn tại, thêm ảnh mới vào chương hiện tại
            chapter.pages.push(...newPages); // Kết hợp ảnh mới vào mảng ảnh cũ
            await chapter.save(); // Lưu lại chương với ảnh mới

            // Trả về thông tin tất cả các ảnh trong chương (cũ và mới)
            res.status(200).json({ message: 'Ảnh đã được thêm vào chương này!', pages: chapter.pages });
        } else {
            // Nếu chương chưa tồn tại, tạo chương mới với ảnh mới
            const newChapter = new Chapter({
                chapterNumber: chapterNum, // Số chương
                comicId,
                pages: newPages, // Thêm ảnh mới vào chương
            });
            await newChapter.save();

            // Trả về thông tin chương mới và các ảnh trong chương
            res.status(201).json({ message: 'Chương mới đã được thêm thành công!', chapter: newChapter });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thêm chương.', error });
    }
});


// Lấy thông tin chương theo comicId và chapterNumber
router.get('/:comicId/chapter/:chapterNumber', async (req, res) => {
    const { comicId, chapterNumber } = req.params;
    const chapterNum = parseInt(chapterNumber, 10); // Chuyển đổi thành số nguyên

    try {
        // Tìm chương theo comicId và chapterNumber
        let chapter = await Chapter.findOne({ comicId, chapterNumber: chapterNum });

        if (!chapter) {
            // Nếu chương không tồn tại, tạo chương mới (nếu cần) hoặc trả về thông báo không có ảnh
            chapter = new Chapter({
                comicId,
                chapterNumber: chapterNum,
                pages: [] // Tạo chương mới với mảng ảnh trống
            });
            await chapter.save();
            return res.status(200).json({ message: 'Chương chưa có ảnh, bạn có thể thêm ảnh vào chương này!', chapter });
        }

        res.status(200).json(chapter);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin chương.', error });
    }
});


// Cập nhật chương
router.put('/:comicId/chapter/:chapterNumber', upload.array('pages'), async (req, res) => {
    const { comicId, chapterNumber } = req.params;
    const chapterNum = parseInt(chapterNumber, 10); // Chuyển đổi thành số nguyên

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Không có hình ảnh nào được tải lên.' });
    }

    const pages = req.files.map(file => ({
        imageUrl: file.path
    }));

    try {
        const updatedChapter = await Chapter.findOneAndUpdate(
            { comicId, chapterNumber: chapterNum }, // Sử dụng chapterNum đã được chuyển đổi
            { $set: { pages: pages } },
            { new: true }
        );

        if (!updatedChapter) {
            return res.status(404).json({ message: 'Chương không tồn tại.' });
        }

        res.status(200).json({ message: 'Chương đã được cập nhật thành công!', chapter: updatedChapter });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật chương.', error });
    }
});

// Endpoint trong router
router.get('/:title/chapters/:chapterNumber', async (req, res) => {
    const { title, chapterNumber } = req.params;

    try {
        // Bước 1: Tìm `Comic` dựa trên `title`
        const comic = await Comic.findOne({ title });
        if (!comic) {
            return res.status(404).json({ message: 'Không tìm thấy truyện với tên này.' });
        }

        // Bước 2: Sử dụng `comic._id` để tìm `Chapter`
        const chapter = await Chapter.findOne({
            comicId: comic._id,
            chapterNumber: parseInt(chapterNumber) // Chuyển đổi thành số nguyên
        });

        if (!chapter) {
            return res.status(404).json({ message: 'Không tìm thấy chương này.' });
        }

        // Kiểm tra nếu mảng `pages` có tồn tại và chứa ảnh
        if (!chapter.pages || chapter.pages.length === 0) {
            return res.status(404).json({ message: 'Không có trang nào trong chương này.' });
        }

        // Trả về mảng `pages` chứa các URL hình ảnh
        res.json(chapter.pages);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Lỗi khi lấy thông tin chương.',
            error: error.message
        });
    }
});



module.exports = router;
