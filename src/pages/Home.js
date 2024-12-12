import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Banner from '../components/BannerSlide';
import { FaRobot } from "react-icons/fa";
import '../assets/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import axios from 'axios';

const Home = () => {
    const [history, setHistory] = useState([]);
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [comics, setComics] = useState([]);
    const [ranking, setRanking] = useState([]);
    const [loadingComics, setLoadingComics] = useState(true);  // Track loading for comics
    const [loadingRanking, setLoadingRanking] = useState(true);  // Track loading for ranking
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const itemsPerPage = 6;

    // Fetching history of comics read by the user
    useEffect(() => {
        const fetchHistory = async () => {
            const storedUsername = localStorage.getItem('username');
            if (!storedUsername) {
                setError('Chưa đăng nhập. Vui lòng đăng nhập để xem lịch sử.');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/api/history/${storedUsername}`);
                const uniqueHistory = getUniqueHistoryByComicId(response.data);
                setHistory(uniqueHistory);
            } catch (error) {
                setError('Lỗi khi tải lịch sử đọc.');
            }
        };

        fetchHistory();
    }, []);

    // Fetching all comics
    useEffect(() => {
        const fetchComics = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/comics');
                setComics(response.data);
                setLoadingComics(false);  // Mark comics as loaded
            } catch (error) {
                setError('Lỗi khi tải truyện. Vui lòng thử lại sau.');
                setLoadingComics(false);
            }
        };

        fetchComics();
    }, []);

    // Fetching ranking data
    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const response = await axios.post('http://localhost:5000/api/comics/ranking');
                setRanking(response.data);
                setLoadingRanking(false);  // Mark ranking as loaded
            } catch (error) {
                console.error('Lỗi khi tải bảng xếp hạng:', error.message || error);
                setError('Lỗi khi tải bảng xếp hạng. Vui lòng thử lại sau.');
                setLoadingRanking(false);
            }
        };

        fetchRanking();
    }, []);

    // Remove duplicates from history by comicId
    const getUniqueHistoryByComicId = (historyList) => {
        const uniqueHistory = [];
        const comicIdSet = new Set();

        historyList.forEach(offer => {
            if (!comicIdSet.has(offer.comicId)) {
                comicIdSet.add(offer.comicId);
                uniqueHistory.push(offer);
            }
        });

        return uniqueHistory;
    };

    const displayedHistory = useMemo(() => {
        return showAllHistory ? history : history.slice(0, itemsPerPage);
    }, [history, showAllHistory]);

    // Split ranking into chunks of 5 for slider
    const chunkedRanking = useMemo(() => {
        const chunks = [];
        for (let i = 0; i < ranking.length; i += 5) {
            chunks.push(ranking.slice(i, i + 5));
        }
        return chunks;
    }, [ranking]);

    // Filter recently updated comics
    const recentlyUpdatedComics = useMemo(() => {
        return comics
            .filter(comic => comic.addedByAdmin === true)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [comics]);

    // Check if all data is loaded
    const isLoading = loadingComics || loadingRanking;

    if (isLoading) {
        return <p>Đang tải danh sách truyện...</p>;
    }

    if (error) {
        return <p className="text-danger">{error}</p>;
    }

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 4,
                },
            },
        ],
    };

    return (
        <div className="home">
            <Header />
            <div className="container">

                <section className="banner-section mb-4">
                    <div className="banner">
                        <div className="banner-content">
                            <h2 className="banner-title">Khám Phá Truyện Nổi Bật</h2>
                            <p className="banner-description">Cùng xem những bộ truyện được yêu thích nhất hiện nay!</p>
                            <Link to="/comics" className="btn btn-banners">Khám Phá Ngay</Link>
                        </div>
                    </div>
                </section>
                
                {history.length > 0 && comics.length > 0 && (
                    <section className="mb-4">
                        <h2 className="mb-4 d-flex align-items-center">
                            <span className="line-indicator mr-2"></span>
                            Đọc tiếp
                        </h2>
                        <div className="row">
                            {displayedHistory.map((offer) => {
                                const comic = comics.find(c => c._id === offer.comicId);
                                return comic ? (
                                    <div className="col-lg-2 col-md-4 col-sm-6 mb-3 d-flex justify-content-center" key={offer._id}>
                                        <div className="relative">
                                            <Link to={`/read/${encodeURIComponent(comic.title)}/chapter/${offer.lastChapterRead}`}>
                                                <picture>
                                                    <img
                                                        src={`http://localhost:5000/${comic.coverImage}`}
                                                        alt={comic.title}
                                                        className="offer-img"
                                                    />
                                                </picture>
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="col-lg-2 col-md-4 col-sm-6 mb-3 d-flex justify-content-center" key={offer._id}>
                                        <div className="relative">
                                            <p>Comic không tìm thấy.</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {!showAllHistory && history.length > itemsPerPage && (
                            <button onClick={() => setShowAllHistory(true)} className="btn btn-primary">Xem tất cả</button>
                        )}
                    </section>
                )}

                {/* Mới ra mắt */}
                <section className="mb-4">
                    <h2 className="mb-4 d-flex align-items-center">
                        <span className="line-indicator mr-2"></span>
                        Mới ra mắt
                    </h2>
                    {recentlyUpdatedComics.filter(comic => comic.addedByAdmin).length > 0 ? (
                        <div className="row">
                            {recentlyUpdatedComics
                                .filter(comic => comic.addedByAdmin)
                                .slice(0, 6)
                                .map(comic => (
                                    <div className="col-lg-2 col-md-4 col-sm-6 mb-3 d-flex justify-content-center" key={comic._id}>
                                        <div className="relative">
                                            <Link to={`/comics/${comic._id}`}>
                                                <picture>
                                                    <img
                                                        src={`http://localhost:5000/${comic.coverImage}`}
                                                        alt={comic.title}
                                                        className="offer-img"
                                                    />
                                                </picture>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="text-muted">Không có truyện mới do admin thêm.</p>
                    )}
                </section>


                {/* Top Comics */}
                <section className="mb-4">
                    <h2 className="mb-4 d-flex align-items-center">
                        <span className="line-indicator mr-2"></span>
                        Top Comics
                    </h2>
                    {comics.length > 0 ? (
                        <div className="row">
                            {comics
                                .sort((a, b) => b.views - a.views) // Sắp xếp theo lượt xem giảm dần
                                .slice(0, 1) // Chỉ lấy 6 truyện có lượt xem cao nhất
                                .map((comic) => (
                                    <div
                                        className="col-lg-2 col-md-4 col-sm-6 mb-3 d-flex justify-content-center"
                                        key={comic._id}
                                    >
                                        <div className="relative">
                                            <Link to={`/comics/${comic._id}`}>
                                                <picture>
                                                    <img
                                                        src={`http://localhost:5000/${comic.coverImage}`}
                                                        alt={comic.title}
                                                        className="offer-img"
                                                    />
                                                </picture>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="text-muted">Không có truyện nào hiện có trong Top Comics.</p>
                    )}
                </section>


                {/* Bảng xếp hạng */}
                {ranking.length > 0 && (
                    <section className="mb-4">
                        <h2 className="mb-4 d-flex align-items-center">
                            <span className="line-indicator"></span>
                            <span>Bảng xếp hạng</span>
                        </h2>

                        {/* Large screen ranking */}
                        <div className="d-none d-lg-block">
                            <div className="row">
                                {Array.from({ length: 4 }).map((_, colIndex) => (
                                    <div className="col-3" key={colIndex}>
                                        {ranking
                                            .filter(comic => comic.likes > 0)  // Lọc truyện có lượt like > 0
                                            .slice(colIndex * 5, colIndex * 5 + 5)  // Hiển thị 5 truyện mỗi cột
                                            .map((comic, index) => {
                                                const rankingNumber = colIndex * 5 + index + 1;
                                                // Áp dụng lớp CSS cho các số thứ tự 1, 2, 3
                                                let rankClass = '';
                                                if (rankingNumber === 1) {
                                                    rankClass = 'special-1';  // Lớp cho số thứ tự 1
                                                } else if (rankingNumber === 2) {
                                                    rankClass = 'special-2';  // Lớp cho số thứ tự 2
                                                } else if (rankingNumber === 3) {
                                                    rankClass = 'special-3';  // Lớp cho số thứ tự 3
                                                }
                                                return (
                                                    <div className="ranking-item d-flex align-items-center mb-3" key={comic._id}>
                                                        <div className={`ranking-number ${rankClass}`}>{rankingNumber}</div>
                                                        <Link to={`/comics/${comic._id}`} className="ml-3">
                                                            <img
                                                                src={`http://localhost:5000/${comic.coverImage}`}
                                                                alt={comic.title}
                                                                className="ranking-img"
                                                            />
                                                            <p className="ranking-title">{comic.title}</p>
                                                        </Link>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Home;
