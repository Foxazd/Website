import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminHeader from '../components/AdminHeader';
import CommentsList from '../components/CommentsList';
import { Modal, Button, Form, Toast } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import '../assets/css/CommentsManagement.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const CommentsManagement = () => {
    const [comments, setComments] = useState([]);
    const [filteredComments, setFilteredComments] = useState([]);
    const [editingComment, setEditingComment] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [deleteReason, setDeleteReason] = useState('');
    const [selectedComment, setSelectedComment] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Fetch comments từ server
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/comments');
                setComments(response.data);
                setFilteredComments(response.data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
    }, []);

    // Mở modal xóa bình luận
    const openDeleteModal = (commentId) => {
        closeEditModal(); // Đóng modal chỉnh sửa nếu nó đang mở
        setSelectedComment(commentId);
        setDeleteReason('');
        setShowDeleteModal(true);
    };

    // Đóng modal xóa bình luận
    const closeDeleteModal = () => setShowDeleteModal(false);

    const openEditModal = (comment) => {
        console.log('Mở modal chỉnh sửa bình luận');
        closeDeleteModal();
        setEditingComment(comment);
        setEditedContent(comment.content);
        setShowEditModal(true);
    };
    
    const closeEditModal = () => {
        console.log('Đóng modal chỉnh sửa bình luận');
        setShowEditModal(false);
        setEditingComment(null);
        setEditedContent('');
    };
    
    // Gửi thông báo cho người dùng khi bình luận bị xóa
    const sendNotification = async (userId, reason) => {
        try {
            await axios.post(`http://localhost:5000/api/notifications`, {
                userId: userId,
                message: `Bình luận của bạn đã bị xóa. Lý do: ${reason}`,
                type: 'reason',
            });
        } catch (error) {
            console.error('Error sending notification:', error.response ? error.response.data : error.message);
        }
    };

    // Xử lý xóa bình luận
    const handleDeleteComment = async () => {
        if (!deleteReason.trim()) {
            alert('Vui lòng nhập lý do xóa bình luận');
            return;
        }

        try {
            const commentToDelete = comments.find(comment => comment._id === selectedComment);
            if (!commentToDelete) {
                alert('Không tìm thấy bình luận.');
                return;
            }

            const user = commentToDelete.user;

            // Xóa bình luận
            await axios.delete(`http://localhost:5000/api/comments/${selectedComment}`, {
                data: { reason: deleteReason },
            });

            // Gửi thông báo đến người dùng
            await sendNotification(user, deleteReason);

            // Cập nhật trạng thái bình luận sau khi xóa
            setComments(prevComments => prevComments.filter(comment => comment._id !== selectedComment));
            setFilteredComments(prevComments => prevComments.filter(comment => comment._id !== selectedComment));

            // Đóng modal và hiển thị thông báo thành công
            setShowDeleteModal(false);
            setToastMessage('Bình luận đã được xóa thành công.');
            setShowToast(true);
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    // Xử lý cập nhật bình luận sau khi chỉnh sửa
    const handleUpdateComment = async (event) => {
        event.preventDefault();
        if (!editedContent.trim() || !editingComment) return;

        try {
            // Gọi API cập nhật bình luận
            await axios.put(`http://localhost:5000/api/comments/${editingComment._id}`, {
                content: editedContent,
            });

            // Cập nhật bình luận trong state
            setComments(prevComments =>
                prevComments.map(comment =>
                    comment._id === editingComment._id ? { ...comment, content: editedContent } : comment
                )
            );
            setFilteredComments(prevComments =>
                prevComments.map(comment =>
                    comment._id === editingComment._id ? { ...comment, content: editedContent } : comment
                )
            );

            // Đóng modal và hiển thị thông báo thành công
            closeEditModal(); // Đóng modal chỉnh sửa
            setToastMessage('Bình luận đã được cập nhật thành công.');
            setShowToast(true);
        } catch (error) {
            console.error('Error updating comment:', error);
            setToastMessage('Lỗi khi cập nhật bình luận.');
            setShowToast(true);
        }
    };

    const headerStyle = {
        fontSize: '2rem',
        marginBottom: '10px',
        paddingTop: '80px',
        fontWeight: 'bold',
        background: 'linear-gradient(90deg, #007bff, #6c757d)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        position: 'relative',
        transition: 'transform 0.3s ease',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        justifyContent: 'center',
    };


    return (
        <>
            <AdminHeader />
            <h1 className="text-center my-4" style={headerStyle}>QUẢN LÝ BÌNH LUẬN</h1>
            <Table striped bordered hover responsive className="table-comments">
                <CommentsList
                    filteredComments={filteredComments}
                    handleEditComment={openEditModal}
                    handleDeleteComment={openDeleteModal}
                />
            </Table>

            <DeleteCommentModal
                show={showDeleteModal}
                handleClose={closeDeleteModal}
                handleDelete={handleDeleteComment}
                deleteReason={deleteReason}
                setDeleteReason={setDeleteReason}
            />

            <EditCommentModal
                show={showEditModal}  // Kiểm tra trạng thái này
                handleClose={closeEditModal}
                handleUpdate={handleUpdateComment}
                editedContent={editedContent}
                setEditedContent={setEditedContent}
            />


            <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
        </>
    );
};

export default CommentsManagement;

// Component modal để xóa bình luận
const DeleteCommentModal = ({ show, handleClose, handleDelete, deleteReason, setDeleteReason }) => (
    <Modal show={show} onHide={handleClose} backdrop={false} className="modal-delete">
        <Modal.Header closeButton>
            <Modal.Title>Nhập lý do xóa bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group controlId="deleteReason">
                    <Form.Label>Lý do xóa bình luận</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                    />
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Hủy bỏ</Button>
            <Button variant="danger" onClick={handleDelete}>Xóa bình luận</Button>
        </Modal.Footer>
    </Modal>
);

// Component modal để chỉnh sửa bình luận
const EditCommentModal = ({ show, handleClose, handleUpdate, editedContent, setEditedContent }) => (
    <Modal show={show} onHide={handleClose} backdrop={false} className="modal-edit" >
        <Modal.Header  closeButton>
            <Modal.Title>Chỉnh sửa bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form onSubmit={handleUpdate}>
                <Form.Group controlId="editedContent">
                    <Form.Label>Nội dung bình luận</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">Cập nhật</Button>
            </Form>
        </Modal.Body>
    </Modal>
);
