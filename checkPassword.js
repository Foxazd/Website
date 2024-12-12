const bcrypt = require('bcrypt');

// Mật khẩu băm bạn đang có
const hashedPassword = '$2b$10$wz3LL97cfWZt/ZDV4ASLI.g8Ted4d9xIp.Tl4k1tcO8EJzpRHKdra';

// Mật khẩu bạn muốn kiểm tra
const passwordToCheck = 'admin'; // Thay thế bằng mật khẩu gốc mà bạn muốn kiểm tra

// So sánh mật khẩu
bcrypt.compare(passwordToCheck, hashedPassword, (err, result) => {
  if (err) {
    console.error('Lỗi khi so sánh mật khẩu:', err);
  } else {
    console.log('Mật khẩu khớp:', result); // true nếu khớp, false nếu không
  }
});
