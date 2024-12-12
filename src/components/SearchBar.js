import React, { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import diacritics from 'diacritics'; // Import thư viện diacritics

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [comics, setComics] = useState([]); // Thay đổi: thêm state cho danh sách truyện
  const [filteredComics, setFilteredComics] = useState([]);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Hàm để tải danh sách truyện từ API
    const fetchComics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/comics');
        const data = await response.json();
        setComics(data); // Lưu dữ liệu vào state
      } catch (error) {
        console.error('Error fetching comics:', error);
      }
    };

    fetchComics(); // Gọi hàm khi component mount
  }, []); // Chạy một lần khi component mount

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);

    const normalizedQuery = diacritics.remove(value).toLowerCase().trim(); // Xóa dấu, chuyển thành chữ thường và loại bỏ khoảng trắng

    if (value) {
      const filtered = comics.filter(comic => {
        const normalizedTitle = diacritics.remove(comic.title).toLowerCase().trim();
        const normalizedAuthor = diacritics.remove(comic.author).toLowerCase().trim();
        const normalizedCategory = diacritics.remove(comic.category).toLowerCase().trim();
        return normalizedTitle.includes(normalizedQuery) || normalizedAuthor.includes(normalizedQuery) || normalizedCategory.includes(normalizedQuery);
      });
      setFilteredComics(filtered);
    } else {
      setFilteredComics([]);
    }
  };

  const handleComicClick = (comic) => {
    setQuery(comic.title);
    setFilteredComics([]);
    onSearch(comic.title);
    navigate(`/comics/${comic._id}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (query.length === 1) {
      navigate('/comics');
    } else {
      onSearch(query);
      // Có thể thực hiện tìm kiếm theo query tại đây nếu cần
    }
    setQuery('');
    setFilteredComics([]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setFilteredComics([]);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-container position-relative" ref={searchContainerRef}>
      <form onSubmit={handleSubmit} className="search-form d-flex align-items-center">
        <input
          type="text"
          placeholder="Tìm kiếm truyện..."
          value={query}
          onChange={handleInputChange}
          className="form-control me-2"
          onFocus={() => {
            if (query) {
              const filtered = comics.filter(comic =>
                diacritics.remove(comic.title).toLowerCase().includes(diacritics.remove(query).toLowerCase().trim()) ||
                diacritics.remove(comic.author).toLowerCase().includes(diacritics.remove(query).toLowerCase().trim()) ||
                diacritics.remove(comic.category).toLowerCase().includes(diacritics.remove(query).toLowerCase().trim())
              );
              setFilteredComics(filtered);
            }
          }}
          onBlur={() => {
            setTimeout(() => setFilteredComics([]), 200);
          }}
        />
        <button type="submit" className="btn btn-outline-secondary me-2">
          <FaSearch />
        </button>
      </form>
      {filteredComics.length > 0 && (
        <ul className="suggestions-list list-unstyled mt-2 position-absolute bg-light border">
          {filteredComics.map((comic, index) => (
            <li
              key={index}
              onClick={() => handleComicClick(comic)}
              className="suggestion-item d-flex align-items-center p-2"
              style={{ cursor: 'pointer' }}
            >
              <img src={`http://localhost:5000/${comic.coverImage}`} alt={`Bìa truyện ${comic.title}`} style={{ width: '40px', height: '60px', marginRight: '10px' }} />
              <div>
                <strong style={{ fontWeight: 'bold', color: 'black' }}>{comic.title}</strong> <br />
                <small style={{ color: 'gray' }}>Tác giả: {comic.author}</small> <br />
                <small style={{ color: 'gray' }}>Thể loại: {comic.category}</small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
