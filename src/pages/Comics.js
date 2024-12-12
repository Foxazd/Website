import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../assets/css/style.css';

const ComicList = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [authors, setAuthors] = useState([]);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/comics');
        setComics(response.data);
        setLoading(false);

        const uniqueAuthors = [...new Set(response.data.map(comic => comic.author.trim()))];
        setAuthors(uniqueAuthors);

        const uniqueStatuses = [...new Set(response.data.map(comic => comic.status.trim()))];
        setStatuses(uniqueStatuses);
      } catch (error) {
        setError('Lỗi khi tải truyện. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchComics();
  }, []);

  if (loading) {
    return <p>Đang tải danh sách truyện...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const filteredComics = comics.filter(comic =>
    (selectedCategory === '' || comic.category.includes(selectedCategory)) &&
    (selectedAuthor === '' || comic.author === selectedAuthor) &&
    (selectedStatus === '' || comic.status === selectedStatus)
  );

  const categories = comics.reduce((acc, comic) => {
    const comicCategories = comic.category.split(',');
    comicCategories.forEach(category => {
      const trimmedCategory = category.trim();
      if (!acc.includes(trimmedCategory)) {
        acc.push(trimmedCategory);
      }
    });
    return acc;
  }, []);

  return (
    <div>
      <Header />
      <main className="comic-list-container d-flex">
        <div className="sidebar">
          <h4>Chọn thể loại</h4>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Tất cả thể loại</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <br />

          <h4>Chọn tác giả</h4>
          <select value={selectedAuthor} onChange={(e) => setSelectedAuthor(e.target.value)}>
            <option value="">Tất cả tác giả</option>
            {authors.map(author => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>

          <br />

          <h4>Chọn trạng thái</h4>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="comic-list-content">
          <h2 className="comic-list-title">Danh Sách Truyện Tranh</h2>
          <div className="comic-list">
            {filteredComics.length === 0 ? (
              <p>Không có truyện nào phù hợp với bộ lọc này.</p>
            ) : (
              filteredComics.map(comic => (
                <div key={comic._id} className="comic-item">
                  <Link to={`/comics/${comic._id}`}>
                    <img
                      src={`http://localhost:5000/${comic.coverImage}`}
                      alt={comic.title}
                      title={comic.description}
                      className="comic-cover"
                    />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ComicList;
