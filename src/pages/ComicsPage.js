import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import mongoose from 'mongoose';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../assets/css/ComicsPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faHeart, faBook, faArrowRight, faChevronDown, faChevronUp, faPaperPlane, faReply, faTrashAlt, faComment, faStar, faDownload, faCheckCircle } from '@fortawesome/free-solid-svg-icons';


const ComicsPage = () => {
    const { id, userId, title } = useParams();
    const navigate = useNavigate();
    const [comic, setComic] = useState(null);
    const [comicId, setComicId] = useState(null);
    const [user, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLevel, setUserLevel] = useState(null);
    const [currentChapter, setCurrentChapter] = useState(1);
    const [lastChapterRead, setLastChapterRead] = useState(null);
    const [accountLevel, setAccountLevel] = useState('');
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showChapters, setShowChapters] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const isDownloaded = (title, chapterNumber) => {
        return downloadedChapters[title] && downloadedChapters[title].includes(chapterNumber);
    };
    const [downloadedChapters, setDownloadedChapters] = useState(
        JSON.parse(sessionStorage.getItem('downloadedChapters')) || {}
    );
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentAuthor, setCommentAuthor] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [rating, setRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [username, setUsername] = useState("");
    const [averageRating, setAverageRating] = useState(0);
    const [replyingTo, setReplyingTo] = useState(null);
    const maxDescriptionLength = 150;
    const [bookmarkedChapters, setBookmarkedChapters] = useState([]);
    const [histories, setHistories] = useState([]);
    const [filteredComments, setFilteredComments] = useState([]);
    const [userRating, setUserRating] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [deletedCommentId, setDeletedCommentId] = useState(null);
    const [hasSentNotification, setHasSentNotification] = useState(false);
    const hasDisplayedModal = localStorage.getItem('hasDisplayedModal') === 'true';
    const seenReasons = new Set();
    const updateRating = (responseData) => {
        setTotalRatings(responseData.totalRatings);
        setAverageRating(responseData.averageRating);
    }

    const updateComicData = (data) => {
        setComic({
            ...data,
            isLiked: data.isLiked
        });
        updateRating(data);
        setLoading(false);
    };

    useEffect(() => {
        const fetchComic = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/comics/${id}`);

                setComic({
                    ...response.data,
                    isLiked: localStorage.getItem('isLiked') === 'true' // Kiểm tra trạng thái liked từ localStorage
                });
                updateRating(response.data);
                setLoading(false);

                // Kiểm tra lượt xem của người dùng
                const hasViewed = localStorage.getItem(`viewed_${id}`);
                if (!hasViewed) {
                    await handleViewComic();
                    localStorage.setItem(`viewed_${id}`, 'true'); // Đánh dấu là đã xem
                }
            } catch (error) {
                setError('Lỗi khi tải truyện. Vui lòng thử lại sau.');
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/comments/${id}`);
                setComments(response.data);
            } catch (error) {
                setError('Lỗi khi tải bình luận. Vui lòng thử lại sau.');
            }
        };

        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/notifications?type=reason`);
                const uniqueNotifications = response.data.filter((notification, index, self) =>
                    index === self.findIndex((n) => n.reason === notification.reason)
                );

                // Chỉ thêm thông báo vào state nếu lý do chưa được thấy
                const newNotifications = uniqueNotifications.filter(notification =>
                    !seenReasons.has(notification.reason)
                );

                if (newNotifications.length > 0) {
                    setNotifications(newNotifications);
                    newNotifications.forEach(notification => seenReasons.add(notification.reason));
                    setShowModal(true); // Hiện modal nếu có thông báo mới
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchComic();
        fetchComments();
        fetchNotifications(); // Gọi hàm để lấy thông báo
    }, [id]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get('http://localhost:5000/api/comics');
            // Đảm bảo comicId được lấy từ phản hồi
            setComicId(response.data.comicId);
        };
        fetchData();
    }, []);

    // Cập nhật trạng thái yêu thích dựa trên localStorage khi component được mount
    useEffect(() => {
        const fetchComic = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/comics/${id}`);
                const data = await response.json();
                setComic(data);
                // Kiểm tra trạng thái đã thích
                const likedComics = JSON.parse(localStorage.getItem('likedComics')) || [];
                setIsLiked(likedComics.includes(id));
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchComic();
    }, [id]);

    useEffect(() => {
        // Lấy thông tin truyện và thông tin người dùng
        const fetchComicData = async () => {
            try {
                const [comicResponse, userResponse] = await Promise.all([
                    axios.get(`http://localhost:5000/api/comics/${id}`),
                    axios.get(`http://localhost:5000/api/users`)
                ]);

                // Cập nhật dữ liệu truyện
                updateComicData(comicResponse.data);

                // Tìm thông tin người dùng hiện tại từ danh sách người dùng
                const currentUser = userResponse.data.find(user => user.username === localStorage.getItem('username'));

                if (currentUser) {
                    // Cập nhật cấp bậc và cấp độ của người dùng
                    setUserLevel(currentUser.level);
                    const accountLevel = currentUser.accountLevel;
                    setAccountLevel(accountLevel);

                    // Ghi log giá trị accountLevel
                    console.log(`Account Level: ${accountLevel}`);
                } else {
                    setError('Người dùng không tìm thấy.');
                }

            } catch (error) {
                setError('Lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
                console.error(error);
                setLoading(false);
            }
        };

        fetchComicData();
    }, [id]);

    useEffect(() => {
        const user = localStorage.getItem('username');
        setCommentAuthor(user || '');
    }, []);

    // Reset lại trạng thái khi người dùng rời khỏi trang
    useEffect(() => {
        return () => {
            // Reset lại trạng thái khi rời khỏi trang
            setDeletedCommentId(null);
            setHasSentNotification(false);
        };
    }, []);

    useEffect(() => {
        const fetchReadingHistories = async () => {
            const storedUsername = localStorage.getItem('username'); // Lấy username từ localStorage
            const storedComicId = localStorage.getItem('currentComicId'); // Lấy comicId từ localStorage

            if (!storedUsername) {
                console.error('Không tìm thấy username trong localStorage.');
                return; // Nếu không có username, thoát khỏi hàm
            }

            if (!storedComicId) {
                console.warn('Không có comicId để lấy lịch sử đọc.');
                return; // Nếu không có comicId, thoát khỏi hàm
            }

            try {
                console.log('Giá trị username từ localStorage:', storedUsername);
                console.log('Giá trị comicId từ localStorage:', storedComicId);

                // Gọi API để lấy lịch sử đọc theo username
                const historyResponse = await axios.get(`http://localhost:5000/api/history/${storedUsername}`);
                console.log("Phản hồi từ API:", historyResponse.data);

                // Lưu toàn bộ dữ liệu vào state
                setHistories(historyResponse.data);

                // Lọc ra lịch sử đọc theo comicId
                const currentComicHistories = historyResponse.data.filter(history => history.comicId === storedComicId);
                if (currentComicHistories.length > 0) {
                    const lastChapterReadValue = currentComicHistories[currentComicHistories.length - 1].lastChapterRead; // Lấy lastChapterRead gần nhất
                    console.log("Giá trị lastChapterRead từ API:", lastChapterReadValue);

                    if (typeof lastChapterReadValue === 'number') {
                        setLastChapterRead(lastChapterReadValue); // Lưu giá trị hợp lệ
                    } else {
                        console.warn('lastChapterRead không hợp lệ trong dữ liệu trả về');
                    }
                } else {
                    console.warn(`Không tìm thấy lịch sử đọc cho comicId: ${storedComicId}`);
                }

            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error.message);
                console.error('Chi tiết lỗi:', error.response);
            }
        };

        fetchReadingHistories();
    }, []);


    const getShortDescription = (description) => {
        return description.length > maxDescriptionLength
            ? description.slice(0, maxDescriptionLength) + '...'
            : description;
    };

    const handleLikeComic = () => {
        const username = localStorage.getItem('username');
        const likedComics = JSON.parse(localStorage.getItem('likedComics')) || [];

        if (isLiked) {
            // Nếu đã thích, bỏ thích
            const updatedLikedComics = likedComics.filter(comicId => comicId !== id);
            localStorage.setItem('likedComics', JSON.stringify(updatedLikedComics));

            // Trừ lượt thích ngay lập tức
            setComic(prevComic => ({
                ...prevComic,
                likes: prevComic.likes - 1
            }));
            setIsLiked(false);

            // Gọi API để bỏ thích
            fetch(`http://localhost:5000/api/comics/${id}/like`, {
                method: 'DELETE',
            }).catch(error => console.error('Error:', error));

        } else {
            // Nếu chưa thích, thích
            likedComics.push(id);
            localStorage.setItem('likedComics', JSON.stringify(likedComics));

            // Cộng lượt thích ngay lập tức
            setComic(prevComic => ({
                ...prevComic,
                likes: prevComic.likes + 1
            }));
            setIsLiked(true);

            // Gọi API để thích
            fetch(`http://localhost:5000/api/comics/${id}/like`, {
                method: 'POST',
            })
                .catch(error => console.error('Error:', error));
        }
    };

    const handleAddComment = async (event) => {
        event.preventDefault();

        // Kiểm tra trường hợp phản hồi hoặc bình luận
        const content = replyingTo ? replyContent : newComment;
        if (!content.trim() || !commentAuthor.trim()) {
            setError('Vui lòng nhập đầy đủ thông tin bình luận/phản hồi và tên người dùng.');
            return;
        }

        try {
            if (replyingTo) {
                // Gửi phản hồi nếu đang trong trạng thái phản hồi
                const response = await axios.post(`http://localhost:5000/api/comments/${replyingTo}/replies`, {
                    user: commentAuthor,
                    content: replyContent,
                    reason: "Lý do mặc định" // Bạn có thể điều chỉnh lý do này tùy ý
                });

                // Cập nhật phản hồi cho bình luận tương ứng trong danh sách bình luận
                setComments(prevComments => prevComments.map(comment =>
                    comment._id === replyingTo ? { ...comment, replies: [...comment.replies, response.data] } : comment
                ));

                // Reset trạng thái sau khi phản hồi
                setReplyContent('');
                setReplyingTo(null);
            } else {
                // Nếu không phải phản hồi thì thêm bình luận mới
                const response = await axios.post(`http://localhost:5000/api/comments/${id}`, {
                    user: commentAuthor,
                    content: newComment,
                    reason: "Lý do mặc định"
                });

                // Thêm bình luận mới vào danh sách bình luận trong trạng thái
                setComments(prevComments => [...prevComments, response.data]);

                // Reset ô nhập liệu
                setNewComment('');
            }

            // Xóa lỗi (nếu có)
            setError(null);
        } catch (error) {
            setError('Lỗi khi gửi bình luận hoặc phản hồi. Vui lòng thử lại sau.');
            console.error('Error posting comment/reply:', error);
        }
    };

    const handleReply = async (commentId) => {
        if (!replyContent || !commentAuthor) return;

        // Kiểm tra xem người dùng có phải là tác giả của bình luận không
        const comment = comments.find(c => c._id === commentId);
        if (comment && comment.user === commentAuthor) {
            setError('Bạn không thể phản hồi bình luận của chính mình.');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:5000/api/comments/${commentId}/reply`, {
                user: commentAuthor,
                content: replyContent,
            });

            setComments(prevComments =>
                prevComments.map(comment =>
                    comment._id === commentId
                        ? { ...comment, replies: [...comment.replies, response.data] }
                        : comment
                )
            );
            setReplyContent('');
            setReplyingTo(null);
        } catch (error) {
            setError('Lỗi khi gửi phản hồi. Vui lòng thử lại sau.');
        }
    };

    const handleRating = async (value) => {
        console.log('Hàm handleRating đã được gọi với giá trị:', value);

        // Lấy thông tin người dùng từ localStorage
        const username = localStorage.getItem('username');

        if (!username) {
            alert("Bạn cần đăng nhập để đánh giá.");
            return;
        }

        // Tạo một key duy nhất dựa trên username và comicId
        const userRatingKey = `rating_${id}_${username}`;

        // Kiểm tra nếu người dùng đã đánh giá truyện trước đó
        const existingRating = localStorage.getItem(userRatingKey);
        if (existingRating) {
            alert("Bạn đã đánh giá truyện này rồi.");
            return; // Dừng lại, không gửi POST nữa
        }

        try {
            // Lấy thông tin người dùng từ server
            const response = await axios.get('http://localhost:5000/api/users');
            let currentUser = null;

            if (response.data && response.data.length > 0) {
                currentUser = response.data.find(user => user.username === username);
            }

            if (!currentUser) {
                console.error('Không tìm thấy người dùng hiện tại');
                return;
            }

            // Kiểm tra xem người dùng đã đọc truyện chưa bằng cách gọi POST
            const readStatusResponse = await axios.post(`http://localhost:5000/api/comics/${id}/has-read`, { username });
            console.log('Read Status Response:', readStatusResponse.data);

            const hasRead = readStatusResponse.data.hasRead;

            if (!hasRead) {
                alert("Bạn cần đọc truyện trước khi có thể đánh giá.");
                return;
            }

            // Nếu người dùng đã đọc truyện, tiếp tục với logic đánh giá
            await axios.post(`http://localhost:5000/api/comics/${id}/rate`, { rating: value, username });

            // Gọi lại dữ liệu comic để lấy lại thông tin đánh giá mới nhất
            const comicResponse = await axios.get(`http://localhost:5000/api/comics/${id}`);
            updateRating(comicResponse.data);
            setUserRating(value);

            // Lưu đánh giá vào localStorage, sử dụng userRatingKey
            localStorage.setItem(userRatingKey, value);

            alert('Đánh giá của bạn đã được gửi thành công!');

        } catch (error) {
            console.error('Lỗi khi gửi đánh giá:', error.response ? error.response.data : error.message);
            alert('Lỗi khi gửi đánh giá. Vui lòng thử lại sau.');
        }
    };

    const handleViewComic = async () => {
        const username = localStorage.getItem('username');
        const viewedComics = JSON.parse(localStorage.getItem('viewedComics')) || [];
        const readComicsCount = JSON.parse(localStorage.getItem('readComicsCount')) || 0; // Lấy số lượng truyện đã đọc

        if (viewedComics.includes(id)) {
            console.log('Người dùng đã xem truyện này trước đó.');
            return; // Nếu đã xem, không cần thực hiện gì thêm
        } else {
            // Nếu chưa xem, thêm vào danh sách đã xem
            viewedComics.push(id);
            localStorage.setItem('viewedComics', JSON.stringify(viewedComics));

            // Cập nhật số lượng truyện đã đọc
            const newReadComicsCount = readComicsCount + 1; // Tăng số lượng truyện đã đọc
            localStorage.setItem('readComicsCount', JSON.stringify(newReadComicsCount)); // Cập nhật vào localStorage

            // Gọi API để tăng lượt xem
            try {
                const response = await fetch(`http://localhost:5000/api/comics/${id}/view`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: username }),
                });

                if (!response.ok) {
                    throw new Error('Lỗi khi tăng lượt xem');
                }
                const data = await response.json();
                console.log('Lượt xem đã được tăng lên:', data);
                setComic(prevComic => ({
                    ...prevComic,
                    views: data.views // Cập nhật số lượt xem từ phản hồi
                }));

                // Gọi API để cập nhật số lượng truyện đã đọc
                await fetch(`http://localhost:5000/api/users/${username}/comicsRead`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ comicsRead: newReadComicsCount }),
                });
                console.log('Số lượng truyện đã đọc được cập nhật:', newReadComicsCount);
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };


    const handleDeleteComment = async (commentId, isAdminDelete = false) => {
        try {
            // Xóa bình luận từ server
            await axios.delete(`http://localhost:5000/api/comments/${commentId}`);

            // Cập nhật danh sách bình luận trong state
            setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
            setFilteredComments(prevComments => prevComments.filter(comment => comment._id !== commentId));

            // Nếu là admin xóa bình luận
            if (isAdminDelete) {
                // Kiểm tra xem bình luận đã bị xóa chưa và thông báo đã gửi chưa
                if (deletedCommentId !== commentId && !hasSentNotification) {
                    // Hiển thị thông báo cho admin
                    setShowModal(true); // Hiển thị modal thông báo
                    setNotifications(prev => [...prev, { _id: commentId, message: 'Bình luận đã bị xóa bởi admin.' }]);
                    setDeletedCommentId(commentId); // Lưu ID bình luận đã xóa
                    setHasSentNotification(true); // Đánh dấu thông báo đã được gửi
                }
            }

        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };


    // Hàm xóa phản hồi
    const handleDeleteReply = async (commentId, replyIndex, reason) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/comments/${commentId}/replies/${replyIndex}`, { reason });
            if (response.status === 200) {
                const updatedComments = comments.map(comment => {
                    if (comment._id === commentId) {
                        comment.replies.splice(replyIndex, 1); // Xóa phản hồi khỏi danh sách
                    }
                    return comment;
                });
                setComments(updatedComments);
                setFilteredComments(updatedComments);
            }
        } catch (error) {
            console.error('Error deleting reply:', error);
        }
    };

    const handleReadMore = () => {
        const storedComicId = localStorage.getItem('currentComicId');
        const username = localStorage.getItem('username');

        if (!storedComicId || !username) {
            console.warn('Không tìm thấy comicId hoặc username trong localStorage');
            return;
        }

        // Lấy danh sách lịch sử đọc từ localStorage
        const readingHistories = JSON.parse(localStorage.getItem('readingHistories')) || [];

        // Kiểm tra xem người dùng đã đọc truyện này chưa
        const userHistory = readingHistories.find(
            (history) => history.comicId === storedComicId && history.username === username
        );

        if (!userHistory) {
            console.log('Truyện chưa đọc, không có lịch sử.');
            return;
        }

        // Nếu có lịch sử đọc, kiểm tra xem đã đọc chương nào và vị trí đã đọc
        const { lastChapterRead, lastReadPosition } = userHistory;

        if (lastChapterRead && lastReadPosition) {
            console.log(`Đã đọc chương ${lastChapterRead} tại vị trí ${lastReadPosition}`);

            const lastReadPositionData = localStorage.getItem(`lastReadPosition_${storedComicId}_${lastChapterRead}`);
            if (lastReadPositionData) {
                const { positionId } = JSON.parse(lastReadPositionData);
                setTimeout(() => {
                    const positionElement = document.getElementById(positionId);
                    if (positionElement) {
                        positionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        console.warn(`Không tìm thấy phần tử với ID: ${positionId}`);
                    }
                }, 100);
            }
        } else {
            console.warn('Không tìm thấy thông tin chương hoặc vị trí đọc.');
        }
    };

    const downloadChapterImages = async (title, chapterNumber) => {
        try {
            // Kiểm tra xem chương truyện đã được tải hay chưa bằng localStorage
            const downloadedChapters = JSON.parse(localStorage.getItem('downloadedChapters')) || {};
            if (downloadedChapters[title] && downloadedChapters[title].includes(chapterNumber)) {
                alert('Chương truyện này đã được tải trước đó.');
                return;
            }

            // Kiểm tra xem có mạng hay không
            if (!navigator.onLine) {
                alert('Không thể tải chương truyện khi offline.');
                return;
            }

            // Lấy dữ liệu hình ảnh từ API khi có mạng
            const response = await axios.get(`http://localhost:5000/api/chapters/${encodeURIComponent(title)}/chapters/${chapterNumber}`);
            if (!response.data || response.data.length === 0) {
                throw new Error("Dữ liệu không hợp lệ hoặc không có trang nào.");
            }

            const imageUrls = response.data.map(img => img.imageUrl);

            // Mở cửa sổ mới để hiển thị hình ảnh
            const imageWindow = window.open('', '_blank');

            // Tạo giao diện hiển thị hình ảnh trong cửa sổ mới
            imageWindow.document.write(`
            <html>
                <head>
                    <title>${title} - Chapter ${chapterNumber}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            padding: 0;
                            background-color: #f4f4f4;
                            margin: 0;
                            overflow-x: hidden;
                        }
                        .image-container {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                            overflow-y: auto;
                            margin: 0;
                        }
                        img {
                            max-width: 100%;
                            margin: 0;
                            display: block;
                        }
                    </style>
                </head>
                <body>
                    <div class="image-container">
            `);

            // Thêm các hình ảnh vào cửa sổ mới
            imageUrls.forEach((relativePath, index) => {
                const url = `http://localhost:5000/${relativePath.replace(/\\/g, '/')}`;
                const imgElement = document.createElement('img');
                imgElement.src = url;
                imgElement.alt = `${title} Chapter ${chapterNumber} Image ${index + 1}`;
                imageWindow.document.body.appendChild(imgElement);
            });

            // Đóng phần HTML lại
            imageWindow.document.write(`</div></body></html>`);

            // Lưu các hình ảnh vào cache và localStorage
            if ('serviceWorker' in navigator) {
                const cacheName = 'comic-chapters-cache-v1';  // Tên cache đã được định nghĩa trước đó
                const cache = await caches.open(cacheName);
                for (const imageUrl of imageUrls) {
                    const fullUrl = `http://localhost:5000/${imageUrl.replace(/\\/g, '/')}`;
                    // Tải hình ảnh và lưu vào cache
                    await fetch(fullUrl).then(response => {
                        if (response.ok) {
                            cache.put(fullUrl, response.clone());  // Lưu vào cache
                        }
                    });
                }
            }

            // Cập nhật trạng thái chương đã tải vào localStorage
            updateDownloadedChapters(title, chapterNumber);

            alert('Chương truyện đã được tải và có thể đọc offline.');

        } catch (error) {
            console.error("Lỗi khi tải hình ảnh chương:", error);
            alert(error.message); // Hiển thị thông báo lỗi
        }
    };

    // Hàm cập nhật `localStorage` khi chương truyện được tải
    const updateDownloadedChapters = (title, chapterNumber) => {
        const downloadedChapters = JSON.parse(localStorage.getItem('downloadedChapters')) || {};
        if (!downloadedChapters[title]) {
            downloadedChapters[title] = [];
        }
        if (!downloadedChapters[title].includes(chapterNumber)) {
            downloadedChapters[title].push(chapterNumber);
            localStorage.setItem('downloadedChapters', JSON.stringify(downloadedChapters));
        }
    };

    // Kiểm tra xem người dùng có thể đọc chương khi offline không
    const canReadChapterOffline = (title, chapterNumber) => {
        const downloadedChapters = JSON.parse(localStorage.getItem('downloadedChapters')) || {};
        if (downloadedChapters[title] && downloadedChapters[title].includes(chapterNumber)) {
            return true;  // Đã tải chương, có thể đọc offline
        }
        return false;  // Chưa tải chương, không thể đọc offline
    };

    // Hàm gọi khi chuyển đến trang chương truyện
    const openChapterWhenOffline = (title, chapterNumber) => {
        if (!navigator.onLine) {
            // Kiểm tra xem chương truyện đã được tải chưa
            if (canReadChapterOffline(title, chapterNumber)) {
                openChapterFromCache(title, chapterNumber);  // Mở chương từ cache
            } else {
                alert('Không thể đọc chương truyện khi offline. Vui lòng tải trước khi mất kết nối.');
            }
        }
    };

    // Mở chương từ cache
    const openChapterFromCache = async (title, chapterNumber) => {
        const cache = await caches.open('comic-chapters-cache-v1');
        const cachedChapterKey = `http://localhost:5000/${title}/chapter-${chapterNumber}`;
        const cachedResponse = await cache.match(cachedChapterKey);

        if (cachedResponse) {
            const imageUrls = await cachedResponse.json();
            // Mở cửa sổ mới để hiển thị hình ảnh từ cache
            const imageWindow = window.open('', '_blank');
            imageWindow.document.write(`
            <html>
                <head>
                    <title>${title} - Chapter ${chapterNumber}</title>
                </head>
                <body>
                    <div class="image-container">
            `);

            imageUrls.forEach((img, index) => {
                const imgElement = document.createElement('img');
                imgElement.src = img;
                imgElement.alt = `${title} Chapter ${chapterNumber} Image ${index + 1}`;
                imageWindow.document.body.appendChild(imgElement);
            });

            imageWindow.document.write(`</div></body></html>`);
        }
    };

    useEffect(() => {
        handleViewComic();
    }, []);  // Chỉ chạy khi component này được render lần đầu

    useEffect(() => {
        // Hiển thị modal nếu chưa từng đóng
        if (!hasDisplayedModal) {
            setShowModal(true);
        }
    }, [hasDisplayedModal]);

    useEffect(() => {
        // Khi component được tải lại, lấy trạng thái từ localStorage (nếu có)
        const storedChapters = JSON.parse(localStorage.getItem('downloadedChapters')) || [];
        setDownloadedChapters(storedChapters);
    }, []); // Chỉ chạy khi component mount lần đầu

    // Hàm đóng modal
    const handleCloseModal = () => {
        setShowModal(false);
        localStorage.setItem('hasDisplayedModal', 'true'); // Lưu trạng thái đã hiển thị
    };

    if (loading) {
        return <p>Đang tải truyện...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!comic) {
        return <p>Không tìm thấy truyện.</p>;
    }

    // Tạo liên kết đến chương đầu tiên của truyện
    const firstChapterLink = comic ? `/read/${encodeURIComponent(comic.title)}/chapter/1` : '#';

    return (
        <div className="comic-page-container">
            <Header />
            <div className="comic-background">
                <main className="comic-content">
                    <div className="comic-header">
                        <img src={`http://localhost:5000/${comic.coverImage}`} alt={comic.title} className="comic-cover" />
                        <div className="comic-details">
                            <h1 className="comic-title">{comic.title}</h1>
                            <div className="comic-meta">
                                <span className="comic-views">
                                    <FontAwesomeIcon icon={faEye} /> Lượt xem: {comic.views}
                                </span>
                                <span className="comic-likes">
                                    <FontAwesomeIcon icon={faHeart} /> Lượt thích: {comic.likes || 0}
                                </span>
                                <span className="comic-chapters">
                                    <FontAwesomeIcon icon={faBook} /> Chương: {comic.chapters}
                                </span>
                            </div>
                            <div className="comic-author-genre">
                                <span className="comic-author">
                                    <strong>Tác giả:</strong> {comic.author}
                                </span>
                                <span className="comic-genre">
                                    <strong>Thể loại:</strong> {comic.category}
                                </span>
                                <span className="comic-status">
                                    <strong>Trạng thái:</strong> {comic.status}
                                </span>
                                <div className="rating-section">
                                    <p>Đánh giá:</p>
                                    <div className="stars">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FontAwesomeIcon
                                                key={star}
                                                icon={faStar}
                                                className={`star ${star <= (rating || averageRating) ? 'filled' : ''}`}
                                                onClick={() => handleRating(star)}
                                            />
                                        ))}
                                    </div>
                                    <h3>Xếp hạng: {averageRating.toFixed(1)}/5 - {totalRatings} Lượt đánh giá.</h3>
                                </div>
                            </div>
                            <p className="comic-description">
                                {showFullDescription ? comic.description : getShortDescription(comic.description)}
                            </p>
                            <button className="btn btn-show-more" onClick={() => setShowFullDescription(!showFullDescription)}>
                                <FontAwesomeIcon icon={showFullDescription ? faChevronUp : faChevronDown} />
                                {showFullDescription ? ' Ẩn bớt' : ' Xem thêm'}
                            </button>
                            <div className="btn-container">
                                <Link to={firstChapterLink} className="btn btn-read-now"
                                    onClick={async (e) => {
                                        e.preventDefault(); // Ngăn chặn link chuyển trang ngay lập tức
                                        await handleViewComic(); // Gọi hàm tăng lượt xem
                                        window.location.href = firstChapterLink; // Sau khi xử lý xong, chuyển hướng người dùng
                                    }}>
                                    <FontAwesomeIcon icon={faArrowRight} /> Đọc Ngay
                                </Link>
                                <button className="btn btn-like" onClick={handleLikeComic}>
                                    <FontAwesomeIcon icon={faHeart} /> {isLiked ? 'Bỏ Thích' : 'Yêu Thích'}
                                </button>

                                <button className="btn btn-chapters" onClick={() => setShowChapters(!showChapters)}>
                                    <FontAwesomeIcon icon={faBook} /> Chương
                                </button>
                                <button className="btn btn-comments" onClick={() => setShowComments(!showComments)}>
                                    <FontAwesomeIcon icon={faComment} /> Bình Luận
                                </button>
                            </div>

                            {showModal && !hasDisplayedModal && (
                                <div className="modal">
                                    <div className="modal-content">
                                        <span className="close" onClick={handleCloseModal}>&times;</span>
                                        <h2>Thông báo</h2>
                                        {notifications.map((notification) => (
                                            <div key={notification._id}>
                                                {notification.message}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {showChapters && comic && (
                                <div className="chapter-list">
                                    {Array.from({ length: comic.chapters }, (_, index) => {
                                        // Xác định số chương tối đa mà người dùng được phép xem
                                        let maxChapters;
                                        switch (accountLevel) {
                                            case 'Level 10':
                                                maxChapters = comic.chapters;
                                                break;
                                            case 'Level 9':
                                                maxChapters = 5 + 3 * 8; // 29 chương
                                                break;
                                            case 'Level 8':
                                                maxChapters = 5 + 3 * 7; // 26 chương
                                                break;
                                            case 'Level 7':
                                                maxChapters = 5 + 3 * 6; // 23 chương
                                                break;
                                            case 'Level 6':
                                                maxChapters = 5 + 3 * 5; // 20 chương
                                                break;
                                            case 'Level 5':
                                                maxChapters = 5 + 3 * 4; // 17 chương
                                                break;
                                            case 'Level 4':
                                                maxChapters = 5 + 3 * 3; // 14 chương
                                                break;
                                            case 'Level 3':
                                                maxChapters = 5 + 3 * 2; // 11 chương
                                                break;
                                            case 'Level 2':
                                                maxChapters = 5 + 3 * 1; // 8 chương
                                                break;
                                            case 'Level 1':
                                                maxChapters = 5; // 5 chương
                                                break;
                                            case 'Bình thường':
                                            default:
                                                maxChapters = 5; // 5 chương
                                                break;
                                        }

                                        const isAccessible = index < maxChapters;
                                        const storedUsername = localStorage.getItem('username');
                                        const lastReadChaptersForCurrentComic = histories
                                            .filter(
                                                history =>
                                                    history.comicId === id && // Chỉ lấy lịch sử của truyện hiện tại
                                                    history.username === storedUsername && // Đảm bảo lịch sử thuộc về người dùng hiện tại
                                                    typeof history.lastChapterRead === 'number' // Chỉ lấy lịch sử hợp lệ
                                            )
                                            .map(history => history.lastChapterRead); // Tạo mảng chứa lastChapterRead của truyện hiện tại

                                        // Kiểm tra xem chương hiện tại đã được đọc hay chưa
                                        const isChapterReadForCurrentComic = lastReadChaptersForCurrentComic.includes(index + 1);
                                        console.log(`Truyện ID: ${id}, Chương hiện tại: ${index + 1}, Đã đọc: ${isChapterReadForCurrentComic}`);
                                        return (
                                            <span key={index + 1} className={`chapter-item ${!isAccessible ? 'restricted' : ''}`}>
                                                {isAccessible ? (
                                                    <>
                                                        <div className="chapter-header">
                                                            <Link
                                                                to={`/read/${encodeURIComponent(comic.title)}/chapter/${index + 1}`}
                                                            >
                                                                Chương {index + 1}
                                                            </Link>
                                                            {isChapterReadForCurrentComic && (
                                                                <Link
                                                                    className="bookmark-text"
                                                                    to={`/read/${encodeURIComponent(comic.title)}/chapter/${index + 1}`}
                                                                    onClick={handleReadMore}
                                                                >
                                                                    Đọc tiếp
                                                                </Link>
                                                            )}
                                                            <FontAwesomeIcon
                                                                icon={isDownloaded(comic.title, index + 1) ? faCheckCircle : faDownload}
                                                                className="download-icon"
                                                                title={isDownloaded(comic.title, index + 1) ? "Đã tải xong" : "Tải xuống chương"}
                                                                onClick={() => {
                                                                    if (!isDownloaded(comic.title, index + 1)) {
                                                                        downloadChapterImages(comic.title, index + 1);
                                                                    }
                                                                }}
                                                                style={{ color: isDownloaded(comic.title, index + 1) ? "green" : "black" }}
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span>
                                                        Chương {index + 1} (Không đủ quyền truy cập)
                                                    </span>
                                                )}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                            {showComments && (
                                <div className="comment-section">
                                    <form
                                        className="comment-form"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (replyingTo) {
                                                // Nếu đang phản hồi, gọi hàm phản hồi
                                                handleReply(replyingTo);
                                                setReplyContent('');
                                                setReplyingTo(null);
                                            } else {
                                                // Nếu không phải đang phản hồi, gọi hàm thêm bình luận
                                                handleAddComment(e);
                                                setNewComment('');
                                            }
                                        }}
                                    >
                                        <div className="textarea-container">
                                            <textarea
                                                placeholder={replyingTo ? `Nhập phản hồi cho ${comments.find(c => c._id === replyingTo)?.user}...` : "Nhập bình luận của bạn..."}
                                                value={replyingTo ? replyContent : newComment}
                                                onChange={(e) => {
                                                    if (replyingTo) {
                                                        setReplyContent(e.target.value); // Cập nhật nội dung phản hồi
                                                    } else {
                                                        setNewComment(e.target.value); // Cập nhật nội dung bình luận
                                                    }
                                                }}
                                                required
                                            />
                                            <button type="submit" className="send-icon">
                                                <FontAwesomeIcon icon={faPaperPlane} />
                                            </button>
                                        </div>
                                    </form>
                                    <div className="comments-list">
                                        {comments.map(comment => (
                                            <div key={comment._id} className="comment">
                                                <div className="comment-header">
                                                    <p className="comment-user">{comment.user}:</p>
                                                    <p className="comment-content">{comment.content}</p>
                                                    {/* Hiển thị lý do xóa nếu có */}
                                                    {comment.deleted && comment.deleteReason && (
                                                        <p className="delete-reason">Lý do bị xóa: {comment.deleteReason}</p>
                                                    )}
                                                    <div className="comments-actions">
                                                        {/* Chỉ hiển thị nút phản hồi nếu không phải chủ bình luận */}
                                                        {comment.user !== commentAuthor && (
                                                            <button
                                                                className="btn btn-reply"
                                                                onClick={() => {
                                                                    setReplyingTo(replyingTo === comment._id ? null : comment._id);
                                                                    setReplyContent(''); // Xóa nội dung phản hồi khi nhấn nút phản hồi
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faReply} /> Phản hồi
                                                            </button>
                                                        )}

                                                        {/* Chỉ hiển thị nút xóa nếu người dùng là chủ bình luận */}
                                                        {comment.user === commentAuthor && (
                                                            <button
                                                                className="btn btn-delete"
                                                                onClick={() => {
                                                                    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?');
                                                                    if (confirmDelete) {
                                                                        handleDeleteComment(comment._id); // Gọi hàm xóa
                                                                    }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faTrashAlt} /> Xóa
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Hiển thị phần phản hồi */}
                                                {comment.replies && comment.replies.length > 0 && (
                                                    <div className="replies">
                                                        {comment.replies.map((reply, index) => (
                                                            <div key={index} className="reply">
                                                                <div className="reply-header">
                                                                    <p className="reply-author">{reply.user}:</p>
                                                                    <p className="reply-content">{reply.content}</p>
                                                                    <button
                                                                        className="btn btn-delete-reply"
                                                                        onClick={() => handleDeleteReply(reply._id)} // Xóa phản hồi không cần lý do
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrashAlt} /> Xóa
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Hiển thị form trả lời bình luận */}
                                                {replyingTo === comment._id && (
                                                    <p className="replying-message">Đang trả lời {comment.user}...</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default ComicsPage;
