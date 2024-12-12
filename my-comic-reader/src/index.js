import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Đăng ký Service Worker nếu trình duyệt hỗ trợ
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker đã được đăng ký thành công:', registration);
      })
      .catch((error) => {
        console.log('Lỗi khi đăng ký Service Worker:', error);
      });
  });
}

// Đo lường hiệu suất của ứng dụng (không bắt buộc)
reportWebVitals();
