import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../assets/css/banner.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const Banner = () => {
  const [suggestedComics, setSuggestedComics] = useState([]);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate(); 

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    nextArrow: <button className="slick-next">Next</button>,
    prevArrow: <button className="slick-prev">Prev</button>,
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setError('Không có thông tin người dùng.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchSuggestedComics = async () => {
      if (!username) return;

      try {
        const response = await axios.get(`http://localhost:5000/api/history/suggestedComics`, {
          params: { username }
        });
        setSuggestedComics(response.data);
      } catch (error) {
        setError('Lỗi khi lấy gợi ý truyện');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchSuggestedComics();
    }
  }, [username]);

  const banners = suggestedComics.map((comic) => ({
    id: comic._id,
    image: comic.coverImage,
    alt: comic.title || 'Truyện gợi ý',
    title: comic.title,
    description: comic.description || 'Mô tả chưa có',
  }));

  // Hàm chuyển trang khi nhấp vào hình ảnh
  const handleComicClick = (comicId) => {
    navigate.push(`/comics/${comicId}`); 
  };

  return (
    <div className="banner-slider-container">
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : error ? (
        <p>{error}</p>
      ) : banners.length > 0 ? (
        <Slider {...settings}>
          {banners.map((banner) => (
            <div key={banner.id} className="slider-item">
              <div 
                className="image-container"
                onClick={() => handleComicClick(banner.id)} // Thêm sự kiện click
                style={{ cursor: 'pointer' }} // Thay đổi con trỏ chuột khi hover
              >
                <img
                  src={`http://localhost:5000/${banner.image}`}
                  alt={banner.alt}
                  loading="lazy"
                />
                <div className="comic-info">
                  <h3>{banner.title}</h3>
                  <p>{banner.description}</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <p>Không có gợi ý nào cho bạn.</p>
      )}
    </div>
  );
};

export default Banner;
