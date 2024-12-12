import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css'; 

const FavoritesList = () => {
    const [favorites, setFavorites] = useState([]);
    const [comicData, setComicData] = useState({}); 

    useEffect(() => {
        const likedComics = JSON.parse(localStorage.getItem('likedComics')) || [];
        setFavorites(likedComics);

        // Lấy dữ liệu cho từng truyện yêu thích
        const fetchComics = async () => {
            const data = {};
            for (const comicId of likedComics) {
                try {
                    const response = await fetch(`http://localhost:5000/api/comics/${comicId}`);
                    const comic = await response.json();
                    data[comicId] = comic; 
                } catch (error) {
                    console.error('Error fetching comic data:', error);
                }
            }
            setComicData(data);
        };

        fetchComics();
    }, []);

    // Hàm để bỏ thích truyện
    const handleRemoveFavorite = (comicId) => {
        const updatedFavorites = favorites.filter(id => id !== comicId);
        setFavorites(updatedFavorites);
        localStorage.setItem('likedComics', JSON.stringify(updatedFavorites));
    };

    const headerStyle = {
      fontSize: '2rem', 
      marginBottom: '20px', 
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

  const listItemStyle = {
    borderRadius: '8px',
    margin: '15px 0',
    padding: '15px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',  
    alignItems: 'center',
    border: '1px solid #e0e0e0', 
    position: 'relative', 
    justifyContent: 'space-between', 
  };

  // Thêm hiệu ứng hover
  const listItemHoverStyle = {
    ...listItemStyle,
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-5px)',
};

    return (
        <div className="comic-page-container">
            <Header />
            <main className="comic-content">
                <h1 className="text-center" style={headerStyle}>Danh sách yêu thích</h1>
                <ul className="list-group">
                    {favorites.length > 0 ? (
                        favorites.map(comicId => (
                            <li
                                key={comicId}
                                className="list-group-item d-flex align-items-center"
                                style={listItemStyle}
                                onMouseEnter={(e) => e.currentTarget.style = listItemHoverStyle}
                                onMouseLeave={(e) => e.currentTarget.style = listItemStyle}
                            >
                                {/* Hiển thị bìa truyện */}
                                {comicData[comicId] && comicData[comicId].coverImage && (
                                    <img
                                        src={`http://localhost:5000/${comicData[comicId].coverImage}`} 
                                        alt={`Bìa truyện ${comicId}`}
                                        className="img-thumbnail me-3" 
                                        style={{ width: '100px', height: 'auto', borderRadius: '5px' }} 
                                    />
                                )}
                                {/* Hiển thị tên truyện */}
                                {comicData[comicId] && comicData[comicId].title ? (
                                    <span className="ms-3" style={{ fontWeight: 'bold', color: '#495057' }}>Truyện: {comicData[comicId].title}</span>
                                ) : (
                                    <span className="ms-3" style={{ color: '#6c757d' }}>Truyện ID: {comicId}</span>
                                )}
                                {/* Nút bỏ thích */}
                                <button
                                    className="btn btn-danger ms-auto"
                                    onClick={() => handleRemoveFavorite(comicId)}
                                    style={{ fontSize: '14px', padding: '8px 12px' }}
                                >
                                    Bỏ thích
                                </button>
                            </li>
                        ))
                    ) : (
                        <li className="list-group-item" style={listItemStyle}>Chưa có truyện nào trong danh sách yêu thích.</li>
                    )}
                </ul>
            </main>
            <Footer />
        </div>
    );
};

export default FavoritesList;
