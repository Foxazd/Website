import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../assets/css/style.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState('user');
  const navigate = useNavigate();

  const validateForm = () => {
    if (!username || !password) {
      setError('Tên người dùng và mật khẩu là bắt buộc.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const endpoint = role === 'admin' 
          ? 'http://localhost:5000/api/admin/login' 
          : 'http://localhost:5000/api/users/login';
      
      const response = await axios.post(endpoint, { username, password });

      if (response.status === 200) {
        setMessage('Đăng nhập thành công!');
        localStorage.setItem('username', username);
        localStorage.setItem('role', response.data.role);

        // Gửi trạng thái đăng nhập đến Service Worker
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'LOGIN_STATUS',
            username,
            role: response.data.role,
          });
        }

        // Kiểm tra trạng thái kết nối mạng và điều hướng tương ứng
        if (navigator.onLine) {
          // Nếu online, chuyển hướng đến /home
          if (response.data.role === 'admin') {
            navigate('/admin');  // Admin chuyển hướng đến /admin
          } else {
            navigate('/home');   // Người dùng bình thường chuyển hướng đến /home
          }
        } else {
          // Nếu offline, chuyển hướng đến /comics
          navigate('/comics');   // Chuyển hướng đến /comics khi không có kết nối mạng
        }

      } else {
        setMessage('');
        setError(response.data.message || 'Đăng nhập không thành công!');
      }
    } catch (error) {
      setMessage('');
      setError('Đăng nhập không thành công! Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên người dùng:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Nhập tên người dùng"
          />
        </div>
        <div>
          <label>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Nhập mật khẩu"
          />
        </div>
        <div>
          <label>Vai trò:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">Người dùng</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      <p className="register-link">
        Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
      </p>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Login;
