import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader'; 
import '../../assets/css/users-list.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi tải danh sách người dùng:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAccountLevelChange = async (userId, newLevel) => {
    console.log('User ID:', userId);  // Kiểm tra ID người dùng
    console.log('New Level:', newLevel);  // Kiểm tra cấp bậc mới
  
    try {
      const response = await axios.put(`http://localhost:5000/api/users/updateLevel/${userId}`, { accountLevel: newLevel });
      console.log('Response:', response.data); // Kiểm tra phản hồi từ server
  
      setUsers((prevUsers) => 
        prevUsers.map((user) => 
          user._id === userId ? { ...user, accountLevel: newLevel } : user
        )
      );
    } catch (error) {
      console.error('Lỗi khi cập nhật cấp bậc tài khoản:', error.response ? error.response.data : error.message);
    }
  };

  if (loading) {
    return <p>Đang tải danh sách người dùng...</p>;
  }

  return (
    <>
      <AdminHeader />
      <Container>
        <Row className="my-4">
          <Col>
            <h1 className="user-list-title">Danh Sách Người Dùng</h1>
            <Link to="/admin/users/add" className="btn btn-add-user mb-3">
              Thêm Người Dùng Mới
            </Link>
            <Table striped bordered hover responsive className="table-users">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Quyền</th>
                  <th>Cấp Bậc</th> 
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <select
                          value={user.accountLevel || 'Bình thường'}
                          onChange={(e) => handleAccountLevelChange(user._id, e.target.value)} // Truyền user._id vào hàm
                        >
                          <option value="Bình thường">Bình thường</option>
                          <option value="Level 1">Level 1</option>
                          <option value="Level 2">Level 2</option>
                          <option value="Level 3">Level 3</option>
                          <option value="Level 4">Level 4</option>
                          <option value="Level 5">Level 5</option>
                          <option value="Level 6">Level 6</option>
                          <option value="Level 7">Level 7</option>
                          <option value="Level 8">Level 8</option>
                          <option value="Level 9">Level 9</option>
                          <option value="Level 10">Level 10</option>
                        </select>
                      </td> 
                      <td>
                        <div className="action-buttons">
                          <Link to={`/admin/users/edit/${user._id}`} className="btn btn-user-edit me-2">
                            <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa
                          </Link>
                          <Link to={`/admin/users/delete/${user._id}`} className="btn btn-user-delete me-2">
                            <FontAwesomeIcon icon={faTrash} /> Xóa
                          </Link>
                          <Link to={`/admin/profile/${user.username}`} className="btn btn-user-view">
                            <FontAwesomeIcon icon={faEye} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">Không có người dùng nào.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default UsersList;
