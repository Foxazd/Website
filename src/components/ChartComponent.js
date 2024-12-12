import React, { useRef, useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import '../assets/css/UserEdit.css';

// Đăng ký các thành phần của Chart.js
Chart.register(...registerables);

const ChartComponent = () => {
  const chartRefs = useRef([]);
  const charts = useRef([]); // Lưu trữ các instance của biểu đồ
  const [userChartData, setUserChartData] = useState([]);
  const [comicChartData, setComicChartData] = useState([]);
  const [commentChartData, setCommentChartData] = useState([]); // Dữ liệu biểu đồ bình luận
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Năm được chọn
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Tháng được chọn
  const [totalUserCount, setTotalUserCount] = useState(0); // Tổng số người dùng
  const [totalComicCount, setTotalComicCount] = useState(0); // Tổng số truyện
  const [totalCommentCount, setTotalCommentCount] = useState(0); // Tổng số bình luận

  // Hàm phân nhóm theo năm và tháng
  const groupByMonthYear = (data, dateField) => {
    return data.reduce((acc, item) => {
      const date = new Date(item[dateField]);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // Khởi tạo nhóm nếu chưa có
      if (!acc[year]) {
        acc[year] = {};
      }
      if (!acc[year][month]) {
        acc[year][month] = 0;
      }
      
      acc[year][month] += 1; // Tăng số lượng cho tháng năm tương ứng
      return acc;
    }, {});
  };

  // Lưu dữ liệu vào localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('totalUserCount', totalUserCount);
    localStorage.setItem('totalComicCount', totalComicCount);
    localStorage.setItem('totalCommentCount', totalCommentCount);
  };

  // Lấy dữ liệu từ localStorage
  const loadFromLocalStorage = () => {
    const savedUserCount = localStorage.getItem('totalUserCount');
    const savedComicCount = localStorage.getItem('totalComicCount');
    const savedCommentCount = localStorage.getItem('totalCommentCount');

    if (savedUserCount && savedComicCount && savedCommentCount) {
      setTotalUserCount(Number(savedUserCount));
      setTotalComicCount(Number(savedComicCount));
      setTotalCommentCount(Number(savedCommentCount));
    }
  };

  // Fetch dữ liệu người dùng
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        const users = response.data;

        // Phân nhóm theo tháng và năm
        const groupedData = groupByMonthYear(users, 'createdAt');

        // Tạo danh sách cho biểu đồ
        const labels = [];
        const values = [];
        let totalUsers = 0;

        for (let month = 0; month < 12; month++) {
          labels.push(`${month + 1}/${selectedYear}`);
          const monthlyCount = groupedData[selectedYear] && groupedData[selectedYear][month] ? groupedData[selectedYear][month] : 0;
          values.push(monthlyCount);
          totalUsers += monthlyCount; // Cộng dồn tổng số người dùng
        }

        setUserChartData([{
          title: 'Quản lý Người Dùng',
          labels,
          values,
          colors: ['#FF6384']
        }]);
        setTotalUserCount(totalUsers); // Cập nhật tổng số người dùng
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu người dùng:', error);
      }
    };

    fetchUserData();
  }, [selectedYear, selectedMonth]);

  // Fetch dữ liệu truyện
  useEffect(() => {
    const fetchComicData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/comics');
        const comics = response.data;

        // Phân nhóm theo tháng và năm
        const groupedData = groupByMonthYear(comics, 'createdAt');

        // Tạo danh sách cho biểu đồ
        const labels = [];
        const values = [];
        let totalComics = 0;

        for (let month = 0; month < 12; month++) {
          labels.push(`${month + 1}/${selectedYear}`);
          const monthlyCount = groupedData[selectedYear] && groupedData[selectedYear][month] ? groupedData[selectedYear][month] : 0;
          values.push(monthlyCount);
          totalComics += monthlyCount; // Cộng dồn tổng số truyện
        }

        setComicChartData([{
          title: 'Quản lý Truyện',
          labels,
          values,
          colors: ['#FFCE56']
        }]);
        setTotalComicCount(totalComics); // Cập nhật tổng số truyện
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu truyện:', error);
      }
    };

    fetchComicData();
  }, [selectedYear, selectedMonth]);

  // Fetch dữ liệu bình luận
  useEffect(() => {
    const fetchCommentData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/comments');
        const comments = response.data;

        // Phân nhóm theo tháng và năm
        const groupedData = groupByMonthYear(comments, 'timestamp');

        // Tạo danh sách cho biểu đồ
        const labels = [];
        const values = [];
        let totalComments = 0;

        for (let month = 0; month < 12; month++) {
          labels.push(`${month + 1}/${selectedYear}`);
          const monthlyCount = groupedData[selectedYear] && groupedData[selectedYear][month] ? groupedData[selectedYear][month] : 0;
          values.push(monthlyCount);
          totalComments += monthlyCount; // Cộng dồn tổng số bình luận
        }

        setCommentChartData([{
          title: 'Quản lý Bình Luận',
          labels,
          values,
          colors: ['#FF5733']
        }]);
        setTotalCommentCount(totalComments); // Cập nhật tổng số bình luận
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu bình luận:', error);
      }
    };

    fetchCommentData();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (userChartData.length === 0 && comicChartData.length === 0 && commentChartData.length === 0) return;

    chartRefs.current.forEach((canvas, index) => {
      if (canvas) {
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          console.error('Failed to get 2D context');
          return;
        }

        // Cập nhật dữ liệu cho các biểu đồ người dùng, truyện và bình luận
        const data = 
          index === 0 ? userChartData[0] :
          index === 1 ? comicChartData[0] :
          commentChartData[0];

        if (!data) return;

        // Nếu biểu đồ đã tồn tại, chỉ cần cập nhật dữ liệu mà không tạo mới
        if (charts.current[index]) {
          charts.current[index].data.labels = data.labels;
          charts.current[index].data.datasets[0].data = data.values;
          charts.current[index].update(); // Cập nhật biểu đồ với dữ liệu mới
        } else {
          // Tạo biểu đồ mới nếu chưa tồn tại
          charts.current[index] = new Chart(ctx, {
            type: 'bar', // Thay đổi loại biểu đồ thành 'bar'
            data: {
              labels: data.labels,
              datasets: [{
                label: data.title,
                data: data.values,
                backgroundColor: data.colors,
                borderColor: data.colors.map(color => color.replace('0.2', '1')), // Thay đổi màu viền cho biểu đồ cột
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: true, // Hiển thị legend
                },
                tooltip: {
                  callbacks: {
                    label: function (tooltipItem) {
                      return `${tooltipItem.label}: ${tooltipItem.raw}`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Tháng'
                  }
                },
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Số lượng'
                  }
                }
              }
            }
          });
        }
      }
    });
  }, [userChartData, comicChartData, commentChartData]);

  useEffect(() => {
    saveToLocalStorage(); // Lưu tổng số lượng vào localStorage mỗi khi cập nhật
  }, [totalUserCount, totalComicCount, totalCommentCount]);

  useEffect(() => {
    loadFromLocalStorage(); // Lấy dữ liệu từ localStorage khi trang tải lại
  }, []);

  return (
    <div className="chart-container">
      <div className="chart-item">
        <canvas ref={el => chartRefs.current[0] = el} width="300" height="300"></canvas>
        <div className="chart-title">Quản lý Người Dùng</div>
        <div className="chart-legend">Số lượng người dùng theo tháng</div>
      </div>
      <div className="chart-item">
        <canvas ref={el => chartRefs.current[1] = el} width="300" height="300"></canvas>
        <div className="chart-title">Quản lý Truyện</div>
        <div className="chart-legend">Số lượng truyện theo tháng</div>
      </div>
      <div className="chart-item">
        <canvas ref={el => chartRefs.current[2] = el} width="300" height="300"></canvas>
        <div className="chart-title">Quản lý Bình Luận</div>
        <div className="chart-legend">Số lượng bình luận theo tháng</div>
      </div>
    </div>
  );
};

export default ChartComponent;
