import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import '../assets/css/style.css';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');  
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();  // Khởi tạo navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/reset-password', { username, newPassword });
      if (response.status === 200) {
        setMessage('Mật khẩu đã được cập nhật thành công.');
        setError('');
        setTimeout(() => {
          navigate('/login');  // Chuyển hướng đến trang đăng nhập sau 2 giây
        }, 2000);
      } else {
        setMessage('');
        setError('Có lỗi xảy ra. Vui lòng thử lại!');
      }
    } catch (error) {
      setMessage('');
      setError('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  return (
    <div className="login-container">
      <h2>Quên Mật Khẩu</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên người dùng:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Nhập tên người dùng của bạn"
          />
        </div>
        <div>
          <label>Mật khẩu mới:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Nhập mật khẩu mới"
          />
        </div>
        <button type="submit">Cập nhật mật khẩu</button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default ForgotPassword;
