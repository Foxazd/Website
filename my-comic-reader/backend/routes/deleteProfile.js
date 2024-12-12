router.delete('/:username', async (req, res) => {
    try {
      const username = req.params.username;
  
      // Tìm người dùng trước khi xóa
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).json({ message: 'Tài khoản không tồn tại.' });
      }
  
      // Xóa người dùng khỏi MongoDB
      await User.deleteOne({ username });
  
      res.status(200).json({ message: 'Tài khoản đã được xóa thành công!' });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa tài khoản.' });
    }
  });
  