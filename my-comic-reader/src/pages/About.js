// src/pages/About.js
import React from 'react';
import Header from '../components/Header'; 
import '../assets/css/style.css'; 

const About = () => {
  return (
    <div className="about-page">
      <Header />
      <main className="about-content">
        <section className="about-section">
          <h1>Giới thiệu về chúng tôi</h1>
          <p>
            Chúng tôi là một nhóm đam mê sáng tạo và đổi mới, chuyên cung cấp
            các giải pháp tuyệt vời cho cộng đồng yêu thích đọc truyện. Chúng tôi
            cam kết mang đến những trải nghiệm đọc truyện tuyệt vời và đáng nhớ.
          </p>
        </section>
        <section className="about-team">
          <h2>Nhóm Của Chúng Tôi</h2>
          <p>
            Đội ngũ của chúng tôi bao gồm các chuyên gia trong các lĩnh vực khác
            nhau, từ thiết kế giao diện người dùng đến phát triển phần mềm. Chúng
            tôi làm việc chăm chỉ để đảm bảo rằng bạn có trải nghiệm tốt nhất.
          </p>
        </section>
        <section className="about-contact">
          <h2>Liên Hệ Với Chúng Tôi</h2>
          <p>
            Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua
            email: <a href="mailto:ComicBubby@example.com">ComicBubby@example.com</a>.
          </p>
        </section>
      </main>
    </div>
  );
};

export default About;
