import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import '../../assets/css/delete-user.css';

const DeleteUser = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate(); // Sử dụng useNavigate thay vì useHistory
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${id}`);
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        navigate('/admin/users'); 
      } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
      }
    }
  };

  if (loading) {
    return <p>Đang tải thông tin người dùng...</p>;
  }

  if (!user) {
    return <p>Người dùng không tìm thấy</p>;
  }

  return (
    <>
      <AdminHeader />
      <Container className="delete-user-container">
        <h1 className="delete-user-title">Xóa Người Dùng</h1>
        <div className="delete-user-info">
          <p><strong>Tên:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Quyền:</strong> {user.role}</p>
        </div>
        <button className="btn" onClick={handleDelete}>Xóa Người Dùng</button>
      </Container>
    </>
  );
};

export default DeleteUser;
