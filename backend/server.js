const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db'); 
const userRoutes = require('./routes/userRoutes');
const offerRoutes = require('./routes/offers'); 
const updateProfileRoute = require('./routes/updateProfile');
const adminRoutes = require('./routes/admin');
const comicRoutes = require('./routes/comics');
const commentRoutes = require('./routes/commentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const favoriteRoutes = require('./routes/favorites'); 
const chapterRouter = require('./routes/chapterRouter');
const messageRoutes = require('./routes/messageRoutes'); 
const readingHistoryRoutes = require('./routes/readingHistoryRoutes');
const suggestedComicsRoutes = require('./routes/suggestedComicsRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const app = express();

// Kết nối đến MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Cấu hình để phục vụ tệp tĩnh từ thư mục 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Tuyến đường
app.use('/api/users', userRoutes); 
app.use('/api', offerRoutes); 
app.use('/api/profile', updateProfileRoute); 
app.use('/api/admin', adminRoutes);
app.use('/api/comics', comicRoutes);  
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/chapters', chapterRouter);
app.use('/api/messages', messageRoutes); 
app.use('/api/history', readingHistoryRoutes);
app.use('/api/suggestedComics', suggestedComicsRoutes); 
app.use('api/chatbot', chatbotRoutes);

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
