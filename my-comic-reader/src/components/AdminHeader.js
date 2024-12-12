import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaBook, FaUser, FaCog, FaSignOutAlt, FaComments } from 'react-icons/fa';
import logo from '../assets/images/logo1.png'; 
import '../assets/css/admin-header.css'; 

const AdminHeader = () => {
  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    window.location.href = '/login'; 
  };

  return (
    <header className="admin-header py-3 border-bottom">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <div className="header-logo">
            <Link to="/admin">
              <img src={logo} alt="Logo" style={{ maxHeight: '60px' }} />
            </Link>
          </div>
          <nav className="header-nav">
            <ul className="nav">
              <li className="nav-item">
                <Link to="/admin" className="nav-link">
                  <FaHome className="nav-icon" /> Trang Chủ
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/comics" className="nav-link">
                  <FaBook className="nav-icon" /> Quản lý Truyện
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/users" className="nav-link">
                  <FaUser className="nav-icon" /> Quản lý Người Dùng
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/comments" className="nav-link">
                  <FaComments className="nav-icon" /> Quản lý Bình Luận
                </Link>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-link">
                  <FaSignOutAlt className="nav-icon" /> Đăng Xuất
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
