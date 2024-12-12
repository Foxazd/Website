import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import logo from '../assets/images/logo1.png';
import '../assets/css/ReadComic.css';
import axios from 'axios';

const ReadComic = () => {
    const { title, chapterNumber } = useParams();
    const navigate = useNavigate();
    const [chapterContent, setChapterContent] = useState([]);
    const [totalChapters, setTotalChapters] = useState(0);
    const [accountLevel, setAccountLevel] = useState('');
    const [comicsRead, setComicsRead] = useState(0);
    const [currentChapter, setCurrentChapter] = useState(Number(chapterNumber));
    const [comicId, setComicId] = useState(null);
    const [username, setUsername] = useState(null);
    const [category, setCategory] = useState(null);
    const [headerVisible, setHeaderVisible] = useState(true);
    const [footerVisible, setFooterVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isZoomOutDisabled, setIsZoomOutDisabled] = useState(true);
    const [isZoomInDisabled, setIsZoomInDisabled] = useState(false);
    let scrollTimeoutId;
    const [hasReadComics, setHasReadComics] = useState(new Set());
    const [showModal, setShowModal] = useState(false);
    const [userLevel, setUserLevel] = useState('');
    const [requiredLevel, setRequiredLevel] = useState('');
    const [moneyToPay, setMoneyToPay] = useState(0);
    const [formattedMoney, setFormattedMoney] = useState('');

    useEffect(() => {
        const fetchComicsData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/comics`);
                if (!response.ok) throw new Error('Lỗi khi tải dữ liệu truyện');

                const data = await response.json();
                const comic = data.find(comic => comic.title === title);
                if (comic) {
                    setComicId(comic._id);
                    setTotalChapters(comic.chapters);
                    setCategory(comic.category);
                } else {
                    console.error('Không tìm thấy truyện', title);
                }
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu truyện', error);
            }
        };

        fetchComicsData();
    }, [title]);

    useEffect(() => {
        setCurrentChapter(Number(chapterNumber));
    }, [chapterNumber]);

    // Định nghĩa hàm getAccountLevel
    const getAccountLevel = (comicsRead) => {
        switch (true) {
            case comicsRead >= 50:
                return 'Level 10'; // Cấp độ cao nhất
            case comicsRead >= 40:
                return 'Level 9';  // Cấp độ 9
            case comicsRead >= 30:
                return 'Level 8';  // Cấp độ 8
            case comicsRead >= 20:
                return 'Level 7';  // Cấp độ 7
            case comicsRead >= 15:
                return 'Level 6';  // Cấp độ 6
            case comicsRead >= 10:
                return 'Level 5';  // Cấp độ 5
            case comicsRead >= 5:
                return 'Level 4';  // Cấp độ 4
            case comicsRead >= 3:
                return 'Level 3';  // Cấp độ 3
            case comicsRead >= 1:
                return 'Level 2';  // Cấp độ 2
            default:
                return 'Bình thường'; // Cấp độ mặc định
        }
    };

    // Định nghĩa hàm getRequiredLevel
    const getRequiredLevel = (chapter) => {
        if (chapter >= 30) return 'Level 7';
        if (chapter >= 20) return 'Level 5';
        if (chapter >= 10) return 'Level 3';
        return 'Bình thường';
    };

    // Lấy danh sách người dùng từ API
    useEffect(() => {
        const fetchUserData = async () => {
            if (username) {
                try {
                    const response = await axios.get('http://localhost:5000/api/users');
                    const user = response.data.find(u => u.username === username);

                    if (user) {
                        setAccountLevel(user.accountLevel);
                        setComicsRead(user.comicsRead);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, [username]);

    useEffect(() => {
        const fetchChapterContent = async () => {
            if (!comicId || !currentChapter || !username || !accountLevel) return; // Kiểm tra điều kiện cần thiết

            setLoading(true); // Bắt đầu trạng thái loading

            try {
                const userLevel = accountLevel; // Lấy cấp độ người dùng từ accountLevel

                // Kiểm tra nếu có dữ liệu trong localStorage để tránh tính toán lại khi reload trang
                let requiredLevel = localStorage.getItem('requiredLevel');

                if (!requiredLevel) {
                    // Nếu chưa có dữ liệu trong localStorage, tính toán lại
                    requiredLevel = getRequiredLevel(currentChapter); // Hàm này trả về cấp độ yêu cầu
                    localStorage.setItem('requiredLevel', requiredLevel); // Lưu trữ vào localStorage
                }

                console.log(`userLevel: ${userLevel}, requiredLevel: ${requiredLevel}`);

                // Tính toán số tiền cần nạp để lên cấp
                let moneyToPay = getMoneyToPay(userLevel); // Hàm này tính toán số tiền cần nạp
                const moneyPerLevel = getMoneyNeededPerLevel(userLevel); // Hàm này trả về số tiền cần để nâng cấp cấp độ

                console.log(`moneyPerLevel: ${moneyPerLevel}`);

                if (userLevel === 'Level 10') {
                    // Nếu cấp độ người dùng đã đạt hoặc vượt qua Level 10
                    console.log(`Bạn đã đạt cấp độ 10, có thể đọc chương này mà không cần thêm tiền.`);
                    alert(`Bạn đã đạt cấp độ 10, có thể đọc chương này mà không cần thêm tiền.`);
                } else if (userLevel < requiredLevel) {
                    // Nếu cấp độ người dùng thấp hơn cấp độ yêu cầu
                    moneyToPay = (requiredLevel - userLevel) * moneyPerLevel;

                    // Kiểm tra giá trị moneyToPay để đảm bảo không phải NaN
                    console.log(`Tính toán moneyToPay: ${moneyToPay}`);

                    if (isNaN(moneyToPay) || moneyToPay < 0) {
                        moneyToPay = 0; // Nếu có lỗi tính toán, gán 0
                    }

                    // Hiển thị thông báo và lựa chọn nạp tiền
                    const userChoice = window.confirm(`Bạn cần cấp độ ${requiredLevel} để đọc chương này. Bạn đang ở cấp độ ${userLevel}. 
            1. Đọc thêm hoặc nạp thêm tiền để lên cấp nhanh hơn. 
            2. Hoặc bạn có thể nạp tiền để lên cấp ngay.`);

                    if (userChoice) {
                        // Nếu người dùng chọn "Nạp Tiền"
                        setShowModal(true);
                    } else {
                        // Nếu người dùng chọn "Đọc thêm truyện"
                        alert(`Bạn cần nạp thêm ${moneyToPay} tiền để lên cấp ${requiredLevel}.`);
                        return; // Dừng lại nếu không đủ cấp độ
                    }
                } else if (userLevel === requiredLevel) {
                    // Nếu cấp độ người dùng bằng cấp độ yêu cầu
                    alert(`Bạn đang ở cấp độ ${userLevel}. Bạn vừa đủ để đọc chương này.`);
                } else if (userLevel > requiredLevel) {
                    // Nếu cấp độ người dùng cao hơn cấp độ yêu cầu
                    alert(`Bạn đang ở cấp độ ${userLevel}. Bạn dễ dàng vượt qua yêu cầu cấp độ ${requiredLevel} để đọc chương này.`);
                }

                // Fetch nội dung chương
                const response = await fetch(`http://localhost:5000/api/chapters/${comicId}/chapter/${currentChapter}`);
                if (!response.ok) {
                    throw new Error('Lỗi khi tải nội dung chương');
                }

                const data = await response.json();
                setChapterContent(data.pages);

                // Lưu lịch sử đọc
                await saveReadingHistory();

                // Cuộn đến vị trí đọc cuối cùng
                scrollToLastReadPosition(comicId, currentChapter);
            } catch (error) {
                console.error('Lỗi khi tải nội dung chương:', error);
                alert('Có lỗi xảy ra, vui lòng thử lại sau.');
            } finally {
                setLoading(false); // Kết thúc trạng thái loading
            }
        };

        const getMoneyNeededPerLevel = (userLevel) => {
            switch (userLevel) {
                case 'Level 1': return 10000; // Tiền cần để lên Level 2
                case 'Level 2': return 20000; // Tiền cần để lên Level 3
                case 'Level 3': return 30000; // Tiền cần để lên Level 4
                case 'Level 4': return 40000; // Tiền cần để lên Level 5
                case 'Level 5': return 50000; // Tiền cần để lên Level 6
                case 'Level 6': return 60000; // Tiền cần để lên Level 7
                case 'Level 7': return 70000; // Tiền cần để lên Level 8
                case 'Level 8': return 80000; // Tiền cần để lên Level 9
                case 'Level 9': return 90000; // Tiền cần để lên Level 10
                case 'Level 10': return 0;    // Không cần thêm tiền
                default: return 0;           // Mặc định
            }
        };

        const getMoneyToPay = (userLevel) => {
            const moneyPerLevel = getMoneyNeededPerLevel(userLevel); // Tính số tiền cần nạp theo mỗi cấp độ

            let moneyToPay = 0;
            switch (userLevel) {
                case 'Level 1': moneyToPay = 10000; break; // 10.000 VNĐ
                case 'Level 2': moneyToPay = 20000; break; // 20.000 VNĐ
                case 'Level 3': moneyToPay = 30000; break; // 30.000 VNĐ
                case 'Level 4': moneyToPay = 40000; break; // 40.000 VNĐ
                case 'Level 5': moneyToPay = 50000; break; // 50.000 VNĐ
                case 'Level 6': moneyToPay = 60000; break; // 60.000 VNĐ
                case 'Level 7': moneyToPay = 70000; break; // 70.000 VNĐ
                case 'Level 8': moneyToPay = 80000; break; // 80.000 VNĐ
                case 'Level 9': moneyToPay = 90000; break; // 90.000 VNĐ
                case 'Level 10': moneyToPay = 0; break;    // Miễn phí nếu đạt Level 10
                default: moneyToPay = 0; break;
            }

            return moneyToPay;
        };

        const scrollToLastReadPosition = (comicId, chapter) => {
            try {
                const lastReadPosition = localStorage.getItem(`lastReadPosition_${comicId}_${chapter}`);
                if (lastReadPosition) {
                    const { positionId } = JSON.parse(lastReadPosition);
                    const checkPositionExist = () => {
                        const positionElement = document.getElementById(positionId);
                        if (positionElement) {
                            positionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else {
                            console.warn(`Element with ID ${positionId} not found. Trying again...`);
                            // Chờ một chút và thử lại
                            setTimeout(checkPositionExist, 100);
                        }
                    };
                    // Thử cuộn đến vị trí
                    checkPositionExist();
                }
            } catch (error) {
                console.error('Lỗi khi cuộn đến vị trí đọc cuối:', error);
            }
        };

        fetchChapterContent(); // Gọi hàm tải nội dung chương
    }, [comicId, currentChapter, username, accountLevel]); // Thêm accountLevel vào dependencies

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const saveReadingHistory = async (lastReadPosition = null, percentageRead = 0) => {
        // Kiểm tra thông tin người dùng và truyện
        if (!username || !comicId) {
            console.warn("Thiếu thông tin người dùng hoặc truyện.");
            return;
        }

        // Tạo bản ghi lịch sử đọc cho truyện hiện tại
        const historyEntry = {
            username,
            comicId,
            lastChapterRead: currentChapter,
            lastReadPosition: lastReadPosition || null, // Lưu vị trí cuối cùng đã đọc
            progressPercentage: percentageRead,         // Lưu tỷ lệ đọc (phần trăm)
            category,  // Lưu thể loại truyện, nếu cần thiết
        };

        try {
            // Cập nhật 'currentComicId' khi người dùng thay đổi truyện
            localStorage.setItem('currentComicId', comicId);

            // Lấy danh sách lịch sử từ localStorage (hoặc khởi tạo mảng rỗng nếu chưa có)
            let readingHistories = JSON.parse(localStorage.getItem('readingHistories')) || [];

            // Thêm bản ghi mới vào danh sách lịch sử
            readingHistories.push(historyEntry);

            // Cập nhật lại localStorage với danh sách mới
            localStorage.setItem('readingHistories', JSON.stringify(readingHistories));

            // Lưu riêng lẻ thông tin để tiện truy xuất cho mỗi comicId và username
            localStorage.setItem(`lastChapterRead_${comicId}_${username}`, currentChapter);
            if (lastReadPosition) {
                localStorage.setItem(`lastReadPosition_${comicId}_${username}`, lastReadPosition);
            }
            if (percentageRead > 0) {
                localStorage.setItem(`percentageRead_${comicId}_${username}`, percentageRead);
            }

            console.log("Lịch sử đọc đã được lưu vào localStorage.");

            // Lưu thông tin vào server (nếu cần)
            try {
                const response = await axios.post('http://localhost:5000/api/history', historyEntry);
                console.log('Lịch sử đọc đã được lưu vào server:', response.data.message);
            } catch (error) {
                console.error('Lỗi khi lưu lịch sử đọc vào server:', error.response?.data.message || error.message);
            }

        } catch (localStorageError) {
            console.error("Lỗi khi lưu vào localStorage:", localStorageError);
        }
    };

    const handleReadingProgress = () => {
        const images = document.querySelectorAll('.comic-page');
        let lastVisibleImage = null;

        images.forEach((image, index) => {
            const rect = image.getBoundingClientRect();
            const imageHeight = rect.bottom - rect.top;

            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
                const visiblePercentage = visibleHeight / imageHeight;

                if (visiblePercentage > 0.5) {
                    lastVisibleImage = { positionId: `position-${index + 1}`, imageUrl: image.src };
                }
            }
        });

        const totalPages = images.length; // Tổng số trang truyện
        const lastReadIndex = lastVisibleImage ? parseInt(lastVisibleImage.positionId.split('-')[1], 10) : 0; // Trang cuối cùng đã đọc
        const percentageRead = Math.round((lastReadIndex / totalPages) * 100); // Tính phần trăm

        // Debug xem kết quả
        console.log(`Tổng số trang: ${totalPages}, Trang cuối đã đọc: ${lastReadIndex}, Tiến độ đọc: ${percentageRead}%`);

        if (percentageRead > 50) {
            saveReadingHistory(lastVisibleImage.positionId, percentageRead);
        }
    };


    const handlePrevChapter = () => {
        if (currentChapter > 1) {
            handleReadingProgress();
            setCurrentChapter(currentChapter - 1);
            navigate(`/read/${title}/chapter/${currentChapter - 1}`);
        }
    };

    const handleNextChapter = () => {
        const levelLimit = 5; // Giới hạn số chương cho cấp độ "Bình thường"
        const userLevel = accountLevel; // Lấy cấp độ hiện tại của người dùng
    
        // Kiểm tra xem người dùng có đang offline không
        const isOffline = !navigator.onLine;
    
        // Nếu đang offline, kiểm tra xem chương tiếp theo đã được tải chưa
        if (isOffline) {
            const downloadedChapters = JSON.parse(localStorage.getItem('downloadedChapters')) || {};
            if (!downloadedChapters[title] || !downloadedChapters[title].includes(currentChapter + 1)) {
                alert('Bạn không thể tiếp tục đọc chương tiếp theo khi đang offline. Hãy tải chương trước đó.');
                return; // Dừng lại nếu chương chưa được tải
            }
        }
    
        // Nếu là "Bình thường" và đạt giới hạn chương
        if (userLevel === 'Bình thường' && currentChapter >= levelLimit) {
            const requiredLevel = 'Level 1'; // Định nghĩa cấp độ tiếp theo (Level 1)
            const comicsToRead = getComicsToReadForLevel(requiredLevel, userLevel); // Tính số truyện cần đọc thêm
            
            setUserLevel(userLevel);
            setRequiredLevel(requiredLevel);
    
            // Thêm log để kiểm tra
            console.log(`User Level: ${userLevel}`);
            console.log(`Current Chapter: ${currentChapter}`);
            console.log(`Comics to Read to Level 1: ${comicsToRead}`);
    
            // Tạo thông báo phù hợp với số truyện cần đọc
            let readMoreMessage = '';
            if (comicsToRead > 0) {
                readMoreMessage = `đọc thêm ${comicsToRead} chương nữa để nâng cấp`;
            } else {
                readMoreMessage = 'bạn không cần đọc thêm truyện nữa để nâng cấp cấp độ';
            }
    
            // Hiển thị thông báo yêu cầu hành động
            const userChoice = window.confirm(`
                Bạn đã đạt giới hạn ${levelLimit} chương ở cấp độ 'Bình thường'.
                Bạn có thể:
                1. Đọc thêm truyện để nâng cấp.
                2. Tiếp tục với cấp độ hiện tại.
            `);
    
            // Thêm log để kiểm tra lựa chọn của người dùng
            console.log(`User Choice: ${userChoice}`);
    
            if (!userChoice) {
                alert(`Hãy đọc thêm ${comicsToRead} chương để nâng cấp hoặc tiếp tục ở cấp độ hiện tại.`);
            }
    
            return; // Dừng tại đây nếu đạt giới hạn
        }
    
        // Xử lý bình thường nếu không phải cấp độ "Bình thường" hoặc chưa đạt giới hạn
        if (currentChapter < totalChapters) {
            handleReadingProgress();
    
            const requiredLevel = getRequiredLevel(currentChapter + 1); // Lấy cấp độ yêu cầu để đọc chương tiếp theo
            const userAccountLevel = getAccountLevel(localStorage.getItem('readComicsCount') || 0);
    
            // Thêm log để kiểm tra cấp độ yêu cầu và cấp độ của người dùng
            console.log(`Required Level: ${requiredLevel}`);
            console.log(`User Account Level: ${userAccountLevel}`);
    
            // Kiểm tra nếu cần nâng cấp cấp độ
            if (userAccountLevel < requiredLevel) {
                const userChoice = window.confirm(`
                    Bạn cần cấp độ ${requiredLevel} để đọc chương ${currentChapter + 1}.
                    Bạn đang ở cấp độ ${userAccountLevel}.
                    1. Đọc thêm truyện để lên cấp.
                    2. Tiếp tục với cấp độ hiện tại.
                `);
    
                // Thêm log để kiểm tra lựa chọn của người dùng
                console.log(`User Choice (Upgrade): ${userChoice}`);
    
                if (!userChoice) {
                    alert(`Bạn cần đọc thêm truyện để lên cấp ${requiredLevel}.`);
                }
            } else {
                setCurrentChapter(currentChapter + 1);
                navigate(`/read/${title}/chapter/${currentChapter + 1}`);
            }
        }
    };
    
    const getComicsToReadForLevel = (requiredLevel, userLevel) => {
        const levelMap = {
            'Level 10': 50,  // Cấp 10 yêu cầu đọc 50 chương
            'Level 9': 40,    // Cấp 9 yêu cầu đọc 40 chương
            'Level 8': 30,    // Cấp 8 yêu cầu đọc 30 chương
            'Level 7': 20,    // Cấp 7 yêu cầu đọc 20 chương
            'Level 6': 15,    // Cấp 6 yêu cầu đọc 15 chương
            'Level 5': 10,    // Cấp 5 yêu cầu đọc 10 chương
            'Level 4': 8,     // Cấp 4 yêu cầu đọc 8 chương
            'Level 3': 6,     // Cấp 3 yêu cầu đọc 6 chương
            'Level 2': 4,     // Cấp 2 yêu cầu đọc 4 chương
            'Level 1': 0,     // Cấp 1 yêu cầu đọc 0 chương
            'Bình thường': 5  // Đã đọc được 5 chương ở cấp "Bình thường"
        };

        // Kiểm tra nếu cấp độ không hợp lệ
        if (!levelMap.hasOwnProperty(requiredLevel) || !levelMap.hasOwnProperty(userLevel)) {
            console.error(`Cấp độ không hợp lệ: requiredLevel = ${requiredLevel}, userLevel = ${userLevel}`);
            return 0; // Trả về 0 nếu cấp độ không hợp lệ
        }

        // Trường hợp đặc biệt: Người dùng ở cấp "Bình thường" và muốn lên "Level 1"
        if (userLevel === 'Bình thường' && requiredLevel === 'Level 1') {
            return 5; // Người dùng cần đọc thêm 5 chương để lên cấp 1
        }

        // Tính số chương cần đọc thêm để lên cấp
        const requiredCount = levelMap[requiredLevel];
        const currentCount = levelMap[userLevel];

        // Trả về số chương cần đọc thêm
        const comicsToRead = Math.max(0, requiredCount - currentCount);
        console.log(`Comics to read to level up: ${comicsToRead}`);
        return comicsToRead;
    };

    const getMoneyToPay = (userLevel) => {
        const moneyNeeded = {
            'Bình thường': 10000,   // Từ "Bình thường" lên "Level 1" cần nạp 10.000 VND
            'Level 1': 20000,        // Từ "Level 1" lên "Level 2" cần nạp 20.000 VND
            'Level 2': 30000,        // Từ "Level 2" lên "Level 3" cần nạp 30.000 VND
            'Level 3': 40000,        // 40.000 VND
            'Level 4': 50000,        // 50.000 VND
            'Level 5': 60000,        // 60.000 VND
            'Level 6': 70000,        // 70.000 VND
            'Level 7': 80000,        // 80.000 VND
            'Level 8': 90000,        // 90.000 VND
            'Level 9': 100000,       // 100.000 VND
            'Level 10': 0,           // Không cần nạp tiền khi đã đạt cấp độ "Level 10"
        };

        // Kiểm tra xem cấp độ có hợp lệ không
        if (!moneyNeeded.hasOwnProperty(userLevel)) {
            console.error(`Invalid user level: ${userLevel}`);
            return 0; // Trả về 0 nếu cấp độ không hợp lệ
        }

        // Lấy số tiền cần nạp cho cấp độ
        return moneyNeeded[userLevel];
    };

    const formatCurrency = (money) => {
        // Nếu là "Miễn phí", trả về "Miễn phí"
        if (money === 'Miễn phí') {
            return 'Miễn phí';
        }

        // Nếu là số tiền hợp lệ, trả về định dạng "đ" cho dễ hiểu
        return `${money} VND`;
    };

    const getMoneyNeededPerLevel = (userLevel) => {
        const moneyNeeded = {
            'Level 1': 5,
            'Level 2': 10,
            'Level 3': 20,
            'Level 4': 30,
            'Level 5': 40,
            'Level 6': 50,
            'Level 7': 60,
            'Level 8': 70,
            'Level 9': 80,
            'Level 10': 0,
        };

        const moneyPerLevel = moneyNeeded[userLevel] || 0;
        console.log(`Money Needed Per Level for ${userLevel}: ${moneyPerLevel}`); // Log kiểm tra
        return moneyPerLevel;
    };

    const handleClick = () => {
        setHeaderVisible(prev => !prev);
        setFooterVisible(prev => !prev);
    };

    const handleTitleClick = () => {
        navigate(`/comics/${comicId}`);
    };

    const handleZoomIn = (event) => {
        event.stopPropagation();
        setZoomLevel(prev => {
            const newZoomLevel = Math.min(prev + 0.1, 2);
            if (newZoomLevel === 2) {
                setIsZoomInDisabled(true);
            }
            setIsZoomOutDisabled(false);
            return newZoomLevel;
        });
        setHeaderVisible(false);
        setFooterVisible(false);
    };

    const handleZoomOut = (event) => {
        event.stopPropagation();
        setZoomLevel(prev => {
            if (prev === 1) {
                setIsZoomOutDisabled(true);
                return 1;
            } else if (prev === 1.1) {
                setIsZoomOutDisabled(true);
                return 1;
            } else {
                const newZoomLevel = Math.max(prev - 0.1, 1);
                if (newZoomLevel === 1) {
                    setIsZoomOutDisabled(true);
                }
                setIsZoomInDisabled(false);
                return newZoomLevel;
            }
        });
        setHeaderVisible(false);
        setFooterVisible(false);
    };


    const handleScroll = () => {
        const images = document.querySelectorAll('.comic-page');
        let lastVisibleImage = null;

        // Duyệt qua các trang hình ảnh và kiểm tra xem trang nào đang hiển thị
        images.forEach((image, index) => {
            const rect = image.getBoundingClientRect();
            const imageHeight = rect.bottom - rect.top;

            // Kiểm tra nếu phần trang có thể nhìn thấy
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
                const visiblePercentage = visibleHeight / imageHeight;

                // Nếu người dùng đã xem hơn 50% của trang, lưu lại
                if (visiblePercentage > 0.5) {
                    lastVisibleImage = {
                        positionId: `position-${index + 1}`,
                        imageUrl: image.src
                    };
                }
            }
        });

        // Dừng timeout cũ trước khi bắt đầu lưu lại vị trí mới
        clearTimeout(scrollTimeoutId);

        // Nếu có trang đang được đọc, lưu vị trí trang
        if (lastVisibleImage) {
            const { positionId } = lastVisibleImage;

            scrollTimeoutId = setTimeout(() => {
                // Lưu vị trí trang với comic.title và currentChapter
                saveReadPosition(currentChapter, positionId, title);  // Lưu vị trí và comic.title

                // Hiển thị thông báo trong console
                console.log(`Đã lưu vị trí trang ${positionId} cho chương ${currentChapter} của truyện "${title}".`);

                // Tăng số lượng comicsRead nếu chưa được tính
                if (!hasReadComics.has(comicId)) {
                    setHasReadComics(prev => new Set(prev).add(comicId));
                    updateComicsReadCount();
                }
            }, 1000); // Để giảm tải việc lưu liên tục khi cuộn trang
        }
    };

    // Gọi handleScroll mỗi khi người dùng cuộn
    window.addEventListener('scroll', handleScroll);

    const saveReadPosition = (chapterIndex, positionId, title) => {
        // Tạo đối tượng chứa các thông tin cần lưu
        const readPosition = {
            positionId, // ID của phần tử đã đọc
            title,      // Tên của truyện
            chapterIndex,
            comicId
        };

        // Lưu đối tượng này vào localStorage dưới dạng chuỗi JSON
        localStorage.setItem(`lastReadPosition_${comicId}_${chapterIndex}`, JSON.stringify(readPosition));

        // Hiển thị thông báo trong console
        console.log(`Đã lưu vị trí trang ${positionId} cho chương ${chapterIndex} của truyện "${title}" với comicId: ${comicId}.`);

    };

    const updateComicsReadCount = async () => {
        if (!username || !title) return; // Kiểm tra nếu username hoặc title không hợp lệ

        // Lấy danh sách truyện đã đọc từ localStorage hoặc gán về một mảng rỗng nếu chưa có
        const readComicsList = JSON.parse(localStorage.getItem('readComicsList')) || [];

        // Kiểm tra xem tiêu đề đã đọc chưa
        if (readComicsList.includes(title)) {
            console.log('Truyện này đã được đọc trước đó, không tính.');
            return; // Nếu đã đọc rồi, không làm gì cả
        }

        // Thêm tiêu đề mới vào danh sách truyện đã đọc
        readComicsList.push(title);
        localStorage.setItem('readComicsList', JSON.stringify(readComicsList)); // Cập nhật localStorage

        // Cập nhật số lượng truyện đã đọc
        const newReadComicsCount = readComicsList.length; // Đếm số lượng truyện đã đọc mới

        try {
            // Gửi yêu cầu cập nhật đến server với cả tiêu đề và số lượng truyện
            await axios.put(`http://localhost:5000/api/users/${username}/comicsRead`, {
                title: title, // Gửi tiêu đề truyện
                comicsRead: newReadComicsCount // Gửi số lượng truyện đã đọc
            });
            console.log('Số lượng truyện đã đọc được cập nhật:', newReadComicsCount);
        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng truyện đã đọc:', error.response?.data.message || error.message);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeoutId);
        };
    }, [chapterContent, currentChapter]);

    return (
        <div className="read-comic-container">
            <header className={`read-comic-header ${headerVisible ? 'header-visible' : ''}`}>
                <Link to="/home" className="logo-container">
                    <img src={logo} alt="Logo" className="logo img-fluid" />
                </Link>
                <div className="title-container">
                    <span className="comic-title" onClick={handleTitleClick}>
                        {title}
                    </span>
                </div>
                <div className="chapter-info white-text">
                    Chương {currentChapter} / {totalChapters}
                </div>
            </header>

            <div className="comic-reader" onClick={handleClick}>
                <div className="zoom-controls">
                    <button onClick={handleZoomIn} disabled={isZoomInDisabled}>+</button>
                    <button onClick={handleZoomOut} disabled={isZoomOutDisabled}>-</button>
                </div>
                <div className="comic-page-container">
                    {loading ? (
                        <p>Đang tải nội dung chương...</p>
                    ) : (
                        chapterContent.length > 0 ? (
                            chapterContent.map((pageUrl, index) => (
                                <div key={index} id={`position-${index + 1}`}>
                                    <img
                                        src={`http://localhost:5000/${pageUrl.imageUrl}`}
                                        alt={`Page ${index + 1}`}
                                        className="comic-page"
                                        style={{ transform: `scale(${zoomLevel})` }}
                                    />
                                </div>
                            ))
                        ) : (
                            <p>Không tìm thấy nội dung chương.</p>
                        )
                    )}
                </div>
            </div>

            <footer className={`read-comic-footer ${footerVisible ? 'footer-visible' : ''}`}>
                <div className="navigation">
                    <button
                        className="prev-btn"
                        onClick={handlePrevChapter}
                        disabled={currentChapter <= 1}
                    >
                        ⟨
                    </button>
                    <button
                        className="next-btn"
                        onClick={handleNextChapter}
                        disabled={currentChapter >= totalChapters}
                    >
                        ⟩
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ReadComic;
