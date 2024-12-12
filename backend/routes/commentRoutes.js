const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Comic = require('../models/Comic');  // Đảm bảo đã có model Comic

// GET all comments with comic title
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate({
        path: 'comicId',
        select: 'title',  // Lấy trường title từ bảng Comic
      })
      .sort({ timestamp: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy bình luận', error });
  }
});

// GET comments by comicId with comic title
router.get('/:id', async (req, res) => {
  try {
    const comments = await Comment.find({ comicId: req.params.id })
      .populate({
        path: 'comicId',
        select: 'title',  // Lấy trường title từ bảng Comic
      })
      .sort({ timestamp: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy bình luận', error });
  }
});

// POST a new comment
router.post('/:id', async (req, res) => {
  const { id } = req.params;
  const { user, content } = req.body;

  if (!user || !content) {
    return res.status(400).json({ error: 'Tác giả và nội dung bình luận không được bỏ trống' });
  }

  try {
    const newComment = new Comment({ comicId: id, user, content });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm bình luận', error });
  }
});

// PUT update comment
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { content, read } = req.body;

  try {
    const updatedComment = await Comment.findByIdAndUpdate(id, { content, read }, { new: true });
    if (!updatedComment) {
      return res.status(404).json({ message: 'Bình luận không tìm thấy' });
    }
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật bình luận', error });
  }
});

// DELETE a comment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Tìm và xóa bình luận
    const deletedComment = await Comment.findByIdAndDelete(id);
    if (!deletedComment) {
      return res.status(404).json({ message: 'Bình luận không tìm thấy' });
    }

    // Trả về phản hồi thành công
    res.status(200).json({ message: 'Bình luận đã bị xóa thành công' });
  } catch (error) {
    // Trả về lỗi nếu có sự cố trong quá trình xóa
    console.error('Error deleting comment:', error); // In ra lỗi
    res.status(500).json({ message: 'Lỗi khi xóa bình luận', error });
  }
});

// POST a reply to a comment
router.post('/:id/reply', async (req, res) => {
  const { id } = req.params; // ID của bình luận gốc
  const { user, content } = req.body; // Thông tin phản hồi

  try {
    // Tìm bình luận gốc bằng ID
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Bình luận không tìm thấy' });
    }

    // Tạo phản hồi mới
    const newReply = {
      user,
      content,
      createdAt: new Date(),
    };

    // Thêm phản hồi vào bình luận gốc
    comment.replies.push(newReply);
    await comment.save();

    res.status(201).json(newReply);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo phản hồi', error });
  }
});

// Route xóa phản hồi
router.delete('/:commentId/reply/:replyIndex', async (req, res) => {
  const { commentId, replyIndex } = req.params;

  try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
          return res.status(404).json({ message: 'Bình luận không tồn tại' });
      }

      comment.replies.splice(replyIndex, 1); // Xóa phản hồi tại vị trí replyIndex
      await comment.save();

      res.status(200).json({ message: 'Đã xóa phản hồi thành công' });
  } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa phản hồi', error });
  }
});

module.exports = router;
