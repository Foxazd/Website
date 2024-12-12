import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';

const UpdateChapterImages = () => {
  const { comicId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [chapterImages, setChapterImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/comics/${comicId}`);
        setChapters(response.data.chapters || []);
        setLoading(false);
      } catch (error) {
        setError('Lỗi khi tải các chương. Vui lòng thử lại.');
        setLoading(false);
      }
    };

    fetchChapters();
  }, [comicId]);

  const handleChapterImageChange = (chapterId, event) => {
    setChapterImages({ ...chapterImages, [chapterId]: event.target.files });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    chapters.forEach(chapter => {
      if (chapterImages[chapter._id]) {
        Array.from(chapterImages[chapter._id]).forEach(image => {
          formData.append(`chapters[${chapter._id}][images]`, image);
        });
      }
    });

    try {
      await axios.put(`http://localhost:5000/api/comics/${comicId}/update-chapter-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Hình ảnh các chương đã được cập nhật thành công!');
      setError('');
      navigate(`/admin/comics/edit/${comicId}`);
    } catch (error) {
      setError('Lỗi khi cập nhật hình ảnh. Vui lòng thử lại.');
      setSuccess('');
    }
  };

  if (loading) {
    return (
      <Container className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
        <p>Đang tải các chương...</p>
      </Container>
    );
  }

  return (
    <Container>
      <h1>Cập Nhật Hình Ảnh Cho Các Chương</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        {chapters.map((chapter) => (
          <div key={chapter._id} className="mb-3">
            <Form.Group controlId={`formChapterImage-${chapter._id}`}>
              <Form.Label>Chương: {chapter.title}</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={(e) => handleChapterImageChange(chapter._id, e)}
              />
            </Form.Group>
          </div>
        ))}
        <Button type="submit" variant="primary">Cập Nhật Hình Ảnh</Button>
      </Form>
    </Container>
  );
};

export default UpdateChapterImages;
