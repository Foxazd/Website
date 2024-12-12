import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Form, Button, Alert, Modal, Spinner } from 'react-bootstrap';
import AdminHeader from '../../components/AdminHeader';
import AdminFooter from '../../components/AdminFooter';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddContent = () => {
  const { comicId } = useParams();
  const [chapterNumber, setChapterNumber] = useState('');
  const [maxChapters, setMaxChapters] = useState(0);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch maximum chapters available
  useEffect(() => {
    const fetchComicData = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/comics/${comicId}`);
        setMaxChapters(data.chapters);
      } catch {
        setError('Không thể tải thông tin truyện. Vui lòng kiểm tra kết nối mạng.');
      }
    };
    fetchComicData();
  }, [comicId]);

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 1000); // 1 giây
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-hide error message
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 1000); // 1 giây
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch existing chapter data
  const fetchChapterData = async (chapterNumber) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/chapters/${comicId}/chapter/${chapterNumber}`
      );
      setExistingImages(data.pages || []);
    } catch {
      setError('Không thể tải chương. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file input change
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter((file) => file.type.startsWith('image/'));

    if (validImages.length !== files.length) {
      setError('Chỉ cho phép chọn hình ảnh.');
    } else {
      const sortedImages = validImages.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );
      setImages(sortedImages);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chapterNumber) {
      setError('Vui lòng chọn một chương.');
      return;
    }
    if (images.length === 0) {
      setError('Vui lòng chọn ít nhất một hình ảnh.');
      return;
    }

    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/chapters/${comicId}/chapter/${chapterNumber}`
      );

      if (data.pages && data.pages.length > 0) {
        setShowModal(true);
      } else {
        await addChapterImages(images);
      }
    } catch {
      setError('Lỗi khi kiểm tra chương. Vui lòng thử lại.');
    }
  };

  const addChapterImages = async (newImages) => {
    const formData = new FormData();
    formData.append('chapterNumber', chapterNumber);
    newImages.forEach((image) => formData.append('pages', image));

    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/chapters/${comicId}/add-chapter`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      setSuccess(true);
      setImages([]);
      setExistingImages(data.pages || []);
      toast.success('Thêm Ảnh Thành Công');
    } catch {
      setError('Không thể thêm nội dung. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = (shouldAddNewImages) => {
    setShowModal(false);
    if (shouldAddNewImages) {
      addChapterImages([...existingImages, ...images]);
    } else {
      setImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChapterSelect = (e) => {
    const selectedChapter = e.target.value;
    setChapterNumber(selectedChapter);
    if (selectedChapter) {
      fetchChapterData(selectedChapter);
    } else {
      setExistingImages([]);
    }
  };

  return (
    <>
      <AdminHeader />
      <Container className="d-flex justify-content-center align-items-center mt-5">
        <div className="form-wrapper">
          <h1 className="my-4">Thêm Nội Dung Cho Truyện</h1>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
              Thêm nội dung thành công!
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="chapterNumber">
              <Form.Label>Số Chương</Form.Label>
              <Form.Control as="select" value={chapterNumber} onChange={handleChapterSelect} required>
                <option value="">Chọn số chương</option>
                {[...Array(maxChapters)].map((_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {isLoading ? (
              <Spinner animation="border" variant="primary" />
            ) : (
              existingImages.length > 0 && (
                <div>
                  <h5 className="mt-3">Ảnh hiện có trong chương:</h5>
                  <div className="existing-images">
                    {existingImages.map((page, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5000/${page.imageUrl.replace(/\\/g, '/')}`}
                        alt={`Page ${index + 1}`}
                        className="existing-image"
                      />
                    ))}
                  </div>
                </div>
              )
            )}
            <Form.Group controlId="images">
              <Form.Label>Hình Ảnh Chương</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleImageChange}
                ref={fileInputRef}
                required
              />
              {images.length > 0 && (
                <ul>
                  {images.map((img, index) => (
                    <li key={index}>{img.name}</li>
                  ))}
                </ul>
              )}
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-3" disabled={isLoading}>
              Thêm Nội Dung
            </Button>
          </Form>
        </div>
      </Container>

      <Modal
        show={showModal}
        onHide={() => handleModalClose(false)}
        backdrop={false}
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm Ảnh Tiếp Tục?</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có muốn thêm ảnh mới vào chương này không?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleModalClose(false)}>
            Không
          </Button>
          <Button variant="primary" onClick={() => handleModalClose(true)}>
            Có
          </Button>
        </Modal.Footer>
      </Modal>

      <AdminFooter />
    </>
  );
};

export default AddContent;
