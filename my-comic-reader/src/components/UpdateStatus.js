import React, { useState } from 'react';
import axios from 'axios';

const UpdateStatus = ({ comicId }) => {
  const [status, setStatus] = useState('Đang tiến hành');

  const handleStatusChange = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/comics/${comicId}/status`, {
        status: status,
      });
      alert(response.data.message);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái truyện:', error);
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="Đang tiến hành">Đang tiến hành</option>
        <option value="Hoàn thành">Hoàn thành</option>
        <option value="Tạm dừng">Tạm dừng</option>
        <option value="Hủy bỏ">Hủy bỏ</option>
      </select>
      <button onClick={handleStatusChange}>Cập nhật trạng thái</button>
    </div>
  );
};

export default UpdateStatus;
