import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const EditComic = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [descriptionFile, setDescriptionFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [comic, setComic] = useState(null);
  const [chapters, setChapters] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComic = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/comics/${id}`);
        const data = response.data;
        setTitle(data.title);
        setAuthor(data.author);
        setCategory(data.category);
        setStatus(data.status);
        setDescription(data.description);
        setCurrentImage(data.coverImage);
        setChapters(data.chapters.length); // Sử dụng data.chapters.length để lấy số chương hiện tại
        setComic(data);
      } catch (error) {
        setError('Lỗi khi tải thông tin truyện. Vui lòng thử lại.');
      }
    };

    fetchComic();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('category', category);
    formData.append('status', status);
    formData.append('description', description);
    formData.append('chapters', chapters);
    if (image) {
      formData.append('coverImage', image);
    }
    if (descriptionFile) {
      formData.append('descriptionFile', descriptionFile);
    }

    try {
      // Cập nhật thông tin truyện
      await axios.put(`http://localhost:5000/api/comics/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Gửi thông báo cho người dùng về chương mới
      const messageData = {
        type: 'newChapter',
        comicId: id,
        chapterNumber: chapters, // Số chương mới
        // Nếu bạn muốn thêm hình ảnh bìa vào thông báo
        comicCover: currentImage,
      };

      await axios.post('http://localhost:5000/api/messages', messageData);

      // Lưu thông báo vào localStorage
      const savedMessages = JSON.parse(localStorage.getItem('messages')) || [];
      savedMessages.push(messageData);
      localStorage.setItem('messages', JSON.stringify(savedMessages));

      alert('Truyện đã được cập nhật thành công và thông báo đã được gửi!');
      navigate(`/admin/comics/${id}/add-chapter`);
    } catch (error) {
      setError('Lỗi khi cập nhật truyện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleDescriptionFileChange = (event) => {
    setDescriptionFile(event.target.files[0]);
  };

  const handleBack = () => {
    navigate('/admin/comics');
  };

  if (!comic) {
    return <p>Đang tải thông tin truyện...</p>;
  }

  return (
    <Container className="d-flex justify-content-center align-items-center edit-comic-container">
      <div className="form-wrapper">
        <h1>Chỉnh Sửa Truyện</h1>
        {error && <Alert variant="danger">{error}</Alert>}
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
            <Form.Label>Số Chap</Form.Label>
            <Form.Control
              type="number"
              placeholder="Nhập số chap"
              value={chapters}
              onChange={(e) => setChapters(e.target.value)}
              required
              min={1}
            />
          </Form.Group>

          <Form.Group controlId="formDescription">
            <Form.Label>Mô tả (viết vào hoặc tải lên file Word)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Nhập mô tả ngắn về truyện"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <Form.Control
              type="file"
              accept=".doc,.docx"
              onChange={handleDescriptionFileChange}
              className="mt-2"
            />
          </Form.Group>

          <Form.Group controlId="formImage">
            <Form.Label>Chọn ảnh bìa (nếu muốn thay đổi)</Form.Label>
            <Form.Control
              type="file"
              onChange={handleImageChange}
            />
            {currentImage && (
              <div className="current-image mt-2">
                <img
                  src={currentImage}
                  alt="Hình ảnh hiện tại"
                  style={{ width: '150px', height: '200px' }}
                />
              </div>
            )}
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

          <div className="button-group">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
            >
              Quay lại
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
            >
              {loading ? ' Đang cập nhật...' : ' Cập nhật Truyện'}
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default EditComic;
