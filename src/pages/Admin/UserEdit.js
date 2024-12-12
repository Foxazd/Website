import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../assets/css/UserEdit.css';  
import { Container, Form, Button } from 'react-bootstrap';

const UserEdit = () => {
  const { id } = useParams(); 
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${id}`);
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        setError('Lỗi khi tải thông tin người dùng.');
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    try {
      await axios.put(`http://localhost:5000/api/users/${id}`, user);
      alert('Thông tin người dùng đã được cập nhật thành công.');
      navigate('/admin/users'); 
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin người dùng:', error);
      alert('Đã xảy ra lỗi khi cập nhật thông tin người dùng.');
    }
  };

  if (loading) {
    return <p>Đang tải thông tin người dùng...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <Container className="user-edit-container">
      <h1>Chỉnh sửa người dùng</h1>
      <Form className="user-edit-form" onSubmit={handleSubmit}>
        <Form.Group className="form-group">
          <Form.Label>Tên người dùng:</Form.Label>
          <Form.Control 
            type="text" 
            value={user.username} 
            onChange={(e) => setUser({ ...user, username: e.target.value })} 
          />
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>Email:</Form.Label>
          <Form.Control 
            type="email" 
            value={user.email} 
            onChange={(e) => setUser({ ...user, email: e.target.value })} 
          />
        </Form.Group>
        <Button type="submit" className="btn btn-primary">Lưu thay đổi</Button>
      </Form>
    </Container>
  );
};

export default UserEdit;
