import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import '../assets/css/style.css'; 
import { FaCopyright } from 'react-icons/fa'; 

const Footer = () => {
  return (
    <footer className="footer py-4">
      <div className="container">
        <div className="row">
          {/* Hướng dẫn sử dụng */}
          <div className="col-md-4 mb-4">
            <h5>Hướng dẫn sử dụng</h5>
            <ul className="list-unstyled">
              <li><span className="footer-link">Cách đọc truyện</span></li> 
              <li><span className="footer-link">Hướng dẫn tải truyện</span></li>
              <li><span className="footer-link">Cách đánh dấu yêu thích</span></li>
            </ul>
          </div>

          {/* Diễn đàn cộng đồng */}
          <div className="col-md-4 mb-4">
            <h5>Diễn đàn cộng đồng</h5>
            <ul className="list-unstyled">
              <li><span className="footer-link">Tham gia thảo luận</span></li>
              <li><span className="footer-link">Sự kiện sắp tới</span></li>
              <li><span className="footer-link">Nhóm đọc giả</span></li>
            </ul>
          </div>

          {/* Hỗ trợ người dùng */}
          <div className="col-md-4 mb-4">
            <h5>Hỗ trợ người dùng</h5>
            <ul className="list-unstyled">
              <li><span className="footer-link">Phản hồi ý kiến</span></li>
              <li><span className="footer-link">Đánh giá ứng dụng</span></li>
              <li><span className="footer-link">Liên hệ khẩn cấp</span></li>
            </ul>
          </div>
        </div>

        {/* Minimalist Footer - Bản quyền và liên kết */}
        <div className="row">
          <div className="col-12 text-center">
            <p className="footer-link">
              <FaCopyright /> <span className="copyright-text">2024 ComicBubby. All rights reserved.</span>
            </p>
            <ul className="list-inline mb-0 footer-nav">
              <li className="list-inline-item">
                <span className="footer-link">Privacy Policy</span>
              </li>
              <li className="list-inline-item">
                <span className="footer-link">Terms of Service</span>
              </li>
              <li className="list-inline-item">
                <span className="footer-link">Contact Us</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
