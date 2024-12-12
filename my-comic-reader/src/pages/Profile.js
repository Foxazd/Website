import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import Header from '../components/Header'; 
import Footer from '../components/Footer'; 
import logo from '../assets/images/logo1.png';
import '../assets/css/style.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
  const { username } = useParams(); 
  const navigate = useNavigate(); 
  const [userData, setUserData] = useState({
    username: '', 
    email: '',
    province: '',
    gender: '', 
    birthday: '', 
    phone: '',
    image: '',
    createdAt: ''
  });
  const [isChecked, setIsChecked] = useState(false);
  const [notification, setNotification] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/profile/${username}`);
      setUserData({
        ...response.data,
        birthday: response.data.birthday || '' 
      });
      setIsChecked(false); 
    } catch (error) {
      console.error("Error fetching user data:", error);
      setNotification('Người dùng không tồn tại');
      setIsVisible(true);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [username]);

  const handleSave = async () => {
    if (!userData.username || !userData.province || !userData.birthday || !userData.gender || !userData.email || !userData.phone || !isChecked) {
      setNotification('Vui lòng điền đầy đủ thông tin và chọn cam kết trước khi lưu.');
      setIsVisible(true);
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/profile/saveProfile', {
        username: userData.username,
        email: userData.email,
        province: userData.province,
        gender: userData.gender,
        birthday: userData.birthday,
        phone: userData.phone,
        isChecked: isChecked
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 200) {
        console.log("Profile saved successfully:", response);
        setNotification('Thông tin đã được lưu thành công!');
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      } else {
        setNotification('Đã xảy ra lỗi khi lưu thông tin.');
      }

      fetchUserData();
    } catch (error) {
      console.error("Error saving profile:", error);
      setNotification('Lỗi khi lưu thông tin người dùng');
    }
    
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div>
      <Header />
      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar-container">
            <div className="avatar">
              <img 
                src={userData.image || logo} 
                alt="Avatar" 
                className="img-fluid" 
                style={{ maxHeight: '60px', borderRadius: '50%' }} 
              />
            </div>
            <div className="user-info">
              <p>Chào, {userData.username || username}</p> 
            </div>
          </div>
        </div>

        <div className="profile-body">
          <h2>Thay đổi thông tin tài khoản</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="username">Tên người dùng</label>
              <input
                type="text"
                id="username"
                value={userData.username}
                onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                placeholder="Nhập tên người dùng"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                placeholder="Nhập email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="province">Tỉnh/Thành phố</label>
              <input
                type="text"
                id="province"
                value={userData.province}
                onChange={(e) => setUserData({ ...userData, province: e.target.value })}
                placeholder="Nhập tỉnh/thành phố"
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Giới tính</label>
              <select
                id="gender"
                value={userData.gender}
                onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="birthday">Ngày sinh</label>
              <input
                type="date"
                id="birthday"
                value={userData.birthday ? userData.birthday.slice(0, 10) : ''} 
                onChange={(e) => setUserData({ ...userData, birthday: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="text"
                id="phone"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="terms"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <label htmlFor="terms">Tôi cam kết thông tin trên là chính xác</label>
            </div>
            <div className="button-container">
              <button 
                onClick={handleSave} 
                className="save-button"
                disabled={!isChecked} 
              >
                Lưu thông tin
              </button>
            </div>
          </form>
        </div>

        {notification && isVisible && (
          <div className={`notification-bar ${notification.includes('cam kết') ? 'notification-bar-warning' : 'notification-bar-success'}`}>
            <span>{notification}</span>
            <button className="close-btn" onClick={handleClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
