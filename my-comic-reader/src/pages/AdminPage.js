import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminFooter from '../components/AdminFooter';
import AdminHeader from '../components/AdminHeader';
import ChartComponent from '../components/ChartComponent';
import '../assets/css/admin.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faUsers, faComments, faChartBar, faBars, faUser, faSignOutAlt, faBell } from '@fortawesome/free-solid-svg-icons';

const AdminPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [selectedChart, setSelectedChart] = useState('users');
  
  // Khởi tạo state từ localStorage
  const [totalUserCount, setTotalUserCount] = useState(() => {
    const savedUserCount = localStorage.getItem('totalUserCount');
    return savedUserCount ? Number(savedUserCount) : 0;
  });

  const [totalComicCount, setTotalComicCount] = useState(() => {
    const savedComicCount = localStorage.getItem('totalComicCount');
    return savedComicCount ? Number(savedComicCount) : 0;
  });

  const [totalCommentCount, setTotalCommentCount] = useState(() => {
    const savedCommentCount = localStorage.getItem('totalCommentCount');
    return savedCommentCount ? Number(savedCommentCount) : 0;
  });

  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    const storedUsername = localStorage.getItem('username');

    if (role !== 'admin') {
      navigate('/home');
    }

    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Gọi API để lấy thông báo về người dùng mới
    fetch('http://localhost:5000/api/notifications?type=registration')
      .then(response => response.json())
      .then(data => setNotifications(data))
      .catch(error => console.error('Lỗi khi lấy thông báo:', error));
  }, [navigate]);

  // Lưu vào localStorage khi giá trị state thay đổi
  useEffect(() => {
    localStorage.setItem('totalUserCount', totalUserCount);
  }, [totalUserCount]);

  useEffect(() => {
    localStorage.setItem('totalComicCount', totalComicCount);
  }, [totalComicCount]);

  useEffect(() => {
    localStorage.setItem('totalCommentCount', totalCommentCount);
  }, [totalCommentCount]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  }, [navigate]);

  const chartDetails = {
    users: {
      title: 'Quản lý Người Dùng',
      description: 'Thống kê số lượng người dùng mới và cũ theo tháng.',
      details: [
        'Người dùng mới: Được thêm trong tháng hiện tại.',
        'Người dùng cũ: Đã tồn tại trước tháng hiện tại.',
      ],
    },
    comics: {
      title: 'Quản lý Truyện',
      description: 'Thống kê số lượng truyện mới và cũ theo tháng.',
      details: [
        'Truyện mới: Được xuất bản trong tháng hiện tại.',
        'Truyện cũ: Đã tồn tại trước tháng hiện tại.',
      ],
    },
    comments: {
      title: 'Quản lý Bình Luận',
      description: 'Thống kê số lượng bình luận mới và cũ theo tháng.',
      details: [
        'Bình luận mới: Được tạo trong tháng hiện tại.',
        'Bình luận cũ: Đã tồn tại trước tháng hiện tại.',
      ],
    },
  };

  return (
    <div className="admin-page">
      <AdminHeader />
      <div className={`admin-sidebar ${menuOpen ? 'active' : ''}`}>
        <button
          className={`menu-toggle ${menuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <div className="sidebar-header">
          <FontAwesomeIcon icon={faUser} className="admin-icon" />
          <p className="username">{username}</p>
        </div>

        <div className="notifications">
          <FontAwesomeIcon icon={faBell} className="notification-icon" />
          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification._id} className="notification-item">
                  {notification.message}
                </div>
              ))
            ) : (
              <p>Không có thông báo nào.</p>
            )}
          </div>
        </div>

        <div className="menu-content">
          <div className="sidebar-menu">
            <a href="/admin/comics" className={`menu-item ${window.location.pathname === '/admin/comics' ? 'active' : ''}`}>
              <FontAwesomeIcon icon={faBook} className="icon" />
              <span>Quản lý Truyện</span>
            </a>
            <a href="/admin/users" className={`menu-item ${window.location.pathname === '/admin/users' ? 'active' : ''}`}>
              <FontAwesomeIcon icon={faUsers} className="icon" />
              <span>Quản lý Người Dùng</span>
            </a>
            <a href="/admin/comments" className={`menu-item ${window.location.pathname === '/admin/comments' ? 'active' : ''}`}>
              <FontAwesomeIcon icon={faComments} className="icon" />
              <span>Quản lý Bình Luận</span>
            </a>
            <button
              onClick={handleLogout}
              className="menu-item"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="icon" />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>
      </div>
      <div className="admin-content">
        <div className="admin-chart">
          <h2>Biểu Đồ Thống Kê</h2>
          <div className="chart-wrapper">
            <div className="chart">
              <ChartComponent />
            </div>
            <div className="chart-details">
              {Object.keys(chartDetails).map((chartKey) => (
                <div key={chartKey} className="chart-detail-item">
                  <h3>{chartDetails[chartKey].title}</h3>
                  <p>{chartDetails[chartKey].description}</p>
                  <ul>
                    {chartDetails[chartKey].details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="chart-statistics">
              <h3>Thống Kê Số Lượng</h3>
              <p>Số lượng người dùng: {totalUserCount}</p>
              <p>Số lượng truyện: {totalComicCount}</p>
              <p>Số lượng bình luận: {totalCommentCount}</p>
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminPage;
