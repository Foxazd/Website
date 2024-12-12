import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer'; 
import '../assets/css/message.css'; 

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentChapters, setCurrentChapters] = useState({});
  const [likedComics, setLikedComics] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    // Lấy danh sách truyện yêu thích của người dùng từ localStorage
    const likedComics = JSON.parse(localStorage.getItem('likedComics')) || [];
    setLikedComics(likedComics);

    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/messages');
        setMessages(response.data);
        
        // Cập nhật số chương hiện tại khi nhận được tin nhắn mới
        const initialChapters = response.data.reduce((acc, message) => {
          if (message.type === 'newChapter') {
            acc[message.comicId] = message.chapterNumber;
          }
          return acc;
        }, {});
        setCurrentChapters(initialChapters);
      } catch (error) {
        setError('Không thể tải tin nhắn. Vui lòng thử lại sau.');
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch messages when the component mounts
    fetchMessages();

    const intervalId = setInterval(fetchMessages, 1000); 

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const headerStyle = {
    fontSize: '2rem', 
    marginBottom: '10px', 
    fontWeight: 'bold', 
    background: 'linear-gradient(90deg, #007bff, #6c757d)', 
    WebkitBackgroundClip: 'text', 
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent', 
    textAlign: 'center', 
    textTransform: 'uppercase', 
    letterSpacing: '1px', 
    position: 'relative', 
    transition: 'transform 0.3s ease', 
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
    display: 'flex', 
    justifyContent: 'center',
  };

  // Lọc tin nhắn chỉ hiển thị cho các truyện trong danh sách yêu thích
  const filteredMessages = messages.filter((message) => 
    likedComics.includes(message.comicId) && message.type === 'newChapter'
  );

  const groupedMessages = filteredMessages.reduce((acc, message) => {
    const comicId = message.comicId;
    acc[comicId] = {
      comicTitle: message.comicTitle,
      comicCover: message.comicCover,
      chapterNumber: currentChapters[comicId] || message.chapterNumber,
    };
    return acc;
  }, {});

  return (
    <div className="comic-page-container">
      <Header /> 
      <h1 className="text-center" style={headerStyle}>Tin Nhắn Của Tôi</h1>
      <div className="container">
        {loading ? (
          <p>Đang tải tin nhắn...</p>
        ) : error ? (
          <p>{error}</p>
        ) : Object.keys(groupedMessages).length > 0 ? (
          <ul className="list-group">
            {Object.entries(groupedMessages).map(([comicId, { comicTitle, comicCover, chapterNumber }]) => (
              <li key={comicId} className="list-group-item">
                <img 
                  src={`http://localhost:5000/${comicCover}`} 
                  alt={`Bìa truyện ${comicTitle}`} 
                  onClick={() => navigate(`/read/${encodeURIComponent(comicTitle)}/chapter/${chapterNumber}`)} 
                  style={{ cursor: 'pointer' }} 
                />
                <div>
                  <h5>Thông báo chương mới</h5>
                  <p>Admin đã cập nhật chương <strong>{chapterNumber}</strong> cho truyện <strong>{comicTitle}</strong>.</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Bạn chưa có tin nhắn nào.</p>
        )}
      </div>
      <Footer /> 
    </div>
  );
};

export default Messages;
