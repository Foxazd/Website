import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import '../../assets/css/user-view.css'; 

const ProfileView = () => {
  const { username } = useParams(); 
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/profile/${username}`);
        setProfile(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin hồ sơ:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleConfirm = () => {
    alert('Đã xác nhận hồ sơ.');
    navigate('/admin/users'); 
  };

  if (loading) {
    return <p>Đang tải thông tin hồ sơ...</p>;
  }

  if (!profile) {
    return <p>Không tìm thấy hồ sơ.</p>;
  }

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <div className="profile-view">
            <h2>Thông Tin Hồ Sơ</h2>
            <p><strong>Tên:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Tỉnh/Thành phố:</strong> {profile.province}</p>
            <p><strong>Giới tính:</strong> {profile.gender}</p>
            <p><strong>Ngày sinh:</strong> {new Date(profile.birthday).toLocaleDateString()}</p>
            <p><strong>Số điện thoại:</strong> {profile.phone}</p>
            <p><strong>Đã kiểm tra:</strong> {profile.isChecked ? 'Có' : 'Không'}</p>
            <Button variant="primary" onClick={handleConfirm} className="mt-3">Xác nhận</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileView;
