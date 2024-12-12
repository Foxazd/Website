import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Container, Form } from 'react-bootstrap';
import '../assets/css/add-comic.css';

const AddComic = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [chapters, setChapters] = useState(''); 
  const [description, setdescription] = useState(''); 
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('Đang tiến hành'); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('category', category);
    formData.append('chapters', chapters); 
    formData.append('description', description); 
    formData.append('status', status);
    if (image) {
      formData.append('coverImage', image);
    }

    try {
      await axios.post('http://localhost:5000/api/comics', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Truyện đã được thêm thành công!');
      navigate('/admin/comics');
    } catch (error) {
      setError('Lỗi khi thêm truyện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/comics');
  };

  return (
    <Container className="d-flex justify-content-center align-items-center add-comic-container">
      <div className="form-wrapper">
        <h1>Thêm Truyện Mới</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formTitle">
            <Form.Label>Tiêu đề</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập tiêu đề truyện"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formAuthor">
            <Form.Label>Tác giả</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập tên tác giả"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formCategory">
            <Form.Label>Thể loại</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập thể loại (ví dụ: Hành động, Hài hước)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formChapters">
            <Form.Label>Số chap</Form.Label>
            <Form.Control
              type="number"
              placeholder="Nhập số chap"
              value={chapters}
              onChange={(e) => setChapters(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formdescription">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Nhập mô tả ngắn về truyện"
              value={description}
              onChange={(e) => setdescription(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formImage">
            <Form.Label>Chọn ảnh bìa</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </Form.Group>

          <Form.Group controlId="formStatus">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Control
              as="select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="Đang tiến hành">Đang tiến hành</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Tạm dừng">Tạm dừng</option>
              <option value="Hủy bỏ">Hủy bỏ</option>
            </Form.Control>
          </Form.Group>

          {error && <p className="text-danger">{error}</p>}

          <div className="button-group">
            <button
              type="button"
              className="back-button"
              onClick={handleBack}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="button-icon" />
              Quay lại
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-custom-primary"
            >
              <FontAwesomeIcon icon={faPlus} className="button-icon" />
              {loading ? ' Đang thêm...' : ' Thêm Truyện'}
            </button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default AddComic;
