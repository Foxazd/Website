import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo1.png';
import '../assets/css/style.css';
import { FaHome, FaBook, FaInfoCircle, FaUser, FaSignOutAlt, FaUserEdit, FaUserPlus, FaHeart, FaComment } from 'react-icons/fa';
import SearchBar from './SearchBar';
import axios from 'axios';

const Header = () => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [comics, setComics] = useState([]);
  const [accountLevel, setAccountLevel] = useState('');
  const [comicsRead, setComicsRead] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Kiểm tra trạng thái kết nối mạng
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const navigate = useNavigate();

  // Lấy thông tin người dùng từ localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    const savedRole = localStorage.getItem('role');

    if (savedUsername) {
      setUsername(savedUsername);
    }
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  // Lấy danh sách người dùng từ API
  useEffect(() => {
    const fetchUserData = async () => {
      if (username) {
        try {
          const response = await axios.get('http://localhost:5000/api/users');
          const user = response.data.find(u => u.username === username);

          if (user) {
            setAccountLevel(user.accountLevel);
            setComicsRead(user.comicsRead);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [username]);

  // Kiểm tra kết nối mạng (online/offline)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up khi component unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Hiện/ẩn menu hồ sơ
  const toggleProfileMenu = useCallback(() => {
    setProfileMenuOpen(prevState => !prevState);
  }, []);

  // Đăng xuất
  const handleLogout = useCallback(() => {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  }, [navigate]);

  // Điều hướng đến trang admin nếu là admin
  useEffect(() => {
    if (role === 'admin') {
      navigate('/admin');
    }
  }, [role, navigate]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedMessages = JSON.parse(localStorage.getItem('messages') || '[]');
      const unreadCount = savedMessages.filter(message => message.type === 'newChapter').length;
      setUnreadMessagesCount(unreadCount);
      console.log('Updated unread messages count:', unreadCount);
    };

    window.addEventListener('storage', handleStorageChange);

    // Lắng nghe sự kiện 'storage' để cập nhật lại số lượng tin nhắn chưa đọc khi thay đổi
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Tìm kiếm truyện
  const handleSearch = async (query) => {
    try {
      const response = await axios.get('http://localhost:5000/api/comics');

      if (Array.isArray(response.data)) {
        const filteredComics = query
          ? response.data.filter(comic =>
            comic.title.toLowerCase().includes(query.toLowerCase())
          )
          : response.data;

        setComics(filteredComics);
        console.log('Tìm kiếm:', filteredComics);
      } else {
        console.error('Dữ liệu trả về không phải là mảng:', response.data);
      }
    } catch (error) {
      console.error('Error searching comics:', error);
    }
  };

  const updateComicsRead = async (newComicsRead) => {
    console.log('Số lượng truyện đã đọc mới:', newComicsRead);
    try {
      const response = await axios.put(`http://localhost:5000/api/users/${username}/comicsRead`, {
        comicsRead: newComicsRead
      });
      console.log('Cập nhật thành công:', response.data);
      setAccountLevel(response.data.accountLevel);
      setComicsRead(newComicsRead);
    } catch (error) {
      console.error('Error updating comicsRead:', error);
    }
  };

  return (
    <header className={`header py-3`}>
      <div className="container d-flex">
        <div className="header-logo">
          <Link to="/home">
            <img src={logo} alt="Logo" className="img-fluid" style={{ maxHeight: '60px' }} />
          </Link>
        </div>

        <SearchBar onSearch={handleSearch} comics={comics} />

        <nav className="header-nav d-flex align-items-center">
          <ul className="nav d-flex align-items-center mb-0">
            <li className="nav-item mx-2">
              <Link to="/home" className={`nav-link d-flex align-items-center ${!isOnline ? 'disabled' : ''}`}>
                <FaHome className="nav-icon" aria-label="Trang chủ" />
                <span className="ms-2">Trang chủ</span>
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link to="/comics" className={`nav-link d-flex align-items-center ${!isOnline ? 'disabled' : ''}`}>
                <FaBook className="nav-icon" aria-label="Truyện" />
                <span className="ms-2">Truyện</span>
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link to="/about" className={`nav-link d-flex align-items-center ${!isOnline ? 'disabled' : ''}`} aria-label="Giới thiệu">
                <FaInfoCircle className="nav-icon" />
                <span className="ms-2">Giới thiệu</span>
              </Link>
            </li>
            <li className="nav-item mx-2 d-none d-md-block">
              <Link to="/register" className={`nav-link d-flex align-items-center ${!isOnline ? 'disabled' : ''}`} aria-label="Đăng ký">
                <FaUserPlus className="nav-icon" />
                <span className="ms-2">Đăng ký</span>
              </Link>
            </li>

            <li className="nav-item mx-2">
              <div
                className="nav-link d-flex align-items-center "
                onClick={toggleProfileMenu}
                aria-label="Menu hồ sơ"
                style={{ cursor: 'pointer' }}
              >
                <FaUser className="nav-icon" aria-label="Người dùng" />
                {username && <span className="ms-2 d-md-inline">{username}</span>}
                {unreadMessagesCount > 0 && (
                    <span className="badge bg-danger ms-2">{unreadMessagesCount}</span>
                  )}
              </div>

              <div className={`dropdown-menu dropdown-menu-end ${profileMenuOpen ? 'show' : ''}`}>
                <li className="nav-item mx-2">
                  <div className="account-level">
                    <span className="level-label">Cấp bậc tài khoản: </span>
                    <span className="level-value">{accountLevel}</span>
                  </div>
                </li>
                <Link
                  to={`/profile/${username}`}
                  className={`dropdown-item ${!isOnline ? 'disabled' : ''}`}
                  aria-label="Chỉnh sửa hồ sơ"
                >
                  <FaUserEdit className="me-2" /> Chỉnh sửa hồ sơ
                </Link>
                <Link
                  to={`/favorites/${username}`}
                  className={`dropdown-item ${!isOnline ? 'disabled' : ''}`}
                  aria-label="Danh sách yêu thích"
                >
                  <FaHeart className="me-2" /> Danh sách yêu thích
                </Link>
                <Link
                  to={`/messages/${username}`}
                  className={`dropdown-item ${!isOnline ? 'disabled' : ''}`}
                  aria-label="Tin nhắn của tôi"
                >
                  <FaComment className="me-2" /> Tin nhắn của tôi
                  {unreadMessagesCount > 0 && (
                    <span className="badge bg-danger ms-2">{unreadMessagesCount}</span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="dropdown-item"
                  aria-label="Đăng xuất"
                >
                  <FaSignOutAlt className="me-2" /> Đăng xuất
                </button>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
