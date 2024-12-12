// src/components/AdminFooter.js

import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/admin-footer.css'; 

const AdminFooter = () => {
  return (
    <footer className="footer py-3 border-top">
      <div className="container text-center">
        <p>&copy; {new Date().getFullYear()} Trang Quản Trị - Tất cả quyền được bảo lưu.</p>
        <p>
          <Link to="/about" className="footer-link">Giới thiệu</Link> | 
          <Link to="/contact" className="footer-link">Liên hệ</Link>
        </p>
      </div>
    </footer>
  );
};

export default AdminFooter;
