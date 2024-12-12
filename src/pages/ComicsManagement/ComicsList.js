import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminHeader from '../../components/AdminHeader'; 
import { Table, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import '../../assets/css/comics-list.css';

const ComicsList = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/comics');
        setComics(response.data);
        setLoading(false);
      } catch (error) {
        setError('Lỗi khi tải truyện tranh. Vui lòng thử lại.');
        setLoading(false);
      }
    };

    fetchComics();
  }, []);

  const handleDelete = async (comicId) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa truyện này không?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/comics/${comicId}`);
      setComics(comics.filter(comic => comic._id !== comicId));
    } catch (error) {
      setError('Lỗi khi xóa truyện. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <Container className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
        <p>Đang tải danh sách truyện...</p>
      </Container>
    );
  }

  return (
    <>
      <AdminHeader />
      <Container>
        <Row className="my-4">
          <Col>
            <h1 className="comics-list-title">Danh Sách Truyện Tranh</h1>
            {error && <Alert variant="danger">{error}</Alert>} 
            <Link to="/admin/comics/add" className="btn btn-add-comic mb-3">
              Thêm Truyện Mới
            </Link>
            <Table striped bordered hover responsive className="table-comics">
              <thead>
                <tr>
                  <th>Hình ảnh</th> 
                  <th>Tiêu đề</th>
                  <th>Tác giả</th>
                  <th>Thể loại</th>
                  <th>Trạng thái</th>
                  <th>Số chap</th>
                  <th>Lượt xem</th>
                  <th>Lượt thích</th>
                  <th>Đánh giá</th>
                  <th>Mô tả</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {comics.length > 0 ? (
                  comics.map((comic) => (
                    <tr key={comic._id}>
                      <td>
                        <img 
                          src={`http://localhost:5000/${comic.coverImage}`} 
                          alt=""
                          style={{ width: '100px', height: '150px' }} 
                        />
                      </td>
                      <td>{comic.title}</td>
                      <td>{comic.author}</td>
                      <td>{comic.category}</td>
                      <td>{comic.status}</td>
                      <td>{comic.chapters}</td>
                      <td>{comic.views}</td>
                      <td>{comic.likes || 0}</td>
                      <td>{comic.averageRating}</td>
                      <td>{comic.description}</td>
                      <td>
                        <Link to={`/admin/comics/edit/${comic._id}`} className="btn btn-comic-edit me-2">
                          Chỉnh sửa
                        </Link>
                        <Link to={`/admin/comics/${comic._id}/add-chapter`} className="btn btn-comic-content me-2">
                          Thêm Nội Dung
                        </Link>
                        <Button
                          className="btn-comic-delete"
                          variant="danger"
                          onClick={() => handleDelete(comic._id)}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center">Không có truyện nào.</td>
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

export default ComicsList;
