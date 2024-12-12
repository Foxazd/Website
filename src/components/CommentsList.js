import React from 'react';

const CommentsList = ({ filteredComments, handleEditComment, handleDeleteComment }) => (
    <table className="table table-hover mt-5">
        <thead className="table-dark">
            <tr>
                <th>Tên Người Dùng</th>
                <th>Tên Truyện</th>
                <th>Nội Dung</th>
                <th>Phản Hồi</th>
                <th>Hành Động</th>
            </tr>
        </thead>
        <tbody>
            {filteredComments.length > 0 ? (
                filteredComments.map((comment) => (
                    <tr key={comment._id}>
                        <td>{comment.user}</td>
                        <td>{comment.comicId?.title || 'Không có'}</td> 
                        <td>{comment.content}</td>
                        <td>
                            {comment.replies && comment.replies.length > 0 ? (
                                <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
                                    {comment.replies.map((reply) => (
                                        <li key={reply._id}><strong>{reply.user}</strong>: {reply.content}</li>
                                    ))}
                                </ul>
                            ) : (
                                <em>Không có phản hồi</em>
                            )}
                        </td>
                        <td>
                            <button className="btn btn-primary btn-sm me-2" onClick={() => handleEditComment(comment)}>
                                Chỉnh sửa
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteComment(comment._id)}>
                                Xóa
                            </button>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="5">Không có bình luận nào.</td>
                </tr>
            )}
        </tbody>
    </table>
);

export default CommentsList;
