const nodemailer = require('nodemailer');

// Tạo đối tượng transporter để gửi email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // Ví dụ: 'gmail'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Hàm gửi thông báo qua email
const sendEmailNotification = async (to, storyName, chapter) => {
  // Chuyển tên truyện thành chữ hoa
  const formattedStoryName = storyName.toUpperCase();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `TRUYỆN ${formattedStoryName} ĐÃ CẬP NHẬT ĐẾN CHAP ${chapter}`,
    text: `Xin chào,\n\nTruyện ${formattedStoryName} mà bạn theo dõi đã được cập nhật đến chap ${chapter}. Mời bạn đọc ngay!\n\nTrân trọng,\nĐội ngũ quản trị`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email đã được gửi tới ${to}`);
  } catch (error) {
    console.error(`Lỗi khi gửi email tới ${to}:`, error);
  }
};

module.exports = { sendEmailNotification };
