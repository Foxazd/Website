import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommentsSection = ({ id }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');

    // Lấy bình luận từ server
    useEffect(() => {
        console.log("ID truyền vào:", id); // Kiểm tra giá trị của id
        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/comments/${id}`);
                setComments(response.data);
            } catch (error) {
                setError('Lỗi khi lấy bình luận');
            }
        };
        
        if (id) {
            fetchComments();
        } else {
            setError('ID không hợp lệ');
        }
    }, [id]);
    

    // Gửi bình luận mới
    const handleAddComment = async (event) => {
        event.preventDefault();
        if (!newComment) return; // Kiểm tra nội dung bình luận

        try {
            const response = await axios.post(`http://localhost:5000/api/comments/${id}`, {
                user: 'Tên người dùng', // Thay bằng tên người dùng thực
                content: newComment
            });

            setComments(prevComments => [...prevComments, response.data]);
            setNewComment('');
        } catch (error) {
            setError('Lỗi khi gửi bình luận. Vui lòng thử lại sau.');
        }
    };

    return (
        <div className="comments-section">
            <h3>Bình luận</h3>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleAddComment}>
                <input 
                    type="text" 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    placeholder="Nhập bình luận của bạn..." 
                    required 
                />
                <button type="submit">Gửi</button>
            </form>
            <ul>
                {comments.map(comment => (
                    <li key={comment._id}>
                        <strong>{comment.user}</strong>: {comment.content}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CommentsSection;
