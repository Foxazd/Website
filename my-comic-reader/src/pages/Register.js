import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../assets/css/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faUserPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!username || !password || !email || !confirmPassword) {
      setError('Tất cả các trường đều bắt buộc.');
      return false;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp.');
      return false;
    }
    if (!/^[a-zA-Z]/.test(email)) {
      setError('Email phải bắt đầu bằng chữ cái.');
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
      const response = await axios.post('http://localhost:5000/api/users/register', { username, password, email });

      if (response.status === 201) { 
        setMessage('Đăng ký thành công!');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setEmail('');
        navigate('/login'); 
      } else {
        setMessage('');
        setError(response.data.message);
      }
    } catch (error) {
      setMessage('');
      setError('Đăng ký không thành công! Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/login'); 
  };

  return (
    <div className="register-container">
      <h2>Đăng ký</h2>
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
        <div className="password-container">
          <label>Mật khẩu:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Nhập mật khẩu"
          />
          <FontAwesomeIcon
            icon={showPassword ? faEye : faEyeSlash}
            onClick={() => setShowPassword(!showPassword)}
            className="password-icon"
          />
        </div>
        <div className="password-container">
          <label>Xác nhận mật khẩu:</label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Nhập lại mật khẩu"
          />
          <FontAwesomeIcon
            icon={showConfirmPassword ? faEye : faEyeSlash}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="password-icon"
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Nhập email"
          />
        </div>
        <div className="button-group">
          <button type="button" className="back-button" onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} className="button-icon" />
            Quay lại
          </button>
          <button type="submit" disabled={loading}>
            <FontAwesomeIcon icon={faUserPlus} className="button-icon" />
            {loading ? ' Đang đăng ký...' : ' Đăng ký'}
          </button>
        </div>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Register;
